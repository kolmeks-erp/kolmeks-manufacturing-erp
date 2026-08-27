const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper: Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * GET /api/employees
 * List employees with search, filtering, sorting, and pagination
 * Restricted to authenticated staff (Admin / HR)
 */
exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const departmentId = req.query.department_id || '';
    const employmentType = req.query.employment_type || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'joining_date';
    const sortOrder = req.query.sortOrder === 'asc' ? true : false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('employees')
      .select('*, department:departments(id, code, name)', { count: 'exact' });

    // Apply Department filter
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    // Apply Employment Type filter
    if (employmentType) {
      query = query.eq('employment_type', employmentType);
    }

    // Apply Status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply Search filter (employee_code, first_name, last_name, email, designation)
    if (search) {
      query = query.or(
        `employee_code.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,designation.ilike.%${search}%`
      );
    }

    // Apply Sorting
    query = query.order(sortBy, { ascending: sortOrder }).range(from, to);

    const { data: employees, count, error } = await query;

    if (error) {
      console.error('Database error in getEmployees:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to retrieve employee records.', code: 'DATABASE_ERROR' },
      });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    res.status(200).json({
      success: true,
      data: employees || [],
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Unhandled error in getEmployees:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching employees.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * GET /api/employees/departments
 * Fetch all active departments for dropdown selection
 */
exports.getDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('id, code, name, description, status')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch departments list.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(200).json({
      success: true,
      data: departments || [],
    });
  } catch (err) {
    console.error('Unhandled error in getDepartments:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error fetching departments.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * GET /api/employees/:id
 * Fetch detailed employee record by ID
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(id, code, name, description)')
      .eq('id', id)
      .single();

    if (error || !employee) {
      return res.status(404).json({
        success: false,
        error: { message: 'Employee record not found.', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    console.error('Unhandled error in getEmployeeById:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error fetching employee profile.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * POST /api/employees
 * Create a new employee record with server-side validation
 */
exports.createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      department_id,
      designation,
      employment_type,
      joining_date,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      relationship,
      status = 'ACTIVE',
    } = req.body;

    // Server-side validations
    if (!first_name || !first_name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'First name is required.' } });
    }
    if (!last_name || !last_name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Last name is required.' } });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: { message: 'A valid email address is required.' } });
    }
    if (!department_id) {
      return res.status(400).json({ success: false, error: { message: 'Department selection is required.' } });
    }
    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Job designation is required.' } });
    }
    if (!employment_type || !['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY'].includes(employment_type)) {
      return res.status(400).json({ success: false, error: { message: 'Valid employment type is required.' } });
    }
    if (!joining_date) {
      return res.status(400).json({ success: false, error: { message: 'Joining date is required.' } });
    }

    // Check for duplicate email
    const { data: existingEmail } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: { message: 'An employee with this email address already exists.' },
      });
    }

    // Insert new employee
    const newEmployeePayload = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      department_id,
      designation: designation.trim(),
      employment_type,
      joining_date,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      address: address ? address.trim() : null,
      city: city ? city.trim() : null,
      state: state ? state.trim() : null,
      country: country ? country.trim() : 'Finland',
      postal_code: postal_code ? postal_code.trim() : null,
      emergency_contact_name: emergency_contact_name ? emergency_contact_name.trim() : null,
      emergency_contact_phone: emergency_contact_phone ? emergency_contact_phone.trim() : null,
      relationship: relationship ? relationship.trim() : null,
      status: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'].includes(status) ? status : 'ACTIVE',
      created_by: req.user ? req.user.id : null,
    };

    const { data: createdEmployee, error: insertError } = await supabaseAdmin
      .from('employees')
      .insert(newEmployeePayload)
      .select('*, department:departments(id, code, name)')
      .single();

    if (insertError) {
      console.error('Error inserting employee:', insertError);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to create employee record.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      data: createdEmployee,
    });
  } catch (err) {
    console.error('Unhandled error in createEmployee:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error creating employee.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * PATCH /api/employees/:id
 * Update existing employee information
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      department_id,
      designation,
      employment_type,
      joining_date,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      relationship,
      status,
    } = req.body;

    // Check employee exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from('employees')
      .select('id, email')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Employee record not found.', code: 'NOT_FOUND' },
      });
    }

    // Check email uniqueness if email changed
    if (email && email.trim().toLowerCase() !== existing.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, error: { message: 'Valid email address is required.' } });
      }
      const { data: emailConflict } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .neq('id', id)
        .single();

      if (emailConflict) {
        return res.status(400).json({
          success: false,
          error: { message: 'Another employee is already registered with this email.' },
        });
      }
    }

    const updatePayload = {
      ...(first_name && { first_name: first_name.trim() }),
      ...(last_name && { last_name: last_name.trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      ...(department_id && { department_id }),
      ...(designation && { designation: designation.trim() }),
      ...(employment_type && { employment_type }),
      ...(joining_date && { joining_date }),
      ...(date_of_birth !== undefined && { date_of_birth: date_of_birth || null }),
      ...(gender !== undefined && { gender: gender || null }),
      ...(address !== undefined && { address: address ? address.trim() : null }),
      ...(city !== undefined && { city: city ? city.trim() : null }),
      ...(state !== undefined && { state: state ? state.trim() : null }),
      ...(country !== undefined && { country: country ? country.trim() : 'Finland' }),
      ...(postal_code !== undefined && { postal_code: postal_code ? postal_code.trim() : null }),
      ...(emergency_contact_name !== undefined && { emergency_contact_name: emergency_contact_name ? emergency_contact_name.trim() : null }),
      ...(emergency_contact_phone !== undefined && { emergency_contact_phone: emergency_contact_phone ? emergency_contact_phone.trim() : null }),
      ...(relationship !== undefined && { relationship: relationship ? relationship.trim() : null }),
      ...(status && ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'].includes(status) && { status }),
      updated_by: req.user ? req.user.id : null,
    };

    const { data: updatedEmployee, error: updateError } = await supabaseAdmin
      .from('employees')
      .update(updatePayload)
      .eq('id', id)
      .select('*, department:departments(id, code, name)')
      .single();

    if (updateError) {
      console.error('Error updating employee:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to update employee record.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      data: updatedEmployee,
    });
  } catch (err) {
    console.error('Unhandled error in updateEmployee:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating employee.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * PATCH /api/employees/:id/status
 * Activate / Deactivate / Change employee status
 */
exports.patchEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid status value (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED) is required.' },
      });
    }

    const { data: updatedEmployee, error } = await supabaseAdmin
      .from('employees')
      .update({ status, updated_by: req.user ? req.user.id : null })
      .eq('id', id)
      .select('id, employee_code, first_name, last_name, status')
      .single();

    if (error || !updatedEmployee) {
      return res.status(404).json({
        success: false,
        error: { message: 'Employee record not found or status update failed.', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: `Employee status updated to ${status}.`,
      data: updatedEmployee,
    });
  } catch (err) {
    console.error('Unhandled error in patchEmployeeStatus:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating employee status.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};
