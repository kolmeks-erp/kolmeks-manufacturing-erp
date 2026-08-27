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

// Quality Dashboard KPIs
router.get('/dashboard/kpis', qualityController.getQualityKPIs);

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

// Non-Conformance Reports (NCR)
router.get('/ncr', qualityController.getNCRs);
router.get('/ncr/:id', qualityController.getNCRById);
router.post('/ncr', qualityController.createNCR);
router.patch('/ncr/:id', qualityController.updateNCR);
router.post('/ncr/:id/close', qualityController.closeNCR);

// Quality Holds
router.get('/holds', qualityController.getQualityHolds);
router.post('/holds', qualityController.createQualityHold);
router.post('/holds/:id/release', qualityController.releaseQualityHold);

module.exports = router;
