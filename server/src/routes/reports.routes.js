const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use(authenticateUser);

// Analytics & Reports Endpoints
router.get('/dashboard', (req, res) => reportsController.getExecutiveDashboard(req, res));
router.get('/sales', (req, res) => reportsController.getSalesReport(req, res));
router.get('/procurement', (req, res) => reportsController.getProcurementReport(req, res));
router.get('/inventory', (req, res) => reportsController.getInventoryReport(req, res));
router.get('/production', (req, res) => reportsController.getProductionReport(req, res));
router.get('/quality', (req, res) => reportsController.getQualityReport(req, res));
router.get('/maintenance', (req, res) => reportsController.getMaintenanceReport(req, res));
router.get('/hr', (req, res) => reportsController.getHRReport(req, res));
router.get('/finance', (req, res) => reportsController.getFinanceReport(req, res));
router.get('/crm', (req, res) => reportsController.getCRMReport(req, res));
router.get('/documents', (req, res) => reportsController.getDocumentReport(req, res));
router.get('/workflows', (req, res) => reportsController.getWorkflowReport(req, res));
router.get('/audit', (req, res) => reportsController.getAuditReport(req, res));

// Saved & Scheduled Reports
router.get('/saved', (req, res) => reportsController.getSavedReports(req, res));
router.post('/saved', (req, res) => reportsController.createSavedReport(req, res));
router.delete('/saved/:id', (req, res) => reportsController.deleteSavedReport(req, res));

router.get('/schedules', (req, res) => reportsController.getReportSchedules(req, res));
router.post('/schedules', (req, res) => reportsController.createReportSchedule(req, res));
router.delete('/schedules/:id', (req, res) => reportsController.deleteReportSchedule(req, res));

module.exports = router;
