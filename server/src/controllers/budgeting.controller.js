import { supabaseAdmin } from '../config/supabase.js';

/**
 * Controller for Budgeting, Cost Centers, Budget Approvals, and Budget vs Actual Variance Analysis
 */
export const budgetingController = {
  // ============================================================================
  // 1. COST CENTERS MANAGEMENT
  // ============================================================================

  getCostCenters: async (req, res) => {
    try {
      const { search, is_active } = req.query;

      let query = supabaseAdmin
        .from('cost_centers')
        .select(`
          *,
          parent:cost_centers!parent_id(id, code, name),
          manager:employees!manager_id(id, first_name, last_name, employee_code, department)
        `)
        .order('code', { ascending: true });

      if (is_active !== undefined && is_active !== '') {
        query = query.eq('is_active', is_active === 'true');
      }

      const { data, error } = await query;
      if (error) throw error;

      let list = data || [];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
      }

      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      console.error('Error fetching cost centers:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch cost centers.' });
    }
  },

  getCostCenterById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: center, error } = await supabaseAdmin
        .from('cost_centers')
        .select(`
          *,
          parent:cost_centers!parent_id(id, code, name),
          manager:employees!manager_id(id, first_name, last_name, employee_code, department)
        `)
        .eq('id', id)
        .single();

      if (error || !center) {
        return res.status(404).json({ success: false, message: 'Cost Center not found.' });
      }

      // Fetch child cost centers if any
      const { data: children } = await supabaseAdmin
        .from('cost_centers')
        .select('id, code, name, is_active')
        .eq('parent_id', id);

      // Fetch budget lines attached to this cost center
      const { data: budgetLines } = await supabaseAdmin
        .from('budget_lines')
        .select(`
          *,
          budget:budgets(id, budget_code, budget_name, status, version),
          account:chart_of_accounts(id, account_code, account_name, account_type)
        `)
        .eq('cost_center_id', id);

      return res.status(200).json({
        success: true,
        data: {
          ...center,
          children: children || [],
          budgetLines: budgetLines || [],
        },
      });
    } catch (err) {
      console.error('Error fetching cost center detail:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch cost center detail.' });
    }
  },

  createCostCenter: async (req, res) => {
    try {
      const { code, name, description, parent_id, manager_id, is_active } = req.body;

      if (!code || !name) {
        return res.status(400).json({ success: false, message: 'Cost Center Code and Name are required.' });
      }

      const formattedCode = code.trim().toUpperCase();

      const { data, error } = await supabaseAdmin
        .from('cost_centers')
        .insert({
          code: formattedCode,
          name: name.trim(),
          description: description || null,
          parent_id: parent_id || null,
          manager_id: manager_id || null,
          is_active: is_active !== undefined ? !!is_active : true,
          created_by: req.user ? req.user.id : null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ success: false, message: `Cost Center code '${formattedCode}' already exists.` });
        }
        throw error;
      }

      return res.status(201).json({
        success: true,
        message: `Cost Center '${formattedCode} - ${name}' created successfully.`,
        data,
      });
    } catch (err) {
      console.error('Error creating cost center:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to create cost center.' });
    }
  },

  updateCostCenter: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, parent_id, manager_id, is_active } = req.body;

      const { data: updated, error } = await supabaseAdmin
        .from('cost_centers')
        .update({
          name: name ? name.trim() : undefined,
          description,
          parent_id: parent_id !== undefined ? parent_id : undefined,
          manager_id: manager_id !== undefined ? manager_id : undefined,
          is_active: is_active !== undefined ? !!is_active : undefined,
          updated_at: new Date().toISOString(),
          updated_by: req.user ? req.user.id : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Cost Center updated successfully.', data: updated });
    } catch (err) {
      console.error('Error updating cost center:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to update cost center.' });
    }
  },

  // ============================================================================
  // 2. BUDGET DASHBOARD KPIS & SUMMARY
  // ============================================================================

  getBudgetSummaryKPIs: async (req, res) => {
    try {
      const [budgetsRes, postedLinesRes] = await Promise.all([
        supabaseAdmin
          .from('budgets')
          .select('*, period:financial_periods(*), lines:budget_lines(*, account:chart_of_accounts(*))'),
        supabaseAdmin
          .from('journal_entry_lines')
          .select('*, account:chart_of_accounts(*), journal_entry:journal_entries(*)')
      ]);

      const budgets = budgetsRes.data || [];
      const postedLines = (postedLinesRes.data || []).filter(
        (l) => l.journal_entry && l.journal_entry.status === 'POSTED'
      );

      // Approved Budgets
      const approvedBudgets = budgets.filter((b) => b.status === 'APPROVED' || b.status === 'LOCKED');
      const totalApprovedBudget = approvedBudgets.reduce((acc, b) => acc + parseFloat(b.total_budget_amount || 0), 0);

      // Calculate Total Actual Expense Spend from posted GL entries
      let totalActualSpend = 0;
      postedLines.forEach((line) => {
        const acct = line.account;
        if (!acct) return;
        const d = parseFloat(line.debit || 0);
        const c = parseFloat(line.credit || 0);

        if (acct.account_type === 'EXPENSE') {
          totalActualSpend += d - c;
        }
      });

      const remainingBudget = Math.max(0, totalApprovedBudget - totalActualSpend);
      const overallUtilization = totalApprovedBudget > 0 ? (totalActualSpend / totalApprovedBudget) * 100 : 0;

      // Status Counts
      const draftCount = budgets.filter((b) => b.status === 'DRAFT').length;
      const submittedCount = budgets.filter((b) => b.status === 'SUBMITTED' || b.status === 'UNDER_REVIEW').length;
      const approvedCount = approvedBudgets.length;
      const rejectedCount = budgets.filter((b) => b.status === 'REJECTED').length;
      const lockedCount = budgets.filter((b) => b.status === 'LOCKED').length;

      return res.status(200).json({
        success: true,
        data: {
          totalApprovedBudget,
          totalActualSpend,
          remainingBudget,
          overallUtilization: Math.round(overallUtilization * 100) / 100,
          statusCounts: {
            draft: draftCount,
            submitted: submittedCount,
            approved: approvedCount,
            rejected: rejectedCount,
            locked: lockedCount,
          },
          totalBudgetsCount: budgets.length,
        },
      });
    } catch (err) {
      console.error('Error fetching budget summary KPIs:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch budget telemetry.' });
    }
  },

  // ============================================================================
  // 3. BUDGET HEADER & LINE MANAGEMENT
  // ============================================================================

  getBudgets: async (req, res) => {
    try {
      const { status, period_id, search, owner_id } = req.query;

      let query = supabaseAdmin
        .from('budgets')
        .select(`
          *,
          period:financial_periods(id, period_name, start_date, end_date, status),
          owner:employees!owner_id(id, first_name, last_name, employee_code, department)
        `)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (period_id) query = query.eq('period_id', period_id);
      if (owner_id) query = query.eq('owner_id', owner_id);

      const { data, error } = await query;
      if (error) throw error;

      let list = data || [];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (b) =>
            b.budget_code.toLowerCase().includes(q) ||
            b.budget_name.toLowerCase().includes(q) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
      }

      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      console.error('Error fetching budgets:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch budgets.' });
    }
  },

  getBudgetApprovalsList: async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('budgets')
        .select(`
          *,
          period:financial_periods(id, period_name, start_date, end_date),
          owner:employees!owner_id(id, first_name, last_name, employee_code, department)
        `)
        .in('status', ['SUBMITTED', 'UNDER_REVIEW'])
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Error fetching budget approvals queue:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch budget approvals list.' });
    }
  },

  getBudgetById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: budget, error } = await supabaseAdmin
        .from('budgets')
        .select(`
          *,
          period:financial_periods(*),
          owner:employees!owner_id(id, first_name, last_name, employee_code, department),
          lines:budget_lines(
            *,
            account:chart_of_accounts(id, account_code, account_name, account_type, normal_balance),
            cost_center:cost_centers(id, code, name)
          )
        `)
        .eq('id', id)
        .single();

      if (error || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      return res.status(200).json({ success: true, data: budget });
    } catch (err) {
      console.error('Error fetching budget by id:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch budget details.' });
    }
  },

  createBudget: async (req, res) => {
    try {
      const { budget_name, period_id, description, owner_id, lines } = req.body;

      if (!budget_name || !period_id) {
        return res.status(400).json({ success: false, message: 'Budget Name and Financial Period are required.' });
      }

      if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({ success: false, message: 'Budget must contain at least one budget line.' });
      }

      // Verify period exists
      const { data: period, error: perr } = await supabaseAdmin
        .from('financial_periods')
        .select('*')
        .eq('id', period_id)
        .single();

      if (perr || !period) {
        return res.status(400).json({ success: false, message: 'Selected financial period is invalid.' });
      }

      // Calculate server-side total budget amount & validate line amounts
      let totalBudget = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.account_id) {
          return res.status(400).json({ success: false, message: `Budget Line #${i + 1} requires an account.` });
        }
        const amt = parseFloat(line.budget_amount || 0);
        if (isNaN(amt) || amt < 0) {
          return res.status(400).json({ success: false, message: `Budget Line #${i + 1} amount cannot be negative.` });
        }
        totalBudget += amt;
      }

      // Generate Budget Code using sequence (e.g. BUD-2026-000001)
      const { data: seqVal } = await supabaseAdmin.rpc('get_next_sequence_val', { seq_name: 'budget_seq' });
      const yearStr = new Date().getFullYear();
      let codeNum = 1;
      if (seqVal) {
        codeNum = seqVal;
      } else {
        const { count } = await supabaseAdmin.from('budgets').select('id', { count: 'exact' });
        codeNum = (count || 0) + 1;
      }
      const budgetCode = `BUD-${yearStr}-${String(codeNum).padStart(6, '0')}`;

      // Insert Budget Header
      const { data: budgetHeader, error: headErr } = await supabaseAdmin
        .from('budgets')
        .insert({
          budget_code: budgetCode,
          budget_name: budget_name.trim(),
          period_id,
          version: 1,
          currency: 'INR',
          status: 'DRAFT',
          description: description || null,
          total_budget_amount: totalBudget,
          owner_id: owner_id || null,
          created_by: req.user ? req.user.id : null,
        })
        .select()
        .single();

      if (headErr) throw headErr;

      // Insert Budget Lines
      const linePayloads = lines.map((l) => ({
        budget_id: budgetHeader.id,
        account_id: l.account_id,
        cost_center_id: l.cost_center_id || null,
        period_id: l.period_id || period_id,
        budget_amount: parseFloat(l.budget_amount || 0),
        notes: l.notes || null,
      }));

      const { error: lineErr } = await supabaseAdmin.from('budget_lines').insert(linePayloads);

      if (lineErr) {
        // Rollback header on error
        await supabaseAdmin.from('budgets').delete().eq('id', budgetHeader.id);
        throw lineErr;
      }

      return res.status(201).json({
        success: true,
        message: `Budget '${budgetCode}' created successfully as DRAFT.`,
        data: budgetHeader,
      });
    } catch (err) {
      console.error('Error creating budget:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to create budget.' });
    }
  },

  updateBudget: async (req, res) => {
    try {
      const { id } = req.params;
      const { budget_name, description, owner_id, lines } = req.body;

      const { data: budget, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      if (budget.status !== 'DRAFT' && budget.status !== 'REJECTED') {
        return res.status(400).json({
          success: false,
          message: `Cannot modify budget in '${budget.status}' status. Only DRAFT or REJECTED budgets can be edited.`,
        });
      }

      let totalBudget = budget.total_budget_amount;

      if (lines && Array.isArray(lines)) {
        totalBudget = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.account_id) {
            return res.status(400).json({ success: false, message: `Budget Line #${i + 1} requires an account.` });
          }
          const amt = parseFloat(line.budget_amount || 0);
          if (isNaN(amt) || amt < 0) {
            return res.status(400).json({ success: false, message: `Budget Line #${i + 1} amount cannot be negative.` });
          }
          totalBudget += amt;
        }

        // Replace lines
        await supabaseAdmin.from('budget_lines').delete().eq('budget_id', id);

        const linePayloads = lines.map((l) => ({
          budget_id: id,
          account_id: l.account_id,
          cost_center_id: l.cost_center_id || null,
          period_id: l.period_id || budget.period_id,
          budget_amount: parseFloat(l.budget_amount || 0),
          notes: l.notes || null,
        }));

        await supabaseAdmin.from('budget_lines').insert(linePayloads);
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('budgets')
        .update({
          budget_name: budget_name ? budget_name.trim() : undefined,
          description: description !== undefined ? description : undefined,
          owner_id: owner_id !== undefined ? owner_id : undefined,
          total_budget_amount: totalBudget,
          status: budget.status === 'REJECTED' ? 'DRAFT' : budget.status,
          updated_at: new Date().toISOString(),
          updated_by: req.user ? req.user.id : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.status(200).json({ success: true, message: 'Budget updated successfully.', data: updated });
    } catch (err) {
      console.error('Error updating budget:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to update budget.' });
    }
  },

  // ============================================================================
  // 4. BUDGET WORKFLOW & APPROVALS
  // ============================================================================

  submitBudget: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: budget, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      if (budget.status !== 'DRAFT') {
        return res.status(400).json({ success: false, message: `Only DRAFT budgets can be submitted for review.` });
      }

      const { data: submitted, error } = await supabaseAdmin
        .from('budgets')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
          submitted_by: req.user ? req.user.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({
        success: true,
        message: `Budget '${budget.budget_code}' submitted for management approval.`,
        data: submitted,
      });
    } catch (err) {
      console.error('Error submitting budget:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit budget for approval.' });
    }
  },

  approveBudget: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: budget, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      if (budget.status !== 'SUBMITTED' && budget.status !== 'UNDER_REVIEW') {
        return res.status(400).json({
          success: false,
          message: `Budget in '${budget.status}' status cannot be approved.`,
        });
      }

      const { data: approved, error } = await supabaseAdmin
        .from('budgets')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: req.user ? req.user.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({
        success: true,
        message: `Budget '${budget.budget_code}' has been APPROVED!`,
        data: approved,
      });
    } catch (err) {
      console.error('Error approving budget:', err);
      return res.status(500).json({ success: false, message: 'Failed to approve budget.' });
    }
  },

  rejectBudget: async (req, res) => {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;

      if (!rejection_reason || !rejection_reason.trim()) {
        return res.status(400).json({ success: false, message: 'A rejection reason is mandatory when rejecting a budget.' });
      }

      const { data: budget, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      if (budget.status !== 'SUBMITTED' && budget.status !== 'UNDER_REVIEW') {
        return res.status(400).json({
          success: false,
          message: `Budget in '${budget.status}' status cannot be rejected.`,
        });
      }

      const { data: rejected, error } = await supabaseAdmin
        .from('budgets')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejected_by: req.user ? req.user.id : null,
          rejection_reason: rejection_reason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({
        success: true,
        message: `Budget '${budget.budget_code}' rejected. Reason recorded.`,
        data: rejected,
      });
    } catch (err) {
      console.error('Error rejecting budget:', err);
      return res.status(500).json({ success: false, message: 'Failed to reject budget.' });
    }
  },

  lockBudget: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: budget, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      if (budget.status !== 'APPROVED') {
        return res.status(400).json({ success: false, message: `Only APPROVED budgets can be locked.` });
      }

      const { data: locked, error } = await supabaseAdmin
        .from('budgets')
        .update({
          status: 'LOCKED',
          locked_at: new Date().toISOString(),
          locked_by: req.user ? req.user.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({
        success: true,
        message: `Budget '${budget.budget_code}' is now LOCKED against further changes.`,
        data: locked,
      });
    } catch (err) {
      console.error('Error locking budget:', err);
      return res.status(500).json({ success: false, message: 'Failed to lock budget.' });
    }
  },

  archiveBudget: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: archived, error } = await supabaseAdmin
        .from('budgets')
        .update({
          status: 'ARCHIVED',
          updated_at: new Date().toISOString(),
          updated_by: req.user ? req.user.id : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Budget archived.', data: archived });
    } catch (err) {
      console.error('Error archiving budget:', err);
      return res.status(500).json({ success: false, message: 'Failed to archive budget.' });
    }
  },

  createBudgetVersion: async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch source budget & lines
      const { data: source, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select('*, lines:budget_lines(*)')
        .eq('id', id)
        .single();

      if (fetchErr || !source) {
        return res.status(404).json({ success: false, message: 'Original budget not found.' });
      }

      // Generate New Version Code
      const nextVersion = source.version + 1;
      const { count } = await supabaseAdmin.from('budgets').select('id', { count: 'exact' });
      const yearStr = new Date().getFullYear();
      const newCode = `BUD-${yearStr}-${String((count || 0) + 1).padStart(6, '0')}`;

      // Insert New Version Header
      const { data: newBudget, error: headErr } = await supabaseAdmin
        .from('budgets')
        .insert({
          budget_code: newCode,
          budget_name: `${source.budget_name} (v${nextVersion})`,
          period_id: source.period_id,
          version: nextVersion,
          currency: source.currency,
          status: 'DRAFT',
          description: `Revision of ${source.budget_code} (v${source.version})`,
          total_budget_amount: source.total_budget_amount,
          owner_id: source.owner_id,
          parent_version_id: source.id,
          created_by: req.user ? req.user.id : null,
        })
        .select()
        .single();

      if (headErr) throw headErr;

      // Copy Budget Lines
      if (source.lines && source.lines.length > 0) {
        const copiedLines = source.lines.map((l) => ({
          budget_id: newBudget.id,
          account_id: l.account_id,
          cost_center_id: l.cost_center_id,
          period_id: l.period_id,
          budget_amount: l.budget_amount,
          notes: l.notes,
        }));
        await supabaseAdmin.from('budget_lines').insert(copiedLines);
      }

      return res.status(201).json({
        success: true,
        message: `New budget version '${newCode}' (v${nextVersion}) created from ${source.budget_code}.`,
        data: newBudget,
      });
    } catch (err) {
      console.error('Error creating budget version:', err);
      return res.status(500).json({ success: false, message: 'Failed to create budget version.' });
    }
  },

  // ============================================================================
  // 5. BUDGET VS ACTUAL & VARIANCE ANALYSIS
  // ============================================================================

  getBudgetVariance: async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch Budget Header & Lines
      const { data: budget, error: fetchErr } = await supabaseAdmin
        .from('budgets')
        .select(`
          *,
          period:financial_periods(*),
          lines:budget_lines(
            *,
            account:chart_of_accounts(*),
            cost_center:cost_centers(*)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchErr || !budget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      // Fetch Posted Journal Lines within financial period date range
      let dateQuery = supabaseAdmin
        .from('journal_entry_lines')
        .select('*, account:chart_of_accounts(*), journal_entry:journal_entries(*)');

      const { data: journalLinesData } = await dateQuery;
      const postedLines = (journalLinesData || []).filter((l) => {
        if (!l.journal_entry || l.journal_entry.status !== 'POSTED') return false;
        if (budget.period) {
          const entryDate = l.journal_entry.entry_date;
          return entryDate >= budget.period.start_date && entryDate <= budget.period.end_date;
        }
        return true;
      });

      // Calculate Actuals per Budget Line
      let totalBudgetAmt = 0;
      let totalActualAmt = 0;

      const lineVariances = (budget.lines || []).map((line) => {
        const acct = line.account;
        const costCenterId = line.cost_center_id;

        // Match posted accounting lines by account_id (and optional cost_center_id)
        const matchedLines = postedLines.filter((pl) => {
          if (pl.account_id !== line.account_id) return false;
          return true;
        });

        let actual = 0;
        matchedLines.forEach((ml) => {
          const d = parseFloat(ml.debit || 0);
          const c = parseFloat(ml.credit || 0);
          if (acct && acct.account_type === 'REVENUE') {
            actual += c - d;
          } else {
            actual += d - c; // Expenses / Assets
          }
        });

        const bAmt = parseFloat(line.budget_amount || 0);
        totalBudgetAmt += bAmt;
        totalActualAmt += actual;

        let variance = 0;
        let isOverSpend = false;
        let isFavorable = false;
        let statusLabel = '';

        if (acct && acct.account_type === 'REVENUE') {
          variance = actual - bAmt;
          isFavorable = variance >= 0;
          statusLabel = isFavorable ? 'Above Budget' : 'Below Budget';
        } else {
          // Expense / Asset / Other
          variance = bAmt - actual;
          isOverSpend = actual > bAmt;
          isFavorable = actual <= bAmt;
          statusLabel = isOverSpend ? 'Over Budget (Unfavorable)' : 'Within Budget (Favorable)';
        }

        const variancePercent = bAmt > 0 ? (variance / bAmt) * 100 : null;
        const utilizationPercent = bAmt > 0 ? (actual / bAmt) * 100 : null;

        return {
          id: line.id,
          account_id: line.account_id,
          account_code: acct ? acct.account_code : 'N/A',
          account_name: acct ? acct.account_name : 'N/A',
          account_type: acct ? acct.account_type : 'EXPENSE',
          cost_center: line.cost_center ? { id: line.cost_center.id, code: line.cost_center.code, name: line.cost_center.name } : null,
          budget_amount: bAmt,
          actual_amount: actual,
          variance_amount: Math.round(variance * 100) / 100,
          variance_percent: variancePercent !== null ? Math.round(variancePercent * 100) / 100 : 'N/A',
          utilization_percent: utilizationPercent !== null ? Math.round(utilizationPercent * 100) / 100 : 'N/A',
          is_over_budget: isOverSpend,
          is_favorable: isFavorable,
          status_label: statusLabel,
          notes: line.notes,
        };
      });

      const totalVariance = totalBudgetAmt - totalActualAmt;
      const totalUtilization = totalBudgetAmt > 0 ? (totalActualAmt / totalBudgetAmt) * 100 : 0;

      return res.status(200).json({
        success: true,
        data: {
          budget: {
            id: budget.id,
            budget_code: budget.budget_code,
            budget_name: budget.budget_name,
            version: budget.version,
            status: budget.status,
            period: budget.period,
          },
          summary: {
            total_budget: totalBudgetAmt,
            total_actual: totalActualAmt,
            total_variance: Math.round(totalVariance * 100) / 100,
            total_utilization_percent: Math.round(totalUtilization * 100) / 100,
          },
          lines: lineVariances,
        },
      });
    } catch (err) {
      console.error('Error calculating budget variance:', err);
      return res.status(500).json({ success: false, message: 'Failed to calculate budget variance report.' });
    }
  },

  getBudgetVersions: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: currentBudget } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (!currentBudget) {
        return res.status(404).json({ success: false, message: 'Budget not found.' });
      }

      // Query root parent budget or all related versions
      const rootId = currentBudget.parent_version_id || currentBudget.id;

      const { data: versions, error } = await supabaseAdmin
        .from('budgets')
        .select(`
          *,
          period:financial_periods(id, period_name)
        `)
        .or(`id.eq.${rootId},parent_version_id.eq.${rootId}`)
        .order('version', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data: versions || [] });
    } catch (err) {
      console.error('Error fetching budget versions:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch budget versions.' });
    }
  },

  getBudgetVsActualReport: async (req, res) => {
    try {
      const { period_id, cost_center_id, account_type } = req.query;

      let budgetQuery = supabaseAdmin
        .from('budget_lines')
        .select(`
          *,
          budget:budgets!inner(*, period:financial_periods(*)),
          account:chart_of_accounts!inner(*),
          cost_center:cost_centers(*)
        `);

      if (period_id) budgetQuery = budgetQuery.eq('budget.period_id', period_id);
      if (cost_center_id) budgetQuery = budgetQuery.eq('cost_center_id', cost_center_id);
      if (account_type) budgetQuery = budgetQuery.eq('account.account_type', account_type);

      const { data: lines, error } = await budgetQuery;
      if (error) throw error;

      // Query posted GL actuals
      const { data: glLines } = await supabaseAdmin
        .from('journal_entry_lines')
        .select('*, account:chart_of_accounts(*), journal_entry:journal_entries(*)');

      const postedGl = (glLines || []).filter((l) => l.journal_entry && l.journal_entry.status === 'POSTED');

      const reportLines = (lines || []).map((line) => {
        const acct = line.account;
        const bAmt = parseFloat(line.budget_amount || 0);

        let actual = 0;
        postedGl.forEach((gl) => {
          if (gl.account_id === line.account_id) {
            const d = parseFloat(gl.debit || 0);
            const c = parseFloat(gl.credit || 0);
            if (acct.account_type === 'REVENUE') {
              actual += c - d;
            } else {
              actual += d - c;
            }
          }
        });

        const variance = acct.account_type === 'REVENUE' ? actual - bAmt : bAmt - actual;
        const utilization = bAmt > 0 ? (actual / bAmt) * 100 : 0;

        return {
          budget_code: line.budget.budget_code,
          budget_name: line.budget.budget_name,
          period_name: line.budget.period?.period_name || 'N/A',
          account_code: acct.account_code,
          account_name: acct.account_name,
          account_type: acct.account_type,
          cost_center_name: line.cost_center?.name || 'General Overhead',
          budget_amount: bAmt,
          actual_amount: actual,
          variance_amount: Math.round(variance * 100) / 100,
          utilization_percent: Math.round(utilization * 100) / 100,
        };
      });

      return res.status(200).json({ success: true, data: reportLines });
    } catch (err) {
      console.error('Error generating management budget report:', err);
      return res.status(500).json({ success: false, message: 'Failed to generate budget report.' });
    }
  },
};
