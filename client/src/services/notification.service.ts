import apiClient from './api';
import {
  NotificationItem,
  ReminderItem,
  NotificationPreference,
  NotificationTypeItem,
  NotificationReportData,
} from '../types/notification';

const API_BASE = '/notifications';

export const notificationService = {
  // Fetch real-time unread count
  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get(`${API_BASE}/unread-count`);
    return res.data?.count || 0;
  },

  // List notifications with filters & pagination
  getNotifications: async (params?: {
    tab?: 'all' | 'unread' | 'mentions' | 'approvals' | 'reminders';
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: NotificationItem[]; total: number }> => {
    const res = await apiClient.get(API_BASE, { params });
    return {
      data: res.data?.data || [],
      total: res.data?.pagination?.total || 0,
    };
  },

  // Get single notification by ID
  getNotificationById: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.get(`${API_BASE}/${id}`);
    return res.data?.data;
  },

  // Mark single as read
  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.put(`${API_BASE}/${id}/read`, {});
    return res.data?.data;
  },

  // Mark single as unread
  markAsUnread: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.put(`${API_BASE}/${id}/unread`, {});
    return res.data?.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(`${API_BASE}/mark-all-read`, {});
  },

  // Dismiss notification
  dismissNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${id}/dismiss`);
  },

  // Reminders API
  getReminders: async (status?: string): Promise<ReminderItem[]> => {
    const res = await apiClient.get(`${API_BASE}/reminders`, {
      params: { status },
    });
    return res.data?.data || [];
  },

  createReminder: async (payload: {
    title: string;
    description?: string;
    due_date: string;
    reminder_time?: string;
    priority?: string;
    related_module?: string;
    related_record_id?: string;
    related_route?: string;
  }): Promise<ReminderItem> => {
    const res = await apiClient.post(`${API_BASE}/reminders`, payload);
    return res.data?.data;
  },

  updateReminderStatus: async (id: string, status: 'COMPLETED' | 'DISMISSED' | 'PENDING'): Promise<ReminderItem> => {
    const res = await apiClient.put(`${API_BASE}/reminders/${id}/status`, { status });
    return res.data?.data;
  },

  // User Notification Preferences API
  getPreferences: async (): Promise<NotificationPreference> => {
    const res = await apiClient.get(`${API_BASE}/preferences`);
    return res.data?.data;
  },

  updatePreferences: async (payload: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    const res = await apiClient.put(`${API_BASE}/preferences`, payload);
    return res.data?.data;
  },

  // Notification Types Metadata
  getNotificationTypes: async (): Promise<NotificationTypeItem[]> => {
    const res = await apiClient.get(`${API_BASE}/types`);
    return res.data?.data || [];
  },

  // Executive Reports
  getNotificationReports: async (): Promise<NotificationReportData> => {
    const res = await apiClient.get(`${API_BASE}/reports`);
    return res.data?.data;
  },
};
