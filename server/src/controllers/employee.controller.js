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
 */
exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const departmentId = req.query.department_id || '';
    const designationId = req.query.designation_id || '';
    const managerId = req.query.manager_id || '';
    const employmentType = req.query.employment_type || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'joining_date';
    const sortOrder = req.query.sortOrder === 'asc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('employees')
      .select(`
        *,
        department:departments!employees_department_id_fkey(id, code, name),
        designation_rel:designations(id, code, name),
        manager:employees!manager_id(id, employee_code, first_name, last_name, email)
      `, { count: 'exact' });

    if (departmentId) query = query.eq('department_id', departmentId);
    if (designationId) query = query.eq('designation_id', designationId);
    if (managerId) query = query.eq('manager_id', managerId);
    if (employmentType) query = query.eq('employment_type', employmentType);
    if (status) query = query.eq('status', status);

    if (search) {
      query = query.or(
        `employee_code.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,designation.ilike.%${search}%`
      );
    }

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
 * Fetch all departments with optional manager details
 */
exports.getDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('*, manager:employees!manager_id(id, employee_code, first_name, last_name)')
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
 * POST /api/employees/departments
 */
exports.createDepartment = async (req, res) => {
  try {
    const { code, name, description, manager_id, parent_department_id, status = 'active' } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, error: { message: 'Department code and name are required.' } });
    }

    const { data, error } = await supabaseAdmin
      .from('departments')
      .insert({
        code: code.toUpperCase().trim(),
        name: name.trim(),
        description: description ? description.trim() : null,
        manager_id: manager_id || null,
        parent_department_id: parent_department_id || null,
        status
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to create department.' } });
  }
};

/**
 * PATCH /api/employees/departments/:id
 */
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, manager_id, parent_department_id, status } = req.body;

    const updatePayload = {
      ...(code && { code: code.toUpperCase().trim() }),
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description ? description.trim() : null }),
      ...(manager_id !== undefined && { manager_id: manager_id || null }),
      ...(parent_department_id !== undefined && { parent_department_id: parent_department_id || null }),
      ...(status && { status })
    };

    const { data, error } = await supabaseAdmin
      .from('departments')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to update department.' } });
  }
};

/**
 * GET /api/employees/organization
 * Build full hierarchy tree for plant organization
 */
exports.getOrganizationStructure = async (req, res) => {
  try {
    const [depts, emps] = await Promise.all([
      supabaseAdmin.from('departments').select('*, manager:employees!manager_id(id, first_name, last_name, designation)').eq('status', 'active'),
      supabaseAdmin.from('employees').select('id, employee_code, first_name, last_name, designation, department_id, manager_id, status').neq('status', 'TERMINATED')
    ]);

    const departments = depts.data || [];
    const employees = emps.data || [];

    const tree = departments.map(d => {
      const deptEmployees = employees.filter(e => e.department_id === d.id);
      return {
        ...d,
        employeeCount: deptEmployees.length,
        employees: deptEmployees
      };
    });

    res.status(200).json({
      success: true,
      data: {
        company: 'Kolmeks Manufacturing Oy',
        totalDepartments: departments.length,
        totalEmployees: employees.length,
        structure: tree
      }
    });
  } catch (err) {
    console.error('Error fetching org structure:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to build organization structure.' } });
  }
};

