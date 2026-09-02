const { supabaseAdmin: supabase } = require('../config/supabase');
const CloudinaryService = require('../services/cloudinary.service');

/**
 * Controller for Kolmeks ERP Expense Management & Reimbursement Module
 */
const expenseController = {
  // ==========================================================================
  // 1. EXPENSE CATEGORIES
  // ==========================================================================
  
  getCategories: async (req, res) => {
    try {
      const { include_inactive } = req.query;

      let query = supabase
        .from('expense_categories')
        .select(`
          *,
          default_account:chart_of_accounts(id, account_code, account_name, account_type)
        `)
        .order('name', { ascending: true });

      if (include_inactive !== 'true') {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Error fetching expense categories:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch expense categories.' } });
    }
  },

  createCategory: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { code, name, description, default_account_id } = req.body;

      if (!code || !name) {
        return res.status(400).json({ error: { message: 'Category code and name are required.' } });
      }

      const formattedCode = code.trim().toUpperCase();

      // Check code uniqueness
      const { data: existing } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('code', formattedCode)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: { message: `Category code '${formattedCode}' already exists.` } });
      }

      const { data, error } = await supabase
        .from('expense_categories')
        .insert({
          code: formattedCode,
          name: name.trim(),
          description: description || null,
          default_account_id: default_account_id || null,
          is_active: true,
          created_by: userId,
          updated_by: userId,
        })
        .select(`
          *,
          default_account:chart_of_accounts(id, account_code, account_name)
        `)
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data,
        message: `Expense category '${name}' created successfully.`,
      });
    } catch (err) {
      console.error('Error creating expense category:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to create category.' } });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { name, description, default_account_id, is_active } = req.body;

      const { data: cat, error: fetchErr } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !cat) {
        return res.status(404).json({ error: { message: 'Expense category not found.' } });
      }

      const updatePayload = {
        updated_at: new Date().toISOString(),
        updated_by: userId,
      };

      if (name !== undefined) updatePayload.name = name.trim();
      if (description !== undefined) updatePayload.description = description;
      if (default_account_id !== undefined) updatePayload.default_account_id = default_account_id || null;
      if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);

      const { data, error } = await supabase
        .from('expense_categories')
        .update(updatePayload)
        .eq('id', id)
        .select(`
          *,
          default_account:chart_of_accounts(id, account_code, account_name)
        `)
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data,
        message: `Category '${cat.code}' updated successfully.`,
      });
    } catch (err) {
      console.error('Error updating expense category:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to update category.' } });
    }
  },

  // ==========================================================================
  // 2. RECEIPT ATTACHMENT UPLOAD
  // ==========================================================================

  uploadReceipt: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'No receipt file provided.' } });
      }

      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: { message: 'Invalid file format. Only JPG, PNG, and PDF files are allowed.' } });
      }

      // 5MB file size check
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: { message: 'Receipt file size exceeds maximum limit of 5MB.' } });
      }

      let uploadResult;
      if (CloudinaryService.isConfigured()) {
        uploadResult = await CloudinaryService.uploadBuffer(req.file.buffer, {
          folder: 'kolmeks/expense-receipts',
          resource_type: req.file.mimetype === 'application/pdf' ? 'raw' : 'image',
        });
      }

      const receiptUrl = uploadResult ? uploadResult.secure_url : `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80`;
      const receiptPublicId = uploadResult ? uploadResult.public_id : `receipt_demo_${Date.now()}`;

      return res.status(200).json({
        success: true,
        data: {
          receipt_url: receiptUrl,
          receipt_public_id: receiptPublicId,
          original_name: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        message: 'Receipt uploaded successfully.',
      });
    } catch (err) {
      console.error('Error uploading receipt:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to upload receipt attachment.' } });
    }
  },

  // ==========================================================================
  // 3. EXPENSE CLAIMS
  // ==========================================================================

  getClaims: async (req, res) => {
    try {
      const { employee_id, cost_center_id, status, search, start_date, end_date } = req.query;

      let query = supabase
        .from('expense_claims')
        .select(`
          *,
          employee:employees(id, first_name, last_name, employee_code),
          cost_center:cost_centers(id, code, name),
          budget:budgets(id, budget_code, budget_name)
        `)
        .order('created_at', { ascending: false });

      if (employee_id) query = query.eq('employee_id', employee_id);
      if (cost_center_id) query = query.eq('cost_center_id', cost_center_id);
      if (status && status !== 'ALL') query = query.eq('status', status);
      if (start_date) query = query.gte('claim_date', start_date);
      if (end_date) query = query.lte('claim_date', end_date);

      if (search) {
        query = query.or(`claim_number.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Error fetching expense claims:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch expense claims.' } });
    }
  },

  getMyClaims: async (req, res) => {
    try {
      const userId = req.user?.id;

      // Find employee record matching current authenticated user
      let employeeId = null;
      if (userId) {
        const { data: emp } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (emp) employeeId = emp.id;
      }

      if (!employeeId) {
        // Fallback search by email if user_id not mapped
        const { data: empByEmail } = await supabase
          .from('employees')
          .select('id')
          .eq('email', req.user?.email)
          .maybeSingle();
        if (empByEmail) employeeId = empByEmail.id;
      }

      if (!employeeId) {
        return res.status(200).json({ success: true, data: [] });
      }

      const { data, error } = await supabase
        .from('expense_claims')
        .select(`
          *,
          employee:employees(id, first_name, last_name, employee_code),
          cost_center:cost_centers(id, code, name),
          budget:budgets(id, budget_code, budget_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Error fetching my claims:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch your expense claims.' } });
    }
  },

  getClaimById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: claim, error } = await supabase
        .from('expense_claims')
        .select(`
          *,
          employee:employees(id, first_name, last_name, employee_code, email),
          cost_center:cost_centers(id, code, name, allocated_budget),
          budget:budgets(id, budget_code, budget_name, total_budget_amount, status),
          journal_entry:journal_entries(id, entry_number, entry_date, status)
        `)
        .eq('id', id)
        .single();

      if (error || !claim) {
        return res.status(404).json({ error: { message: 'Expense claim not found.' } });
      }

      // Fetch line items
      const { data: items, error: itemErr } = await supabase
        .from('expense_items')
        .select(`
          *,
          category:expense_categories(id, code, name),
          cost_center:cost_centers(id, code, name),
          account:chart_of_accounts(id, account_code, account_name)
        `)
        .eq('claim_id', id)
        .order('created_at', { ascending: true });

      if (itemErr) throw itemErr;

      // Fetch reimbursements
      const { data: reimbursements } = await supabase
        .from('reimbursements')
        .select('*')
        .eq('claim_id', id)
        .order('reimbursement_date', { ascending: false });

      // Fetch audit logs
      const { data: auditLogs } = await supabase
        .from('expense_audit_logs')
        .select('*')
        .eq('claim_id', id)
        .order('created_at', { ascending: false });

      return res.status(200).json({
        success: true,
        data: {
          ...claim,
          items: items || [],
          reimbursements: reimbursements || [],
          audit_logs: auditLogs || [],
        },
      });
    } catch (err) {
      console.error('Error fetching claim details:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch claim details.' } });
    }
  },

  createClaim: async (req, res) => {
    try {
      const userId = req.user?.id;
      const {
        employee_id,
        claim_date,
        description,
        cost_center_id,
        budget_id,
        items,
        submit_immediately,
      } = req.body;

      if (!claim_date || !description || !items || items.length === 0) {
        return res.status(400).json({
          error: { message: 'Claim Date, Description, and at least one expense item are required.' },
        });
      }

      // Validate Employee
      let targetEmployeeId = employee_id;
      if (!targetEmployeeId) {
        // Fallback to user's mapped employee profile
        const { data: emp } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (emp) targetEmployeeId = emp.id;
      }

      if (!targetEmployeeId) {
        // Use first employee if in development / initial setup
        const { data: firstEmp } = await supabase.from('employees').select('id').limit(1).maybeSingle();
        if (firstEmp) targetEmployeeId = firstEmp.id;
      }

      if (!targetEmployeeId) {
        return res.status(400).json({ error: { message: 'Valid employee reference is required to submit expense claim.' } });
      }

      // Generate Claim Number: EXP-2026-000001
      let claimNumber;
      try {
        const { data: seqNum } = await supabase.rpc('nextval', { seq_name: 'expense_claim_seq' });
        claimNumber = `EXP-${new Date().getFullYear()}-${String(seqNum || 1).padStart(6, '0')}`;
      } catch (e) {
        claimNumber = `EXP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      // Process and validate items server-side
      let calculatedTotal = 0;
      const processedItems = items.map((item) => {
        const amount = parseFloat(item.amount) || 0;
        if (amount <= 0) {
          throw new Error(`Expense item '${item.description || 'Item'}' must have an amount greater than 0.`);
        }

        // Future-date validation
        const itemDate = item.expense_date || claim_date;
        if (new Date(itemDate) > new Date()) {
          throw new Error(`Expense date (${itemDate}) cannot be in the future.`);
        }

        calculatedTotal += amount;

        return {
          expense_date: itemDate,
          category_id: item.category_id || null,
          description: item.description || 'Expense Item',
          amount,
          currency: item.currency || 'INR',
          cost_center_id: item.cost_center_id || cost_center_id || null,
          account_id: item.account_id || null,
          receipt_url: item.receipt_url || null,
          receipt_public_id: item.receipt_public_id || null,
          notes: item.notes || null,
          is_approved: true,
          approved_amount: amount,
        };
      });

      const initialStatus = submit_immediately ? 'SUBMITTED' : 'DRAFT';

      // Insert Claim Header
      const { data: claim, error: claimErr } = await supabase
        .from('expense_claims')
        .insert({
          claim_number: claimNumber,
          employee_id: targetEmployeeId,
          claim_date,
          description: description.trim(),
          currency: 'INR',
          total_amount: calculatedTotal,
          approved_amount: submit_immediately ? calculatedTotal : 0.0,
          reimbursed_amount: 0.0,
          outstanding_amount: submit_immediately ? calculatedTotal : 0.0,
          cost_center_id: cost_center_id || null,
          budget_id: budget_id || null,
          status: initialStatus,
          submitted_at: submit_immediately ? new Date().toISOString() : null,
          submitted_by: submit_immediately ? userId : null,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single();

      if (claimErr) throw claimErr;

      // Insert Line Items
      const itemRecords = processedItems.map((item) => ({
        ...item,
        claim_id: claim.id,
      }));

      const { error: itemsInsErr } = await supabase.from('expense_items').insert(itemRecords);
      if (itemsInsErr) throw itemsInsErr;

      // Record Audit Log
      await supabase.from('expense_audit_logs').insert({
        claim_id: claim.id,
        action: submit_immediately ? 'EXPENSE_SUBMITTED' : 'EXPENSE_CREATED',
        performed_by: userId,
        details: { claim_number: claimNumber, total_amount: calculatedTotal, items_count: items.length },
      });

      return res.status(201).json({
        success: true,
        data: claim,
        message: `Expense claim ${claimNumber} created successfully.`,
      });
    } catch (err) {
      console.error('Error creating expense claim:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to create expense claim.' } });
    }
  },

  updateClaim: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { claim_date, description, cost_center_id, budget_id, items } = req.body;

      const { data: claim, error: fetchErr } = await supabase
        .from('expense_claims')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !claim) {
        return res.status(404).json({ error: { message: 'Expense claim not found.' } });
      }

      if (!['DRAFT', 'RETURNED'].includes(claim.status)) {
        return res.status(400).json({
          error: { message: `Cannot edit claim in '${claim.status}' status. Only DRAFT or RETURNED claims can be edited.` },
        });
      }

      let calculatedTotal = claim.total_amount;
      if (items && items.length > 0) {
        calculatedTotal = 0;
        const processedItems = items.map((item) => {
          const amount = parseFloat(item.amount) || 0;
          if (amount <= 0) throw new Error('Expense item amount must be greater than 0.');
          calculatedTotal += amount;
          return {
            claim_id: id,
            expense_date: item.expense_date || claim_date || claim.claim_date,
            category_id: item.category_id || null,
            description: item.description || 'Expense Item',
            amount,
            currency: 'INR',
            cost_center_id: item.cost_center_id || cost_center_id || null,
            account_id: item.account_id || null,
            receipt_url: item.receipt_url || null,
            receipt_public_id: item.receipt_public_id || null,
            notes: item.notes || null,
            is_approved: true,
            approved_amount: amount,
          };
        });

        // Replace Line Items
        await supabase.from('expense_items').delete().eq('claim_id', id);
        await supabase.from('expense_items').insert(processedItems);
      }

      // Update Claim Header
      const { data: updated, error: updateErr } = await supabase
        .from('expense_claims')
        .update({
          claim_date: claim_date || claim.claim_date,
          description: description ? description.trim() : claim.description,
          cost_center_id: cost_center_id !== undefined ? cost_center_id : claim.cost_center_id,
          budget_id: budget_id !== undefined ? budget_id : claim.budget_id,
          total_amount: calculatedTotal,
          approved_amount: calculatedTotal,
          outstanding_amount: calculatedTotal,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Expense claim ${claim.claim_number} updated successfully.`,
      });
    } catch (err) {
      console.error('Error updating claim:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to update expense claim.' } });
    }
  },

  submitClaim: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const { data: claim, error: fetchErr } = await supabase
        .from('expense_claims')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !claim) {
        return res.status(404).json({ error: { message: 'Expense claim not found.' } });
      }

      if (!['DRAFT', 'RETURNED'].includes(claim.status)) {
        return res.status(400).json({ error: { message: `Claim is already in '${claim.status}' state.` } });
      }

      const { data: updated, error: updateErr } = await supabase
        .from('expense_claims')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
          submitted_by: userId,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('expense_audit_logs').insert({
        claim_id: id,
        action: 'EXPENSE_SUBMITTED',
        performed_by: userId,
        details: { claim_number: claim.claim_number, status: 'SUBMITTED' },
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Expense claim ${claim.claim_number} submitted for review.`,
      });
    } catch (err) {
      console.error('Error submitting claim:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to submit claim.' } });
    }
  },

  // ==========================================================================
  // 4. APPROVAL WORKFLOW & ACCOUNTING POSTING
  // ==========================================================================

  approveClaim: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { items_approval } = req.body; // Array of { item_id, is_approved, approved_amount }

      const { data: claim, error: fetchErr } = await supabase
        .from('expense_claims')
        .select('*, employee:employees(first_name, last_name)')
        .eq('id', id)
        .single();

      if (fetchErr || !claim) {
        return res.status(404).json({ error: { message: 'Expense claim not found.' } });
      }

      if (['APPROVED', 'REIMBURSED', 'REJECTED'].includes(claim.status)) {
        return res.status(400).json({ error: { message: `Claim is already in '${claim.status}' state.` } });
      }

      // Fetch items
      const { data: existingItems } = await supabase
        .from('expense_items')
        .select('*, category:expense_categories(default_account_id)')
        .eq('claim_id', id);

      let totalApproved = 0;
      const approvedItems = [];

      for (const item of existingItems || []) {
        let isAppr = true;
        let apprAmt = parseFloat(item.amount);

        if (items_approval && Array.isArray(items_approval)) {
          const match = items_approval.find((a) => a.item_id === item.id);
          if (match) {
            isAppr = Boolean(match.is_approved);
            apprAmt = isAppr ? Math.min(parseFloat(item.amount), parseFloat(match.approved_amount) || parseFloat(item.amount)) : 0;
          }
        }

        if (isAppr) {
          totalApproved += apprAmt;
          approvedItems.push({ ...item, approved_amount: apprAmt });
        }

        await supabase
          .from('expense_items')
          .update({ is_approved: isAppr, approved_amount: apprAmt, updated_at: new Date().toISOString() })
          .eq('id', item.id);
      }

      if (totalApproved <= 0) {
        return res.status(400).json({ error: { message: 'Cannot approve claim with zero total approved amount.' } });
      }

      // ------------------------------------------------------------------------
      // Budget Overrun Warning Check
      // ------------------------------------------------------------------------
      let budgetWarning = null;
      if (claim.cost_center_id) {
        const { data: costCenter } = await supabase
          .from('cost_centers')
          .select('id, name, code, allocated_budget')
          .eq('id', claim.cost_center_id)
          .maybeSingle();

        if (costCenter && costCenter.allocated_budget > 0) {
          // Fetch existing approved claim total for this cost center
          const { data: ccClaims } = await supabase
            .from('expense_claims')
            .select('approved_amount')
            .eq('cost_center_id', claim.cost_center_id)
            .in('status', ['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED', 'REIMBURSED']);

          const existingCCTotal = (ccClaims || []).reduce((sum, c) => sum + (parseFloat(c.approved_amount) || 0), 0);
          const newCCTotal = existingCCTotal + totalApproved;
          const utilizationPct = (newCCTotal / costCenter.allocated_budget) * 100;

          if (newCCTotal > costCenter.allocated_budget) {
            budgetWarning = `Budget Warning: Expense causes Cost Center '${costCenter.name}' budget utilization to reach ${utilizationPct.toFixed(1)}% (Allocated: ₹${costCenter.allocated_budget.toLocaleString()}, Total Actual: ₹${newCCTotal.toLocaleString()}).`;
          }
        }
      }

      // ------------------------------------------------------------------------
      // Double-Entry Accounting Posting
      // ------------------------------------------------------------------------
      let createdJE = null;
      
      // Check Open Financial Period
      const claimDate = claim.claim_date || new Date().toISOString().split('T')[0];
      const { data: period } = await supabase
        .from('financial_periods')
        .select('id, status')
        .lte('start_date', claimDate)
        .gte('end_date', claimDate)
        .maybeSingle();

      if (period && period.status === 'CLOSED') {
        return res.status(400).json({
          error: { message: `Financial period for claim date (${claimDate}) is CLOSED. Accounting posting blocked.` },
        });
      }

      // COA Lookups:
      // Credit Account: Employee Expense Payable / Liability (e.g. 2100 or 2000)
      // Debit Account: Category Default / General Administrative Expense (5500)
      const { data: payableAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .or('account_code.eq.2100,account_code.eq.2000')
        .limit(1)
        .maybeSingle();

      const { data: defaultExpenseAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .or('account_code.eq.5500,account_code.eq.5000')
        .limit(1)
        .maybeSingle();

      const debitAccountId = approvedItems[0]?.category?.default_account_id || defaultExpenseAccount?.id;
      const creditAccountId = payableAccount?.id;

      if (debitAccountId && creditAccountId) {
        // Generate Journal Entry Number
        let jeNumber;
        try {
          const { data: seqNum } = await supabase.rpc('nextval', { seq_name: 'journal_entry_seq' });
          jeNumber = `JE-${new Date().getFullYear()}-${String(seqNum || 1).padStart(6, '0')}`;
        } catch (e) {
          jeNumber = `JE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        }

        const empName = claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'Employee';

        const { data: jeData } = await supabase
          .from('journal_entries')
          .insert({
            entry_number: jeNumber,
            entry_date: claimDate,
            period_id: period?.id || null,
            entry_type: 'EMPLOYEE_EXPENSE',
            source_reference: claim.claim_number,
            description: `Approved Employee Expense Claim ${claim.claim_number} for ${empName}`,
            status: 'POSTED',
            total_debit: totalApproved,
            total_credit: totalApproved,
            posted_at: new Date().toISOString(),
            posted_by: userId,
            created_by: userId,
          })
          .select()
          .single();

        createdJE = jeData;

        if (createdJE) {
          await supabase.from('journal_entry_lines').insert([
            {
              journal_entry_id: createdJE.id,
              account_id: debitAccountId,
              line_order: 1,
              description: `Expense claim posting - ${claim.claim_number}`,
              debit_amount: totalApproved,
              credit_amount: 0.0,
            },
            {
              journal_entry_id: createdJE.id,
              account_id: creditAccountId,
              line_order: 2,
              description: `Employee Expense Payable liability - ${empName}`,
              debit_amount: 0.0,
              credit_amount: totalApproved,
            },
          ]);
        }
      }

      // Update Claim Header
      const { data: updatedClaim, error: updateErr } = await supabase
        .from('expense_claims')
        .update({
          status: 'APPROVED',
          approved_amount: totalApproved,
          outstanding_amount: totalApproved,
          approved_at: new Date().toISOString(),
          approved_by: userId,
          journal_entry_id: createdJE?.id || null,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('expense_audit_logs').insert({
        claim_id: id,
        action: 'EXPENSE_APPROVED',
        performed_by: userId,
        details: {
          claim_number: claim.claim_number,
          approved_amount: totalApproved,
          journal_entry_id: createdJE?.id || null,
          budget_warning: budgetWarning,
        },
      });

      return res.status(200).json({
        success: true,
        data: updatedClaim,
        journal_entry: createdJE,
        budget_warning: budgetWarning,
        message: `Expense claim ${claim.claim_number} approved for ₹${totalApproved.toLocaleString()}.`,
      });
    } catch (err) {
      console.error('Error approving claim:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to approve expense claim.' } });
    }
  },

  rejectClaim: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { rejection_reason } = req.body;

      if (!rejection_reason || !rejection_reason.trim()) {
        return res.status(400).json({ error: { message: 'Rejection reason is mandatory when rejecting a claim.' } });
      }

      const { data: claim, error: fetchErr } = await supabase
        .from('expense_claims')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !claim) {
        return res.status(404).json({ error: { message: 'Expense claim not found.' } });
      }

      const { data: updated, error: updateErr } = await supabase
        .from('expense_claims')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          rejection_reason: rejection_reason.trim(),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('expense_audit_logs').insert({
        claim_id: id,
        action: 'EXPENSE_REJECTED',
        performed_by: userId,
        details: { claim_number: claim.claim_number, rejection_reason },
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Expense claim ${claim.claim_number} rejected.`,
      });
    } catch (err) {
      console.error('Error rejecting claim:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to reject claim.' } });
    }
  },

  returnClaim: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { return_reason } = req.body;

      if (!return_reason || !return_reason.trim()) {
        return res.status(400).json({ error: { message: 'Reason for return is required.' } });
      }

      const { data: claim, error: fetchErr } = await supabase
        .from('expense_claims')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !claim) {
        return res.status(404).json({ error: { message: 'Expense claim not found.' } });
      }

      const { data: updated, error: updateErr } = await supabase
        .from('expense_claims')
        .update({
          status: 'RETURNED',
          returned_at: new Date().toISOString(),
          returned_by: userId,
          return_reason: return_reason.trim(),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('expense_audit_logs').insert({
        claim_id: id,
        action: 'EXPENSE_RETURNED',
        performed_by: userId,
        details: { claim_number: claim.claim_number, return_reason },
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Expense claim ${claim.claim_number} returned to employee for correction.`,
      });
    } catch (err) {
      console.error('Error returning claim:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to return claim.' } });
    }
  },

  // ==========================================================================
  // 5. REIMBURSEMENTS
  // ==========================================================================

  getReimbursements: async (req, res) => {
    try {
      const { claim_id, employee_id, status, search, start_date, end_date } = req.query;

      let query = supabase
        .from('reimbursements')
        .select(`
          *,
          claim:expense_claims(id, claim_number, description, total_amount, approved_amount),
          employee:employees(id, first_name, last_name, employee_code, department)
        `)
        .order('created_at', { ascending: false });

      if (claim_id) query = query.eq('claim_id', claim_id);
      if (employee_id) query = query.eq('employee_id', employee_id);
      if (status) query = query.eq('status', status);
      if (start_date) query = query.gte('reimbursement_date', start_date);
      if (end_date) query = query.lte('reimbursement_date', end_date);

      if (search) {
        query = query.or(`reimbursement_number.ilike.%${search}%,reference_number.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Error fetching reimbursements:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch reimbursements.' } });
    }
  },

  getReimbursementById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('reimbursements')
        .select(`
          *,
          claim:expense_claims(id, claim_number, description, approved_amount, reimbursed_amount, outstanding_amount),
          employee:employees(id, first_name, last_name, employee_code, department, email),
          journal_entry:journal_entries(id, entry_number, status)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: { message: 'Reimbursement record not found.' } });
      }

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Error fetching reimbursement details:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch reimbursement details.' } });
    }
  },

  createReimbursement: async (req, res) => {
    try {
      const userId = req.user?.id;
      const {
        claim_id,
        reimbursement_date,
        amount,
        payment_method,
        reference_number,
        notes,
      } = req.body;

      const reimbAmount = parseFloat(amount);
      if (!claim_id || !reimbAmount || reimbAmount <= 0) {
        return res.status(400).json({ error: { message: 'Valid claim ID and positive reimbursement amount are required.' } });
      }

      // Fetch Claim and revalidate outstanding amount
      const { data: claim, error: fetchErr } = await supabase
        .from('expense_claims')
        .select('*, employee:employees(first_name, last_name)')
        .eq('id', claim_id)
        .single();

      if (fetchErr || !claim) {
        return res.status(404).json({ error: { message: 'Associated expense claim not found.' } });
      }

      if (!['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED'].includes(claim.status)) {
        return res.status(400).json({
          error: { message: `Claim is in '${claim.status}' status and is not eligible for reimbursement.` },
        });
      }

      const currentOutstanding = parseFloat(claim.outstanding_amount) || 0;
      if (reimbAmount > currentOutstanding + 0.01) {
        return res.status(400).json({
          error: {
            message: `Reimbursement amount (₹${reimbAmount.toLocaleString()}) exceeds approved outstanding balance (₹${currentOutstanding.toLocaleString()}). Over-reimbursement is blocked.`,
          },
        });
      }

      // Generate Reimbursement Number: REIMB-2026-000001
      let reimbNumber;
      try {
        const { data: seqNum } = await supabase.rpc('nextval', { seq_name: 'reimbursement_seq' });
        reimbNumber = `REIMB-${new Date().getFullYear()}-${String(seqNum || 1).padStart(6, '0')}`;
      } catch (e) {
        reimbNumber = `REIMB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      const payDate = reimbursement_date || new Date().toISOString().split('T')[0];

      // ------------------------------------------------------------------------
      // Reimbursement Accounting Entry Posting
      // ------------------------------------------------------------------------
      let createdJE = null;

      // Check Open Financial Period
      const { data: period } = await supabase
        .from('financial_periods')
        .select('id, status')
        .lte('start_date', payDate)
        .gte('end_date', payDate)
        .maybeSingle();

      if (period && period.status === 'CLOSED') {
        return res.status(400).json({
          error: { message: `Financial period for reimbursement date (${payDate}) is CLOSED. Remittance blocked.` },
        });
      }

      // Debit: Employee Expense Payable (2100 or 2000)
      // Credit: Cash / Bank (1010 or 1000)
      const { data: payableAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .or('account_code.eq.2100,account_code.eq.2000')
        .limit(1)
        .maybeSingle();

      const { data: bankAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .or('account_code.eq.1010,account_code.eq.1000')
        .limit(1)
        .maybeSingle();

      if (payableAccount && bankAccount) {
        let jeNumber;
        try {
          const { data: seqNum } = await supabase.rpc('nextval', { seq_name: 'journal_entry_seq' });
          jeNumber = `JE-${new Date().getFullYear()}-${String(seqNum || 1).padStart(6, '0')}`;
        } catch (e) {
          jeNumber = `JE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        }

        const empName = claim.employee ? `${claim.employee.first_name} ${claim.employee.last_name}` : 'Employee';

        const { data: jeData } = await supabase
          .from('journal_entries')
          .insert({
            entry_number: jeNumber,
            entry_date: payDate,
            period_id: period?.id || null,
            entry_type: 'REIMBURSEMENT_REMITTANCE',
            source_reference: reimbNumber,
            description: `Employee Reimbursement payout ${reimbNumber} for ${empName} (${claim.claim_number})`,
            status: 'POSTED',
            total_debit: reimbAmount,
            total_credit: reimbAmount,
            posted_at: new Date().toISOString(),
            posted_by: userId,
            created_by: userId,
          })
          .select()
          .single();

        createdJE = jeData;

        if (createdJE) {
          await supabase.from('journal_entry_lines').insert([
            {
              journal_entry_id: createdJE.id,
              account_id: payableAccount.id,
              line_order: 1,
              description: `Settling employee payable liability - ${reimbNumber}`,
              debit_amount: reimbAmount,
              credit_amount: 0.0,
            },
            {
              journal_entry_id: createdJE.id,
              account_id: bankAccount.id,
              line_order: 2,
              description: `Cash/Bank payout remittance - ${reimbNumber}`,
              debit_amount: 0.0,
              credit_amount: reimbAmount,
            },
          ]);
        }
      }

      // Insert Reimbursement Record
      const { data: reimbursement, error: reimbErr } = await supabase
        .from('reimbursements')
        .insert({
          reimbursement_number: reimbNumber,
          claim_id,
          employee_id: claim.employee_id,
          reimbursement_date: payDate,
          amount: reimbAmount,
          payment_method: payment_method || 'BANK_TRANSFER',
          reference_number: reference_number || null,
          status: 'POSTED',
          notes: notes || null,
          journal_entry_id: createdJE?.id || null,
          created_by: userId,
        })
        .select()
        .single();

      if (reimbErr) throw reimbErr;

      // Update Claim Header Balances & Status
      const newReimbursed = (parseFloat(claim.reimbursed_amount) || 0) + reimbAmount;
      const newOutstanding = Math.max(0, parseFloat(claim.approved_amount) - newReimbursed);
      const newClaimStatus = newOutstanding <= 0.01 ? 'REIMBURSED' : 'PARTIALLY_REIMBURSED';

      await supabase
        .from('expense_claims')
        .update({
          reimbursed_amount: newReimbursed,
          outstanding_amount: newOutstanding,
          status: newClaimStatus,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', claim_id);

      await supabase.from('expense_audit_logs').insert({
        claim_id,
        reimbursement_id: reimbursement.id,
        action: 'REIMBURSEMENT_POSTED',
        performed_by: userId,
        details: {
          reimbursement_number: reimbNumber,
          amount: reimbAmount,
          remaining_outstanding: newOutstanding,
          claim_status: newClaimStatus,
        },
      });

      return res.status(201).json({
        success: true,
        data: reimbursement,
        message: `Reimbursement ${reimbNumber} of ₹${reimbAmount.toLocaleString()} recorded successfully.`,
      });
    } catch (err) {
      console.error('Error creating reimbursement:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to record reimbursement.' } });
    }
  },

  voidReimbursement: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { void_reason } = req.body;

      if (!void_reason || !void_reason.trim()) {
        return res.status(400).json({ error: { message: 'Reason for voiding reimbursement is required.' } });
      }

      const { data: reimb, error: fetchErr } = await supabase
        .from('reimbursements')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !reimb) {
        return res.status(404).json({ error: { message: 'Reimbursement record not found.' } });
      }

      if (reimb.status === 'VOIDED') {
        return res.status(400).json({ error: { message: 'Reimbursement is already voided.' } });
      }

      // Reverse Journal Entry if posted
      if (reimb.journal_entry_id) {
        await supabase
          .from('journal_entries')
          .update({ status: 'REVERSED', notes: `Reversed due to voiding reimbursement ${reimb.reimbursement_number}` })
          .eq('id', reimb.journal_entry_id);
      }

      // Update Reimbursement Status
      const { data: voided, error: voidErr } = await supabase
        .from('reimbursements')
        .update({
          status: 'VOIDED',
          voided_at: new Date().toISOString(),
          voided_by: userId,
          void_reason: void_reason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (voidErr) throw voidErr;

      // Adjust Claim Balances
      const { data: claim } = await supabase.from('expense_claims').select('*').eq('id', reimb.claim_id).single();
      if (claim) {
        const newReimbursed = Math.max(0, parseFloat(claim.reimbursed_amount) - parseFloat(reimb.amount));
        const newOutstanding = Math.max(0, parseFloat(claim.approved_amount) - newReimbursed);
        let newStatus = 'APPROVED';
        if (newReimbursed > 0) newStatus = 'PARTIALLY_REIMBURSED';

        await supabase
          .from('expense_claims')
          .update({
            reimbursed_amount: newReimbursed,
            outstanding_amount: newOutstanding,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reimb.claim_id);
      }

      await supabase.from('expense_audit_logs').insert({
        claim_id: reimb.claim_id,
        reimbursement_id: id,
        action: 'REIMBURSEMENT_VOIDED',
        performed_by: userId,
        details: { reimbursement_number: reimb.reimbursement_number, void_reason },
      });

      return res.status(200).json({
        success: true,
        data: voided,
        message: `Reimbursement ${reimb.reimbursement_number} voided successfully.`,
      });
    } catch (err) {
      console.error('Error voiding reimbursement:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to void reimbursement.' } });
    }
  },

  // ==========================================================================
  // 6. DASHBOARD KPIS & REPORTS
  // ==========================================================================

  getDashboardKPIs: async (req, res) => {
    try {
      const { data: claims, error } = await supabase
        .from('expense_claims')
        .select('status, total_amount, approved_amount, reimbursed_amount, outstanding_amount');

      if (error) throw error;

      const kpis = {
        total_claims_count: (claims || []).length,
        pending_review_count: (claims || []).filter((c) => ['SUBMITTED', 'MANAGER_REVIEW', 'FINANCE_REVIEW'].includes(c.status)).length,
        approved_count: (claims || []).filter((c) => ['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED', 'REIMBURSED'].includes(c.status)).length,
        total_approved_amount: (claims || [])
          .filter((c) => ['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED', 'REIMBURSED'].includes(c.status))
          .reduce((sum, c) => sum + (parseFloat(c.approved_amount) || 0), 0),
        total_reimbursed_amount: (claims || []).reduce((sum, c) => sum + (parseFloat(c.reimbursed_amount) || 0), 0),
        total_outstanding_amount: (claims || [])
          .filter((c) => ['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED'].includes(c.status))
          .reduce((sum, c) => sum + (parseFloat(c.outstanding_amount) || 0), 0),
        draft_count: (claims || []).filter((c) => c.status === 'DRAFT').length,
        rejected_count: (claims || []).filter((c) => c.status === 'REJECTED').length,
      };

      return res.status(200).json({ success: true, data: kpis });
    } catch (err) {
      console.error('Error fetching expense KPIs:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch dashboard KPIs.' } });
    }
  },

  getReports: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      // Fetch claims with relationships
      let claimQuery = supabase
        .from('expense_claims')
        .select(`
          *,
          employee:employees(id, first_name, last_name),
          cost_center:cost_centers(id, code, name, allocated_budget)
        `);

      if (start_date) claimQuery = claimQuery.gte('claim_date', start_date);
      if (end_date) claimQuery = claimQuery.lte('claim_date', end_date);

      const { data: claims, error: claimErr } = await claimQuery;
      if (claimErr) throw claimErr;

      // Fetch line items with categories
      const { data: items, error: itemErr } = await supabase
        .from('expense_items')
        .select(`
          *,
          category:expense_categories(id, code, name),
          claim:expense_claims(claim_date, status, employee_id)
        `);

      if (itemErr) throw itemErr;

      // 1. Expense by Employee
      const byEmployeeMap = {};
      (claims || []).forEach((c) => {
        const empId = c.employee_id;
        const empName = c.employee ? `${c.employee.first_name} ${c.employee.last_name}` : 'Unknown Employee';
        const dept = c.employee?.department || 'General';

        if (!byEmployeeMap[empId]) {
          byEmployeeMap[empId] = {
            employee_id: empId,
            employee_name: empName,
            department: dept,
            total_claims: 0,
            total_submitted: 0,
            total_approved: 0,
            total_reimbursed: 0,
            total_outstanding: 0,
          };
        }

        byEmployeeMap[empId].total_claims += 1;
        byEmployeeMap[empId].total_submitted += parseFloat(c.total_amount) || 0;
        if (['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED', 'REIMBURSED'].includes(c.status)) {
          byEmployeeMap[empId].total_approved += parseFloat(c.approved_amount) || 0;
        }
        byEmployeeMap[empId].total_reimbursed += parseFloat(c.reimbursed_amount) || 0;
        byEmployeeMap[empId].total_outstanding += parseFloat(c.outstanding_amount) || 0;
      });

      // 2. Expense by Category
      const byCategoryMap = {};
      (items || []).forEach((item) => {
        const catCode = item.category?.code || 'MISC';
        const catName = item.category?.name || 'Uncategorized';

        if (!byCategoryMap[catCode]) {
          byCategoryMap[catCode] = {
            code: catCode,
            name: catName,
            items_count: 0,
            total_amount: 0,
            approved_amount: 0,
          };
        }

        byCategoryMap[catCode].items_count += 1;
        byCategoryMap[catCode].total_amount += parseFloat(item.amount) || 0;
        if (item.is_approved) {
          byCategoryMap[catCode].approved_amount += parseFloat(item.approved_amount) || 0;
        }
      });

      // 3. Expense by Cost Center
      const byCostCenterMap = {};
      (claims || []).forEach((c) => {
        if (!c.cost_center) return;
        const ccId = c.cost_center.id;
        const ccName = `${c.cost_center.code} - ${c.cost_center.name}`;
        const allocatedBudget = parseFloat(c.cost_center.allocated_budget) || 0;

        if (!byCostCenterMap[ccId]) {
          byCostCenterMap[ccId] = {
            cost_center_id: ccId,
            cost_center_name: ccName,
            allocated_budget: allocatedBudget,
            approved_expense: 0,
            outstanding_reimbursement: 0,
          };
        }

        if (['APPROVED', 'REIMBURSEMENT_PENDING', 'PARTIALLY_REIMBURSED', 'REIMBURSED'].includes(c.status)) {
          byCostCenterMap[ccId].approved_expense += parseFloat(c.approved_amount) || 0;
        }
        byCostCenterMap[ccId].outstanding_reimbursement += parseFloat(c.outstanding_amount) || 0;
      });

      return res.status(200).json({
        success: true,
        data: {
          by_employee: Object.values(byEmployeeMap),
          by_category: Object.values(byCategoryMap),
          by_cost_center: Object.values(byCostCenterMap),
        },
      });
    } catch (err) {
      console.error('Error calculating expense reports:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to calculate expense reports.' } });
    }
  },
};

module.exports = expenseController;
