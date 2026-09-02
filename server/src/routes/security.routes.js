const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/auth.middleware');

// Apply authentication middleware to all security endpoints
router.use(authenticateUser);

// Require administrative / security roles for security center APIs
const securityRoles = authorizeRoles('admin', 'master_admin', 'security_officer');

router.get('/overview', securityRoles, (req, res, next) => securityController.getOverview(req, res, next));
router.get('/access', securityRoles, (req, res, next) => securityController.getAccessControl(req, res, next));
router.put('/access/:id/status', securityRoles, (req, res, next) => securityController.updateUserStatus(req, res, next));
router.get('/sessions', securityRoles, (req, res, next) => securityController.getSessions(req, res, next));
router.post('/sessions/:id/revoke', securityRoles, (req, res, next) => securityController.revokeSession(req, res, next));
router.get('/events', securityRoles, (req, res, next) => securityController.getEvents(req, res, next));
router.get('/policies', securityRoles, (req, res, next) => securityController.getPolicies(req, res, next));
router.put('/policies/:key', securityRoles, (req, res, next) => securityController.updatePolicy(req, res, next));
router.get('/audit', securityRoles, (req, res, next) => securityController.getAuditTrail(req, res, next));

module.exports = router;
