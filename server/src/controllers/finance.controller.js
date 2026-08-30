const { supabaseAdmin } = require('../config/supabase');

// ==============================================================================
// 1. FINANCE DASHBOARD KPIS & TELEMETRY
// ==============================================================================

exports.getFinanceDashboardKPIs = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch accounts, periods, and posted journal entries
    const [accountsRes, periodsRes, entriesRes] = await Promise.all([
      supabaseAdmin.from('chart_of_accounts').select('*').eq('status', 'ACTIVE'),
      supabaseAdmin.from('financial_periods').select('*').order('start_date', { ascending: false }),
      supabaseAdmin.from('journal_entries').select('*, lines:journal_entry_lines(*, account:chart_of_accounts(*))').eq('status', 'POSTED')
    ]);

    const accounts = accountsRes.data || [];
    const periods = periodsRes.data || [];
    const postedEntries = entriesRes.data || [];

    const activePeriod = periods.find(p => p.status === 'OPEN') || periods[0] || null;

    // Calculate balances for dashboard metrics based on posted ledger entries
    let totalRevenue = 0;
    let totalExpenses = 0;
    let cashBankBalance = 0;
    let accountsReceivable = 0;
    let accountsPayable = 0;

    postedEntries.forEach(entry => {
      (entry.lines || []).forEach(line => {
        const acct = line.account;
        if (!acct) return;

        const debit = parseFloat(line.debit || 0);
        const credit = parseFloat(line.credit || 0);

        if (acct.account_type === 'REVENUE') {
          // Revenue normal balance is CREDIT
          totalRevenue += (credit - debit);
        } else if (acct.account_type === 'EXPENSE') {
          // Expense normal balance is DEBIT
          totalExpenses += (debit - credit);
        } else if (acct.account_type === 'ASSET') {
          // Assets normal balance is DEBIT
          if (['1110', '1120'].includes(acct.account_code) || acct.category === 'Cash and Cash Equivalents') {
            cashBankBalance += (debit - credit);
          }
          if (acct.account_code === '1130' || acct.account_name.includes('Receivable')) {
            accountsReceivable += (debit - credit);
          }
        } else if (acct.account_type === 'LIABILITY') {
          // Liabilities normal balance is CREDIT
          if (acct.account_code === '2110' || acct.account_name.includes('Payable')) {
            accountsPayable += (credit - debit);
          }
        }
      });
    });

    const netProfitLoss = totalRevenue - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfitLoss,
        cashBankBalance,
        accountsReceivable,
        accountsPayable,
        postedJournalsCount: postedEntries.length,
        activePeriod: activePeriod ? { id: activePeriod.id, period_name: activePeriod.period_name, status: activePeriod.status } : null,
        recentPostedJournals: postedEntries.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Error fetching finance dashboard KPIs:', err);
    res.status(500).json({ success: false, message: 'Internal server error fetching finance metrics.' });
  }
};

// ==============================================================================
// 2. CHART OF ACCOUNTS MANAGEMENT
// ==============================================================================

