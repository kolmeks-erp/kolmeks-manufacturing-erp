const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Authorized ERP Roles for Customer Management
const AUTHORIZED_ROLES = ['admin', 'sales_manager'];

// Guard all customer endpoints with authentication & RBAC authorization
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// ==============================================================================
// CUSTOMER MASTER ENDPOINTS
// ==============================================================================
router.get('/check-duplicate', customerController.checkDuplicate);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.patch('/:id/status', customerController.patchCustomerStatus);

// ==============================================================================
// CUSTOMER CONTACTS ENDPOINTS
// ==============================================================================
router.get('/:id/contacts', customerController.getContacts);
router.post('/:id/contacts', customerController.createContact);
router.put('/:id/contacts/:contactId', customerController.updateContact);
router.patch('/:id/contacts/:contactId/status', customerController.patchContactStatus);

module.exports = router;
