const express = require('express');
const router = express.Router();
const systemAdminController = require('../controllers/system_admin.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use(authenticateUser);

// Dashboard Telemetry
router.get('/dashboard', systemAdminController.getDashboardTelemetry);

// Organization Profile
router.get('/organization', systemAdminController.getOrganizationProfile);
router.put('/organization', systemAdminController.updateOrganizationProfile);

// Locations
router.get('/locations', systemAdminController.getLocations);
router.post('/locations', systemAdminController.saveLocation);
router.put('/locations/:id', systemAdminController.saveLocation);

// Departments
router.get('/departments', systemAdminController.getDepartments);
router.post('/departments', systemAdminController.saveDepartment);
router.put('/departments/:id', systemAdminController.saveDepartment);

// User Management
router.get('/users', systemAdminController.getUsers);
router.put('/users/:id/status', systemAdminController.updateUserStatus);
router.put('/users/:id/role', systemAdminController.updateUserRole);

// Roles & Permissions
router.get('/roles', systemAdminController.getRoles);
router.post('/roles', systemAdminController.saveRole);
router.put('/roles/:id', systemAdminController.saveRole);
router.get('/permissions', systemAdminController.getPermissions);

// Numbering Sequences
router.get('/numbering', systemAdminController.getNumberingSequences);
router.put('/numbering/:id', systemAdminController.updateNumberingSequence);

// Currencies
router.get('/currencies', systemAdminController.getCurrencies);
router.post('/currencies', systemAdminController.saveCurrency);
router.put('/currencies/:id', systemAdminController.saveCurrency);

// Units of Measure
router.get('/units', systemAdminController.getUnits);
router.post('/units', systemAdminController.saveUnit);
router.put('/units/:id', systemAdminController.saveUnit);

// Master Data Options
router.get('/masters', systemAdminController.getMasterDataOptions);

// Security Settings
router.get('/security', systemAdminController.getSecuritySettings);

// Audit Center
router.get('/audit', systemAdminController.getAuditLogs);

module.exports = router;
