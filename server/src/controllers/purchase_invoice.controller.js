const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Controller for Purchase Invoicing, Three-Way Matching, Supplier Payments & Accounts Payable
 */
const purchaseInvoiceController = {
  // ==========================================================================
  // 1. LIST PURCHASE INVOICES
  // ==========================================================================
  getInvoices: async (req, res) => {
    try {
      const { supplier_id, status, match_status, search, start_date, end_date } = req.query;

      let query = supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(id, supplier_name, supplier_code),
          purchase_order:purchase_orders(id, po_number),
          grn:goods_receipts(id, grn_number)
        `)
        .order('created_at', { ascending: false });

      if (supplier_id) query = query.eq('supplier_id', supplier_id);
      if (status) query = query.eq('status', status);
      if (match_status) query = query.eq('match_status', match_status);
      if (start_date) query = query.gte('invoice_date', start_date);
      if (end_date) query = query.lte('invoice_date', end_date);

      if (search) {
        query = query.or(
          `internal_invoice_number.ilike.%${search}%,supplier_invoice_number.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Error fetching purchase invoices:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch purchase invoices.' } });
    }
  },

  // ==========================================================================
  // 2. GET PURCHASE INVOICE BY ID
  // ==========================================================================
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: invoice, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(id, supplier_name, supplier_code, payment_terms),
          purchase_order:purchase_orders(id, po_number, status),
          grn:goods_receipts(id, grn_number, status),
          journal_entry:journal_entries(id, entry_number, status)
        `)
        .eq('id', id)
        .single();

      if (error || !invoice) {
        return res.status(404).json({ error: { message: 'Purchase invoice not found.' } });
      }

      // Fetch line items
      const { data: lines, error: lineError } = await supabase
        .from('purchase_invoice_lines')
        .select(`
          *,
          product:products(id, name, sku)
        `)
        .eq('invoice_id', id)
        .order('line_order', { ascending: true });

      if (lineError) throw lineError;

      // Fetch payment allocations
      const { data: allocations, error: allocError } = await supabase
        .from('supplier_payment_allocations')
        .select(`
          *,
          payment:supplier_payments(id, payment_number, payment_date, payment_method, reference_number)
        `)
        .eq('purchase_invoice_id', id);

      if (allocError) throw allocError;

      return res.status(200).json({
        success: true,
        data: {
          ...invoice,
          lines: lines || [],
          allocations: allocations || [],
        },
      });
    } catch (err) {
      console.error('Error fetching purchase invoice details:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch invoice details.' } });
    }
  },

  // ==========================================================================
  // 3. CREATE PURCHASE INVOICE (WITH THREE-WAY MATCHING)
  // ==========================================================================
  createInvoice: async (req, res) => {
    try {
      const userId = req.user?.id;
      const {
        supplier_id,
        supplier_invoice_number,
        purchase_order_id,
        grn_id,
        invoice_date,
        due_date,
        payment_terms,
        notes,
        lines,
      } = req.body;

      if (!supplier_id || !supplier_invoice_number || !due_date || !lines || lines.length === 0) {
        return res.status(400).json({
          error: { message: 'Supplier, Supplier Invoice Number, Due Date, and line items are required.' },
        });
      }

      // 1. Prevent duplicate supplier invoice number for the same supplier
      const { data: existingDup } = await supabase
        .from('purchase_invoices')
        .select('id, internal_invoice_number, status')
        .eq('supplier_id', supplier_id)
        .eq('supplier_invoice_number', supplier_invoice_number.trim())
        .neq('status', 'VOIDED')
        .maybeSingle();

      if (existingDup) {
        return res.status(400).json({
          error: {
            message: `Supplier Invoice Number '${supplier_invoice_number}' has already been recorded for this supplier under internal invoice '${existingDup.internal_invoice_number}'.`,
          },
        });
      }

      // 2. Validate Supplier
      const { data: supplier, error: suppErr } = await supabase
        .from('suppliers')
        .select('id, supplier_name')
        .eq('id', supplier_id)
        .single();

      if (suppErr || !supplier) {
        return res.status(400).json({ error: { message: 'Invalid supplier specified.' } });
      }

      // 3. Three-Way Matching & Line Items Calculation
      let calculatedSubtotal = 0;
      let calculatedTax = 0;
      let calculatedDiscount = 0;

      let hasQtyVariance = false;
      let hasPriceVariance = false;

      const processedLines = lines.map((line, idx) => {
        const qty = parseFloat(line.quantity) || 0;
        const price = parseFloat(line.unit_price) || 0;
        const discount = parseFloat(line.discount) || 0;
        const taxRate = parseFloat(line.tax_rate) || 0;

        const orderedQty = parseFloat(line.ordered_quantity) || 0;
        const receivedQty = parseFloat(line.received_quantity) || orderedQty || qty;
        const poUnitPrice = parseFloat(line.po_unit_price) || price;

        const qtyVariance = qty - receivedQty;
        const priceVariance = price - poUnitPrice;

        if (Math.abs(qtyVariance) > 0.001) hasQtyVariance = true;
        if (Math.abs(priceVariance) > 0.001) hasPriceVariance = true;

        const lineSubtotal = qty * price - discount;
        const lineTax = (lineSubtotal * taxRate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        calculatedSubtotal += lineSubtotal;
        calculatedTax += lineTax;
        calculatedDiscount += discount;

        return {
          purchase_order_item_id: line.purchase_order_item_id || null,
          grn_item_id: line.grn_item_id || null,
          product_id: line.product_id || null,
          description: line.description || 'Item Description',
          ordered_quantity: orderedQty,
          received_quantity: receivedQty,
          quantity: qty,
          unit: line.unit || 'Pcs',
          po_unit_price: poUnitPrice,
          unit_price: price,
          discount: discount,
          tax_rate: taxRate,
          tax_amount: lineTax,
          line_subtotal: lineSubtotal,
          line_total: lineTotal,
          quantity_variance: qtyVariance,
          price_variance: priceVariance,
          line_order: idx + 1,
        };
      });

      const totalAmount = calculatedSubtotal + calculatedTax;

      // Determine match_status
      let matchStatus = 'MATCHED';
      if (hasQtyVariance && hasPriceVariance) matchStatus = 'BOTH_VARIANCE';
      else if (hasQtyVariance) matchStatus = 'QUANTITY_VARIANCE';
      else if (hasPriceVariance) matchStatus = 'PRICE_VARIANCE';

      // 4. Generate Internal Purchase Invoice Number via RPC / SQL Sequence
      const { data: numData, error: seqError } = await supabase.rpc('generate_purchase_invoice_number');
      let internalInvoiceNumber = numData;

      if (seqError || !internalInvoiceNumber) {
        internalInvoiceNumber = `PINV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      // Initial status: PENDING_REVIEW if variance exists, else DRAFT
      const initialStatus = matchStatus !== 'MATCHED' ? 'PENDING_REVIEW' : 'DRAFT';

      // Insert Header
      const { data: newInvoice, error: invError } = await supabase
        .from('purchase_invoices')
        .insert({
          internal_invoice_number: internalInvoiceNumber,
          supplier_invoice_number: supplier_invoice_number.trim(),
          supplier_id,
          purchase_order_id: purchase_order_id || null,
          grn_id: grn_id || null,
          invoice_date: invoice_date || new Date().toISOString().split('T')[0],
          due_date,
          payment_terms,
          subtotal: calculatedSubtotal,
          discount_amount: calculatedDiscount,
          tax_amount: calculatedTax,
          total_amount: totalAmount,
          paid_amount: 0.0,
          outstanding_amount: totalAmount,
          status: initialStatus,
          match_status: matchStatus,
          notes,
          created_by: userId,
        })
        .select()
        .single();

      if (invError) throw invError;

      // Insert Lines
      const lineRecords = processedLines.map((l) => ({
        ...l,
        invoice_id: newInvoice.id,
      }));

      const { error: lineInsErr } = await supabase
        .from('purchase_invoice_lines')
        .insert(lineRecords);

      if (lineInsErr) throw lineInsErr;

      return res.status(201).json({
        success: true,
        data: newInvoice,
        message: `Purchase invoice ${internalInvoiceNumber} created successfully.`,
      });
    } catch (err) {
      console.error('Error creating purchase invoice:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to create purchase invoice.' } });
    }
  },

  // ==========================================================================
  // 4. APPROVE VARIANCE EXCEPTION
  // ==========================================================================
  approveInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { variance_reason } = req.body;

      const { data: inv, error: fetchErr } = await supabase
        .from('purchase_invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !inv) {
        return res.status(404).json({ error: { message: 'Purchase invoice not found.' } });
      }

      const { data: updated, error: updateErr } = await supabase
        .from('purchase_invoices')
        .update({
          status: 'APPROVED',
          match_status: 'APPROVED_EXCEPTION',
          variance_reason: variance_reason || 'Variance approved by finance manager.',
          approved_at: new Date().toISOString(),
          approved_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Invoice ${inv.internal_invoice_number} approved successfully.`,
      });
    } catch (err) {
      console.error('Error approving invoice variance:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to approve purchase invoice.' } });
    }
  },

  // ==========================================================================
  // 5. POST PURCHASE INVOICE (POST TO ACCOUNTING JOURNAL)
  // ==========================================================================
  postInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const { data: inv, error: fetchErr } = await supabase
        .from('purchase_invoices')
        .select('*, supplier:suppliers(supplier_name)')
        .eq('id', id)
        .single();

      if (fetchErr || !inv) {
        return res.status(404).json({ error: { message: 'Purchase invoice not found.' } });
      }

      if (inv.status === 'POSTED' || inv.journal_entry_id) {
        return res.status(400).json({ error: { message: 'Purchase invoice is already posted to accounting.' } });
      }

      // Check Open Financial Period
      const { data: period } = await supabase
        .from('financial_periods')
        .select('id, status')
        .lte('start_date', inv.invoice_date)
        .gte('end_date', inv.invoice_date)
        .maybeSingle();

      if (period && period.status === 'CLOSED') {
        return res.status(400).json({
          error: { message: `Financial period for invoice date (${inv.invoice_date}) is CLOSED. Posting blocked.` },
        });
      }

      // Account Mappings (COA Lookup)
      // Debit: COGS/Expense (e.g. 5000) or Raw Material Inventory (1300)
      // Credit: Accounts Payable (2000)
      const { data: apAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_code', '2000')
        .maybeSingle();

      const { data: expAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_code', '5000')
        .maybeSingle();

      if (!apAccount || !expAccount) {
        return res.status(400).json({
          error: { message: 'Accounts Payable (2000) or Purchase Expense (5000) account missing in Chart of Accounts.' },
        });
      }

      // Generate Journal Entry Number
      const { data: jeNum } = await supabase.rpc('generate_journal_entry_number');
      const entryNumber = jeNum || `JE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Double Entry: Debit Expense, Credit AP
      const journalPayload = {
        entry_number: entryNumber,
        entry_date: inv.invoice_date,
        period_id: period?.id || null,
        entry_type: 'PURCHASE_INVOICE',
        source_reference: inv.internal_invoice_number,
        description: `Purchase Invoice posting for ${inv.supplier?.supplier_name || 'Supplier'} (${inv.supplier_invoice_number})`,
        status: 'POSTED',
        total_debit: inv.total_amount,
        total_credit: inv.total_amount,
        posted_at: new Date().toISOString(),
        posted_by: userId,
        created_by: userId,
      };

      const { data: createdJE, error: jeError } = await supabase
        .from('journal_entries')
        .insert(journalPayload)
        .select()
        .single();

      if (jeError) throw jeError;

      // Journal Entry Lines
      const jeLines = [
        {
          journal_entry_id: createdJE.id,
          account_id: expAccount.id,
          line_order: 1,
          description: `Direct purchase / Inventory received - PINV ${inv.internal_invoice_number}`,
          debit_amount: inv.total_amount,
          credit_amount: 0.0,
        },
        {
          journal_entry_id: createdJE.id,
          account_id: apAccount.id,
          line_order: 2,
          description: `Accounts Payable liability - Supplier ${inv.supplier?.supplier_name}`,
          debit_amount: 0.0,
          credit_amount: inv.total_amount,
        },
      ];

      const { error: lineErr } = await supabase.from('journal_lines').insert(jeLines);
      if (lineErr) throw lineErr;

      // Update Purchase Invoice status & reference
      const { data: updatedInv, error: updateErr } = await supabase
        .from('purchase_invoices')
        .update({
          status: 'POSTED',
          journal_entry_id: createdJE.id,
          posted_at: new Date().toISOString(),
          posted_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.status(200).json({
        success: true,
        data: updatedInv,
        journal_entry: createdJE,
        message: `Purchase invoice ${inv.internal_invoice_number} successfully posted to Accounts Payable.`,
      });
    } catch (err) {
      console.error('Error posting purchase invoice:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to post purchase invoice.' } });
    }
  },

  // ==========================================================================
  // 6. VOID PURCHASE INVOICE
  // ==========================================================================
  voidInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { void_reason } = req.body;

      const { data: inv, error: fetchErr } = await supabase
        .from('purchase_invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !inv) {
        return res.status(404).json({ error: { message: 'Purchase invoice not found.' } });
      }

      if (inv.paid_amount > 0) {
        return res.status(400).json({
          error: { message: 'Cannot void invoice with existing payments. Reverse supplier payments first.' },
        });
      }

      // Reverse Journal Entry if posted
      if (inv.journal_entry_id) {
        await supabase
          .from('journal_entries')
          .update({ status: 'REVERSED', notes: `Reversed due to voiding purchase invoice ${inv.internal_invoice_number}` })
          .eq('id', inv.journal_entry_id);
      }

      const { data: voidedInv, error: voidErr } = await supabase
        .from('purchase_invoices')
        .update({
          status: 'VOIDED',
          voided_at: new Date().toISOString(),
          voided_by: userId,
          void_reason: void_reason || 'Voided by user request.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (voidErr) throw voidErr;

      return res.status(200).json({
        success: true,
        data: voidedInv,
        message: `Invoice ${inv.internal_invoice_number} voided successfully.`,
      });
    } catch (err) {
      console.error('Error voiding purchase invoice:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to void purchase invoice.' } });
    }
  },

  // ==========================================================================
  // 7. RECORD SUPPLIER PAYMENT
  // ==========================================================================
  recordPayment: async (req, res) => {
    try {
      const userId = req.user?.id;
      const {
        supplier_id,
        payment_date,
        amount,
        payment_method,
        reference_number,
        bank_account_id,
        notes,
        allocations, // Array of { purchase_invoice_id, amount }
      } = req.body;

      const totalPaymentAmount = parseFloat(amount);
      if (!supplier_id || !totalPaymentAmount || totalPaymentAmount <= 0) {
        return res.status(400).json({ error: { message: 'Supplier and a valid positive payment amount are required.' } });
      }

      // 1. Calculate total allocated
      let totalAllocated = 0;
      const validAllocations = (allocations || []).map((a) => {
        const allocAmt = parseFloat(a.amount) || 0;
        totalAllocated += allocAmt;
        return { purchase_invoice_id: a.purchase_invoice_id, amount: allocAmt };
      });

      if (totalAllocated > totalPaymentAmount) {
        return res.status(400).json({
          error: { message: `Allocated amount (₹${totalAllocated}) cannot exceed payment amount (₹${totalPaymentAmount}).` },
        });
      }

      // 2. Generate Payment Number via RPC
      const { data: numData } = await supabase.rpc('generate_supplier_payment_number');
      const paymentNumber = numData || `SPAY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const unallocatedAmount = totalPaymentAmount - totalAllocated;

      // 3. Check Financial Period
      const payDate = payment_date || new Date().toISOString().split('T')[0];
      const { data: period } = await supabase
        .from('financial_periods')
        .select('id, status')
        .lte('start_date', payDate)
        .gte('end_date', payDate)
        .maybeSingle();

      if (period && period.status === 'CLOSED') {
        return res.status(400).json({ error: { message: `Financial period for payment date (${payDate}) is CLOSED.` } });
      }

      // 4. Double Entry Accounts: Debit Accounts Payable (2000), Credit Cash/Bank (1010)
      const { data: apAccount } = await supabase.from('chart_of_accounts').select('id').eq('account_code', '2000').maybeSingle();
      const { data: bankAccount } = await supabase.from('chart_of_accounts').select('id').eq('account_code', '1010').maybeSingle();

      let createdJE = null;
      if (apAccount && bankAccount) {
        const { data: jeNum } = await supabase.rpc('generate_journal_entry_number');
        const entryNumber = jeNum || `JE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        const { data: jeData } = await supabase
          .from('journal_entries')
          .insert({
            entry_number: entryNumber,
            entry_date: payDate,
            period_id: period?.id || null,
            entry_type: 'SUPPLIER_PAYMENT',
            source_reference: paymentNumber,
            description: `Supplier Payment remittance ${paymentNumber}`,
            status: 'POSTED',
            total_debit: totalPaymentAmount,
            total_credit: totalPaymentAmount,
            posted_at: new Date().toISOString(),
            posted_by: userId,
            created_by: userId,
          })
          .select()
          .single();

        createdJE = jeData;

        if (createdJE) {
          await supabase.from('journal_lines').insert([
            {
              journal_entry_id: createdJE.id,
              account_id: apAccount.id,
              line_order: 1,
              description: `A/P settlement payment ${paymentNumber}`,
              debit_amount: totalPaymentAmount,
              credit_amount: 0.0,
            },
            {
              journal_entry_id: createdJE.id,
              account_id: bankAccount.id,
              line_order: 2,
              description: `Cash/Bank payout ${paymentNumber}`,
              debit_amount: 0.0,
              credit_amount: totalPaymentAmount,
            },
          ]);
        }
      }

      // 5. Create Supplier Payment
      const { data: paymentRecord, error: payError } = await supabase
        .from('supplier_payments')
        .insert({
          payment_number: paymentNumber,
          supplier_id,
          bank_account_id: bank_account_id || null,
          payment_date: payDate,
          amount: totalPaymentAmount,
          payment_method: payment_method || 'BANK_TRANSFER',
          reference_number: reference_number || null,
          allocated_amount: totalAllocated,
          unallocated_amount: unallocatedAmount,
          status: 'POSTED',
          journal_entry_id: createdJE?.id || null,
          notes,
          posted_at: new Date().toISOString(),
          posted_by: userId,
          created_by: userId,
        })
        .select()
        .single();

      if (payError) throw payError;

      // 6. Process Allocations & Update Purchase Invoices
      for (const alloc of validAllocations) {
        if (alloc.amount <= 0) continue;

        // Insert Allocation record
        await supabase.from('supplier_payment_allocations').insert({
          payment_id: paymentRecord.id,
          purchase_invoice_id: alloc.purchase_invoice_id,
          allocated_amount: alloc.amount,
          created_by: userId,
        });

        // Update target Purchase Invoice
        const { data: inv } = await supabase
          .from('purchase_invoices')
          .select('total_amount, paid_amount, due_date')
          .eq('id', alloc.purchase_invoice_id)
          .single();

        if (inv) {
          const newPaid = (parseFloat(inv.paid_amount) || 0) + alloc.amount;
          const newOutstanding = Math.max(0, parseFloat(inv.total_amount) - newPaid);

          let newStatus = 'PARTIALLY_PAID';
          if (newOutstanding <= 0.01) {
            newStatus = 'PAID';
          } else if (new Date(payDate) > new Date(inv.due_date)) {
            newStatus = 'OVERDUE';
          }

          await supabase
            .from('purchase_invoices')
            .update({
              paid_amount: newPaid,
              outstanding_amount: newOutstanding,
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', alloc.purchase_invoice_id);
        }
      }

      return res.status(201).json({
        success: true,
        data: paymentRecord,
        message: `Supplier payment ${paymentNumber} recorded and posted successfully.`,
      });
    } catch (err) {
      console.error('Error recording supplier payment:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to record supplier payment.' } });
    }
  },

  // ==========================================================================
  // 8. LIST SUPPLIER PAYMENTS
  // ==========================================================================
  getPayments: async (req, res) => {
    try {
      const { supplier_id, status } = req.query;

      let query = supabase
        .from('supplier_payments')
        .select(`
          *,
          supplier:suppliers(id, supplier_name, supplier_code)
        `)
        .order('created_at', { ascending: false });

      if (supplier_id) query = query.eq('supplier_id', supplier_id);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Error fetching supplier payments:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch payments.' } });
    }
  },

  // ==========================================================================
  // 9. GET SUPPLIER PAYMENT BY ID
  // ==========================================================================
  getPaymentById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: payment, error } = await supabase
        .from('supplier_payments')
        .select(`
          *,
          supplier:suppliers(id, supplier_name, supplier_code),
          journal_entry:journal_entries(id, entry_number)
        `)
        .eq('id', id)
        .single();

      if (error || !payment) {
        return res.status(404).json({ error: { message: 'Supplier payment not found.' } });
      }

      const { data: allocations } = await supabase
        .from('supplier_payment_allocations')
        .select(`
          *,
          invoice:purchase_invoices(id, internal_invoice_number, supplier_invoice_number, invoice_date, total_amount)
        `)
        .eq('payment_id', id);

      return res.status(200).json({
        success: true,
        data: {
          ...payment,
          allocations: allocations || [],
        },
      });
    } catch (err) {
      console.error('Error fetching payment details:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch payment details.' } });
    }
  },

  // ==========================================================================
  // 10. VOID SUPPLIER PAYMENT
  // ==========================================================================
  voidPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { void_reason } = req.body;

      const { data: pay, error: fetchErr } = await supabase
        .from('supplier_payments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !pay) {
        return res.status(404).json({ error: { message: 'Supplier payment not found.' } });
      }

      if (pay.status === 'VOIDED') {
        return res.status(400).json({ error: { message: 'Payment is already voided.' } });
      }

      // Reverse Journal Entry
      if (pay.journal_entry_id) {
        await supabase
          .from('journal_entries')
          .update({ status: 'REVERSED', notes: `Reversed due to voiding supplier payment ${pay.payment_number}` })
          .eq('id', pay.journal_entry_id);
      }

      // Fetch allocations to reverse invoice balances
      const { data: allocations } = await supabase
        .from('supplier_payment_allocations')
        .select('purchase_invoice_id, allocated_amount')
        .eq('payment_id', id);

      if (allocations && allocations.length > 0) {
        for (const alloc of allocations) {
          const { data: inv } = await supabase
            .from('purchase_invoices')
            .select('total_amount, paid_amount')
            .eq('id', alloc.purchase_invoice_id)
            .single();

          if (inv) {
            const restoredPaid = Math.max(0, (parseFloat(inv.paid_amount) || 0) - alloc.allocated_amount);
            const restoredOutstanding = parseFloat(inv.total_amount) - restoredPaid;
            const newStatus = restoredPaid > 0 ? 'PARTIALLY_PAID' : 'POSTED';

            await supabase
              .from('purchase_invoices')
              .update({
                paid_amount: restoredPaid,
                outstanding_amount: restoredOutstanding,
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', alloc.purchase_invoice_id);
          }
        }
      }

      // Mark payment voided
      const { data: voidedPay, error: voidErr } = await supabase
        .from('supplier_payments')
        .update({
          status: 'VOIDED',
          voided_at: new Date().toISOString(),
          voided_by: userId,
          void_reason: void_reason || 'Voided by user request',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (voidErr) throw voidErr;

      return res.status(200).json({
        success: true,
        data: voidedPay,
        message: `Supplier payment ${pay.payment_number} voided successfully.`,
      });
    } catch (err) {
      console.error('Error voiding supplier payment:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to void supplier payment.' } });
    }
  },

  // ==========================================================================
  // 11. ACCOUNTS PAYABLE DASHBOARD SUMMARY
  // ==========================================================================
  getPayables: async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch all non-voided/cancelled purchase invoices
      const { data: invoices, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(id, supplier_name, supplier_code),
          purchase_order:purchase_orders(id, po_number),
          grn:goods_receipts(id, grn_number)
        `)
        .not('status', 'in', '("VOIDED","CANCELLED")')
        .gt('outstanding_amount', 0)
        .order('due_date', { ascending: true });

      if (error) throw error;

      let totalPayable = 0;
      let totalOverdue = 0;
      let openInvoicesCount = invoices ? invoices.length : 0;
      let pendingApprovalCount = 0;

      (invoices || []).forEach((inv) => {
        const out = parseFloat(inv.outstanding_amount) || 0;
        totalPayable += out;

        if (inv.due_date < today) {
          totalOverdue += out;
        }

        if (inv.status === 'PENDING_REVIEW') {
          pendingApprovalCount++;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            total_payable: totalPayable,
            total_overdue: totalOverdue,
            open_invoices_count: openInvoicesCount,
            pending_approval_count: pendingApprovalCount,
          },
          invoices: invoices || [],
        },
      });
    } catch (err) {
      console.error('Error fetching accounts payable summary:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to fetch accounts payable.' } });
    }
  },

  // ==========================================================================
  // 12. PAYABLE AGING REPORT
  // ==========================================================================
  getPayableAging: async (req, res) => {
    try {
      const reportDate = req.query.report_date ? new Date(req.query.report_date) : new Date();

      const { data: invoices, error } = await supabase
        .from('purchase_invoices')
        .select(`
          id, internal_invoice_number, supplier_invoice_number, invoice_date, due_date, outstanding_amount, status,
          supplier:suppliers(id, supplier_name, supplier_code)
        `)
        .gt('outstanding_amount', 0)
        .not('status', 'in', '("VOIDED","CANCELLED")');

      if (error) throw error;

      const summary = {
        current: 0,
        days_1_30: 0,
        days_31_60: 0,
        days_61_90: 0,
        days_90_plus: 0,
        total: 0,
      };

      const supplierMap = {};

      (invoices || []).forEach((inv) => {
        const dueDate = new Date(inv.due_date);
        const diffTime = reportDate.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        const out = parseFloat(inv.outstanding_amount) || 0;

        summary.total += out;

        let bucket = 'current';
        if (diffDays <= 0) {
          summary.current += out;
          bucket = 'current';
        } else if (diffDays <= 30) {
          summary.days_1_30 += out;
          bucket = 'days_1_30';
        } else if (diffDays <= 60) {
          summary.days_31_60 += out;
          bucket = 'days_31_60';
        } else if (diffDays <= 90) {
          summary.days_61_90 += out;
          bucket = 'days_61_90';
        } else {
          summary.days_90_plus += out;
          bucket = 'days_90_plus';
        }

        const suppId = inv.supplier?.id || 'unknown';
        if (!supplierMap[suppId]) {
          supplierMap[suppId] = {
            supplier_id: suppId,
            supplier_name: inv.supplier?.supplier_name || 'Unknown Supplier',
            supplier_code: inv.supplier?.supplier_code || '',
            current: 0,
            days_1_30: 0,
            days_31_60: 0,
            days_61_90: 0,
            days_90_plus: 0,
            total: 0,
          };
        }

        supplierMap[suppId][bucket] += out;
        supplierMap[suppId].total += out;
      });

      return res.status(200).json({
        success: true,
        data: {
          as_of_date: reportDate.toISOString().split('T')[0],
          summary,
          by_supplier: Object.values(supplierMap),
        },
      });
    } catch (err) {
      console.error('Error generating payable aging report:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to generate aging report.' } });
    }
  },

  // ==========================================================================
  // 13. SUPPLIER STATEMENT
  // ==========================================================================
  getSupplierStatement: async (req, res) => {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      // 1. Fetch Supplier Info
      const { data: supplier, error: suppErr } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (suppErr || !supplier) {
        return res.status(404).json({ error: { message: 'Supplier not found.' } });
      }

      // 2. Fetch Invoices for Supplier
      let invQuery = supabase
        .from('purchase_invoices')
        .select('id, internal_invoice_number, supplier_invoice_number, invoice_date, total_amount, status')
        .eq('supplier_id', id)
        .not('status', 'in', '("VOIDED","CANCELLED")');

      if (start_date) invQuery = invQuery.gte('invoice_date', start_date);
      if (end_date) invQuery = invQuery.lte('invoice_date', end_date);

      const { data: invoices } = await invQuery;

      // 3. Fetch Payments for Supplier
      let payQuery = supabase
        .from('supplier_payments')
        .select('id, payment_number, payment_date, amount, payment_method, status')
        .eq('supplier_id', id)
        .neq('status', 'VOIDED');

      if (start_date) payQuery = payQuery.gte('payment_date', start_date);
      if (end_date) payQuery = payQuery.lte('payment_date', end_date);

      const { data: payments } = await payQuery;

      // 4. Combine and Sort Chronologically
      const transactions = [];

      (invoices || []).forEach((inv) => {
        transactions.push({
          date: inv.invoice_date,
          type: 'INVOICE',
          reference: `${inv.internal_invoice_number} (${inv.supplier_invoice_number})`,
          description: `Purchase Invoice recorded`,
          credit: parseFloat(inv.total_amount) || 0, // In AP, Invoice is Credit to Liability
          debit: 0,
        });
      });

      (payments || []).forEach((pay) => {
        transactions.push({
          date: pay.payment_date,
          type: 'PAYMENT',
          reference: pay.payment_number,
          description: `Supplier payment (${pay.payment_method})`,
          credit: 0,
          debit: parseFloat(pay.amount) || 0, // Payment is Debit to Liability
        });
      });

      transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 5. Calculate Running Balance
      let runningBalance = 0;
      const statement = transactions.map((t) => {
        runningBalance += t.credit - t.debit;
        return {
          ...t,
          balance: runningBalance,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          supplier,
          closing_balance: runningBalance,
          statement,
        },
      });
    } catch (err) {
      console.error('Error generating supplier statement:', err);
      return res.status(500).json({ error: { message: err.message || 'Failed to generate supplier statement.' } });
    }
  },
};

module.exports = purchaseInvoiceController;
