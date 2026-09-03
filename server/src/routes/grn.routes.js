const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const {
  getEligiblePurchaseOrders,
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
  updateGoodsReceipt,
  completeGoodsReceipt,
  cancelGoodsReceipt,
  getGoodsReceiptActivities,
} = require('../controllers/grn.controller');

const AUTHORIZED_ROLES = ['admin', 'warehouse_manager', 'purchase_manager', 'quality_manager', 'executive'];
const grnAuth = authorizeRoles(...AUTHORIZED_ROLES);

// Protect all GRN endpoints with Authentication
router.use(authenticateUser);

// Eligible POs for GRN creation
router.get('/purchase-orders/eligible-for-receiving', grnAuth, getEligiblePurchaseOrders);

// Goods Receipt Endpoints
router.get('/goods-receipts', grnAuth, getGoodsReceipts);
router.get('/goods-receipts/:id', grnAuth, getGoodsReceiptById);
router.post('/goods-receipts', grnAuth, createGoodsReceipt);
router.patch('/goods-receipts/:id', grnAuth, updateGoodsReceipt);
router.post('/goods-receipts/:id/complete', grnAuth, completeGoodsReceipt);
router.post('/goods-receipts/:id/cancel', grnAuth, cancelGoodsReceipt);
router.get('/goods-receipts/:id/activity', grnAuth, getGoodsReceiptActivities);

module.exports = router;
