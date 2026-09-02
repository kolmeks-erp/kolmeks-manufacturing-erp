const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper: Resolve Employee Record for authenticated user
 */
const getEmployeeForUser = async (user) => {
  if (!user) return null;
  let { data: emp } = await supabaseAdmin
    .from('employees')
    .select('*, department:departments!employees_department_id_fkey(id, code, name)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (emp) return emp;

  if (user.email) {
    const { data: empByEmail } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments!employees_department_id_fkey(id, code, name)')
      .eq('email', user.email.toLowerCase())
      .maybeSingle();

    if (empByEmail) return empByEmail;
  }
  return null;
};

// ==============================================================================
// 1. PAYROLL DASHBOARD KPIS
// ==============================================================================

exports.getPayrollDashboardKPIs = async (req, res) => {
  try {
    const [empCount, activePeriod, runsCount, totalPayrollData] = await Promise.all([
      supabaseAdmin.from('employees').select('id', { count: 'exact' }).eq('status', 'ACTIVE'),
      supabaseAdmin.from('payroll_periods').select('*').in('status', ['OPEN', 'PROCESSING']).order('start_date', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('payroll_runs').select('id', { count: 'exact' }),
      supabaseAdmin.from('payroll_runs').select('gross_payroll, total_deductions, net_payroll').eq('status', 'POSTED')
    ]);

    const postedRuns = totalPayrollData.data || [];
    const cumulativeGross = postedRuns.reduce((acc, r) => acc + parseFloat(r.gross_payroll || 0), 0);
    const cumulativeNet = postedRuns.reduce((acc, r) => acc + parseFloat(r.net_payroll || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: empCount.count || 0,
        activePeriod: activePeriod.data || null,
        totalRuns: runsCount.count || 0,
        cumulativeGross,
        cumulativeNet
      }
    });
  } catch (err) {
    console.error('Error fetching Payroll dashboard KPIs:', err);
    res.status(500).json({ success: false, message: 'Internal server error fetching Payroll metrics.' });
  }
};

// ==============================================================================
// 2. EMPLOYEE COMPENSATION
// ==============================================================================

exports.getEmployeeCompensations = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select(`
        id, employee_code, first_name, last_name, email, hire_date, status,
        department:departments!employees_department_id_fkey(id, code, name),
        compensation:employee_compensation(*)
      `)
      .eq('status', 'ACTIVE')
      .order('first_name', { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map(emp => ({
      ...emp,
      basic_salary: emp.compensation ? emp.compensation.basic_salary : 0,
      allowances: emp.compensation ? emp.compensation.allowances : 0,
      hourly_rate: emp.compensation ? emp.compensation.hourly_rate : 0,
      currency: emp.compensation ? emp.compensation.currency : 'INR'
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch employee compensation data.' });
  }
};

exports.updateEmployeeCompensation = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { basic_salary, allowances, hourly_rate, currency } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('employee_compensation')
      .upsert({
        employee_id,
        basic_salary: parseFloat(basic_salary) || 0,
        allowances: parseFloat(allowances) || 0,
        hourly_rate: parseFloat(hourly_rate) || 0,
        currency: currency || 'INR',
        effective_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      }, { onConflict: 'employee_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Employee compensation updated successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update compensation.' });
  }
};

// ==============================================================================
// 3. PAYROLL PERIODS
// ==============================================================================

exports.getPayrollPeriods = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payroll_periods')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payroll periods.' });
  }
};

exports.createPayrollPeriod = async (req, res) => {
  try {
    const { period_code, name, start_date, end_date } = req.body;
    if (!period_code || !name || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Period code, name, start date, and end date are required.' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    const { data, error } = await supabaseAdmin
      .from('payroll_periods')
      .insert({
        period_code: period_code.toUpperCase(),
        name: name.trim(),
        start_date,
        end_date,
        status: 'OPEN'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Payroll period created successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create payroll period.' });
  }
};

exports.updatePayrollPeriodStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'OPEN', 'PROCESSING', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'CLOSED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status ${status}.` });
    }

    const { data, error } = await supabaseAdmin
      .from('payroll_periods')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: `Payroll period status updated to ${status}.`, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update period status.' });
  }
};

// ==============================================================================
// 4. PAYROLL RUNS & CALCULATION ENGINE
// ==============================================================================

exports.getPayrollRuns = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payroll_runs')
      .select('*, payroll_period:payroll_periods(*), approver:employees!approved_by(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payroll runs.' });
  }
};

