const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper: Resolve Employee Record for authenticated user
 */
const getEmployeeForUser = async (user) => {
  if (!user) return null;

  // 1. Try matching by auth_user_id
  let { data: emp, error } = await supabaseAdmin
    .from('employees')
    .select('*, department:departments(id, code, name), shift:shifts(*)')
    .eq('auth_user_id', user.id)
    .single();

  if (emp) return emp;

  // 2. Fallback: match by email
  if (user.email) {
    const { data: empByEmail } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(id, code, name), shift:shifts(*)')
      .eq('email', user.email.toLowerCase())
      .single();

    if (empByEmail) {
      // Link auth_user_id for future quick lookups
      await supabaseAdmin
        .from('employees')
        .update({ auth_user_id: user.id })
        .eq('id', empByEmail.id);
      return empByEmail;
    }
  }

  return null;
};

// ==============================================================================
// 1. DASHBOARD TELEMETRY & KPIS
// ==============================================================================

exports.getHRDashboardKPIs = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [empCount, attToday, pendingLeaves, upcomingHolidays] = await Promise.all([
      // Total active employees
      supabaseAdmin.from('employees').select('id', { count: 'exact' }).eq('status', 'ACTIVE'),
      
      // Today's attendance records
      supabaseAdmin.from('attendance_records').select('id, status, late_minutes').eq('attendance_date', today),

      // Pending leave requests
      supabaseAdmin.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'PENDING'),

      // Upcoming holidays
      supabaseAdmin.from('holidays').select('*').gte('holiday_date', today).eq('status', 'ACTIVE').order('holiday_date', { ascending: true }).limit(5)
    ]);

    const totalEmployees = empCount.count || 0;
    const todayRecords = attToday.data || [];

    const presentToday = todayRecords.filter(r => ['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status)).length;
    const absentToday = todayRecords.filter(r => r.status === 'ABSENT').length;
    const onLeaveToday = todayRecords.filter(r => r.status === 'ON_LEAVE').length;
    const lateToday = todayRecords.filter(r => r.status === 'LATE' || r.late_minutes > 0).length;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday,
        lateToday,
        pendingLeaveRequests: pendingLeaves.count || 0,
        upcomingHolidays: upcomingHolidays.data || []
      }
    });
  } catch (err) {
    console.error('Error fetching HR dashboard KPIs:', err);
    res.status(500).json({ success: false, message: 'Internal server error fetching HR metrics.' });
  }
};

// ==============================================================================
// 2. DESIGNATIONS
// ==============================================================================

exports.getDesignations = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('designations')
      .select('*, department:departments(id, code, name)')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch designations.' });
  }
};

exports.createDesignation = async (req, res) => {
  try {
    const { code, name, department_id, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Code and Designation Name are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('designations')
      .insert({ code: code.toUpperCase(), name: name.trim(), department_id, description })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create designation.' });
  }
};

// ==============================================================================
// 3. SHIFT MANAGEMENT
// ==============================================================================

exports.getShifts = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch shift schedules.' });
  }
};

