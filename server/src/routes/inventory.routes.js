const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

const AUTHORIZED_ROLES = [
  'admin',
  'warehouse_manager',
  'purchase_manager',
  'inventory_manager',
  'production_manager',
  'quality_manager',
  'sales_manager',
  'executive',
];

router.use(authenticateUser);

// Summary & Telemetry
router.get('/summary', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventorySummary);
router.get('/atp', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getAvailableToPromise);
router.get('/valuation', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventoryValuation);

// Audit Movements Log
router.get('/movements', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getStockMovements);

// Stock Transfers
router.get('/transfers', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getStockTransfers);
router.post('/transfers', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), inventoryController.createStockTransfer);

// Stock Adjustments
router.get('/adjustments', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getStockAdjustments);
router.post('/adjustments', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), inventoryController.createStockAdjustment);
router.post('/adjustments/create', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), inventoryController.createStockAdjustmentRequest);

// Stock Reservations
router.get('/reservations', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getStockReservations);
router.post('/reservations', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager', 'sales_manager', 'production_manager'), inventoryController.createStockReservation);
router.post('/reservations/:id/release', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager', 'sales_manager', 'production_manager'), inventoryController.releaseStockReservation);

// Batch & Lot Tracking
router.get('/batches', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getBatches);
router.post('/batches', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager', 'quality_manager'), inventoryController.createBatch);

// Serial Numbers
router.get('/serial-numbers', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getSerialNumbers);
router.post('/serial-numbers', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager', 'quality_manager'), inventoryController.createSerialNumber);

// Reorder & Replenishment
router.get('/reorder', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getReorderDashboard);
router.post('/reorder', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager', 'purchase_manager'), inventoryController.upsertReorderLevel);

// Stock Balances
router.get('/', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventory);
router.get('/:productId', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventoryByProduct);

module.exports = router;
