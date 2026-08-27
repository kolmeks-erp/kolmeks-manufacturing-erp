const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/auth.middleware');

const AUTHORIZED_ROLES = [
  'admin',
  'warehouse_manager',
  'purchase_manager',
  'inventory_manager',
  'production_manager',
  'executive',
];

router.use(authenticateUser);

router.get('/summary', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventorySummary);
router.get('/movements', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getStockMovements);
router.post('/adjustments', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), inventoryController.createStockAdjustment);
router.post('/transfers', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), inventoryController.createStockTransfer);
router.get('/', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventory);
router.get('/:productId', authorizeRoles(...AUTHORIZED_ROLES), inventoryController.getInventoryByProduct);

module.exports = router;