exports.createShift = async (req, res) => {
  try {
    const { shift_code, name, start_time, end_time, break_duration_minutes, grace_minutes, description } = req.body;
    if (!shift_code || !name || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Shift Code, Name, Start and End times are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .insert({
        shift_code: shift_code.toUpperCase(),
        name: name.trim(),
        start_time,
        end_time,
        break_duration_minutes: parseInt(break_duration_minutes, 10) || 60,
        grace_minutes: parseInt(grace_minutes, 10) || 15,
        description
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create shift schedule.' });
  }
};

exports.assignEmployeeShift = async (req, res) => {
  try {
    const { employee_id, shift_id, start_date } = req.body;
    if (!employee_id || !shift_id) {
      return res.status(400).json({ success: false, message: 'Employee and Shift selection are required.' });
    }

    // 1. Update active employee record
    await supabaseAdmin
      .from('employees')
      .update({ shift_id })
      .eq('id', employee_id);

    // 2. Insert shift assignment log
    const { data, error } = await supabaseAdmin
      .from('employee_shift_assignments')
      .insert({
        employee_id,
        shift_id,
        start_date: start_date || new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Shift assigned successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to assign shift.' });
  }
};

// ==============================================================================
// 4. ATTENDANCE ENGINE & CHECK-IN / CHECK-OUT
// ==============================================================================

exports.checkIn = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Your login profile is not linked to an active Employee record.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Check existing attendance for today
    const { data: existing } = await supabaseAdmin
      .from('attendance_records')
      .select('id, check_in, check_out')
      .eq('employee_id', emp.id)
      .eq('attendance_date', todayStr)
      .single();

    if (existing && existing.check_in) {
      return res.status(400).json({ success: false, message: 'You have already checked in for today.' });
    }

    // Evaluate Late arrival based on assigned shift
    let isLate = false;
    let lateMinutes = 0;

    if (emp.shift) {
      const now = new Date();
      const [shHours, shMins] = emp.shift.start_time.split(':').map(Number);
      const shiftStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), shHours, shMins);
      const graceTime = new Date(shiftStart.getTime() + (emp.shift.grace_minutes || 15) * 60000);

      if (now > graceTime) {
        isLate = true;
        lateMinutes = Math.round((now.getTime() - shiftStart.getTime()) / 60000);
      }
    }

    const attendancePayload = {
      employee_id: emp.id,
      attendance_date: todayStr,
      shift_id: emp.shift_id || null,
      check_in: nowIso,
      status: isLate ? 'LATE' : 'PRESENT',
      late_minutes: lateMinutes
    };

    const { data: record, error } = await supabaseAdmin
      .from('attendance_records')
      .upsert(attendancePayload, { onConflict: 'employee_id,attendance_date' })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Check-in recorded successfully at ${new Date(nowIso).toLocaleTimeString()}.${isLate ? ` (Marked LATE by ${lateMinutes} mins)` : ''}`,
      data: record
    });
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ success: false, message: err.message || 'Check-in failed.' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('attendance_records')
      .select('*, shift:shifts(*)')
      .eq('employee_id', emp.id)
      .eq('attendance_date', todayStr)
      .single();

    if (fetchErr || !record || !record.check_in) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today. You must check in first.' });
    }

    if (record.check_out) {
      return res.status(400).json({ success: false, message: 'You have already checked out for today.' });
    }

    // Calculate worked minutes
    const checkInTime = new Date(record.check_in).getTime();
    const checkOutTime = new Date(nowIso).getTime();
    const totalDurationMins = Math.round((checkOutTime - checkInTime) / 60000);
    const breakMins = record.shift?.break_duration_minutes || 60;
    const workedMinutes = Math.max(0, totalDurationMins - breakMins);

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('attendance_records')
      .update({
        check_out: nowIso,
        worked_minutes: workedMinutes
      })
      .eq('id', record.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: `Check-out recorded successfully. Total Worked: ${(workedMinutes / 60).toFixed(1)} Hours.`,
      data: updated
    });
  } catch (err) {
    console.error('Error during check-out:', err);
    res.status(500).json({ success: false, message: err.message || 'Check-out failed.' });
  }
};

exports.getAttendanceRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const employeeId = req.query.employee_id || '';
    const departmentId = req.query.department_id || '';
    const status = req.query.status || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('attendance_records')
      .select('*, employee:employees(id, employee_code, first_name, last_name, department:departments(name)), shift:shifts(name)', { count: 'exact' });

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('attendance_date', startDate);
    if (endDate) query = query.lte('attendance_date', endDate);

    query = query.order('attendance_date', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        totalRecords: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance logs.' });
  }
};

exports.requestAttendanceCorrection = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    const { attendance_id, requested_check_in, requested_check_out, requested_status, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason for attendance correction is required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('attendance_corrections')
      .insert({
        attendance_id: attendance_id || null,
        employee_id: emp ? emp.id : req.body.employee_id,
        requested_check_in,
        requested_check_out,
        requested_status: requested_status || 'PRESENT',
        reason: reason.trim(),
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Attendance correction request submitted.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit attendance correction.' });
  }
};

// ==============================================================================
// 5. LEAVE MANAGEMENT
// ==============================================================================

exports.getLeaveTypes = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leave_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave policies.' });
  }
};

exports.createLeaveType = async (req, res) => {
  try {
    const { code, name, description, paid, default_days, requires_approval } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Leave code and name are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('leave_types')
      .insert({
        code: code.toUpperCase(),
        name: name.trim(),
        description,
        paid: paid !== undefined ? paid : true,
        default_days: parseInt(default_days, 10) || 12,
        requires_approval: requires_approval !== undefined ? requires_approval : true
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create leave policy.' });
  }
};

exports.getLeaveBalances = async (req, res) => {
  try {
    const employeeId = req.query.employee_id || '';
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    let query = supabaseAdmin
      .from('leave_balances')
      .select('*, leave_type:leave_types(*), employee:employees(id, employee_code, first_name, last_name)')
      .eq('year', year);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave balances.' });
  }
};

exports.allocateLeaveBalance = async (req, res) => {
  try {
    const { employee_id, leave_type_id, year, allocated_days } = req.body;
    if (!employee_id || !leave_type_id || !allocated_days) {
      return res.status(400).json({ success: false, message: 'Employee, Leave Type, and Allocated Days are required.' });
    }

    const yr = parseInt(year, 10) || new Date().getFullYear();
    const days = parseFloat(allocated_days);

    const { data, error } = await supabaseAdmin
      .from('leave_balances')
      .upsert({
        employee_id,
        leave_type_id,
        year: yr,
        allocated_days: days,
        remaining_days: days
      }, { onConflict: 'employee_id,leave_type_id,year' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Leave balance allocated successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to allocate leave balance.' });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || '';
    const employeeId = req.query.employee_id || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('leave_requests')
      .select('*, employee:employees(id, employee_code, first_name, last_name, department:departments(name)), leave_type:leave_types(id, code, name), approver:employees!approver_id(first_name, last_name)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (employeeId) query = query.eq('employee_id', employeeId);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        totalRecords: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests.' });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { employee_id, leave_type_id, start_date, end_date, half_day, reason } = req.body;
    
    // Resolve employee
    let empId = employee_id;
    if (!empId) {
      const emp = await getEmployeeForUser(req.user);
      if (!emp) return res.status(404).json({ success: false, message: 'Employee profile not linked.' });
      empId = emp.id;
    }

    if (!leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({ success: false, message: 'Leave Type, Start Date, End Date, and Reason are required.' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be prior to start date.' });
    }

    // Check for overlapping approved/pending leave requests
    const { data: overlap } = await supabaseAdmin
      .from('leave_requests')
      .select('id, request_number, start_date, end_date')
      .eq('employee_id', empId)
      .in('status', ['PENDING', 'APPROVED'])
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (overlap && overlap.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Overlapping leave request already exists (${overlap[0].request_number} from ${overlap[0].start_date} to ${overlap[0].end_date}).`
      });
    }

    // Calculate requested leave days
    const sDate = new Date(start_date);
    const eDate = new Date(end_date);
    let days = Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24)) + 1;
    if (half_day && half_day !== 'NONE') days = 0.5;

    // Create leave request
    const { data: reqData, error } = await supabaseAdmin
      .from('leave_requests')
      .insert({
        employee_id: empId,
        leave_type_id,
        start_date,
        end_date,
        half_day: half_day || 'NONE',
        leave_days: days,
        reason: reason.trim(),
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;

    // Update pending_days in leave_balances
    const currentYr = sDate.getFullYear();
    const { data: bal } = await supabaseAdmin
      .from('leave_balances')
      .select('*')
      .eq('employee_id', empId)
      .eq('leave_type_id', leave_type_id)
      .eq('year', currentYr)
      .single();

    if (bal) {
      await supabaseAdmin
        .from('leave_balances')
        .update({ pending_days: parseFloat(bal.pending_days || 0) + days })
        .eq('id', bal.id);
    }

    res.status(201).json({ success: true, message: 'Leave request submitted successfully.', data: reqData });
  } catch (err) {
    console.error('Error creating leave request:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to submit leave request.' });
  }
};