/**
 * GET /api/employees/:id
 * Fetch complete single employee profile with relational metadata
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [empRes, skillsRes, qualRes, certRes, historyRes, docsRes, notesRes, assetsRes] = await Promise.all([
      supabaseAdmin
        .from('employees')
        .select(`
          *,
          department:departments!employees_department_id_fkey(id, code, name, description),
          designation_rel:designations(id, code, name),
          manager:employees!manager_id(id, employee_code, first_name, last_name, email),
          cost_center:cost_centers(id, code, name)
        `)
        .eq('id', id)
        .single(),
      supabaseAdmin.from('employee_skills').select('*').eq('employee_id', id).order('skill_name'),
      supabaseAdmin.from('employee_qualifications').select('*').eq('employee_id', id).order('year_completed', { ascending: false }),
      supabaseAdmin.from('employee_certifications').select('*').eq('employee_id', id).order('issue_date', { ascending: false }),
      supabaseAdmin.from('employee_history').select(`
        *,
        old_dept:departments!old_department_id(name),
        new_dept:departments!new_department_id(name),
        old_desig:designations!old_designation_id(name),
        new_desig:designations!new_designation_id(name)
      `).eq('employee_id', id).order('event_date', { ascending: false }),
      supabaseAdmin.from('employee_documents').select('*').eq('employee_id', id).order('uploaded_at', { ascending: false }),
      supabaseAdmin.from('employee_hr_notes').select('*, created_by_profile:profiles!created_by(full_name, email)').eq('employee_id', id).order('created_at', { ascending: false }),
      supabaseAdmin.from('fixed_assets').select('id, asset_code, name, category, status').eq('assigned_to_employee_id', id)
    ]);

    if (empRes.error || !empRes.data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Employee record not found.', code: 'NOT_FOUND' },
      });
    }

    const employee = empRes.data;

    res.status(200).json({
      success: true,
      data: {
        ...employee,
        skills: skillsRes.data || [],
        qualifications: qualRes.data || [],
        certifications: certRes.data || [],
        history: historyRes.data || [],
        documents: docsRes.data || [],
        notes: notesRes.data || [],
        assets: assetsRes.data || []
      },
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
 * Create a new employee record with server-side validation & history entry
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
      designation_id,
      manager_id,
      cost_center_id,
      location = 'Factory Plant 1',
      employment_type = 'FULL_TIME',
      joining_date,
      probation_start_date,
      probation_end_date,
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

    if (!first_name || !first_name.trim()) return res.status(400).json({ success: false, error: { message: 'First name is required.' } });
    if (!last_name || !last_name.trim()) return res.status(400).json({ success: false, error: { message: 'Last name is required.' } });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: { message: 'A valid email address is required.' } });
    if (!department_id) return res.status(400).json({ success: false, error: { message: 'Department selection is required.' } });

    // Check for duplicate email
    const { data: existingEmail } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: { message: 'An employee with this email address already exists.' },
      });
    }

    const newEmployeePayload = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      department_id,
      designation: designation ? designation.trim() : 'Staff Member',
      designation_id: designation_id || null,
      manager_id: manager_id || null,
      cost_center_id: cost_center_id || null,
      location: location.trim(),
      employment_type,
      joining_date: joining_date || new Date().toISOString().split('T')[0],
      probation_start_date: probation_start_date || null,
      probation_end_date: probation_end_date || null,
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
      status: status || 'ACTIVE',
      created_by: req.user ? req.user.id : null,
    };

    const { data: createdEmployee, error: insertError } = await supabaseAdmin
      .from('employees')
      .insert(newEmployeePayload)
      .select('*, department:departments!employees_department_id_fkey(id, code, name)')
      .single();

    if (insertError) {
      console.error('Error inserting employee:', insertError);
      return res.status(500).json({
        success: false,
        error: { message: insertError.message || 'Failed to create employee record.', code: 'DATABASE_ERROR' },
      });
    }

    // Log initial JOINING event into history
    await supabaseAdmin.from('employee_history').insert({
      employee_id: createdEmployee.id,
      event_type: 'JOINING',
      event_date: createdEmployee.joining_date,
      new_department_id: createdEmployee.department_id,
      new_designation_id: createdEmployee.designation_id,
      new_manager_id: createdEmployee.manager_id,
      new_location: createdEmployee.location,
      reason: 'New Employee Joined Organization',
      approved_by: req.user ? req.user.id : null
    });

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
 * General employee update
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateBody = req.body;

    const { data: existing, error: findError } = await supabaseAdmin
      .from('employees')
      .select('id, email, manager_id')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Employee record not found.', code: 'NOT_FOUND' },
      });
    }

    if (updateBody.manager_id && updateBody.manager_id === id) {
      return res.status(400).json({ success: false, error: { message: 'An employee cannot report to themselves.' } });
    }

    const { data: updatedEmployee, error: updateError } = await supabaseAdmin
      .from('employees')
      .update({
        ...updateBody,
        updated_by: req.user ? req.user.id : null
      })
      .eq('id', id)
      .select('*, department:departments!employees_department_id_fkey(id, code, name)')
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      data: updatedEmployee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to update employee record.' },
    });
  }
};

/**
 * POST /api/employees/:id/transfer
 * Transfer employee to new Department / Manager / Location / Cost Center
 */
