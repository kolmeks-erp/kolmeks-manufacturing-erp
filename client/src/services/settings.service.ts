import axios from 'axios';
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

const API_BASE = '/api/settings';

export const settingsService = {
  getDashboardTelemetry: async (): Promise<AdminTelemetry> => {
    const response = await axios.get(`${API_BASE}/dashboard`);
    return response.data.data;
  },

  getOrganizationProfile: async (): Promise<OrganizationProfile> => {
    const response = await axios.get(`${API_BASE}/organization`);
    return response.data.data;
  },

  updateOrganizationProfile: async (payload: OrganizationProfile): Promise<OrganizationProfile> => {
    const response = await axios.put(`${API_BASE}/organization`, payload);
    return response.data.data;
  },

  getLocations: async (): Promise<LocationItem[]> => {
    const response = await axios.get(`${API_BASE}/locations`);
    return response.data.data;
  },

  saveLocation: async (payload: Partial<LocationItem>): Promise<LocationItem> => {
    const url = payload.id ? `${API_BASE}/locations/${payload.id}` : `${API_BASE}/locations`;
    const method = payload.id ? 'put' : 'post';
    const response = await axios[method](url, payload);
    return response.data.data;
  },

  getDepartments: async (): Promise<DepartmentItem[]> => {
    const response = await axios.get(`${API_BASE}/departments`);
    return response.data.data;
  },

  saveDepartment: async (payload: Partial<DepartmentItem>): Promise<DepartmentItem> => {
    const url = payload.id ? `${API_BASE}/departments/${payload.id}` : `${API_BASE}/departments`;
    const method = payload.id ? 'put' : 'post';
    const response = await axios[method](url, payload);
    return response.data.data;
  },

  getUsers: async (): Promise<UserItem[]> => {
    const response = await axios.get(`${API_BASE}/users`);
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<UserItem> => {
    const response = await axios.put(`${API_BASE}/users/${userId}/status`, { status });
    return response.data.data;
  },

  updateUserRole: async (userId: string, roleId: string): Promise<UserItem> => {
    const response = await axios.put(`${API_BASE}/users/${userId}/role`, { roleId });
    return response.data.data;
  },

  getRoles: async (): Promise<RoleItem[]> => {
    const response = await axios.get(`${API_BASE}/roles`);
    return response.data.data;
  },

  saveRole: async (payload: Partial<RoleItem>): Promise<RoleItem> => {
    const url = payload.id ? `${API_BASE}/roles/${payload.id}` : `${API_BASE}/roles`;
    const method = payload.id ? 'put' : 'post';
    const response = await axios[method](url, payload);
    return response.data.data;
  },

  getPermissions: async (): Promise<PermissionItem[]> => {
    const response = await axios.get(`${API_BASE}/permissions`);
    return response.data.data;
  },

  getNumberingSequences: async (): Promise<NumberingSequence[]> => {
    const response = await axios.get(`${API_BASE}/numbering`);
    return response.data.data;
  },

  updateNumberingSequence: async (id: string, payload: Partial<NumberingSequence>): Promise<NumberingSequence> => {
    const response = await axios.put(`${API_BASE}/numbering/${id}`, payload);
    return response.data.data;
  },

  getCurrencies: async (): Promise<CurrencyItem[]> => {
    const response = await axios.get(`${API_BASE}/currencies`);
    return response.data.data;
  },

  saveCurrency: async (payload: Partial<CurrencyItem>): Promise<CurrencyItem> => {
    const url = payload.id ? `${API_BASE}/currencies/${payload.id}` : `${API_BASE}/currencies`;
    const method = payload.id ? 'put' : 'post';
    const response = await axios[method](url, payload);
    return response.data.data;
  },

  getUnits: async (): Promise<UnitItem[]> => {
    const response = await axios.get(`${API_BASE}/units`);
    return response.data.data;
  },

  saveUnit: async (payload: Partial<UnitItem>): Promise<UnitItem> => {
    const url = payload.id ? `${API_BASE}/units/${payload.id}` : `${API_BASE}/units`;
    const method = payload.id ? 'put' : 'post';
    const response = await axios[method](url, payload);
    return response.data.data;
  },

  getMasterDataOptions: async (category?: string): Promise<MasterOption[]> => {
    const response = await axios.get(`${API_BASE}/masters`, { params: { category } });
    return response.data.data;
  },

  getSecuritySettings: async () => {
    const response = await axios.get(`${API_BASE}/security`);
    return response.data.data;
  },

  getAuditLogs: async (params?: { module?: string; severity?: string }): Promise<AuditLogItem[]> => {
    const response = await axios.get(`${API_BASE}/audit`, { params });
    return response.data.data;
  }
};
