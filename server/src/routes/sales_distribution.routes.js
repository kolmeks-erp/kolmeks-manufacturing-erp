const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const {
  getSalesDashboard,
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotationStatus,
  getOrderFulfillment,
  getPickings,
  createPicking,
  updatePickingStatus,
  getPackings,
  createPacking,
  getDeliveries,
  getDeliveryById,
  createDelivery,
  dispatchDelivery,
  confirmDelivery,
  getSalesReturns,
  createSalesReturn,
  updateSalesReturnStatus,
  getCreditNotes,
  createCreditNote,
  getPricingRules,
  createPricingRule,
  getSalesReports,
} = require('../controllers/sales_distribution.controller');

const AUTHORIZED_ROLES = [
  'admin',
  'sales_manager',
  'executive',
  'warehouse_manager',
  'finance',
  'accountant'
];

router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// Dashboard
router.get('/dashboard', getSalesDashboard);

// Quotations
router.get('/quotations', getQuotations);
router.get('/quotations/:id', getQuotationById);
router.post('/quotations', createQuotation);
router.patch('/quotations/:id/status', updateQuotationStatus);

// Fulfillment & Inventory Reservations
router.get('/fulfillment', getOrderFulfillment);

// Picking & Packing
router.get('/picking', getPickings);
router.post('/picking', createPicking);
router.patch('/picking/:id', updatePickingStatus);

router.get('/packing', getPackings);
router.post('/packing', createPacking);

// Deliveries
router.get('/deliveries', getDeliveries);
router.get('/deliveries/:id', getDeliveryById);
router.post('/deliveries', createDelivery);
router.post('/deliveries/:id/dispatch', dispatchDelivery);
router.post('/deliveries/:id/deliver', confirmDelivery);

// Returns & Credit Notes
router.get('/returns', getSalesReturns);
router.post('/returns', createSalesReturn);
router.patch('/returns/:id/status', updateSalesReturnStatus);

router.get('/credit-notes', getCreditNotes);
router.post('/credit-notes', createCreditNote);

// Pricing Rules
router.get('/pricing', getPricingRules);
router.post('/pricing', createPricingRule);

// Reports
router.get('/reports', getSalesReports);

module.exports = router;
