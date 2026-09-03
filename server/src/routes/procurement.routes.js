const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const {
  getPurchaseRequisitions,
  getPurchaseRequisitionById,
  createPurchaseRequisition,
  updatePurchaseRequisition,
  updateRequisitionStatus,
  approveRequisition,
  rejectRequisition,
  convertRequisitionToPO,
  getRequisitionActivities,

  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  getPOActivities,
} = require('../controllers/procurement.controller');

const AUTHORIZED_ROLES = ['admin', 'purchase_manager', 'warehouse_manager', 'executive'];
const procurementAuth = authorizeRoles(...AUTHORIZED_ROLES);

// Protect all procurement endpoints with Auth
router.use(authenticateUser);

// ==============================================================================
// PURCHASE REQUISITION ENDPOINTS
// ==============================================================================
router.get('/purchase-requisitions', procurementAuth, getPurchaseRequisitions);
router.get('/purchase-requisitions/:id', procurementAuth, getPurchaseRequisitionById);
router.post('/purchase-requisitions', procurementAuth, createPurchaseRequisition);
router.patch('/purchase-requisitions/:id', procurementAuth, updatePurchaseRequisition);
router.patch('/purchase-requisitions/:id/status', procurementAuth, updateRequisitionStatus);
router.post('/purchase-requisitions/:id/approve', procurementAuth, approveRequisition);
router.post('/purchase-requisitions/:id/reject', procurementAuth, rejectRequisition);
router.post('/purchase-requisitions/:id/create-purchase-order', procurementAuth, convertRequisitionToPO);
router.get('/purchase-requisitions/:id/activity', procurementAuth, getRequisitionActivities);

// ==============================================================================
// PURCHASE ORDER ENDPOINTS
// ==============================================================================
router.get('/purchase-orders', procurementAuth, getPurchaseOrders);
router.get('/purchase-orders/:id', procurementAuth, getPurchaseOrderById);
router.post('/purchase-orders', procurementAuth, createPurchaseOrder);
router.patch('/purchase-orders/:id', procurementAuth, updatePurchaseOrder);
router.patch('/purchase-orders/:id/status', procurementAuth, updatePurchaseOrderStatus);
router.get('/purchase-orders/:id/activity', procurementAuth, getPOActivities);

module.exports = router;
