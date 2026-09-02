const reportsService = require('../services/reports.service');

class ReportsController {
  async getExecutiveDashboard(req, res) {
    try {
      const data = await reportsService.getExecutiveDashboard(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching executive dashboard:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch executive dashboard.' });
    }
  }

  async getSalesReport(req, res) {
    try {
      const data = await reportsService.getSalesReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching sales report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch sales report.' });
    }
  }

  async getProcurementReport(req, res) {
    try {
      const data = await reportsService.getProcurementReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching procurement report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch procurement report.' });
    }
  }

  async getInventoryReport(req, res) {
    try {
      const data = await reportsService.getInventoryReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching inventory report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch inventory report.' });
    }
  }

  async getProductionReport(req, res) {
    try {
      const data = await reportsService.getProductionReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching production report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch production report.' });
    }
  }

  async getQualityReport(req, res) {
    try {
      const data = await reportsService.getQualityReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching quality report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch quality report.' });
    }
  }

  async getMaintenanceReport(req, res) {
    try {
      const data = await reportsService.getMaintenanceReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching maintenance report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch maintenance report.' });
    }
  }

  async getHRReport(req, res) {
    try {
      const data = await reportsService.getHRReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching HR report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch HR report.' });
    }
  }

  async getFinanceReport(req, res) {
    try {
      const data = await reportsService.getFinanceReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching finance report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch finance report.' });
    }
  }

  async getCRMReport(req, res) {
    try {
      const data = await reportsService.getCRMReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching CRM report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch CRM report.' });
    }
  }

  async getDocumentReport(req, res) {
    try {
      const data = await reportsService.getDocumentReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching document report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch document report.' });
    }
  }

  async getWorkflowReport(req, res) {
    try {
      const data = await reportsService.getWorkflowReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching workflow report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch workflow report.' });
    }
  }

  async getAuditReport(req, res) {
    try {
      const data = await reportsService.getAuditReport(req.query);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching audit report:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch audit report.' });
    }
  }

  // Saved & Scheduled Reports
  async getSavedReports(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const data = await reportsService.getSavedReports(userId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createSavedReport(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const data = await reportsService.createSavedReport(userId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async deleteSavedReport(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const data = await reportsService.deleteSavedReport(userId, req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getReportSchedules(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const data = await reportsService.getReportSchedules(userId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async createReportSchedule(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const data = await reportsService.createReportSchedule(userId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async deleteReportSchedule(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub;
      const data = await reportsService.deleteReportSchedule(userId, req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new ReportsController();
