const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use(authenticateUser);

// Telemetry & Dashboard
router.get('/dashboard', workflowController.getDashboardTelemetry);

// Workflow Definitions
router.get('/definitions', workflowController.getWorkflowDefinitions);
router.post('/definitions', workflowController.createWorkflowDefinition);
router.get('/definitions/:id', workflowController.getWorkflowDefinitionById);
router.put('/definitions/:id/activate', workflowController.activateWorkflowDefinition);

// Workflow Instances
router.get('/instances', workflowController.getWorkflowInstances);
router.post('/instances/start', workflowController.startWorkflowInstance);
router.get('/instances/:id', workflowController.getWorkflowInstanceById);
router.post('/instances/:id/cancel', workflowController.cancelWorkflowInstance);
router.post('/instances/:id/resubmit', workflowController.resubmitWorkflowInstance);

// Workflow Tasks & Approvals
router.get('/tasks', workflowController.getUserTasks);
router.post('/tasks/:id/decision', workflowController.processTaskDecision);
router.post('/tasks/:id/reassign', workflowController.reassignTask);

// History, Reports, Groups & Delegations
router.get('/history', workflowController.getWorkflowHistory);
router.get('/reports', workflowController.getWorkflowReports);
router.get('/groups', workflowController.getApprovalGroups);
router.get('/delegations', workflowController.getWorkflowDelegations);

module.exports = router;
