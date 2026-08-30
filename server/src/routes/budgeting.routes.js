import { Router } from 'express';
import { budgetingController } from '../controllers/budgeting.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';

const router = Router();

// Apply Authentication Middleware globally to all routes
router.use(authenticateUser);

// Roles authorized for Budgeting and Cost Center management
const BUDGET_ROLES = ['admin', 'finance', 'finance_manager', 'accountant', 'manager', 'executive'];
const BUDGET_MANAGERS_ONLY = ['admin', 'finance', 'finance_manager'];

// ============================================================================
// COST CENTER ENDPOINTS
// ============================================================================
router.get(
  '/finance/cost-centers',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getCostCenters
);

router.get(
  '/finance/cost-centers/:id',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getCostCenterById
);

router.post(
  '/finance/cost-centers',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.createCostCenter
);

router.patch(
  '/finance/cost-centers/:id',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.updateCostCenter
);

// ============================================================================
// BUDGET & WORKFLOW ENDPOINTS
// ============================================================================
router.get(
  '/finance/budgets/summary',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getBudgetSummaryKPIs
);

router.get(
  '/finance/budgets/approvals',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.getBudgetApprovalsList
);

router.get(
  '/finance/budgets',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getBudgets
);

router.get(
  '/finance/budgets/:id',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getBudgetById
);

router.post(
  '/finance/budgets',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.createBudget
);

router.patch(
  '/finance/budgets/:id',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.updateBudget
);

router.post(
  '/finance/budgets/:id/submit',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.submitBudget
);

router.post(
  '/finance/budgets/:id/approve',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.approveBudget
);

router.post(
  '/finance/budgets/:id/reject',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.rejectBudget
);

router.post(
  '/finance/budgets/:id/lock',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.lockBudget
);

router.post(
  '/finance/budgets/:id/archive',
  authorizeRoles(...BUDGET_MANAGERS_ONLY),
  budgetingController.archiveBudget
);

router.post(
  '/finance/budgets/:id/version',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.createBudgetVersion
);

// ============================================================================
// BUDGET VS ACTUAL & VARIANCE REPORTING
// ============================================================================
router.get(
  '/finance/budgets/:id/variance',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getBudgetVariance
);

router.get(
  '/finance/budgets/:id/versions',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getBudgetVersions
);

router.get(
  '/finance/budget-vs-actual',
  authorizeRoles(...BUDGET_ROLES),
  budgetingController.getBudgetVsActualReport
);

export default router;
