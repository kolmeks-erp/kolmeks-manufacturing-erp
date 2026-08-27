const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  getActivity,
} = require('../controllers/quotation.controller');
const { createSalesOrderFromQuotation } = require('../controllers/sales_order.controller');

const AUTHORIZED_ROLES = ['admin', 'sales_manager', 'executive'];

// Protect all quotation endpoints with Authentication & Role-based Access Control
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// Quotation management endpoints
router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.post('/', createQuotation);
router.post('/:id/create-sales-order', createSalesOrderFromQuotation);
router.patch('/:id', updateQuotation);
router.patch('/:id/status', updateQuotationStatus);
router.get('/:id/activity', getActivity);

module.exports = router;
