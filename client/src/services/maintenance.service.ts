import { apiClient } from './api';
import {
  Asset,
  MaintenanceSchedule,
  MaintenanceRequest,
  WorkOrder,
  WorkOrderChecklist,
  SparePartUsed,
  DowntimeLog,
  MaintenanceKPIs
} from '../types/maintenance';

export const maintenanceService = {
  // 1. Dashboard KPIs
  getDashboardKPIs: async (): Promise<MaintenanceKPIs> => {
    const res = await apiClient.get<{ success: boolean; data: MaintenanceKPIs }>('/maintenance/dashboard/kpis');
    return res.data.data;
  },

  // 2. Assets
  getAssets: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    criticality?: string;
    workCenterId?: string;
  }): Promise<{ data: Asset[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number } }> => {
    const res = await apiClient.get('/maintenance/assets', { params });
    return res.data;
  },

  getAssetById: async (id: string): Promise<Asset> => {
    const res = await apiClient.get<{ success: boolean; data: Asset }>(`/maintenance/assets/${id}`);
    return res.data.data;
  },

  createAsset: async (payload: Partial<Asset>): Promise<Asset> => {
    const res = await apiClient.post<{ success: boolean; data: Asset }>('/maintenance/assets', payload);
    return res.data.data;
  },

  updateAsset: async (id: string, payload: Partial<Asset>): Promise<Asset> => {
    const res = await apiClient.patch<{ success: boolean; data: Asset }>(`/maintenance/assets/${id}`, payload);
    return res.data.data;
  },

  // 3. Maintenance Schedules
  getMaintenanceSchedules: async (params?: {
    search?: string;
    assetId?: string;
    status?: string;
    type?: string;
  }): Promise<MaintenanceSchedule[]> => {
    const res = await apiClient.get<{ success: boolean; data: MaintenanceSchedule[] }>('/maintenance/schedules', { params });
    return res.data.data;
  },

  getMaintenanceScheduleById: async (id: string): Promise<MaintenanceSchedule> => {
    const res = await apiClient.get<{ success: boolean; data: MaintenanceSchedule }>(`/maintenance/schedules/${id}`);
    return res.data.data;
  },

  createMaintenanceSchedule: async (payload: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> => {
    const res = await apiClient.post<{ success: boolean; data: MaintenanceSchedule }>('/maintenance/schedules', payload);
    return res.data.data;
  },

  updateMaintenanceSchedule: async (id: string, payload: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> => {
    const res = await apiClient.patch<{ success: boolean; data: MaintenanceSchedule }>(`/maintenance/schedules/${id}`, payload);
    return res.data.data;
  },

  // 4. Maintenance Requests
  getMaintenanceRequests: async (params?: {
    search?: string;
    assetId?: string;
    status?: string;
    priority?: string;
  }): Promise<MaintenanceRequest[]> => {
    const res = await apiClient.get<{ success: boolean; data: MaintenanceRequest[] }>('/maintenance/requests', { params });
    return res.data.data;
  },

  createMaintenanceRequest: async (payload: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    const res = await apiClient.post<{ success: boolean; data: MaintenanceRequest }>('/maintenance/requests', payload);
    return res.data.data;
  },

  convertRequestToWorkOrder: async (
    requestId: string,
    payload: { assigned_to?: string; planned_start?: string; planned_end?: string; priority?: string }
  ): Promise<WorkOrder> => {
    const res = await apiClient.post<{ success: boolean; data: WorkOrder }>(`/maintenance/requests/${requestId}/convert`, payload);
    return res.data.data;
  },

  // 5. Work Orders
  getWorkOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    assetId?: string;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
  }): Promise<{ data: WorkOrder[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number } }> => {
    const res = await apiClient.get('/maintenance/work-orders', { params });
    return res.data;
  },

  getWorkOrderById: async (id: string): Promise<WorkOrder> => {
    const res = await apiClient.get<{ success: boolean; data: WorkOrder }>(`/maintenance/work-orders/${id}`);
    return res.data.data;
  },

  createWorkOrder: async (payload: Partial<WorkOrder> & { checklists?: Array<{ title: string; required?: boolean }> }): Promise<WorkOrder> => {
    const res = await apiClient.post<{ success: boolean; data: WorkOrder }>('/maintenance/work-orders', payload);
    return res.data.data;
  },

  startWorkOrder: async (id: string): Promise<WorkOrder> => {
    const res = await apiClient.post<{ success: boolean; data: WorkOrder }>(`/maintenance/work-orders/${id}/start`);
    return res.data.data;
  },

  completeWorkOrder: async (id: string, payload: { root_cause?: string; resolution?: string; notes?: string }): Promise<WorkOrder> => {
    const res = await apiClient.post<{ success: boolean; data: WorkOrder }>(`/maintenance/work-orders/${id}/complete`, payload);
    return res.data.data;
  },

  // 6. Spare Parts Consumption
  addWorkOrderPart: async (
    workOrderId: string,
    payload: { product_id: string; warehouse_id: string; location_id?: string; quantity: number; notes?: string }
  ): Promise<SparePartUsed> => {
    const res = await apiClient.post<{ success: boolean; data: SparePartUsed }>(`/maintenance/work-orders/${workOrderId}/parts`, payload);
    return res.data.data;
  },

  // 7. Checklists
  updateChecklistItem: async (checklistId: string, payload: { completed: boolean; notes?: string }): Promise<WorkOrderChecklist> => {
    const res = await apiClient.patch<{ success: boolean; data: WorkOrderChecklist }>(`/maintenance/checklists/${checklistId}`, payload);
    return res.data.data;
  },

  // 8. Downtime Logs
  getDowntimeLogs: async (params?: { search?: string; assetId?: string; status?: string }): Promise<DowntimeLog[]> => {
    const res = await apiClient.get<{ success: boolean; data: DowntimeLog[] }>('/maintenance/downtime', { params });
    return res.data.data;
  },

  createDowntimeLog: async (payload: { asset_id: string; work_order_id?: string; reason: string; start_time?: string; notes?: string }): Promise<DowntimeLog> => {
    const res = await apiClient.post<{ success: boolean; data: DowntimeLog }>('/maintenance/downtime', payload);
    return res.data.data;
  },

  closeDowntimeLog: async (id: string): Promise<DowntimeLog> => {
    const res = await apiClient.post<{ success: boolean; data: DowntimeLog }>(`/maintenance/downtime/${id}/close`);
    return res.data.data;
  },

  // 9. History
  getMaintenanceHistory: async (): Promise<WorkOrder[]> => {
    const res = await apiClient.get<{ success: boolean; data: WorkOrder[] }>('/maintenance/history');
    return res.data.data;
  }
};