exports.getAccounts = async (req, res) => {
  try {
    const { type, search, category, status } = req.query;

    let query = supabaseAdmin
      .from('chart_of_accounts')
      .select('*, parent_account:chart_of_accounts!parent_account_id(id, account_code, account_name)')
      .order('account_code', { ascending: true });

    if (type) query = query.eq('account_type', type);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    let accountsList = data || [];

    if (search) {
      const q = search.toLowerCase();
      accountsList = accountsList.filter(a =>
        a.account_code.toLowerCase().includes(q) ||
        a.account_name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

    res.status(200).json({ success: true, data: accountsList });
  } catch (err) {
    console.error('Error fetching chart of accounts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch Chart of Accounts.' });
  }
};

exports.getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: account, error } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('*, parent_account:chart_of_accounts!parent_account_id(id, account_code, account_name)')
      .eq('id', id)
      .single();

    if (error || !account) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Calculate total debit, total credit, and running balance from posted journal lines
    const { data: lines } = await supabaseAdmin
      .from('journal_entry_lines')
      .select('*, journal_entry:journal_entries(*)')
      .eq('account_id', id);

    let totalDebit = 0;
    let totalCredit = 0;
    const postedLines = (lines || []).filter(l => l.journal_entry && l.journal_entry.status === 'POSTED');

    postedLines.forEach(l => {
      totalDebit += parseFloat(l.debit || 0);
      totalCredit += parseFloat(l.credit || 0);
    });

    const currentBalance = account.normal_balance === 'DEBIT'
      ? (totalDebit - totalCredit)
      : (totalCredit - totalDebit);

    res.status(200).json({
      success: true,
      data: {
        ...account,
        totalDebit,
        totalCredit,
        currentBalance,
        recentActivity: postedLines.slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch account detail.' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const {
      account_code,
      account_name,
      account_type,
      parent_account_id,
      category,
      description,
      is_control_account,
      normal_balance
    } = req.body;

    if (!account_code || !account_name || !account_type) {
      return res.status(400).json({ success: false, message: 'Account Code, Name, and Type are required.' });
    }

    const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
    if (!validTypes.includes(account_type.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Invalid account_type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Default normal balance based on account_type if not explicitly provided
    let derivedNormalBalance = normal_balance;
    if (!derivedNormalBalance) {
      derivedNormalBalance = ['ASSET', 'EXPENSE'].includes(account_type.toUpperCase()) ? 'DEBIT' : 'CREDIT';
    }

    const { data, error } = await supabaseAdmin
      .from('chart_of_accounts')
      .insert({
        account_code: account_code.trim(),
        account_name: account_name.trim(),
        account_type: account_type.toUpperCase(),
        parent_account_id: parent_account_id || null,
        category: category || account_type.toUpperCase(),
        description,
        is_control_account: !!is_control_account,
        normal_balance: derivedNormalBalance.toUpperCase(),
        status: 'ACTIVE',
        created_by: req.user ? req.user.id : null
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: `Account code '${account_code}' already exists.` });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: 'Account created successfully.', data });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create account.' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_name, category, description, is_control_account, status } = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('chart_of_accounts')
      .update({
        account_name: account_name ? account_name.trim() : undefined,
        category,
        description,
        is_control_account: is_control_account !== undefined ? !!is_control_account : undefined,
        status,
        updated_at: new Date().toISOString(),
        updated_by: req.user ? req.user.id : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Account updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update account.' });
  }
};

// ==============================================================================
// 3. FINANCIAL PERIODS MANAGEMENT
// ==============================================================================

exports.getPeriods = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('financial_periods')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch financial periods.' });
  }
};

exports.createPeriod = async (req, res) => {
  try {
    const { period_name, start_date, end_date } = req.body;
    if (!period_name || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Period Name, Start Date, and End Date are required.' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    const { data, error } = await supabaseAdmin
      .from('financial_periods')
      .insert({
        period_name: period_name.trim(),
        start_date,
        end_date,
        status: 'OPEN'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Financial period created.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create financial period.' });
  }
};

exports.closePeriod = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: period, error: fetchErr } = await supabaseAdmin
      .from('financial_periods')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !period) {
      return res.status(404).json({ success: false, message: 'Financial period not found.' });
    }

    if (period.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Financial period is already closed.' });
    }

    const { data: closed, error } = await supabaseAdmin
      .from('financial_periods')
      .update({
        status: 'CLOSED',
        closed_at: new Date().toISOString(),
        closed_by: req.user ? req.user.id : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: `Financial period '${period.period_name}' has been closed.`, data: closed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to close financial period.' });
  }
};

exports.reopenPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { reopen_reason } = req.body;

    if (!reopen_reason || !reopen_reason.trim()) {
      return res.status(400).json({ success: false, message: 'A valid reason is required to reopen a closed financial period.' });
    }

    const { data: period } = await supabaseAdmin
      .from('financial_periods')
      .select('*')
      .eq('id', id)
      .single();

    if (!period || period.status === 'OPEN') {
      return res.status(400).json({ success: false, message: 'Financial period is already OPEN.' });
    }

    const { data: reopened, error } = await supabaseAdmin
      .from('financial_periods')
      .update({
        status: 'OPEN',
        reopened_at: new Date().toISOString(),
        reopened_by: req.user ? req.user.id : null,
        reopen_reason: reopen_reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: `Financial period '${period.period_name}' reopened. Audit recorded.`, data: reopened });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reopen financial period.' });
  }
};

