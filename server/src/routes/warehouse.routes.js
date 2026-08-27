const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

const AUTHORIZED_ROLES = [
  'admin',
  'warehouse_manager',
  'purchase_manager',
  'inventory_manager',
  'production_manager',
  'executive',
];

router.use(authenticateUser);

router.get('/', authorizeRoles(...AUTHORIZED_ROLES), warehouseController.getWarehouses);
router.get('/:id', authorizeRoles(...AUTHORIZED_ROLES), warehouseController.getWarehouseById);
router.post('/', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), warehouseController.createWarehouse);
router.patch('/:id', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), warehouseController.updateWarehouse);
router.patch('/:id/status', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), warehouseController.toggleWarehouseStatus);

// Storage location sub-routes
router.get('/:id/locations', authorizeRoles(...AUTHORIZED_ROLES), warehouseController.getWarehouseLocations);
router.post('/:id/locations', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), warehouseController.createWarehouseLocation);
router.patch('/:id/locations/:locationId', authorizeRoles('admin', 'warehouse_manager', 'inventory_manager'), warehouseController.updateWarehouseLocation);

module.exports = router;
