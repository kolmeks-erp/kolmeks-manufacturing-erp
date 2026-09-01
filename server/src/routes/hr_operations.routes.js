const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const hrController = require('../controllers/hr_operations.controller');

// Enforce authentication across all HR endpoints
router.use(authenticateUser);

// ==============================================================================
// 1. EMPLOYEE SELF-SERVICE ("MY HR") — ACCESSIBLE BY ALL AUTHENTICATED STAFF
// ==============================================================================

router.get('/me/profile', hrController.getMyProfile);
router.get('/me/attendance', hrController.getMyAttendance);
router.get('/me/leave', hrController.getMyLeave);

router.post('/attendance/check-in', hrController.checkIn);
router.post('/attendance/check-out', hrController.checkOut);
router.post('/attendance/correction-request', hrController.requestAttendanceCorrection);

router.post('/leave/requests', hrController.createLeaveRequest);

// ==============================================================================
// 2. HR MANAGEMENT & OPERATIONS — RESTRICTED TO ADMIN & HR ROLES
// ==============================================================================

const hrAuth = authorizeRoles('admin', 'hr');

// Dashboard Telemetry
router.get('/dashboard/kpis', hrAuth, hrController.getHRDashboardKPIs);

// Designations
router.get('/designations', hrAuth, hrController.getDesignations);
router.post('/designations', hrAuth, hrController.createDesignation);

// Shifts
router.get('/shifts', hrAuth, hrController.getShifts);
router.post('/shifts', hrAuth, hrController.createShift);
router.post('/shifts/assign', hrAuth, hrController.assignEmployeeShift);

// Attendance Management
router.get('/attendance', hrAuth, hrController.getAttendanceRecords);

// Leave Management
router.get('/leave/types', hrAuth, hrController.getLeaveTypes);
router.post('/leave/types', hrAuth, hrController.createLeaveType);
router.get('/leave/balances', hrAuth, hrController.getLeaveBalances);
router.post('/leave/balances/allocate', hrAuth, hrController.allocateLeaveBalance);
router.get('/leave/requests', hrAuth, hrController.getLeaveRequests);
router.post('/leave/requests/:id/approve', hrAuth, hrController.approveLeaveRequest);
router.post('/leave/requests/:id/reject', hrAuth, hrController.rejectLeaveRequest);

// Overtime Management
router.get('/overtime', hrAuth, hrController.getOvertimeRecords);
router.post('/overtime', hrController.createOvertimeRequest);
router.post('/overtime/:id/approve', hrAuth, hrController.approveOvertimeRequest);
router.post('/overtime/:id/reject', hrAuth, hrController.rejectOvertimeRequest);

// Working Calendar Settings
router.get('/calendar-settings', hrController.getWorkingCalendarSettings);
router.post('/calendar-settings', hrAuth, hrController.updateWorkingCalendarSettings);

// Holidays
router.get('/holidays', hrController.getHolidays); // Open for view by all staff, edit by HR
router.post('/holidays', hrAuth, hrController.createHoliday);

module.exports = router;