exports.transferEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_department_id, new_manager_id, new_location, new_cost_center_id, effective_date, reason } = req.body;

    const { data: emp } = await supabaseAdmin.from('employees').select('*').eq('id', id).single();
    if (!emp) return res.status(404).json({ success: false, error: { message: 'Employee not found.' } });

    if (new_manager_id && new_manager_id === id) {
      return res.status(400).json({ success: false, error: { message: 'Employee cannot be their own manager.' } });
    }

    // Update employee
    const { data: updated } = await supabaseAdmin
      .from('employees')
      .update({
        ...(new_department_id && { department_id: new_department_id }),
        ...(new_manager_id !== undefined && { manager_id: new_manager_id }),
        ...(new_location && { location: new_location.trim() }),
        ...(new_cost_center_id !== undefined && { cost_center_id: new_cost_center_id }),
        updated_by: req.user ? req.user.id : null
      })
      .eq('id', id)
      .select()
      .single();

    // Log History
    await supabaseAdmin.from('employee_history').insert({
      employee_id: id,
      event_type: 'TRANSFER',
      event_date: effective_date || new Date().toISOString().split('T')[0],
      old_department_id: emp.department_id,
      new_department_id: new_department_id || emp.department_id,
      old_manager_id: emp.manager_id,
      new_manager_id: new_manager_id !== undefined ? new_manager_id : emp.manager_id,
      old_location: emp.location,
      new_location: new_location || emp.location,
      old_cost_center_id: emp.cost_center_id,
      new_cost_center_id: new_cost_center_id !== undefined ? new_cost_center_id : emp.cost_center_id,
      reason: reason || 'Departmental Transfer',
      approved_by: req.user ? req.user.id : null
    });

    res.status(200).json({ success: true, message: 'Employee transferred successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Transfer failed.' } });
  }
};

/**
 * POST /api/employees/:id/promote
 * Promote employee designation
 */
exports.promoteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_designation, new_designation_id, effective_date, reason } = req.body;

    const { data: emp } = await supabaseAdmin.from('employees').select('*').eq('id', id).single();
    if (!emp) return res.status(404).json({ success: false, error: { message: 'Employee not found.' } });

    const { data: updated } = await supabaseAdmin
      .from('employees')
      .update({
        designation: new_designation || emp.designation,
        designation_id: new_designation_id || emp.designation_id,
        updated_by: req.user ? req.user.id : null
      })
      .eq('id', id)
      .select()
      .single();

    // Log History
    await supabaseAdmin.from('employee_history').insert({
      employee_id: id,
      event_type: 'PROMOTION',
      event_date: effective_date || new Date().toISOString().split('T')[0],
      old_designation_id: emp.designation_id,
      new_designation_id: new_designation_id || emp.designation_id,
      reason: reason || 'Merit Promotion',
      approved_by: req.user ? req.user.id : null
    });

    res.status(200).json({ success: true, message: 'Employee promoted successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Promotion failed.' } });
  }
};

/**
 * POST /api/employees/:id/confirm
 */
