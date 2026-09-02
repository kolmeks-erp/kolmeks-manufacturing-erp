import axios from 'axios';
import {
  SecurityOverviewMetrics,
  SecurityUserRecord,
  UserSessionRecord,
  SecurityEventRecord,
  SecurityPolicyRecord,
  SystemAuditLogRecord
} from '../types/security';

const API_URL = '/api/security';

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const securityService = {
  async getOverviewMetrics(): Promise<SecurityOverviewMetrics> {
    const response = await axios.get(`${API_URL}/overview`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async getAccessRecords(params: { search?: string; status?: string; roleId?: string } = {}): Promise<SecurityUserRecord[]> {
    const response = await axios.get(`${API_URL}/access`, { params, headers: getAuthHeaders() });
    return response.data.data || [];
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'inactive'): Promise<SecurityUserRecord> {
    const response = await axios.put(`${API_URL}/access/${userId}/status`, { status }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async getSessions(params: { userId?: string; status?: string } = {}): Promise<UserSessionRecord[]> {
    const response = await axios.get(`${API_URL}/sessions`, { params, headers: getAuthHeaders() });
    return response.data.data || [];
  },

  async revokeSession(sessionId: string): Promise<UserSessionRecord> {
    const response = await axios.post(`${API_URL}/sessions/${sessionId}/revoke`, {}, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async getSecurityEvents(params: { category?: string; severity?: string; limit?: number } = {}): Promise<SecurityEventRecord[]> {
    const response = await axios.get(`${API_URL}/events`, { params, headers: getAuthHeaders() });
    return response.data.data || [];
  },

  async getSecurityPolicies(): Promise<SecurityPolicyRecord[]> {
    const response = await axios.get(`${API_URL}/policies`, { headers: getAuthHeaders() });
    return response.data.data || [];
  },

  async updateSecurityPolicy(policyKey: string, value: Record<string, any>): Promise<SecurityPolicyRecord> {
    const response = await axios.put(`${API_URL}/policies/${policyKey}`, { value }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async getAuditTrail(params: { module?: string; severity?: string; search?: string; limit?: number } = {}): Promise<SystemAuditLogRecord[]> {
    const response = await axios.get(`${API_URL}/audit`, { params, headers: getAuthHeaders() });
    return response.data.data || [];
  },

  exportSecurityCSV(filename: string, headers: string[], rows: (string | number)[][]) {
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
