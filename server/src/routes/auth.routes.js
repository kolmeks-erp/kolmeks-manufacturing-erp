const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');

/**
 * GET /api/auth/me
 * Protected endpoint to retrieve authenticated staff user identity, profile & role
 */
router.get('/me', authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    profile: {
      id: req.profile.id,
      full_name: req.profile.full_name,
      email: req.profile.email,
      phone: req.profile.phone,
      department: req.profile.department,
      status: req.profile.status,
    },
    role: req.role,
  });
});

module.exports = router;
