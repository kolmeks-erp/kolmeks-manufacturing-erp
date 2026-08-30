import { apiClient } from './api';

export interface SystemFeatureFlag {
  id?: string;
  key: string;
  label: string;
  category: string;
  description?: string;
  is_enabled: boolean;
  updated_at?: string;
}

export interface AdminUserControlItem {
  id: string;
  email: string;
  full_name?: string;
  is_active?: boolean;
  is_master_admin?: boolean;
  created_at?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export const systemSettingsService = {
  /**
   * Fetch all feature flags (ON/OFF status per module)
   */
  async getFeatureFlags(): Promise<SystemFeatureFlag[]> {
    const res = await apiClient.get('/system/feature-flags');
    return res.data.data || [];
  },

  /**
   * Toggle a module ON/OFF
   */
  async toggleFeatureFlag(key: string, is_enabled: boolean): Promise<SystemFeatureFlag> {
    const res = await apiClient.put('/system/feature-flags/toggle', { key, is_enabled });
    return res.data.data;
  },

  /**
   * Fetch users list for Master Admin management
   */
  async getUsersForControl(): Promise<AdminUserControlItem[]> {
    const res = await apiClient.get('/system/users');
    return res.data.data || [];
  },

  /**
   * Toggle user active status (Enable / Disable account)
   */
  async toggleUserActive(userId: string, is_active: boolean): Promise<AdminUserControlItem> {
    const res = await apiClient.put(`/system/users/${userId}/toggle-active`, { is_active });
    return res.data.data;
  }
};