exports.createPayrollRun = async (req, res) => {
  try {
    const { payroll_period_id } = req.body;
    if (!payroll_period_id) {
      return res.status(400).json({ success: false, message: 'Payroll Period selection is required.' });
    }

    // Check if open run already exists for period
    const { data: existingRun } = await supabaseAdmin
      .from('payroll_runs')
      .select('id, run_number, status')
      .eq('payroll_period_id', payroll_period_id)
      .not('status', 'eq', 'CANCELLED')
      .maybeSingle();

    if (existingRun) {
      return res.status(400).json({
        success: false,
        message: `A payroll run (${existingRun.run_number}) already exists for this period in ${existingRun.status} status.`
      });
    }

    const { data: runData, error } = await supabaseAdmin
      .from('payroll_runs')
      .insert({
        payroll_period_id,
        run_date: new Date().toISOString().split('T')[0],
        status: 'DRAFT'
      })
      .select('*, payroll_period:payroll_periods(*)')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Payroll run initialized in DRAFT.', data: runData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create payroll run.' });
  }
};

exports.getPayrollRunById = async (req, res) => {
  try {
    const { id } = req.params;

    const [runRes, entriesRes] = await Promise.all([
      supabaseAdmin.from('payroll_runs').select('*, payroll_period:payroll_periods(*), approver:employees!approved_by(first_name, last_name)').eq('id', id).single(),
      supabaseAdmin.from('payroll_entries').select('*, employee:employees(id, employee_code, first_name, last_name, email), department:departments(name)').eq('payroll_run_id', id).order('created_at', { ascending: true })
    ]);

    if (runRes.error || !runRes.data) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        run: runRes.data,
        entries: entriesRes.data || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payroll run details.' });
  }
};

exports.calculatePayrollRun = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: run, error: fetchErr } = await supabaseAdmin
      .from('payroll_runs')
      .select('*, payroll_period:payroll_periods(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    if (['POSTED', 'CLOSED', 'CANCELLED'].includes(run.status)) {
      return res.status(400).json({ success: false, message: `Cannot recalculate payroll run in ${run.status} status.` });
    }

    // 1. Fetch active employees
    const { data: employees, error: empErr } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments!employees_department_id_fkey(id, name), compensation:employee_compensation(*)')
      .eq('status', 'ACTIVE');

    if (empErr) throw empErr;

    if (!employees || employees.length === 0) {
      return res.status(400).json({ success: false, message: 'No active employees found to process.' });
    }

    const startDate = run.payroll_period.start_date;
    const endDate = run.payroll_period.end_date;

    // Delete existing entries for recalculation
    await supabaseAdmin.from('payroll_entries').delete().eq('payroll_run_id', id);

    let runGross = 0;
    let runDeductions = 0;
    let runNet = 0;
    const entriesToInsert = [];

    for (const emp of employees) {
      const basicSalary = emp.compensation ? parseFloat(emp.compensation.basic_salary || 0) : 0;
      const allowances = emp.compensation ? parseFloat(emp.compensation.allowances || 0) : 0;

      // 2. Query approved overtime in this period
      const { data: otRecords } = await supabaseAdmin
        .from('overtime_records')
        .select('overtime_amount')
        .eq('employee_id', emp.id)
        .eq('status', 'APPROVED')
        .gte('overtime_date', startDate)
        .lte('overtime_date', endDate);

      const overtimePay = (otRecords || []).reduce((acc, r) => acc + parseFloat(r.overtime_amount || 0), 0);

      // 3. Query unpaid leave (LWP) requests in this period
      const { data: lwpRequests } = await supabaseAdmin
        .from('leave_requests')
        .select('leave_days, leave_type:leave_types(paid)')
        .eq('employee_id', emp.id)
        .eq('status', 'APPROVED')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      const lwpDays = (lwpRequests || []).reduce((acc, r) => {
        if (r.leave_type && !r.leave_type.paid) {
          return acc + parseFloat(r.leave_days || 0);
        }
        return acc;
      }, 0);

      // Calculate unpaid leave daily rate deduction (assumes 30 days/month default)
      const dailyRate = basicSalary / 30;
      const unpaidLeaveDeduction = Math.round(lwpDays * dailyRate * 100) / 100;

      const grossPay = basicSalary + allowances + overtimePay;
      const totalDeductions = unpaidLeaveDeduction;
      const netPay = Math.max(0, grossPay - totalDeductions);

      runGross += grossPay;
      runDeductions += totalDeductions;
      runNet += netPay;

      entriesToInsert.push({
        payroll_run_id: id,
        employee_id: emp.id,
        department_id: emp.department_id || null,
        basic_salary: basicSalary,
        allowances,
        overtime_pay: overtimePay,
        bonus: 0.00,
        other_earnings: 0.00,
        gross_pay: grossPay,
        loan_deductions: 0.00,
        unpaid_leave_deductions: unpaidLeaveDeduction,
        other_deductions: 0.00,
        total_deductions: totalDeductions,
        net_pay: netPay,
        status: 'DRAFT'
      });
    }

    // Insert entries
    const { data: insertedEntries, error: insErr } = await supabaseAdmin
      .from('payroll_entries')
      .insert(entriesToInsert)
      .select();

    if (insErr) throw insErr;

    // Update payroll run status and totals
    const { data: updatedRun } = await supabaseAdmin
      .from('payroll_runs')
      .update({
        total_employees: employees.length,
        gross_payroll: runGross,
        total_deductions: runDeductions,
        net_payroll: runNet,
        status: 'PROCESSING'
      })
      .eq('id', id)
      .select('*, payroll_period:payroll_periods(*)')
      .single();

    res.status(200).json({
      success: true,
      message: `Payroll run calculated successfully for ${employees.length} employees.`,
      data: {
        run: updatedRun,
        entries: insertedEntries
      }
    });
  } catch (err) {
    console.error('Error calculating payroll run:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to calculate payroll run.' });
  }
};

