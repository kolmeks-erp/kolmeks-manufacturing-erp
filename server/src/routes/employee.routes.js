const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const employeeController = require('../controllers/employee.controller');

// Enforce Authentication and HR/Admin Authorization across all Employee endpoints
router.use(authenticateUser);
router.use(authorizeRoles('admin', 'hr'));

/**
 * GET /api/employees/departments
 * Fetch departments list
 */
router.get('/departments', employeeController.getDepartments);

/**
 * GET /api/employees
 * List employees with search, filter, sort, pagination
 */
router.get('/', employeeController.getEmployees);

/**
 * GET /api/employees/:id
 * Fetch single employee profile
 */
router.get('/:id', employeeController.getEmployeeById);

/**
 * POST /api/employees
 * Create new employee
 */
router.post('/', employeeController.createEmployee);

/**
 * PATCH /api/employees/:id
 * Update employee record
 */
router.patch('/:id', employeeController.updateEmployee);

/**
 * PATCH /api/employees/:id/status
 * Activate / Deactivate / Change status
 */
router.patch('/:id/status', employeeController.patchEmployeeStatus);

module.exports = router;
