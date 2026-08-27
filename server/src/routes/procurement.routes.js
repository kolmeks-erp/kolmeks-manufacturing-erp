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

// Protect all procurement endpoints with Auth & RBAC
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// ==============================================================================
// PURCHASE REQUISITION ENDPOINTS
// ==============================================================================
router.get('/purchase-requisitions', getPurchaseRequisitions);
router.get('/purchase-requisitions/:id', getPurchaseRequisitionById);
router.post('/purchase-requisitions', createPurchaseRequisition);
router.patch('/purchase-requisitions/:id', updatePurchaseRequisition);
router.patch('/purchase-requisitions/:id/status', updateRequisitionStatus);
router.post('/purchase-requisitions/:id/approve', approveRequisition);
router.post('/purchase-requisitions/:id/reject', rejectRequisition);
router.post('/purchase-requisitions/:id/create-purchase-order', convertRequisitionToPO);
router.get('/purchase-requisitions/:id/activity', getRequisitionActivities);

// ==============================================================================
// PURCHASE ORDER ENDPOINTS
// ==============================================================================
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrderById);
router.post('/purchase-orders', createPurchaseOrder);
router.patch('/purchase-orders/:id', updatePurchaseOrder);
router.patch('/purchase-orders/:id/status', updatePurchaseOrderStatus);
router.get('/purchase-orders/:id/activity', getPOActivities);

module.exports = router;
