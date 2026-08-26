const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

/**
 * GET /api/erp/dashboard-summary
 * Accessible by all authenticated active ERP staff users
 */
router.get('/dashboard-summary', authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Kolmeks Manufacturing ERP Portal',
    authenticatedUser: req.profile.full_name,
    userRole: req.role.name,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/erp/admin-only
 * Restricted strictly to users with 'admin' role
 */
router.get('/admin-only', authenticateUser, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted to Administrator security endpoint.',
    adminUser: req.profile.full_name,
    role: req.role,
  });
});

module.exports = router;
