const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Authorized ERP Roles for Product & Category Management
const AUTHORIZED_ROLES = ['admin', 'production_manager', 'sales_manager', 'quality_manager'];

// Guard all product routes with user authentication & role authorization
router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// ==============================================================================
// PRODUCT CATEGORIES ENDPOINTS
// ==============================================================================
router.get('/categories', productController.getCategories);
router.post('/categories', productController.createCategory);
router.patch('/categories/:id', productController.updateCategory);
router.patch('/categories/:id/status', productController.patchCategoryStatus);

// ==============================================================================
// PRODUCT MASTER ENDPOINTS
// ==============================================================================
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.patch('/:id/status', productController.patchProductStatus);

module.exports = router;
