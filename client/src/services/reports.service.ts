import axios from 'axios';
import { GlobalReportFilters, ExecutiveDashboardKPIs, SavedReport, ReportSchedule } from '../types/reports';

const API_URL = '/api/reports';

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reportsService = {
  async getExecutiveDashboard(filters: Partial<GlobalReportFilters> = {}): Promise<ExecutiveDashboardKPIs> {
    const response = await axios.get(`${API_URL}/dashboard`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getSalesReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/sales`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getProcurementReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/procurement`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getInventoryReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/inventory`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getProductionReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/production`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getQualityReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/quality`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getMaintenanceReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/maintenance`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getHRReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/hr`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getFinanceReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/finance`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getCRMReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/crm`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getDocumentReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/documents`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getWorkflowReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/workflows`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getAuditReport(filters: Partial<GlobalReportFilters> = {}): Promise<any> {
    const response = await axios.get(`${API_URL}/audit`, {
      params: filters,
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  // Saved & Scheduled Reports
  async getSavedReports(): Promise<SavedReport[]> {
    const response = await axios.get(`${API_URL}/saved`, { headers: getAuthHeaders() });
    return response.data.data || [];
  },

  async createSavedReport(payload: Partial<SavedReport>): Promise<SavedReport> {
    const response = await axios.post(`${API_URL}/saved`, payload, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async deleteSavedReport(id: string): Promise<void> {
    await axios.delete(`${API_URL}/saved/${id}`, { headers: getAuthHeaders() });
  },

  async getReportSchedules(): Promise<ReportSchedule[]> {
    const response = await axios.get(`${API_URL}/schedules`, { headers: getAuthHeaders() });
    return response.data.data || [];
  },

  async createReportSchedule(payload: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const response = await axios.post(`${API_URL}/schedules`, payload, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async deleteReportSchedule(id: string): Promise<void> {
    await axios.delete(`${API_URL}/schedules/${id}`, { headers: getAuthHeaders() });
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