// ==============================================================================
// 4. JOURNAL ENTRIES & DOUBLE-ENTRY WORKFLOW
// ==============================================================================

exports.getJournalEntries = async (req, res) => {
  try {
    const status = req.query.status || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';
    const search = req.query.search || '';

    let query = supabaseAdmin
      .from('journal_entries')
      .select('*, period:financial_periods(id, period_name, status), lines:journal_entry_lines(*, account:chart_of_accounts(id, account_code, account_name))')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('entry_date', startDate);
    if (endDate) query = query.lte('entry_date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    let entries = data || [];

    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(e =>
        e.journal_number.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.reference_id && e.reference_id.toLowerCase().includes(q))
      );
    }

    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch journal entries.' });
  }
};

exports.getJournalEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*, period:financial_periods(*), lines:journal_entry_lines(*, account:chart_of_accounts(*))')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch journal entry detail.' });
  }
};

exports.createJournalEntry = async (req, res) => {
  try {
    const { entry_date, description, reference_type, reference_id, lines } = req.body;

    if (!entry_date || !description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Entry Date and Description are required.' });
    }

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({ success: false, message: 'Journal entry must contain at least 2 lines for double-entry validation.' });
    }

    // 1. Verify Entry Date falls within an OPEN Financial Period
    const { data: openPeriods } = await supabaseAdmin
      .from('financial_periods')
      .select('*')
      .eq('status', 'OPEN')
      .lte('start_date', entry_date)
      .gte('end_date', entry_date);

    if (!openPeriods || openPeriods.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Posting date ${entry_date} does not belong to any OPEN financial period. Please select a valid open date or open the period.`
      });
    }
    const targetPeriod = openPeriods[0];

    // 2. Validate Lines Structure & Calculate Totals
    let totalDebit = 0;
    let totalCredit = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.account_id) {
        return res.status(400).json({ success: false, message: `Line #${i + 1} is missing account selection.` });
      }

      const d = parseFloat(line.debit || 0);
      const c = parseFloat(line.credit || 0);

      if (d < 0 || c < 0) {
        return res.status(400).json({ success: false, message: `Line #${i + 1} contains negative amounts which are not allowed.` });
      }

      if ((d > 0 && c > 0) || (d === 0 && c === 0)) {
        return res.status(400).json({
          success: false,
          message: `Line #${i + 1} must specify EITHER Debit > 0 OR Credit > 0 (Debit XOR Credit).`
        });
      }

      totalDebit += d;
      totalCredit += c;
    }

    // Rounding check
    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    // Generate Journal Number (e.g. JE-2026-000001)
    const yearStr = new Date(entry_date).getFullYear();
    const { count } = await supabaseAdmin
      .from('journal_entries')
      .select('id', { count: 'exact' });

    const journalNum = `JE-${yearStr}-${String((count || 0) + 1).padStart(6, '0')}`;

    // Insert Header
    const { data: journalHeader, error: headErr } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        journal_number: journalNum,
        entry_date,
        financial_period_id: targetPeriod.id,
        reference_type: reference_type || 'MANUAL',
        reference_id,
        description: description.trim(),
        status: 'DRAFT',
        total_debit: totalDebit,
        total_credit: totalCredit,
        created_by: req.user ? req.user.id : null
      })
      .select()
      .single();

    if (headErr) throw headErr;

    // Insert Lines
    const linePayloads = lines.map(l => ({
      journal_entry_id: journalHeader.id,
      account_id: l.account_id,
      description: l.description || description.trim(),
      debit: parseFloat(l.debit || 0),
      credit: parseFloat(l.credit || 0)
    }));

    const { error: lineErr } = await supabaseAdmin
      .from('journal_entry_lines')
      .insert(linePayloads);

    if (lineErr) {
      await supabaseAdmin.from('journal_entries').delete().eq('id', journalHeader.id);
      throw lineErr;
    }

    res.status(201).json({
      success: true,
      message: `Journal Entry '${journalNum}' created as DRAFT.`,
      data: journalHeader
    });
  } catch (err) {
    console.error('Error creating journal entry:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create journal entry.' });
  }
};

