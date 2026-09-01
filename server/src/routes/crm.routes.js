const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const crmController = require('../controllers/crm.controller');

// Enforce authentication on all CRM endpoints
router.use(authenticateUser);

const crmAuth = authorizeRoles('admin', 'crm_manager', 'sales_manager', 'sales', 'sales_executive', 'hr', 'finance', 'executive', 'accountant');

// 1. Dashboard
router.get('/dashboard', crmAuth, crmController.getCRMDashboardKPIs);

// 2. Leads Management
router.get('/leads', crmAuth, crmController.getLeads);
router.post('/leads', crmAuth, crmController.createLead);
router.get('/leads/:id', crmAuth, crmController.getLeadById);
router.patch('/leads/:id', crmAuth, crmController.updateLead);
router.post('/leads/:id/qualify', crmAuth, crmController.qualifyLead);
router.post('/leads/:id/convert', crmAuth, crmController.convertLead);

// 3. Opportunities & Pipeline Board
router.get('/opportunities', crmAuth, crmController.getOpportunities);
router.post('/opportunities', crmAuth, crmController.createOpportunity);
router.get('/opportunities/:id', crmAuth, crmController.getOpportunityById);
router.post('/opportunities/:id/stage', crmAuth, crmController.updateOpportunityStage);
router.post('/opportunities/:id/win', crmAuth, crmController.winOpportunity);
router.post('/opportunities/:id/lost', crmAuth, crmController.loseOpportunity);
router.get('/pipeline', crmAuth, crmController.getPipelineBoard);

// 4. Activities & Tasks & Followups
router.get('/activities', crmAuth, crmController.getActivities);
router.post('/activities', crmAuth, crmController.createActivity);
router.get('/tasks', crmAuth, crmController.getTasks);
router.post('/tasks', crmAuth, crmController.createTask);
router.patch('/tasks/:id/status', crmAuth, crmController.updateTaskStatus);
router.get('/follow-ups', crmAuth, crmController.getFollowups);
router.post('/follow-ups', crmAuth, crmController.createFollowup);

// 5. Customer Timeline & Notes
router.get('/customers/:id/timeline', crmAuth, crmController.getCustomerTimeline);
router.post('/customers/:id/notes', crmAuth, crmController.addCustomerNote);

// 6. Analytical CRM Reports
router.get('/reports', crmAuth, crmController.getCRMReports);

module.exports = router;
