const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  createSalesOrderFromQuotation,
  updateSalesOrder,
  updateSalesOrderStatus,
  getActivity,
} = require('../controllers/sales_order.controller');

const AUTHORIZED_ROLES = ['admin', 'sales_manager', 'executive'];

// Protect all sales order endpoints with Authentication & Role-based Access Control
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// Sales order management endpoints
router.get('/', getSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', createSalesOrder);
router.post('/from-quotation/:quotationId', createSalesOrderFromQuotation);
router.patch('/:id', updateSalesOrder);
router.patch('/:id/status', updateSalesOrderStatus);
router.get('/:id/activity', getActivity);

module.exports = router;
