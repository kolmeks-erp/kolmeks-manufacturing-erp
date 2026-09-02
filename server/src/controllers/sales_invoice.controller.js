const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Controller for Sales Invoicing, Customer Payments, Accounts Receivable, Aging & Statements
 */
const salesInvoiceController = {
  // --------------------------------------------------------------------------
  // 1. SALES INVOICES
  // --------------------------------------------------------------------------
  
  // List Invoices
  getInvoices: async (req, res, next) => {
    try {
      const { status, customer_id, start_date, end_date, search } = req.query;

      let query = supabase
        .from('sales_invoices')
        .select(`
          *,
          customer:customers(id, company_name, customer_code),
          sales_order:sales_orders(id, order_number)
        `)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (customer_id) query = query.eq('customer_id', customer_id);
      if (start_date) query = query.gte('invoice_date', start_date);
      if (end_date) query = query.lte('invoice_date', end_date);
      if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,billing_address.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Get Invoice Details by ID
  getInvoiceById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: invoice, error } = await supabase
        .from('sales_invoices')
        .select(`
          *,
          customer:customers(id, company_name, customer_code, email, phone, billing_address),
          sales_order:sales_orders(id, order_number, order_date),
          lines:sales_invoice_lines(
            *,
            product:products(id, name, sku, unit_of_measure)
          ),
          allocations:payment_allocations(
            id,
            allocated_amount,
            created_at,
            payment:customer_payments(id, payment_number, payment_date, payment_method, reference_number)
          ),
          journal_entry:journal_entries(id, entry_number, entry_date, status)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!invoice) {
        return res.status(404).json({ success: false, error: { message: 'Sales invoice not found' } });
      }

      return res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  },

  // Create Invoice (Draft)
  createInvoice: async (req, res, next) => {
    try {
      const {
        customer_id,
        sales_order_id,
        invoice_date,
        due_date,
        currency = 'INR',
        payment_terms,
        billing_address,
        notes,
        lines = [],
      } = req.body;

      if (!customer_id || !due_date || lines.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Customer, due date, and at least one invoice line are required' },
        });
      }

      // 1. Calculate Totals Server-Side
      let subtotal = 0;
      let total_discount = 0;
      let total_tax = 0;

      const preparedLines = lines.map((line, idx) => {
        const qty = parseFloat(line.quantity) || 0;
        const price = parseFloat(line.unit_price) || 0;
        const discVal = parseFloat(line.discount) || 0;
        const taxRate = parseFloat(line.tax_rate) || 0;

        let lineDisc = 0;
        if (line.discount_type === 'percentage') {
          lineDisc = (qty * price * discVal) / 100;
        } else {
          lineDisc = discVal;
        }

        const lineSubtotal = qty * price - lineDisc;
        const lineTax = (lineSubtotal * taxRate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        subtotal += qty * price;
        total_discount += lineDisc;
        total_tax += lineTax;

        return {
          product_id: line.product_id || null,
          sales_order_item_id: line.sales_order_item_id || null,
          description: line.description || 'Line Item',
          quantity: qty,
          unit: line.unit || 'Pcs',
          unit_price: price,
          discount_type: line.discount_type || 'amount',
          discount: discVal,
          tax_rate: taxRate,
          tax_amount: lineTax,
          line_subtotal: lineSubtotal,
          line_total: lineTotal,
          line_order: idx + 1,
        };
      });

      const total_amount = subtotal - total_discount + total_tax;
      const outstanding_amount = total_amount;

      // 2. Generate Invoice Number via DB Function
      const { data: invNumData, error: seqErr } = await supabase.rpc('generate_invoice_number');
      const invoice_number = invNumData || `INV-${Date.now()}`;

      // 3. Insert Header
      const { data: header, error: headErr } = await supabase
        .from('sales_invoices')
        .insert({
          invoice_number,
          customer_id,
          sales_order_id: sales_order_id || null,
          invoice_date: invoice_date || new Date().toISOString().split('T')[0],
          due_date,
          currency,
          payment_terms: payment_terms || 'Net 30',
          subtotal,
          discount_amount: total_discount,
          tax_amount: total_tax,
          total_amount,
          paid_amount: 0,
          outstanding_amount,
          status: 'DRAFT',
          billing_address,
          notes,
          created_by: req.user?.id || null,
        })
        .select()
        .single();

      if (headErr) throw headErr;

      // 4. Insert Lines
      const linesWithHeader = preparedLines.map((l) => ({ ...l, invoice_id: header.id }));
      const { error: lineErr } = await supabase.from('sales_invoice_lines').insert(linesWithHeader);
      if (lineErr) throw lineErr;

      return res.status(201).json({
        success: true,
        message: 'Sales Invoice created successfully',
        data: header,
      });
    } catch (err) {
      next(err);
    }
  },

  // Issue Invoice (Posts Accounting Entry)
  issueInvoice: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Fetch Invoice
      const { data: invoice, error: fetchErr } = await supabase
        .from('sales_invoices')
        .select('*, customer:customers(company_name)')
        .eq('id', id)
        .single();

      if (fetchErr || !invoice) {
        return res.status(404).json({ success: false, error: { message: 'Invoice not found' } });
      }

      if (invoice.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: { message: `Invoice is already in ${invoice.status} status` },
        });
      }

      // Check Financial Period OPEN
      const invDate = invoice.invoice_date;
      const { data: periods } = await supabase
        .from('financial_periods')
        .select('*')
        .lte('start_date', invDate)
        .gte('end_date', invDate)
        .eq('status', 'OPEN');

      if (!periods || periods.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: `Financial period for date ${invDate} is CLOSED or not defined.` },
        });
      }

      // Fetch Accounts Receivable and Sales Revenue Accounts
      const { data: arAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('code', '1200')
        .single();

      const { data: revAccount } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('code', '4000')
        .single();

      let journalEntryId = null;

      if (arAccount && revAccount && invoice.total_amount > 0) {
        // Create Double-Entry Journal Entry
        // Debit: Accounts Receivable (1200)
        // Credit: Sales Revenue (4000)
        const { data: entryNum } = await supabase.rpc('generate_journal_entry_number');
        
        const { data: jEntry, error: jErr } = await supabase
          .from('journal_entries')
          .insert({
            entry_number: entryNum || `JE-INV-${Date.now()}`,
            entry_date: invDate,
            period_id: periods[0].id,
            description: `Sales Invoice ${invoice.invoice_number} issued for ${invoice.customer?.company_name}`,
            reference_type: 'SALES_INVOICE',
            reference_id: invoice.id,
            total_debit: invoice.total_amount,
            total_credit: invoice.total_amount,
            status: 'POSTED',
            posted_at: new Date().toISOString(),
            posted_by: req.user?.id || null,
            created_by: req.user?.id || null,
          })
          .select()
          .single();

        if (!jErr && jEntry) {
          journalEntryId = jEntry.id;

          // Journal Lines
          await supabase.from('journal_lines').insert([
            {
              journal_entry_id: jEntry.id,
              account_id: arAccount.id,
              description: `A/R - Invoice ${invoice.invoice_number}`,
              debit: invoice.total_amount,
              credit: 0,
              line_order: 1,
            },
            {
              journal_entry_id: jEntry.id,
              account_id: revAccount.id,
              description: `Sales Revenue - Invoice ${invoice.invoice_number}`,
              debit: 0,
              credit: invoice.total_amount,
              line_order: 2,
            },
          ]);
        }
      }

      // Update Invoice Status
      const { data: updated, error: upErr } = await supabase
        .from('sales_invoices')
        .update({
          status: 'ISSUED',
          journal_entry_id: journalEntryId,
          issued_at: new Date().toISOString(),
          issued_by: req.user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (upErr) throw upErr;

      return res.status(200).json({
        success: true,
        message: 'Sales Invoice issued and journal entry posted successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // Void Invoice
  voidInvoice: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { void_reason } = req.body;

      const { data: invoice } = await supabase
        .from('sales_invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (!invoice) {
        return res.status(404).json({ success: false, error: { message: 'Invoice not found' } });
      }

      if (invoice.paid_amount > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot void invoice with recorded payments. Unallocate/void payments first.' },
        });
      }

      // Reverse Journal Entry if exists
      if (invoice.journal_entry_id) {
        await supabase
          .from('journal_entries')
          .update({
            status: 'VOIDED',
            void_reason: void_reason || 'Invoice voided',
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoice.journal_entry_id);
      }

      // Update Status to VOIDED
      const { data: voided, error: vErr } = await supabase
        .from('sales_invoices')
        .update({
          status: 'VOIDED',
          void_reason: void_reason || 'Voided by user',
          voided_at: new Date().toISOString(),
          voided_by: req.user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (vErr) throw vErr;

      return res.status(200).json({
        success: true,
        message: 'Sales Invoice voided successfully',
        data: voided,
      });
    } catch (err) {
      next(err);
    }
  },

  // --------------------------------------------------------------------------
  // 2. CUSTOMER PAYMENTS & ALLOCATION
  // --------------------------------------------------------------------------

  // List Payments
  getPayments: async (req, res, next) => {
    try {
      const { customer_id, status, start_date, end_date } = req.query;

      let query = supabase
        .from('customer_payments')
        .select(`
          *,
          customer:customers(id, company_name, customer_code)
        `)
        .order('created_at', { ascending: false });

      if (customer_id) query = query.eq('customer_id', customer_id);
      if (status) query = query.eq('status', status);
      if (start_date) query = query.gte('payment_date', start_date);
      if (end_date) query = query.lte('payment_date', end_date);

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Get Payment Details by ID
  getPaymentById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: payment, error } = await supabase
        .from('customer_payments')
        .select(`
          *,
          customer:customers(id, company_name, customer_code, email),
          allocations:payment_allocations(
            id,
            allocated_amount,
            created_at,
            invoice:sales_invoices(id, invoice_number, invoice_date, total_amount, outstanding_amount, status)
          ),
          journal_entry:journal_entries(id, entry_number, entry_date, status)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!payment) {
        return res.status(404).json({ success: false, error: { message: 'Customer payment not found' } });
      }

      return res.status(200).json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  },

  // Record Customer Payment & Allocate
  recordPayment: async (req, res, next) => {
    try {
      const {
        customer_id,
        payment_date,
        amount,
        currency = 'INR',
        payment_method = 'BANK_TRANSFER',
        reference_number,
        notes,
        allocations = [], // Array of { invoice_id, amount }
      } = req.body;

      const payAmount = parseFloat(amount);
      if (!customer_id || !payAmount || payAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Valid customer and positive payment amount are required' },
        });
      }

      // Validate total allocation doesn't exceed payment amount
      let totalAllocated = 0;
      allocations.forEach((alloc) => {
        totalAllocated += parseFloat(alloc.amount) || 0;
      });

      if (totalAllocated > payAmount) {
        return res.status(400).json({
          success: false,
          error: { message: `Allocated total (₹${totalAllocated}) cannot exceed payment amount (₹${payAmount})` },
        });
      }

      // Generate Payment Number via DB function
      const { data: payNumData } = await supabase.rpc('generate_payment_number');
      const payment_number = payNumData || `PAY-${Date.now()}`;

      // Insert Customer Payment Record
      const { data: paymentHeader, error: payErr } = await supabase
        .from('customer_payments')
        .insert({
          payment_number,
          customer_id,
          payment_date: payment_date || new Date().toISOString().split('T')[0],
          amount: payAmount,
          currency,
          payment_method,
          reference_number,
          allocated_amount: totalAllocated,
          unallocated_amount: payAmount - totalAllocated,
          status: 'POSTED',
          notes,
          posted_at: new Date().toISOString(),
          posted_by: req.user?.id || null,
          created_by: req.user?.id || null,
        })
        .select()
        .single();

      if (payErr) throw payErr;

      // Process Allocations & Update Invoices
      if (allocations.length > 0) {
        for (const alloc of allocations) {
          const allocAmt = parseFloat(alloc.amount);
          if (!allocAmt || allocAmt <= 0) continue;

          // Save Allocation Record
          await supabase.from('payment_allocations').insert({
            payment_id: paymentHeader.id,
            invoice_id: alloc.invoice_id,
            allocated_amount: allocAmt,
            created_by: req.user?.id || null,
          });

          // Fetch Invoice to update totals
          const { data: inv } = await supabase
            .from('sales_invoices')
            .select('total_amount, paid_amount, outstanding_amount')
            .eq('id', alloc.invoice_id)
            .single();

          if (inv) {
            const newPaid = parseFloat(inv.paid_amount || 0) + allocAmt;
            const newOutstanding = Math.max(0, parseFloat(inv.total_amount) - newPaid);
            const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIALLY_PAID';

            await supabase
              .from('sales_invoices')
              .update({
                paid_amount: newPaid,
                outstanding_amount: newOutstanding,
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', alloc.invoice_id);
          }
        }
      }

      // Accounting Journal Entry (Debit: Cash/Bank 1010, Credit: A/R 1200)
      const { data: bankAcc } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('code', '1010')
        .single();

      const { data: arAcc } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('code', '1200')
        .single();

      if (bankAcc && arAcc) {
        const { data: jEntryNum } = await supabase.rpc('generate_journal_entry_number');

        const { data: jEntry } = await supabase
          .from('journal_entries')
          .insert({
            entry_number: jEntryNum || `JE-PAY-${Date.now()}`,
            entry_date: payment_date || new Date().toISOString().split('T')[0],
            description: `Payment ${payment_number} received from customer`,
            reference_type: 'CUSTOMER_PAYMENT',
            reference_id: paymentHeader.id,
            total_debit: payAmount,
            total_credit: payAmount,
            status: 'POSTED',
            posted_at: new Date().toISOString(),
            created_by: req.user?.id || null,
          })
          .select()
          .single();

        if (jEntry) {
          await supabase.from('customer_payments').update({ journal_entry_id: jEntry.id }).eq('id', paymentHeader.id);

          await supabase.from('journal_lines').insert([
            {
              journal_entry_id: jEntry.id,
              account_id: bankAcc.id,
              description: `Cash Receipts - ${payment_number}`,
              debit: payAmount,
              credit: 0,
              line_order: 1,
            },
            {
              journal_entry_id: jEntry.id,
              account_id: arAcc.id,
              description: `A/R Settlement - ${payment_number}`,
              debit: 0,
              credit: payAmount,
              line_order: 2,
            },
          ]);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Customer payment recorded and allocated successfully',
        data: paymentHeader,
      });
    } catch (err) {
      next(err);
    }
  },

  // Void Payment
  voidPayment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { void_reason } = req.body;

      const { data: payment } = await supabase
        .from('customer_payments')
        .select('*, allocations:payment_allocations(*)')
        .eq('id', id)
        .single();

      if (!payment) {
        return res.status(404).json({ success: false, error: { message: 'Payment record not found' } });
      }

      // Reverse Allocations on Invoices
      if (payment.allocations && payment.allocations.length > 0) {
        for (const alloc of payment.allocations) {
          const { data: inv } = await supabase
            .from('sales_invoices')
            .select('total_amount, paid_amount')
            .eq('id', alloc.invoice_id)
            .single();

          if (inv) {
            const newPaid = Math.max(0, parseFloat(inv.paid_amount || 0) - parseFloat(alloc.allocated_amount));
            const newOutstanding = parseFloat(inv.total_amount) - newPaid;
            const newStatus = newPaid === 0 ? 'ISSUED' : 'PARTIALLY_PAID';

            await supabase
              .from('sales_invoices')
              .update({
                paid_amount: newPaid,
                outstanding_amount: newOutstanding,
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', alloc.invoice_id);
          }
        }

        // Delete allocation records
        await supabase.from('payment_allocations').delete().eq('payment_id', id);
      }

      // Reverse Journal Entry
      if (payment.journal_entry_id) {
        await supabase
          .from('journal_entries')
          .update({
            status: 'VOIDED',
            void_reason: void_reason || 'Payment voided',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.journal_entry_id);
      }

      // Update Payment Record
      const { data: voided } = await supabase
        .from('customer_payments')
        .update({
          status: 'VOIDED',
          allocated_amount: 0,
          unallocated_amount: 0,
          void_reason: void_reason || 'Payment voided',
          voided_at: new Date().toISOString(),
          voided_by: req.user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      return res.status(200).json({
        success: true,
        message: 'Payment voided and invoice balances restored successfully',
        data: voided,
      });
    } catch (err) {
      next(err);
    }
  },

  // --------------------------------------------------------------------------
  // 3. RECEIVABLES & AGING REPORTING
  // --------------------------------------------------------------------------

  // Get Receivables Summary & Open Invoices
  getReceivables: async (req, res, next) => {
    try {
      const { data: invoices, error } = await supabase
        .from('sales_invoices')
        .select(`
          id,
          invoice_number,
          invoice_date,
          due_date,
          total_amount,
          paid_amount,
          outstanding_amount,
          status,
          customer:customers(id, company_name, customer_code)
        `)
        .in('status', ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'])
        .order('due_date', { ascending: true });

      if (error) throw error;

      let totalOutstanding = 0;
      let totalOverdue = 0;
      const today = new Date().toISOString().split('T')[0];

      invoices.forEach((inv) => {
        const out = parseFloat(inv.outstanding_amount || 0);
        totalOutstanding += out;
        if (inv.due_date < today) {
          totalOverdue += out;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            total_outstanding: totalOutstanding,
            total_overdue: totalOverdue,
            open_invoices_count: invoices.length,
          },
          invoices,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Receivable Aging Report (Current, 1-30, 31-60, 61-90, 90+ days)
  getReceivableAging: async (req, res, next) => {
    try {
      const { data: openInvoices, error } = await supabase
        .from('sales_invoices')
        .select(`
          id,
          invoice_number,
          invoice_date,
          due_date,
          total_amount,
          outstanding_amount,
          customer:customers(id, company_name, customer_code)
        `)
        .gt('outstanding_amount', 0)
        .in('status', ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE']);

      if (error) throw error;

      const today = new Date();
      const agingBuckets = {
        current: 0,
        days_1_30: 0,
        days_31_60: 0,
        days_61_90: 0,
        days_90_plus: 0,
        total: 0,
      };

      const customerMap = {};

      openInvoices.forEach((inv) => {
        const dueDate = new Date(inv.due_date);
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

        const amount = parseFloat(inv.outstanding_amount);
        agingBuckets.total += amount;

        const custId = inv.customer?.id || 'unknown';
        if (!customerMap[custId]) {
          customerMap[custId] = {
            customer_id: custId,
            customer_name: inv.customer?.company_name || 'Unknown',
            customer_code: inv.customer?.customer_code || '',
            current: 0,
            days_1_30: 0,
            days_31_60: 0,
            days_61_90: 0,
            days_90_plus: 0,
            total: 0,
          };
        }

        customerMap[custId].total += amount;

        if (diffDays <= 0) {
          agingBuckets.current += amount;
          customerMap[custId].current += amount;
        } else if (diffDays <= 30) {
          agingBuckets.days_1_30 += amount;
          customerMap[custId].days_1_30 += amount;
        } else if (diffDays <= 60) {
          agingBuckets.days_31_60 += amount;
          customerMap[custId].days_31_60 += amount;
        } else if (diffDays <= 90) {
          agingBuckets.days_61_90 += amount;
          customerMap[custId].days_61_90 += amount;
        } else {
          agingBuckets.days_90_plus += amount;
          customerMap[custId].days_90_plus += amount;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          summary: agingBuckets,
          by_customer: Object.values(customerMap),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Customer Statement (Ledger of Invoices and Payments with Running Balance)
  getCustomerStatement: async (req, res, next) => {
    try {
      const { id } = req.params; // Customer ID
      const { start_date, end_date } = req.query;

      // 1. Fetch Invoices
      let invQuery = supabase
        .from('sales_invoices')
        .select('id, invoice_number, invoice_date, total_amount, status')
        .eq('customer_id', id)
        .neq('status', 'VOIDED');

      if (start_date) invQuery = invQuery.gte('invoice_date', start_date);
      if (end_date) invQuery = invQuery.lte('invoice_date', end_date);

      const { data: invoices } = await invQuery;

      // 2. Fetch Payments
      let payQuery = supabase
        .from('customer_payments')
        .select('id, payment_number, payment_date, amount, payment_method, reference_number, status')
        .eq('customer_id', id)
        .neq('status', 'VOIDED');

      if (start_date) payQuery = payQuery.gte('payment_date', start_date);
      if (end_date) payQuery = payQuery.lte('payment_date', end_date);

      const { data: payments } = await payQuery;

      // Combine into unified transaction timeline
      const transactions = [];

      (invoices || []).forEach((inv) => {
        transactions.push({
          date: inv.invoice_date,
          type: 'INVOICE',
          reference: inv.invoice_number,
          description: `Sales Invoice ${inv.invoice_number}`,
          debit: parseFloat(inv.total_amount),
          credit: 0,
        });
      });

      (payments || []).forEach((pay) => {
        transactions.push({
          date: pay.payment_date,
          type: 'PAYMENT',
          reference: pay.payment_number,
          description: `Customer Payment (${pay.payment_method}) - Ref: ${pay.reference_number || 'N/A'}`,
          debit: 0,
          credit: parseFloat(pay.amount),
        });
      });

      // Sort chronologically
      transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate running balance
      let runningBalance = 0;
      const statementLines = transactions.map((tx) => {
        runningBalance += tx.debit - tx.credit;
        return {
          ...tx,
          balance: runningBalance,
        };
      });

      // Fetch Customer Info
      const { data: customer } = await supabase
        .from('customers')
        .select('id, company_name, customer_code, email, phone, billing_address')
        .eq('id', id)
        .single();

      return res.status(200).json({
        success: true,
        data: {
          customer,
          statement: statementLines,
          closing_balance: runningBalance,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = salesInvoiceController;
