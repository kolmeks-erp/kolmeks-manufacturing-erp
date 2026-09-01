const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const employeeController = require('../controllers/employee.controller');

// Enforce Authentication and HR/Admin Authorization across all Employee endpoints
router.use(authenticateUser);
router.use(authorizeRoles('admin', 'hr'));

// Departments
router.get('/departments', employeeController.getDepartments);
router.post('/departments', employeeController.createDepartment);
router.patch('/departments/:id', employeeController.updateDepartment);

// Organization Hierarchy & Reports
router.get('/organization', employeeController.getOrganizationStructure);
router.get('/reports', employeeController.getHRReports);

// Employees Master
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.patch('/:id', employeeController.updateEmployee);
router.patch('/:id/status', employeeController.patchEmployeeStatus);

// Employee Lifecycle Operations
router.post('/:id/transfer', employeeController.transferEmployee);
router.post('/:id/promote', employeeController.promoteEmployee);
router.post('/:id/confirm', employeeController.confirmEmployee);
router.post('/:id/resign', employeeController.resignEmployee);
router.post('/:id/terminate', employeeController.terminateEmployee);

// Employee Relational Details
router.post('/:id/skills', employeeController.addEmployeeSkill);
router.post('/:id/qualifications', employeeController.addEmployeeQualification);
router.post('/:id/certifications', employeeController.addEmployeeCertification);
router.post('/:id/notes', employeeController.addEmployeeHRNote);
router.post('/:id/documents', employeeController.addEmployeeDocument);

module.exports = router;
