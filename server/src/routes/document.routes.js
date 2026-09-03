const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/auth.middleware');
const { documentUpload } = require('../middleware/upload.middleware');

// Protect all document management endpoints with mandatory authentication
router.use(authenticateUser);

// 1. Dashboard & Telemetry
router.get('/dashboard', documentController.getDashboardData);

// 2. Document Library (List, Search, Filter)
router.get('/', documentController.getDocuments);
router.get('/recent', documentController.getRecentDocuments);
router.get('/expiring', documentController.getExpiringDocuments);
router.get('/reports', documentController.getDocumentReports);

// 3. Document Details & CRUD
router.get('/types', documentController.getDocumentTypes);
router.post('/types', authorizeRoles('admin', 'quality_manager', 'hr', 'executive'), documentController.createDocumentType);

router.get('/categories', documentController.getDocumentCategories);
router.post('/categories', authorizeRoles('admin', 'quality_manager', 'hr', 'executive'), documentController.createDocumentCategory);

router.get('/approvals/my', documentController.getMyApprovals);

router.get('/:id', documentController.getDocumentById);

// Upload new document with optional file attachment
router.post('/', documentUpload.single('file'), documentController.createDocument);

// Update document metadata
router.patch('/:id/metadata', documentController.updateDocumentMetadata);

// Upload new version / revision
router.post('/:id/versions', documentUpload.single('file'), documentController.uploadNewVersion);

// Submit document for digital approval
router.post('/:id/approvals', documentController.submitForApproval);

// Process approval decision (Approve, Reject, Request Changes)
router.post('/approvals/:approval_id/decision', documentController.processApprovalDecision);

// Publish approved document
router.post('/:id/publish', authorizeRoles('admin', 'quality_manager', 'purchase_manager', 'sales_manager', 'production_manager', 'hr', 'finance', 'executive'), documentController.publishDocument);

// Archive document
router.post('/:id/archive', authorizeRoles('admin', 'quality_manager', 'purchase_manager', 'sales_manager', 'hr', 'executive'), documentController.archiveDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
