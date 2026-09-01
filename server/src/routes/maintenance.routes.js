const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const maintenanceController = require('../controllers/maintenance.controller');

const MAINTENANCE_ROLES = [
  'admin',
  'maintenance_manager',
  'maintenance_technician',
  'production_manager',
  'quality_manager',
  'executive',
  'management',
  'warehouse_manager'
];

router.use(authenticateUser);
router.use(authorizeRoles(...MAINTENANCE_ROLES));

// 1. Dashboard KPIs
router.get('/dashboard/kpis', maintenanceController.getDashboardKPIs);

// 2. Assets
router.get('/assets', maintenanceController.getAssets);
router.get('/assets/:id', maintenanceController.getAssetById);
router.post('/assets', maintenanceController.createAsset);
router.patch('/assets/:id', maintenanceController.updateAsset);

// 3. Maintenance Schedules
router.get('/schedules', maintenanceController.getMaintenanceSchedules);
router.get('/schedules/:id', maintenanceController.getMaintenanceScheduleById);
router.post('/schedules', maintenanceController.createMaintenanceSchedule);
router.patch('/schedules/:id', maintenanceController.updateMaintenanceSchedule);

// 4. Maintenance Requests
router.get('/requests', maintenanceController.getMaintenanceRequests);
router.post('/requests', maintenanceController.createMaintenanceRequest);
router.post('/requests/:id/convert', maintenanceController.convertRequestToWorkOrder);

// 5. Work Orders
router.get('/work-orders', maintenanceController.getWorkOrders);
router.get('/work-orders/:id', maintenanceController.getWorkOrderById);
router.post('/work-orders', maintenanceController.createWorkOrder);
router.post('/work-orders/:id/start', maintenanceController.startWorkOrder);
router.post('/work-orders/:id/complete', maintenanceController.completeWorkOrder);

// 6. Spare Parts Consumption
router.post('/work-orders/:id/parts', maintenanceController.addWorkOrderPart);

// 7. Checklists
router.patch('/checklists/:id', maintenanceController.updateChecklistItem);

// 8. Downtime Logs
router.get('/downtime', maintenanceController.getDowntimeLogs);
router.post('/downtime', maintenanceController.createDowntimeLog);
router.post('/downtime/:id/close', maintenanceController.closeDowntimeLog);

// 9. History
router.get('/history', maintenanceController.getMaintenanceHistory);

// 10. Breakdowns
router.get('/breakdowns', maintenanceController.getBreakdowns);
router.get('/breakdowns/:id', maintenanceController.getBreakdownById);
router.post('/breakdowns', maintenanceController.createBreakdown);
router.post('/breakdowns/:id/convert', maintenanceController.convertBreakdownToWorkOrder);

// 11. Reliability Analytics (MTBF, MTTR, Availability)
router.get('/reliability', maintenanceController.getReliabilityAnalytics);

// 12. Maintenance Costs
router.get('/costs', maintenanceController.getMaintenanceCosts);

// 13. Calendar
router.get('/calendar', maintenanceController.getMaintenanceCalendar);

// 14. Reports
router.get('/reports', maintenanceController.getMaintenanceReports);

module.exports = router;