exports.confirmEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation_date, remarks } = req.body;

    const { data: updated } = await supabaseAdmin
      .from('employees')
      .update({
        status: 'ACTIVE',
        confirmation_date: confirmation_date || new Date().toISOString().split('T')[0],
        confirmation_remarks: remarks || 'Confirmed after probation review',
        confirmed_by: req.user ? req.user.id : null
      })
      .eq('id', id)
      .select()
      .single();

    await supabaseAdmin.from('employee_history').insert({
      employee_id: id,
      event_type: 'CONFIRMATION',
      event_date: confirmation_date || new Date().toISOString().split('T')[0],
      reason: remarks || 'Employee Confirmed',
      approved_by: req.user ? req.user.id : null
    });

    res.status(200).json({ success: true, message: 'Employee confirmed successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Confirmation failed.' } });
  }
};

/**
 * POST /api/employees/:id/resign
 */
exports.resignEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { resignation_date, last_working_date, notice_period_days, reason } = req.body;

    const { data: updated } = await supabaseAdmin
      .from('employees')
      .update({
        status: 'NOTICE_PERIOD',
        resignation_date: resignation_date || new Date().toISOString().split('T')[0],
        last_working_date,
        notice_period_days: notice_period_days || 30,
        resignation_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    await supabaseAdmin.from('employee_history').insert({
      employee_id: id,
      event_type: 'RESIGNATION',
      event_date: resignation_date || new Date().toISOString().split('T')[0],
      reason: reason || 'Tendered Resignation',
      approved_by: req.user ? req.user.id : null
    });

    res.status(200).json({ success: true, message: 'Resignation recorded.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Resignation processing failed.' } });
  }
};

/**
 * POST /api/employees/:id/terminate
 */
exports.terminateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { termination_date, reason, remarks } = req.body;

    const { data: updated } = await supabaseAdmin
      .from('employees')
      .update({
        status: 'TERMINATED',
        termination_date: termination_date || new Date().toISOString().split('T')[0],
        termination_reason: reason,
        termination_remarks: remarks
      })
      .eq('id', id)
      .select()
      .single();

    await supabaseAdmin.from('employee_history').insert({
      employee_id: id,
      event_type: 'TERMINATION',
      event_date: termination_date || new Date().toISOString().split('T')[0],
      reason: reason || 'Employment Terminated',
      approved_by: req.user ? req.user.id : null
    });

    res.status(200).json({ success: true, message: 'Employee terminated.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Termination failed.' } });
  }
};

/**
 * SKILLS, QUALIFICATIONS, CERTIFICATIONS & NOTES APIs
 */
exports.addEmployeeSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_name, proficiency_level, years_of_experience, last_verified_date } = req.body;
    if (!skill_name) return res.status(400).json({ success: false, error: { message: 'Skill name is required.' } });

    const { data, error } = await supabaseAdmin
      .from('employee_skills')
      .insert({
        employee_id: id,
        skill_name: skill_name.trim(),
        proficiency_level: proficiency_level || 'INTERMEDIATE',
        years_of_experience: parseFloat(years_of_experience) || 0,
        last_verified_date: last_verified_date || null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to add skill.' } });
  }
};

exports.addEmployeeQualification = async (req, res) => {
  try {
    const { id } = req.params;
    const { qualification_title, institution, year_completed, specialization, status = 'COMPLETED' } = req.body;
    if (!qualification_title || !institution) {
      return res.status(400).json({ success: false, error: { message: 'Qualification Title and Institution are required.' } });
    }

    const { data, error } = await supabaseAdmin
      .from('employee_qualifications')
      .insert({
        employee_id: id,
        qualification_title: qualification_title.trim(),
        institution: institution.trim(),
        year_completed: parseInt(year_completed, 10) || null,
        specialization: specialization ? specialization.trim() : null,
        status
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to add qualification.' } });
  }
};

exports.addEmployeeCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { certification_name, issuing_organization, issue_date, expiry_date, status = 'VALID' } = req.body;
    if (!certification_name || !issuing_organization || !issue_date) {
      return res.status(400).json({ success: false, error: { message: 'Certification Name, Issuer, and Issue Date are required.' } });
    }

    const { data, error } = await supabaseAdmin
      .from('employee_certifications')
      .insert({
        employee_id: id,
        certification_name: certification_name.trim(),
        issuing_organization: issuing_organization.trim(),
        issue_date,
        expiry_date: expiry_date || null,
        status
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to add certification.' } });
  }
};

exports.addEmployeeHRNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ success: false, error: { message: 'Note text is required.' } });

    const { data, error } = await supabaseAdmin
      .from('employee_hr_notes')
      .insert({
        employee_id: id,
        note: note.trim(),
        created_by: req.user ? req.user.id : null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to add HR note.' } });
  }
};