exports.approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approverEmp = await getEmployeeForUser(req.user);

    const { data: lReq, error: fetchErr } = await supabaseAdmin
      .from('leave_requests')
      .select('*, leave_type:leave_types(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !lReq) {
      return res.status(404).json({ success: false, message: 'Leave request record not found.' });
    }

    if (lReq.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot approve leave in ${lReq.status} status.` });
    }

    const yr = new Date(lReq.start_date).getFullYear();

    // Fetch leave balance
    const { data: bal } = await supabaseAdmin
      .from('leave_balances')
      .select('*')
      .eq('employee_id', lReq.employee_id)
      .eq('leave_type_id', lReq.leave_type_id)
      .eq('year', yr)
      .single();

    const days = parseFloat(lReq.leave_days);

    if (lReq.leave_type?.paid && bal && parseFloat(bal.remaining_days) < days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Requested ${days} days, but remaining balance is ${bal.remaining_days} days.`
      });
    }

    // 1. Update Leave Request
    const { data: approved, error: appErr } = await supabaseAdmin
      .from('leave_requests')
      .update({
        status: 'APPROVED',
        approver_id: approverEmp ? approverEmp.id : null,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (appErr) throw appErr;

    // 2. Adjust Leave Balances
    if (bal) {
      const newPending = Math.max(0, parseFloat(bal.pending_days || 0) - days);
      const newUsed = parseFloat(bal.used_days || 0) + days;
      const newRemaining = parseFloat(bal.allocated_days || 0) + parseFloat(bal.adjustment_days || 0) - newUsed;

      await supabaseAdmin
        .from('leave_balances')
        .update({
          pending_days: newPending,
          used_days: newUsed,
          remaining_days: newRemaining
        })
        .eq('id', bal.id);
    }

    res.status(200).json({ success: true, message: 'Leave request approved successfully.', data: approved });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to approve leave request.' });
  }
};

exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const approverEmp = await getEmployeeForUser(req.user);

    const { data: lReq } = await supabaseAdmin
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!lReq || lReq.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Leave request is not in PENDING status.' });
    }

    const days = parseFloat(lReq.leave_days);
    const yr = new Date(lReq.start_date).getFullYear();

    // 1. Update Request
    const { data: rejected } = await supabaseAdmin
      .from('leave_requests')
      .update({
        status: 'REJECTED',
        rejection_reason: rejection_reason || 'Rejected by HR/Manager',
        approver_id: approverEmp ? approverEmp.id : null,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    // 2. Reduce pending_days in balance
    const { data: bal } = await supabaseAdmin
      .from('leave_balances')
      .select('*')
      .eq('employee_id', lReq.employee_id)
      .eq('leave_type_id', lReq.leave_type_id)
      .eq('year', yr)
      .single();

    if (bal) {
      await supabaseAdmin
        .from('leave_balances')
        .update({ pending_days: Math.max(0, parseFloat(bal.pending_days || 0) - days) })
        .eq('id', bal.id);
    }

    res.status(200).json({ success: true, message: 'Leave request rejected.', data: rejected });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject leave request.' });
  }
};

// ==============================================================================
// 6. HOLIDAYS MANAGEMENT
// ==============================================================================

exports.getHolidays = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const { data, error } = await supabaseAdmin
      .from('holidays')
      .select('*')
      .gte('holiday_date', `${year}-01-01`)
      .lte('holiday_date', `${year}-12-31`)
      .order('holiday_date', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch holiday calendar.' });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const { name, holiday_date, description } = req.body;
    if (!name || !holiday_date) {
      return res.status(400).json({ success: false, message: 'Holiday Name and Date are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('holidays')
      .insert({ name: name.trim(), holiday_date, description })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to add holiday.' });
  }
};

// ==============================================================================
// 7. EMPLOYEE SELF-SERVICE ("MY HR")
// ==============================================================================

exports.getMyProfile = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'No linked Employee record found for your user login.' });
    }

    const yr = new Date().getFullYear();
    const [balances, recentAttendance] = await Promise.all([
      supabaseAdmin.from('leave_balances').select('*, leave_type:leave_types(*)').eq('employee_id', emp.id).eq('year', yr),
      supabaseAdmin.from('attendance_records').select('*').eq('employee_id', emp.id).order('attendance_date', { ascending: false }).limit(7)
    ]);

    res.status(200).json({
      success: true,
      data: {
        employee: emp,
        leaveBalances: balances.data || [],
        recentAttendance: recentAttendance.data || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve employee profile.' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee profile not found.' });

    const { data, error } = await supabaseAdmin
      .from('attendance_records')
      .select('*, shift:shifts(name, start_time, end_time)')
      .eq('employee_id', emp.id)
      .order('attendance_date', { ascending: false })
      .limit(60);

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch personal attendance history.' });
  }
};

exports.getMyLeave = async (req, res) => {
  try {
    const emp = await getEmployeeForUser(req.user);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee profile not found.' });

    const yr = new Date().getFullYear();
    const [balances, requests] = await Promise.all([
      supabaseAdmin.from('leave_balances').select('*, leave_type:leave_types(*)').eq('employee_id', emp.id).eq('year', yr),
      supabaseAdmin.from('leave_requests').select('*, leave_type:leave_types(*), approver:employees!approver_id(first_name, last_name)').eq('employee_id', emp.id).order('created_at', { ascending: false })
    ]);

    res.status(200).json({
      success: true,
      data: {
        balances: balances.data || [],
        requests: requests.data || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch personal leave data.' });
  }
};
