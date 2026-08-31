const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planning.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All routes require JWT authentication
router.use(authenticateJWT);

const allowedPlanningRoles = [
  'admin',
  'production_planner',
  'production_manager',
  'production_supervisor',
  'warehouse_manager',
  'maintenance_manager',
  'executive',
  'quality_manager',
];

/**
 * DASHBOARD & REPORTS
 */
router.get('/dashboard', authorizeRoles(...allowedPlanningRoles), planningController.getPlanningDashboard);
router.get('/reports', authorizeRoles(...allowedPlanningRoles), planningController.getPlanningReports);

/**
 * PRODUCTION PLANS
 */
router.get('/plans', authorizeRoles(...allowedPlanningRoles), planningController.getProductionPlans);
router.post('/plans', authorizeRoles('admin', 'production_planner', 'production_manager'), planningController.createProductionPlan);
router.get('/plans/:id', authorizeRoles(...allowedPlanningRoles), planningController.getProductionPlanById);
router.patch('/plans/:id', authorizeRoles('admin', 'production_planner', 'production_manager'), planningController.updateProductionPlan);
router.post('/plans/:id/submit', authorizeRoles('admin', 'production_planner', 'production_manager'), planningController.submitProductionPlan);
router.post('/plans/:id/approve', authorizeRoles('admin', 'production_manager', 'executive'), planningController.approveProductionPlan);
router.post('/plans/:id/cancel', authorizeRoles('admin', 'production_manager'), planningController.cancelProductionPlan);
router.post('/plans/:id/generate-orders', authorizeRoles('admin', 'production_planner', 'production_manager'), planningController.generateProductionOrdersFromPlan);

/**
 * MATERIAL REQUIREMENTS (MRP) & CAPACITY PLANNING
 */
router.get('/materials', authorizeRoles(...allowedPlanningRoles), planningController.calculateMaterialRequirements);
router.get('/capacity', authorizeRoles(...allowedPlanningRoles), planningController.calculateCapacityPlanning);

/**
 * WORK ORDER SCHEDULING & CALENDAR
 */
router.get('/schedule', authorizeRoles(...allowedPlanningRoles), planningController.getSchedules);
router.post('/schedule', authorizeRoles('admin', 'production_planner', 'production_manager', 'production_supervisor'), planningController.createSchedule);
router.post('/schedule/:id/reschedule', authorizeRoles('admin', 'production_planner', 'production_manager', 'production_supervisor'), planningController.rescheduleWorkOrder);
router.get('/calendar', authorizeRoles(...allowedPlanningRoles), planningController.getCalendarEvents);

module.exports = router;
