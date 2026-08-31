const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Global Auth Middleware
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

const FINANCE_MANAGERS_ONLY = ['admin', 'finance', 'finance_manager', 'accountant'];
const FINANCE_AND_MANAGERS = ['admin', 'finance', 'finance_manager', 'accountant', 'manager', 'production_manager', 'executive'];

// ============================================================================
// 1. ASSET CATEGORIES
// ============================================================================
router.get(
  '/asset-categories',
  authorizeRoles(...ALL_ROLES),
  assetController.getCategories
);

router.get(
  '/asset-categories/:id',
  authorizeRoles(...ALL_ROLES),
  assetController.getCategoryById
);

router.post(
  '/asset-categories',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  assetController.createCategory
);

router.patch(
  '/asset-categories/:id',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  assetController.updateCategory
);

// ============================================================================
// 2. DASHBOARD & REPORTS
// ============================================================================
router.get(
  '/assets/dashboard/summary',
  authorizeRoles(...ALL_ROLES),
  assetController.getDashboardSummary
);

router.get(
  '/assets/reports/summary',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  assetController.getReports
);

// ============================================================================
// 3. DEPRECIATION RUNS & SCHEDULES
// ============================================================================
router.get(
  '/assets/:id/depreciation-schedule',
  authorizeRoles(...ALL_ROLES),
  assetController.getDepreciationSchedule
);

router.post(
  '/assets/depreciation/preview',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  assetController.previewDepreciationRun
);

router.post(
  '/assets/depreciation/post',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  assetController.postDepreciationRun
);

// ============================================================================
// 4. TRANSFERS & DISPOSALS
// ============================================================================
router.get(
  '/assets/transfers',
  authorizeRoles(...ALL_ROLES),
  assetController.getTransfers
);

router.post(
  '/assets/:id/transfer',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  assetController.transferAsset
);

router.get(
  '/assets/disposals',
  authorizeRoles(...ALL_ROLES),
  assetController.getDisposals
);

router.post(
  '/assets/:id/dispose',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  assetController.disposeAsset
);

// ============================================================================
// 5. FIXED ASSET REGISTER & CAPITALIZATION
// ============================================================================
router.get(
  '/assets',
  authorizeRoles(...ALL_ROLES),
  assetController.getAssets
);

router.get(
  '/assets/:id',
  authorizeRoles(...ALL_ROLES),
  assetController.getAssetById
);

router.post(
  '/assets',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  assetController.createAsset
);

router.patch(
  '/assets/:id',
  authorizeRoles(...FINANCE_AND_MANAGERS),
  assetController.updateAsset
);

router.post(
  '/assets/:id/capitalize',
  authorizeRoles(...FINANCE_MANAGERS_ONLY),
  assetController.capitalizeAsset
);

module.exports = router;