exports.postJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: journal, error: fetchErr } = await supabaseAdmin
      .from('journal_entries')
      .select('*, period:financial_periods(*), lines:journal_entry_lines(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !journal) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }

    if (journal.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: `Journal entry is in ${journal.status} status and cannot be posted.` });
    }

    // 1. STRICT DOUBLE-ENTRY BALANCE VALIDATION (Total Debits == Total Credits)
    let totalDebit = 0;
    let totalCredit = 0;

    (journal.lines || []).forEach(l => {
      totalDebit += parseFloat(l.debit || 0);
      totalCredit += parseFloat(l.credit || 0);
    });

    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;
    const difference = Math.abs(totalDebit - totalCredit);

    if (difference > 0.001) {
      return res.status(400).json({
        success: false,
        message: `UNBALANCED JOURNAL ENTRY REJECTED! Total Debit (₹${totalDebit.toFixed(2)}) must EQUAL Total Credit (₹${totalCredit.toFixed(2)}). Difference: ₹${difference.toFixed(2)}.`
      });
    }

    // 2. Validate target financial period is still OPEN
    if (!journal.period || journal.period.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: `Financial period for date ${journal.entry_date} is CLOSED. Posting rejected.`
      });
    }

    // 3. Post Journal Entry
    const { data: posted, error: updateErr } = await supabaseAdmin
      .from('journal_entries')
      .update({
        status: 'POSTED',
        posted_at: new Date().toISOString(),
        posted_by: req.user ? req.user.id : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: `Journal Entry '${journal.journal_number}' posted successfully! Ledger updated.`,
      data: posted
    });
  } catch (err) {
    console.error('Error posting journal entry:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to post journal entry.' });
  }
};

exports.reverseJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { void_reason } = req.body;

    if (!void_reason || !void_reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reversal/void reason is required.' });
    }

    const { data: original, error: fetchErr } = await supabaseAdmin
      .from('journal_entries')
      .select('*, period:financial_periods(*), lines:journal_entry_lines(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !original) {
      return res.status(404).json({ success: false, message: 'Original journal entry not found.' });
    }

    if (original.status !== 'POSTED') {
      return res.status(400).json({ success: false, message: 'Only POSTED journal entries can be reversed/voided.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Find OPEN period for reversal
    const { data: openPeriods } = await supabaseAdmin
      .from('financial_periods')
      .select('*')
      .eq('status', 'OPEN')
      .lte('start_date', todayStr)
      .gte('end_date', todayStr);

    const periodId = (openPeriods && openPeriods.length > 0) ? openPeriods[0].id : original.financial_period_id;

    // Generate Reversing Journal Number
    const { count } = await supabaseAdmin
      .from('journal_entries')
      .select('id', { count: 'exact' });

    const revNum = `JE-REV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(6, '0')}`;

    // Insert Reversing Journal Header
    const { data: revHeader, error: headErr } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        journal_number: revNum,
        entry_date: todayStr,
        financial_period_id: periodId,
        reference_type: 'REVERSAL',
        reference_id: original.journal_number,
        description: `REVERSAL of ${original.journal_number}: ${void_reason.trim()}`,
        status: 'POSTED',
        total_debit: original.total_credit,
        total_credit: original.total_debit,
        posted_at: new Date().toISOString(),
        posted_by: req.user ? req.user.id : null,
        reversed_journal_id: original.id,
        created_by: req.user ? req.user.id : null
      })
      .select()
      .single();

    if (headErr) throw headErr;

    // Swap Debits and Credits for reversing lines
    const revLines = original.lines.map(l => ({
      journal_entry_id: revHeader.id,
      account_id: l.account_id,
      description: `Reversal: ${l.description || original.description}`,
      debit: parseFloat(l.credit || 0), // Swap
      credit: parseFloat(l.debit || 0)  // Swap
    }));

    await supabaseAdmin.from('journal_entry_lines').insert(revLines);

    // Mark original journal as VOIDED
    await supabaseAdmin
      .from('journal_entries')
      .update({
        status: 'VOIDED',
        voided_at: new Date().toISOString(),
        voided_by: req.user ? req.user.id : null,
        void_reason: void_reason.trim()
      })
      .eq('id', id);

    res.status(200).json({
      success: true,
      message: `Journal ${original.journal_number} voided. Reversal entry '${revNum}' posted.`,
      data: revHeader
    });
  } catch (err) {
    console.error('Error reversing journal:', err);
    res.status(500).json({ success: false, message: 'Failed to reverse journal entry.' });
  }
};

