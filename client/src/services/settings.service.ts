import apiClient from './api';
import {
  AdminTelemetry,
  OrganizationProfile,
  LocationItem,
  DepartmentItem,
  UserItem,
  RoleItem,
  PermissionItem,
  NumberingSequence,
  CurrencyItem,
  UnitItem,
  MasterOption,
  AuditLogItem
} from '../types/settings';

export const settingsService = {
  getDashboardTelemetry: async (): Promise<AdminTelemetry> => {
    const response = await apiClient.get('/settings/dashboard');
    return response.data?.data || {};
  },

  getOrganizationProfile: async (): Promise<OrganizationProfile> => {
    const response = await apiClient.get('/settings/organization');
    return response.data?.data;
  },

  updateOrganizationProfile: async (payload: OrganizationProfile): Promise<OrganizationProfile> => {
    const response = await apiClient.put('/settings/organization', payload);
    return response.data?.data;
  },

  getLocations: async (): Promise<LocationItem[]> => {
    const response = await apiClient.get('/settings/locations');
    return response.data?.data || [];
  },

  saveLocation: async (payload: Partial<LocationItem>): Promise<LocationItem> => {
    const url = payload.id ? `/settings/locations/${payload.id}` : '/settings/locations';
    const method = payload.id ? 'put' : 'post';
    const response = await apiClient[method](url, payload);
    return response.data?.data;
  },

  getDepartments: async (): Promise<DepartmentItem[]> => {
    const response = await apiClient.get('/settings/departments');
    return response.data?.data || [];
  },

  saveDepartment: async (payload: Partial<DepartmentItem>): Promise<DepartmentItem> => {
    const url = payload.id ? `/settings/departments/${payload.id}` : '/settings/departments';
    const method = payload.id ? 'put' : 'post';
    const response = await apiClient[method](url, payload);
    return response.data?.data;
  },

  getUsers: async (): Promise<UserItem[]> => {
    const response = await apiClient.get('/settings/users');
    return response.data?.data || [];
  },

  updateUserStatus: async (userId: string, status: string): Promise<UserItem> => {
    const response = await apiClient.put(`/settings/users/${userId}/status`, { status });
    return response.data?.data;
  },

  updateUserRole: async (userId: string, roleId: string): Promise<UserItem> => {
    const response = await apiClient.put(`/settings/users/${userId}/role`, { roleId });
    return response.data?.data;
  },

  getRoles: async (): Promise<RoleItem[]> => {
    const response = await apiClient.get('/settings/roles');
    return response.data?.data || [];
  },

  saveRole: async (payload: Partial<RoleItem>): Promise<RoleItem> => {
    const url = payload.id ? `/settings/roles/${payload.id}` : '/settings/roles';
    const method = payload.id ? 'put' : 'post';
    const response = await apiClient[method](url, payload);
    return response.data?.data;
  },

  getPermissions: async (): Promise<PermissionItem[]> => {
    const response = await apiClient.get('/settings/permissions');
    return response.data?.data || [];
  },

  getNumberingSequences: async (): Promise<NumberingSequence[]> => {
    const response = await apiClient.get('/settings/numbering');
    return response.data?.data || [];
  },

  updateNumberingSequence: async (id: string, payload: Partial<NumberingSequence>): Promise<NumberingSequence> => {
    const response = await apiClient.put(`/settings/numbering/${id}`, payload);
    return response.data?.data;
  },

  getCurrencies: async (): Promise<CurrencyItem[]> => {
    const response = await apiClient.get('/settings/currencies');
    return response.data?.data || [];
  },

  saveCurrency: async (payload: Partial<CurrencyItem>): Promise<CurrencyItem> => {
    const url = payload.id ? `/settings/currencies/${payload.id}` : '/settings/currencies';
    const method = payload.id ? 'put' : 'post';
    const response = await apiClient[method](url, payload);
    return response.data?.data;
  },

  getUnits: async (): Promise<UnitItem[]> => {
    const response = await apiClient.get('/settings/units');
    return response.data?.data || [];
  },

  saveUnit: async (payload: Partial<UnitItem>): Promise<UnitItem> => {
    const url = payload.id ? `/settings/units/${payload.id}` : '/settings/units';
    const method = payload.id ? 'put' : 'post';
    const response = await apiClient[method](url, payload);
    return response.data?.data;
  },

  getMasterDataOptions: async (category?: string): Promise<MasterOption[]> => {
    const response = await apiClient.get('/settings/masters', { params: { category } });
    return response.data?.data || [];
  },

  getSecuritySettings: async () => {
    const response = await apiClient.get('/settings/security');
    return response.data?.data || {};
  },

  getAuditLogs: async (params?: { module?: string; severity?: string }): Promise<AuditLogItem[]> => {
    const response = await apiClient.get('/settings/audit', { params });
    return response.data?.data || [];
  }
};

export default settingsService;
