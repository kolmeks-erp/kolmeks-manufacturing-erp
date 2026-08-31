const express = require('express');
const router = express.Router();
const costingController = require('../controllers/costing.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All routes protected by JWT auth
router.use(authenticateJWT);

const allowedCostingRoles = [
  'admin',
  'cost_accountant',
  'finance_manager',
  'production_manager',
  'warehouse_manager',
  'executive',
  'accountant',
  'finance',
];

/**
 * DASHBOARD & ORDERS
 */
router.get('/dashboard', authorizeRoles(...allowedCostingRoles), costingController.getCostingDashboard);
router.get('/orders', authorizeRoles(...allowedCostingRoles), costingController.getProductionCostOrders);
router.get('/orders/:id', authorizeRoles(...allowedCostingRoles), costingController.getProductionCostOrderById);
router.post('/orders/:id/calculate', authorizeRoles(...allowedCostingRoles), costingController.calculateProductionCost);
router.post('/orders/:id/post', authorizeRoles('admin', 'cost_accountant', 'finance_manager', 'accountant'), costingController.postProductionCost);

/**
 * WIP
 */
router.get('/wip', authorizeRoles(...allowedCostingRoles), costingController.getWIPRecords);
router.post('/wip/:id/close', authorizeRoles('admin', 'cost_accountant', 'production_manager', 'finance_manager'), costingController.closeWIPRecord);

/**
 * VARIANCE, CONFIGURATION & REPORTS
 */
router.get('/variance', authorizeRoles(...allowedCostingRoles), costingController.getManufacturingVariances);
router.get('/configuration', authorizeRoles(...allowedCostingRoles), costingController.getCostingConfiguration);
router.patch('/configuration', authorizeRoles('admin', 'cost_accountant', 'finance_manager'), costingController.updateCostingConfiguration);
router.get('/reports', authorizeRoles(...allowedCostingRoles), costingController.getCostingReports);

module.exports = router;
