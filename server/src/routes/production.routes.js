const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

const AUTHORIZED_ROLES = [
  'admin',
  'production_manager',
  'warehouse_manager',
  'purchase_manager',
  'quality_manager',
  'executive',
];

router.use(authenticateUser);

// Summary Telemetry
router.get('/summary', authorizeRoles(...AUTHORIZED_ROLES), productionController.getProductionSummary);

// Work Centers
router.get('/work-centers', authorizeRoles(...AUTHORIZED_ROLES), productionController.getWorkCenters);
router.post('/work-centers', authorizeRoles('admin', 'production_manager'), productionController.createWorkCenter);
router.patch('/work-centers/:id', authorizeRoles('admin', 'production_manager'), productionController.updateWorkCenter);
router.patch('/work-centers/:id/status', authorizeRoles('admin', 'production_manager'), productionController.toggleWorkCenterStatus);

// Machines
router.get('/machines', authorizeRoles(...AUTHORIZED_ROLES), productionController.getMachines);
router.post('/machines', authorizeRoles('admin', 'production_manager'), productionController.createMachine);
router.patch('/machines/:id', authorizeRoles('admin', 'production_manager'), productionController.updateMachine);
router.patch('/machines/:id/status', authorizeRoles('admin', 'production_manager'), productionController.updateMachineStatus);

// BOMs
router.get('/boms', authorizeRoles(...AUTHORIZED_ROLES), productionController.getBOMs);
router.get('/boms/:id', authorizeRoles(...AUTHORIZED_ROLES), productionController.getBOMById);
router.post('/boms', authorizeRoles('admin', 'production_manager'), productionController.createBOM);
router.post('/boms/:id/activate', authorizeRoles('admin', 'production_manager'), productionController.activateBOM);

// Routings
router.get('/routings', authorizeRoles(...AUTHORIZED_ROLES), productionController.getRoutings);
router.get('/routings/:id', authorizeRoles(...AUTHORIZED_ROLES), productionController.getRoutingById);
router.post('/routings', authorizeRoles('admin', 'production_manager'), productionController.createRouting);

// Production Orders
router.get('/orders', authorizeRoles(...AUTHORIZED_ROLES), productionController.getProductionOrders);
router.get('/orders/:id', authorizeRoles(...AUTHORIZED_ROLES), productionController.getProductionOrderById);
router.post('/orders', authorizeRoles('admin', 'production_manager'), productionController.createProductionOrder);
router.patch('/orders/:id/status', authorizeRoles('admin', 'production_manager'), productionController.updateProductionOrderStatus);
router.patch('/operations/:operationId/status', authorizeRoles('admin', 'production_manager', 'warehouse_manager'), productionController.updateOperationStatus);

// Material Consumption & Output Posting
router.post('/orders/:id/material-consumption', authorizeRoles('admin', 'production_manager', 'warehouse_manager'), productionController.recordMaterialConsumption);
router.post('/orders/:id/output', authorizeRoles('admin', 'production_manager', 'warehouse_manager'), productionController.recordProductionOutput);

module.exports = router;
