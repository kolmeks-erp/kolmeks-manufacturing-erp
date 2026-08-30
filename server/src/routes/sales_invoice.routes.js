const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const salesInvoiceController = require('../controllers/sales_invoice.controller');

// Enforce authentication across all Sales Invoicing & Accounts Receivable endpoints
router.use(authenticateUser);

const financeAuth = authorizeRoles('admin', 'finance', 'accountant', 'sales_manager', 'manager', 'executive');

// --------------------------------------------------------------------------
// SALES INVOICES API
// --------------------------------------------------------------------------
router.get('/invoices', financeAuth, salesInvoiceController.getInvoices);
router.get('/invoices/:id', financeAuth, salesInvoiceController.getInvoiceById);
router.post('/invoices', financeAuth, salesInvoiceController.createInvoice);
router.post('/invoices/:id/issue', financeAuth, salesInvoiceController.issueInvoice);
router.post('/invoices/:id/void', financeAuth, salesInvoiceController.voidInvoice);

// --------------------------------------------------------------------------
// CUSTOMER PAYMENTS API
// --------------------------------------------------------------------------
router.get('/payments', financeAuth, salesInvoiceController.getPayments);
router.get('/payments/:id', financeAuth, salesInvoiceController.getPaymentById);
router.post('/payments', financeAuth, salesInvoiceController.recordPayment);
router.post('/payments/:id/void', financeAuth, salesInvoiceController.voidPayment);

// --------------------------------------------------------------------------
// ACCOUNTS RECEIVABLE, AGING & STATEMENTS
// --------------------------------------------------------------------------
router.get('/receivables', financeAuth, salesInvoiceController.getReceivables);
router.get('/receivables/aging', financeAuth, salesInvoiceController.getReceivableAging);
router.get('/customers/:id/statement', financeAuth, salesInvoiceController.getCustomerStatement);

module.exports = router;