// ==============================================================================
// 5. FINANCIAL REPORTING (GL, TRIAL BALANCE, P&L, BALANCE SHEET)
// ==============================================================================

exports.getGeneralLedger = async (req, res) => {
  try {
    const { account_id, start_date, end_date, search } = req.query;

    let query = supabaseAdmin
      .from('journal_entry_lines')
      .select('*, account:chart_of_accounts(*), journal_entry:journal_entries(*)')
      .order('created_at', { ascending: true });

    if (account_id) query = query.eq('account_id', account_id);

    const { data, error } = await query;
    if (error) throw error;

    let items = (data || []).filter(l => l.journal_entry && l.journal_entry.status === 'POSTED');

    if (start_date) items = items.filter(l => l.journal_entry.entry_date >= start_date);
    if (end_date) items = items.filter(l => l.journal_entry.entry_date <= end_date);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(l =>
        (l.account && l.account.account_code.toLowerCase().includes(q)) ||
        (l.account && l.account.account_name.toLowerCase().includes(q)) ||
        (l.journal_entry && l.journal_entry.journal_number.toLowerCase().includes(q)) ||
        (l.description && l.description.toLowerCase().includes(q))
      );
    }

    // Calculate Running Balance
    let runningBalance = 0;
    const ledger = items.map(l => {
      const debit = parseFloat(l.debit || 0);
      const credit = parseFloat(l.credit || 0);
      const normal = l.account?.normal_balance || 'DEBIT';

      if (normal === 'DEBIT') {
        runningBalance += (debit - credit);
      } else {
        runningBalance += (credit - debit);
      }

      return {
        ...l,
        running_balance: runningBalance
      };
    });

    res.status(200).json({ success: true, data: ledger });
  } catch (err) {
    console.error('Error fetching general ledger:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch General Ledger.' });
  }
};

exports.getTrialBalance = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const [accountsRes, linesRes] = await Promise.all([
      supabaseAdmin.from('chart_of_accounts').select('*').order('account_code', { ascending: true }),
      supabaseAdmin.from('journal_entry_lines').select('*, journal_entry:journal_entries(*)').order('created_at', { ascending: true })
    ]);

    const accounts = accountsRes.data || [];
    let lines = (linesRes.data || []).filter(l => l.journal_entry && l.journal_entry.status === 'POSTED');

    if (start_date) lines = lines.filter(l => l.journal_entry.entry_date >= start_date);
    if (end_date) lines = lines.filter(l => l.journal_entry.entry_date <= end_date);

    // Map total debits & credits by account
    const accountMap = {};
    accounts.forEach(a => {
      accountMap[a.id] = {
        id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        account_type: a.account_type,
        normal_balance: a.normal_balance,
        total_debit: 0,
        total_credit: 0,
        net_balance: 0
      };
    });

    lines.forEach(l => {
      if (accountMap[l.account_id]) {
        accountMap[l.account_id].total_debit += parseFloat(l.debit || 0);
        accountMap[l.account_id].total_credit += parseFloat(l.credit || 0);
      }
    });

    let overallTotalDebit = 0;
    let overallTotalCredit = 0;

    const trialBalanceItems = Object.values(accountMap).map(item => {
      overallTotalDebit += item.total_debit;
      overallTotalCredit += item.total_credit;

      item.net_balance = item.normal_balance === 'DEBIT'
        ? (item.total_debit - item.total_credit)
        : (item.total_credit - item.total_debit);

      return item;
    }).filter(i => i.total_debit > 0 || i.total_credit > 0);

    overallTotalDebit = Math.round(overallTotalDebit * 100) / 100;
    overallTotalCredit = Math.round(overallTotalCredit * 100) / 100;
    const isBalanced = Math.abs(overallTotalDebit - overallTotalCredit) < 0.01;

    res.status(200).json({
      success: true,
      data: {
        items: trialBalanceItems,
        totalDebit: overallTotalDebit,
        totalCredit: overallTotalCredit,
        isBalanced,
        difference: Math.abs(overallTotalDebit - overallTotalCredit)
      }
    });
  } catch (err) {
    console.error('Error fetching Trial Balance:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate Trial Balance.' });
  }
};

