const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const p2pController = require('../controllers/procurement_p2p.controller');

const AUTHORIZED_ROLES = ['admin', 'purchase_manager', 'warehouse_manager', 'quality_manager', 'executive', 'finance'];

router.use(authenticateUser);
router.use(authorizeRoles(...AUTHORIZED_ROLES));

// Telemetry & KPIs
router.get('/telemetry', p2pController.getProcurementTelemetry);

// Supplier Evaluation & Rating
router.post('/suppliers/:id/evaluate', p2pController.evaluateSupplier);
router.get('/suppliers/:id/evaluations', p2pController.getSupplierEvaluations);

// Supplier Documents & Onboarding
router.post('/suppliers/:id/documents', p2pController.addSupplierDocument);
router.get('/suppliers/:id/documents', p2pController.getSupplierDocuments);
router.patch('/suppliers/:id/onboard-status', p2pController.updateSupplierOnboardingStatus);

// Supplier Quotation & RFQ Comparison Matrix
router.post('/quotations', p2pController.createSupplierQuotation);
router.get('/quotations/compare', p2pController.getQuotationComparison);
router.post('/quotations/:quotation_id/select', p2pController.selectSupplierForRFQ);

// PO Controlled Amendment
router.post('/orders/:id/amend', p2pController.amendPurchaseOrder);

// Supplier Returns & Quality RMA
router.post('/returns', p2pController.createSupplierReturn);
router.get('/returns', p2pController.getSupplierReturns);
router.patch('/returns/:id/status', p2pController.updateSupplierReturnStatus);

// Three-Way Matching (PO + GRN + Invoice)
router.get('/three-way-match/:invoiceId', p2pController.performThreeWayMatch);

// Procurement Reports & Analytics
router.get('/reports', p2pController.getProcurementReports);

module.exports = router;
