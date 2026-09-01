const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const payrollController = require('../controllers/payroll.controller');

// Enforce authentication across all Payroll endpoints
router.use(authenticateUser);

const payrollAuth = authorizeRoles('admin', 'hr', 'payroll', 'finance');

// Dashboard Telemetry
router.get('/dashboard/kpis', payrollAuth, payrollController.getPayrollDashboardKPIs);

// Employee Compensation Management
router.get('/compensations', payrollAuth, payrollController.getEmployeeCompensations);
router.post('/compensations/:employee_id', payrollAuth, payrollController.updateEmployeeCompensation);

// Payroll Periods
router.get('/periods', payrollAuth, payrollController.getPayrollPeriods);
router.post('/periods', payrollAuth, payrollController.createPayrollPeriod);
router.patch('/periods/:id/status', payrollAuth, payrollController.updatePayrollPeriodStatus);

// Payroll Runs & Engine
router.get('/runs', payrollAuth, payrollController.getPayrollRuns);
router.post('/runs', payrollAuth, payrollController.createPayrollRun);
router.get('/runs/:id', payrollAuth, payrollController.getPayrollRunById);
router.post('/runs/:id/calculate', payrollAuth, payrollController.calculatePayrollRun);
router.post('/runs/:id/approve', payrollAuth, payrollController.approvePayrollRun);
router.post('/runs/:id/post', payrollAuth, payrollController.postPayrollRun);

// Payslips (Self-Service + Admin View)
router.get('/payslips', payrollController.getPayslips);
router.get('/payslips/:id', payrollController.getPayslipById);

// Reports
router.get('/reports', payrollAuth, payrollController.getPayrollReports);

module.exports = router;