exports.getProfitLoss = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const [accountsRes, linesRes] = await Promise.all([
      supabaseAdmin.from('chart_of_accounts').select('*').in('account_type', ['REVENUE', 'EXPENSE']).order('account_code', { ascending: true }),
      supabaseAdmin.from('journal_entry_lines').select('*, journal_entry:journal_entries(*)').order('created_at', { ascending: true })
    ]);

    const accounts = accountsRes.data || [];
    let lines = (linesRes.data || []).filter(l => l.journal_entry && l.journal_entry.status === 'POSTED');

    if (start_date) lines = lines.filter(l => l.journal_entry.entry_date >= start_date);
    if (end_date) lines = lines.filter(l => l.journal_entry.entry_date <= end_date);

    const revenueMap = {};
    const expenseMap = {};

    accounts.forEach(a => {
      const obj = { id: a.id, account_code: a.account_code, account_name: a.account_name, amount: 0 };
      if (a.account_type === 'REVENUE') revenueMap[a.id] = obj;
      else if (a.account_type === 'EXPENSE') expenseMap[a.id] = obj;
    });

    lines.forEach(l => {
      const d = parseFloat(l.debit || 0);
      const c = parseFloat(l.credit || 0);

      if (revenueMap[l.account_id]) {
        revenueMap[l.account_id].amount += (c - d); // Credit - Debit
      }
      if (expenseMap[l.account_id]) {
        expenseMap[l.account_id].amount += (d - c); // Debit - Credit
      }
    });

    const revenueItems = Object.values(revenueMap);
    const expenseItems = Object.values(expenseMap);

    const totalRevenue = revenueItems.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenseItems.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        revenueItems,
        expenseItems,
        totalRevenue,
        totalExpenses,
        netProfit
      }
    });
  } catch (err) {
    console.error('Error fetching P&L:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate Profit & Loss.' });
  }
};

exports.getBalanceSheet = async (req, res) => {
  try {
    const [accountsRes, linesRes] = await Promise.all([
      supabaseAdmin.from('chart_of_accounts').select('*').in('account_type', ['ASSET', 'LIABILITY', 'EQUITY']).order('account_code', { ascending: true }),
      supabaseAdmin.from('journal_entry_lines').select('*, journal_entry:journal_entries(*)').order('created_at', { ascending: true })
    ]);

    const accounts = accountsRes.data || [];
    const lines = (linesRes.data || []).filter(l => l.journal_entry && l.journal_entry.status === 'POSTED');

    const assetMap = {};
    const liabilityMap = {};
    const equityMap = {};

    accounts.forEach(a => {
      const obj = { id: a.id, account_code: a.account_code, account_name: a.account_name, category: a.category, balance: 0 };
      if (a.account_type === 'ASSET') assetMap[a.id] = obj;
      else if (a.account_type === 'LIABILITY') liabilityMap[a.id] = obj;
      else if (a.account_type === 'EQUITY') equityMap[a.id] = obj;
    });

    lines.forEach(l => {
      const d = parseFloat(l.debit || 0);
      const c = parseFloat(l.credit || 0);

      if (assetMap[l.account_id]) {
        assetMap[l.account_id].balance += (d - c);
      }
      if (liabilityMap[l.account_id]) {
        liabilityMap[l.account_id].balance += (c - d);
      }
      if (equityMap[l.account_id]) {
        equityMap[l.account_id].balance += (c - d);
      }
    });

    const assets = Object.values(assetMap);
    const liabilities = Object.values(liabilityMap);
    const equity = Object.values(equityMap);

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.balance, 0);

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

    res.status(200).json({
      success: true,
      data: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalLiabilitiesAndEquity,
        isBalanced,
        difference: Math.abs(totalAssets - totalLiabilitiesAndEquity)
      }
    });
  } catch (err) {
    console.error('Error fetching Balance Sheet:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate Balance Sheet.' });
  }
};
