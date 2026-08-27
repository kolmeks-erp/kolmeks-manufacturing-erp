const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Authorized ERP Roles for Supplier Management
const AUTHORIZED_ROLES = ['admin', 'purchase_manager', 'warehouse_manager'];

// Guard all supplier endpoints with authentication & RBAC authorization
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// ==============================================================================
// SUPPLIER MASTER ENDPOINTS
// ==============================================================================
router.get('/check-duplicate', supplierController.checkDuplicate);
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.patch('/:id/status', supplierController.patchSupplierStatus);

// ==============================================================================
// SUPPLIER CONTACTS ENDPOINTS
// ==============================================================================
router.get('/:id/contacts', supplierController.getContacts);
router.post('/:id/contacts', supplierController.createContact);
router.put('/:id/contacts/:contactId', supplierController.updateContact);
router.patch('/:id/contacts/:contactId/status', supplierController.patchContactStatus);

module.exports = router;
