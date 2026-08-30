import { Router } from 'express';
import { purchaseInvoiceController } from '../controllers/purchase_invoice.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';

const router = Router();

// Apply Authentication Middleware globally to all routes
router.use(authenticateUser);

// Roles allowed to manage Purchase Invoices & Accounts Payable
const FINANCE_AND_PURCHASE_ROLES = [
  'admin',
  'finance',
  'finance_manager',
  'accountant',
  'purchase_manager',
  'manager',
  'executive',
];

const FINANCE_MANAGERS_ONLY = ['admin', 'finance', 'finance_manager'];

// ============================================================================
// PURCHASE INVOICES ENDPOINTS
// ============================================================================
router.get(
  '/purchases/invoices',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getInvoices
);

router.get(
  '/purchases/invoices/:id',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getInvoiceById
);

router.post(
  '/purchases/invoices',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.createInvoice
);

router.post(
  '/purchases/invoices/:id/approve',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  purchaseInvoiceController.approveInvoice
);

router.post(
  '/purchases/invoices/:id/post',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  purchaseInvoiceController.postInvoice
);

router.post(
  '/purchases/invoices/:id/void',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  purchaseInvoiceController.voidInvoice
);

// ============================================================================
// ACCOUNTS PAYABLE & SUPPLIER PAYMENTS ENDPOINTS
// ============================================================================
router.get(
  '/finance/payables',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getPayables
);

router.get(
  '/finance/payables/aging',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getPayableAging
);

router.get(
  '/finance/suppliers/:id/statement',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getSupplierStatement
);

router.get(
  '/finance/payables/supplier/:id/statement',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getSupplierStatement
);

router.get(
  '/finance/supplier-payments',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getPayments
);

router.get(
  '/finance/supplier-payments/:id',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.getPaymentById
);

router.post(
  '/finance/supplier-payments',
  authorizeRoles(...FINANCE_AND_PURCHASE_ROLES),
  purchaseInvoiceController.recordPayment
);

router.post(
  '/finance/supplier-payments/:id/void',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  purchaseInvoiceController.voidPayment
);

export default router;