exports.approvePayrollRun = async (req, res) => {
  try {
    const { id } = req.params;
    const approverEmp = await getEmployeeForUser(req.user);

    const { data: run, error: fetchErr } = await supabaseAdmin
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    if (!['DRAFT', 'PROCESSING', 'PENDING_APPROVAL'].includes(run.status)) {
      return res.status(400).json({ success: false, message: `Cannot approve payroll in ${run.status} status.` });
    }

    const { data: approvedRun, error } = await supabaseAdmin
      .from('payroll_runs')
      .update({
        status: 'APPROVED',
        approved_by: approverEmp ? approverEmp.id : null,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, payroll_period:payroll_periods(*)')
      .single();

    if (error) throw error;

    // Update entries status
    await supabaseAdmin.from('payroll_entries').update({ status: 'APPROVED' }).eq('payroll_run_id', id);

    res.status(200).json({ success: true, message: 'Payroll run approved successfully.', data: approvedRun });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to approve payroll run.' });
  }
};

// ==============================================================================
// 5. PAYROLL ACCOUNTING POSTING (GL INTEGRATION)
// ==============================================================================

exports.postPayrollRun = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: run, error: fetchErr } = await supabaseAdmin
      .from('payroll_runs')
      .select('*, payroll_period:payroll_periods(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.' });
    }

    if (run.status === 'POSTED') {
      return res.status(400).json({ success: false, message: 'Payroll run is already posted to General Ledger.' });
    }

    if (run.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Payroll run must be APPROVED before GL posting.' });
    }

    // 1. Verify OPEN Financial Period
    const { data: openFinPeriod } = await supabaseAdmin
      .from('financial_periods')
      .select('id, period_name, status')
      .eq('status', 'OPEN')
      .lte('start_date', run.payroll_period.start_date)
      .gte('end_date', run.payroll_period.end_date)
      .maybeSingle();

    let finPeriodId = openFinPeriod ? openFinPeriod.id : null;

    if (!finPeriodId) {
      const { data: anyOpenPeriod } = await supabaseAdmin
        .from('financial_periods')
        .select('id')
        .eq('status', 'OPEN')
        .limit(1)
        .single();
      if (anyOpenPeriod) finPeriodId = anyOpenPeriod.id;
    }

    if (!finPeriodId) {
      return res.status(400).json({
        success: false,
        message: 'No OPEN financial period found in General Ledger. Please open a financial period before posting payroll.'
      });
    }

    // 2. Fetch Payroll GL Account Mappings
    const { data: mapping } = await supabaseAdmin
      .from('payroll_account_mappings')
      .select('*')
      .limit(1)
      .maybeSingle();

    let expenseAccId = mapping ? mapping.salary_expense_account_id : null;
    let payableAccId = mapping ? mapping.payroll_payable_account_id : null;

    if (!expenseAccId) {
      const { data: expAcc } = await supabaseAdmin.from('chart_of_accounts').select('id').eq('account_code', '5200').maybeSingle();
      if (expAcc) expenseAccId = expAcc.id;
    }

    if (!payableAccId) {
      const { data: liabAcc } = await supabaseAdmin.from('chart_of_accounts').select('id').eq('account_code', '2120').maybeSingle();
      if (liabAcc) payableAccId = liabAcc.id;
    }

    if (!expenseAccId || !payableAccId) {
      return res.status(400).json({
        success: false,
        message: 'Missing GL account mappings for Salary Expense (5200) or Payroll Payable (2120). Please configure account mappings.'
      });
    }

    const grossAmount = parseFloat(run.gross_payroll || 0);
    const journalNum = `JE-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Create General Ledger Journal Entry
    const { data: je, error: jeErr } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        journal_number: journalNum,
        entry_date: run.run_date || new Date().toISOString().split('T')[0],
        financial_period_id: finPeriodId,
        reference_type: 'PAYROLL',
        reference_id: run.run_number,
        description: `Payroll Posting for ${run.payroll_period.name} (${run.total_employees} Employees)`,
        status: 'POSTED',
        total_debit: grossAmount,
        total_credit: grossAmount,
        posted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jeErr) throw jeErr;

    // 4. Create Journal Entry Lines (Debit Expense, Credit Payable)
    await supabaseAdmin.from('journal_entry_lines').insert([
      {
        journal_entry_id: je.id,
        account_id: expenseAccId,
        description: `Salary & Wage Expense for ${run.payroll_period.name}`,
        debit: grossAmount,
        credit: 0.00
      },
      {
        journal_entry_id: je.id,
        account_id: payableAccId,
        description: `Accrued Salaries Payable for ${run.payroll_period.name}`,
        debit: 0.00,
        credit: grossAmount
      }
    ]);

    // 5. Mark Payroll Run as POSTED
    const { data: postedRun } = await supabaseAdmin
      .from('payroll_runs')
      .update({
        status: 'POSTED',
        journal_entry_id: je.id
      })
      .eq('id', id)
      .select('*, payroll_period:payroll_periods(*)')
      .single();

    await supabaseAdmin.from('payroll_entries').update({ status: 'POSTED' }).eq('payroll_run_id', id);

    res.status(200).json({
      success: true,
      message: `Payroll run posted successfully to General Ledger (${journalNum}).`,
      data: {
        run: postedRun,
        journalEntry: je
      }
    });
  } catch (err) {
    console.error('Error posting payroll to GL:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to post payroll run to General Ledger.' });
  }
};

// ==============================================================================
// 6. PAYSLIPS & SELF-SERVICE
// ==============================================================================

exports.getPayslips = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    const userRole = req.user?.role || 'employee';

    let query = supabaseAdmin
      .from('payroll_entries')
      .select(`
        *,
        employee:employees(id, employee_code, first_name, last_name, email, designation_id),
        department:departments(name),
        payroll_run:payroll_runs(id, run_number, run_date, payroll_period:payroll_periods(name, start_date, end_date))
      `)
      .order('created_at', { ascending: false });

    // Restrict employee users to only their own payslips
    if (!['admin', 'hr', 'payroll', 'finance'].includes(userRole)) {
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee profile not linked.' });
      }
      query = query.eq('employee_id', emp.id).in('status', ['APPROVED', 'POSTED']);
    } else if (req.query.employee_id) {
      query = query.eq('employee_id', req.query.employee_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payslips.' });
  }
};

exports.getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await getEmployeeForUser(req.user);
    const userRole = req.user?.role || 'employee';

    const { data: payslip, error } = await supabaseAdmin
      .from('payroll_entries')
      .select(`
        *,
        employee:employees(id, employee_code, first_name, last_name, email, hire_date, department:departments!employees_department_id_fkey(name)),
        department:departments(name),
        cost_center:cost_centers(code, name),
        payroll_run:payroll_runs(id, run_number, run_date, payroll_period:payroll_periods(name, start_date, end_date))
      `)
      .eq('id', id)
      .single();

    if (error || !payslip) {
      return res.status(404).json({ success: false, message: 'Payslip record not found.' });
    }

    // Security check: normal employees can only access their own payslip
    if (!['admin', 'hr', 'payroll', 'finance'].includes(userRole)) {
      if (!emp || payslip.employee_id !== emp.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to requested payslip.' });
      }
    }

    res.status(200).json({ success: true, data: payslip });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve payslip details.' });
  }
};

// ==============================================================================
// 7. PAYROLL REPORTS
// ==============================================================================

exports.getPayrollReports = async (req, res) => {
  try {
    const periodId = req.query.payroll_period_id || '';

    let query = supabaseAdmin
      .from('payroll_entries')
      .select('*, employee:employees(id, employee_code, first_name, last_name, department:departments!employees_department_id_fkey(name)), payroll_run:payroll_runs(id, run_number, payroll_period_id)');

    if (periodId) {
      const { data: runs } = await supabaseAdmin.from('payroll_runs').select('id').eq('payroll_period_id', periodId);
      const runIds = (runs || []).map(r => r.id);
      if (runIds.length > 0) {
        query = query.in('payroll_run_id', runIds);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate payroll reports.' });
  }
};
