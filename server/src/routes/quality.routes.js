const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/quality.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

const QUALITY_ROLES = [
  'admin',
  'quality_manager',
  'quality_engineer',
  'quality_inspector',
  'production_manager',
  'warehouse_manager',
  'management',
  'executive'
];

router.use(authenticateUser);
router.use(authorizeRoles(...QUALITY_ROLES));

// Quality Dashboard KPIs & Reports
router.get('/dashboard/kpis', qualityController.getQualityKPIs);
router.get('/reports/summary', qualityController.getQualityReportSummary);
router.get('/reports/defects-pareto', qualityController.getDefectsParetoReport);
router.get('/reports/spc', qualityController.getSPCReport);

// Defects Catalog
router.get('/defects', qualityController.getQualityDefects);
router.post('/defects', qualityController.createQualityDefect);
router.put('/defects/:id', qualityController.updateQualityDefect);

// Quality Inspections
router.get('/inspections', qualityController.getInspections);
router.get('/inspections/:id', qualityController.getInspectionById);
router.post('/inspections', qualityController.createInspection);
router.patch('/inspections/:id', qualityController.updateInspection);
router.post('/inspections/:id/complete', qualityController.completeInspection);

// Inspection Plans
router.get('/inspection-plans', qualityController.getInspectionPlans);
router.get('/inspection-plans/:id', qualityController.getInspectionPlanById);
router.post('/inspection-plans', qualityController.createInspectionPlan);

// Non-Conformance Reports (NCR) & Root Cause
router.get('/ncr', qualityController.getNCRs);
router.get('/ncr/:id', qualityController.getNCRById);
router.post('/ncr', qualityController.createNCR);
router.patch('/ncr/:id', qualityController.updateNCR);
router.post('/ncr/:id/root-cause', qualityController.saveNCRRootCause);
router.post('/ncr/:id/close', qualityController.closeNCR);

// CAPA Management
router.get('/capa', qualityController.getCAPAs);
router.get('/capa/:id', qualityController.getCAPAById);
router.post('/capa', qualityController.createCAPA);
router.patch('/capa/:id', qualityController.updateCAPA);
router.post('/capa/:id/actions', qualityController.addCAPAAction);
router.patch('/capa/actions/:actionId', qualityController.updateCAPAAction);
router.post('/capa/:id/verify', qualityController.verifyCAPA);
router.post('/capa/:id/close', qualityController.closeCAPA);

// Quality Holds & Quarantine
router.get('/holds', qualityController.getQualityHolds);
router.post('/holds', qualityController.createQualityHold);
router.post('/holds/:id/release', qualityController.releaseQualityHold);
router.post('/holds/:id/scrap', qualityController.scrapQualityHold);

// Supplier Quality Performance
router.get('/suppliers/performance', qualityController.getSupplierQualityPerformance);

// Customer Complaints
router.get('/complaints', qualityController.getCustomerComplaints);
router.get('/complaints/:id', qualityController.getCustomerComplaintById);
router.post('/complaints', qualityController.createCustomerComplaint);
router.patch('/complaints/:id', qualityController.updateCustomerComplaint);

module.exports = router;
