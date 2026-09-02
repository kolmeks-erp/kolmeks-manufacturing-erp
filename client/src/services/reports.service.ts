import apiClient from './api';
import { GlobalReportFilters, ExecutiveDashboardKPIs, SavedReport, ReportSchedule } from '../types/reports';

export const reportsService = {
  async getExecutiveDashboard(filters: Partial<GlobalReportFilters> = {}): Promise<ExecutiveDashboardKPIs> {
    const response = await apiClient.get('/reports/dashboard', { params: filters });
    return response.data?.data || {};
  },

  async getSalesReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/sales', { params: filters });
    return response.data?.data || {};
  },

  async getProcurementReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/procurement', { params: filters });
    return response.data?.data || {};
  },

  async getInventoryReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/inventory', { params: filters });
    return response.data?.data || {};
  },

  async getProductionReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/production', { params: filters });
    return response.data?.data || {};
  },

  async getQualityReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/quality', { params: filters });
    return response.data?.data || {};
  },

  async getMaintenanceReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/maintenance', { params: filters });
    return response.data?.data || {};
  },

  async getHRReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/hr', { params: filters });
    return response.data?.data || {};
  },

  async getFinanceReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/finance', { params: filters });
    return response.data?.data || {};
  },

  async getCRMReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/crm', { params: filters });
    return response.data?.data || {};
  },

  async getDocumentReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/documents', { params: filters });
    return response.data?.data || {};
  },

  async getWorkflowReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/workflows', { params: filters });
    return response.data?.data || {};
  },

  async getAuditReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await apiClient.get('/reports/audit', { params: filters });
    return response.data?.data || {};
  },

  // Saved & Scheduled Reports
  async getSavedReports(): Promise<SavedReport[]> {
    const response = await apiClient.get('/reports/saved');
    return response.data?.data || [];
  },

  async createSavedReport(payload: Partial<SavedReport>): Promise<SavedReport> {
    const response = await apiClient.post('/reports/saved', payload);
    return response.data?.data;
  },

  async deleteSavedReport(id: string): Promise<void> {
    await apiClient.delete(`/reports/saved/${id}`);
  },

  async getReportSchedules(): Promise<ReportSchedule[]> {
    const response = await apiClient.get('/reports/schedules');
    return response.data?.data || [];
  },

  async createReportSchedule(payload: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const response = await apiClient.post('/reports/schedules', payload);
    return response.data?.data;
  },

  async deleteReportSchedule(id: string): Promise<void> {
    await apiClient.delete(`/reports/schedules/${id}`);
  },

  // Utility to trigger CSV download from data rows
  exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
