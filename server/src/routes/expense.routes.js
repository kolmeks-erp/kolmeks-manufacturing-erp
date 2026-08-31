const express = require('express');
const router = express.Router();
const multer = require('multer');
const expenseController = require('../controllers/expense.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Configure Multer in-memory storage for receipt upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Apply Authentication Middleware globally
router.use(authenticateUser);

const ALL_ROLES = [
  'admin',
  'hr',
  'finance',
  'finance_manager',
  'accountant',
  'manager',
  'sales_manager',
  'purchase_manager',
  'production_manager',
  'quality_manager',
  'warehouse_manager',
  'executive',
];

const FINANCE_AND_MANAGERS = [
  'admin',
  'finance',
  'finance_manager',
  'accountant',
  'manager',
  'hr',
  'sales_manager',
  'purchase_manager',
  'production_manager',
  'executive',
];

const FINANCE_MANAGERS_ONLY = ['admin', 'finance', 'finance_manager', 'accountant'];

// ============================================================================
// 1. EXPENSE CATEGORIES ENDPOINTS
// ============================================================================
router.get(
  '/expense-categories',
  authorizeRoles(...ALL_ROLES),
  expenseController.getCategories
);

router.post(
  '/expense-categories',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  expenseController.createCategory
);

router.patch(
  '/expense-categories/:id',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  expenseController.updateCategory
);

// ============================================================================
// 2. RECEIPT UPLOAD ENDPOINT
// ============================================================================
router.post(
  '/expenses/upload-receipt',
  authorizeRoles(...ALL_ROLES),
  upload.single('receipt'),
  expenseController.uploadReceipt
);

// ============================================================================
// 3. EXPENSE DASHBOARD & REPORTS ENDPOINTS
// ============================================================================
router.get(
  '/expenses/dashboard/kpis',
  authorizeRoles(...ALL_ROLES),
  expenseController.getDashboardKPIs
);

router.get(
  '/expenses/reports/summary',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  expenseController.getReports
);

// ============================================================================
// 4. EXPENSE CLAIMS ENDPOINTS
// ============================================================================
router.get(
  '/expenses/my',
  authorizeRoles(...ALL_ROLES),
  expenseController.getMyClaims
);

router.get(
  '/expenses',
  authorizeRoles(...ALL_ROLES),
  expenseController.getClaims
);

router.get(
  '/expenses/:id',
  authorizeRoles(...ALL_ROLES),
  expenseController.getClaimById
);

router.post(
  '/expenses',
  authorizeRoles(...ALL_ROLES),
  expenseController.createClaim
);

router.put(
  '/expenses/:id',
  authorizeRoles(...ALL_ROLES),
  expenseController.updateClaim
);

router.post(
  '/expenses/:id/submit',
  authorizeRoles(...ALL_ROLES),
  expenseController.submitClaim
);

router.post(
  '/expenses/:id/approve',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  expenseController.approveClaim
);

router.post(
  '/expenses/:id/reject',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  expenseController.rejectClaim
);

router.post(
  '/expenses/:id/return',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  expenseController.returnClaim
);

// ============================================================================
// 5. REIMBURSEMENTS ENDPOINTS
// ============================================================================
router.get(
  '/reimbursements',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  expenseController.getReimbursements
);

router.get(
  '/reimbursements/:id',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  expenseController.getReimbursementById
);

router.post(
  '/reimbursements',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  expenseController.createReimbursement
);

router.post(
  '/reimbursements/:id/void',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  expenseController.voidReimbursement
);

module.exports = router;