exports.addEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type, document_name, file_url, notes, expiry_date } = req.body;
    if (!document_name || !file_url) {
      return res.status(400).json({ success: false, error: { message: 'Document name and file URL are required.' } });
    }

    let status = 'VALID';
    if (expiry_date) {
      const exp = new Date(expiry_date);
      const now = new Date();
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 0) status = 'EXPIRED';
      else if (diffDays <= 30) status = 'EXPIRING_SOON';
    }

    const { data, error } = await supabaseAdmin
      .from('employee_documents')
      .insert({
        employee_id: id,
        document_type: document_type || 'OTHER',
        document_name: document_name.trim(),
        file_url: file_url.trim(),
        notes: notes ? notes.trim() : null,
        expiry_date: expiry_date || null,
        status,
        uploaded_by: req.user ? req.user.id : null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to add document.' } });
  }
};

/**
 * GET /api/hr/reports
 * Comprehensive HR analytical reports
 */
exports.getHRReports = async (req, res) => {
  try {
    const [empRes, deptRes, certRes, docRes] = await Promise.all([
      supabaseAdmin.from('employees').select('id, employee_code, first_name, last_name, department_id, joining_date, status, employment_type'),
      supabaseAdmin.from('departments').select('id, code, name'),
      supabaseAdmin.from('employee_certifications').select('*, employee:employees(id, employee_code, first_name, last_name)'),
      supabaseAdmin.from('employee_documents').select('*, employee:employees(id, employee_code, first_name, last_name)')
    ]);

    const employees = empRes.data || [];
    const departments = deptRes.data || [];
    const certifications = certRes.data || [];
    const documents = docRes.data || [];

    // Department Breakdown
    const departmentBreakdown = departments.map(d => {
      const deptEmps = employees.filter(e => e.department_id === d.id);
      return {
        id: d.id,
        code: d.code,
        name: d.name,
        total: deptEmps.length,
        active: deptEmps.filter(e => e.status === 'ACTIVE').length,
        probation: deptEmps.filter(e => e.status === 'PROBATION').length,
        onLeave: deptEmps.filter(e => e.status === 'ON_LEAVE').length
      };
    });

    // Tenure Breakdown
    const now = new Date();
    const tenureBreakdown = {
      under1Year: employees.filter(e => (now.getTime() - new Date(e.joining_date).getTime()) / (1000 * 3600 * 24 * 365) < 1).length,
      between1And3Years: employees.filter(e => {
        const yrs = (now.getTime() - new Date(e.joining_date).getTime()) / (1000 * 3600 * 24 * 365);
        return yrs >= 1 && yrs < 3;
      }).length,
      above3Years: employees.filter(e => (now.getTime() - new Date(e.joining_date).getTime()) / (1000 * 3600 * 24 * 365) >= 3).length
    };

    // Document & Certification Expiries
    const expiringCertifications = certifications.filter(c => c.expiry_date && new Date(c.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const expiringDocuments = documents.filter(d => d.expiry_date && new Date(d.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: employees.length,
        departmentBreakdown,
        tenureBreakdown,
        expiringCertifications,
        expiringDocuments
      }
    });
  } catch (err) {
    console.error('Error generating HR reports:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to generate HR reports.' } });
  }
};

/**
 * PATCH /api/employees/:id/status
 */
exports.patchEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: { message: 'Status is required.' } });
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
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating employee status.' },
    });
  }
};
