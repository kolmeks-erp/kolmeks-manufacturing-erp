import apiClient from './api';
import {
  SecurityOverviewMetrics,
  SecurityUserRecord,
  UserSessionRecord,
  SecurityEventRecord,
  SecurityPolicyRecord,
  SystemAuditLogRecord
} from '../types/security';

export const securityService = {
  async getOverviewMetrics(): Promise<SecurityOverviewMetrics> {
    const response = await apiClient.get('/security/overview');
    return response.data?.data || {};
  },

  async getAccessRecords(params: { search?: string; status?: string; roleId?: string } = {}): Promise<SecurityUserRecord[]> {
    const response = await apiClient.get('/security/access', { params });
    return response.data?.data || [];
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'inactive'): Promise<SecurityUserRecord> {
    const response = await apiClient.put(`/security/access/${userId}/status`, { status });
    return response.data?.data;
  },

  async getSessions(params: { userId?: string; status?: string } = {}): Promise<UserSessionRecord[]> {
    const response = await apiClient.get('/security/sessions', { params });
    return response.data?.data || [];
  },

  async revokeSession(sessionId: string): Promise<UserSessionRecord> {
    const response = await apiClient.post(`/security/sessions/${sessionId}/revoke`, {});
    return response.data?.data;
  },

  async getSecurityEvents(params: { category?: string; severity?: string; limit?: number } = {}): Promise<SecurityEventRecord[]> {
    const response = await apiClient.get('/security/events', { params });
    return response.data?.data || [];
  },

  async getSecurityPolicies(): Promise<SecurityPolicyRecord[]> {
    const response = await apiClient.get('/security/policies');
    return response.data?.data || [];
  },

  async updateSecurityPolicy(policyKey: string, value: Record<string, any>): Promise<SecurityPolicyRecord> {
    const response = await apiClient.put(`/security/policies/${policyKey}`, { value });
    return response.data?.data;
  },

  async getAuditTrail(params: { module?: string; severity?: string; search?: string; limit?: number } = {}): Promise<SystemAuditLogRecord[]> {
    const response = await apiClient.get('/security/audit', { params });
    return response.data?.data || [];
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
