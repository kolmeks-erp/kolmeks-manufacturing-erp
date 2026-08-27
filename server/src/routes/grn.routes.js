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

// Protect all GRN endpoints with Authentication & RBAC
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// Eligible POs for GRN creation
router.get('/purchase-orders/eligible-for-receiving', getEligiblePurchaseOrders);

// Goods Receipt Endpoints
router.get('/goods-receipts', getGoodsReceipts);
router.get('/goods-receipts/:id', getGoodsReceiptById);
router.post('/goods-receipts', createGoodsReceipt);
router.patch('/goods-receipts/:id', updateGoodsReceipt);
router.post('/goods-receipts/:id/complete', completeGoodsReceipt);
router.post('/goods-receipts/:id/cancel', cancelGoodsReceipt);
router.get('/goods-receipts/:id/activity', getGoodsReceiptActivities);

module.exports = router;
