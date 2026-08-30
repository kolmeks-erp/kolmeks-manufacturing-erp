const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const {
  getSystemFeatureFlags,
  toggleFeatureFlag,
  getUsersForAdminControl,
  toggleUserActiveStatus
} = require('../controllers/system_settings.controller');

// 1. Get active feature flags (Public/Authenticated)
router.get('/feature-flags', getSystemFeatureFlags);

// All admin modification endpoints require authentication
router.use(authenticateUser);

// 2. Toggle ERP module ON/OFF (Admin / Master Admin)
router.put('/feature-flags/toggle', toggleFeatureFlag);

// 3. Get user list for admin control panel
router.get('/users', getUsersForAdminControl);

// 4. Enable/Disable user account
router.put('/users/:userId/toggle-active', toggleUserActiveStatus);

module.exports = router;
