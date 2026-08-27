import { apiClient } from './api';
import {
  WorkCenter,
  Machine,
  BOM,
  Routing,
  ProductionOrder,
  ProductionSummary,
  ProductionFilterParams,
  CreateWorkCenterPayload,
  CreateMachinePayload,
  CreateBOMPayload,
  CreateRoutingPayload,
  CreateProductionOrderPayload,
  RecordMaterialConsumptionPayload,
  RecordProductionOutputPayload,
  MachineStatus,
  WorkCenterStatus,
} from '../types/production';

export const productionService = {
  // Telemetry Summary
  async getSummary(): Promise<ProductionSummary> {
    const res = await apiClient.get<{ success: boolean; data: ProductionSummary }>('/production/summary');
    return res.data.data;
  },

  // Work Centers
  async getWorkCenters(params?: { status?: string; search?: string }): Promise<WorkCenter[]> {
    const res = await apiClient.get<{ success: boolean; data: WorkCenter[] }>('/production/work-centers', { params });
    return res.data.data;
  },

  async createWorkCenter(payload: CreateWorkCenterPayload): Promise<WorkCenter> {
    const res = await apiClient.post<{ success: boolean; data: WorkCenter }>('/production/work-centers', payload);
    return res.data.data;
  },

  async updateWorkCenter(id: string, payload: Partial<CreateWorkCenterPayload>): Promise<WorkCenter> {
    const res = await apiClient.patch<{ success: boolean; data: WorkCenter }>(`/production/work-centers/${id}`, payload);
    return res.data.data;
  },

  async toggleWorkCenterStatus(id: string, status: WorkCenterStatus): Promise<WorkCenter> {
    const res = await apiClient.patch<{ success: boolean; data: WorkCenter }>(`/production/work-centers/${id}/status`, { status });
    return res.data.data;
  },

  // Machines
  async getMachines(params?: { work_center_id?: string; status?: string; search?: string }): Promise<Machine[]> {
    const res = await apiClient.get<{ success: boolean; data: Machine[] }>('/production/machines', { params });
    return res.data.data;
  },

  async createMachine(payload: CreateMachinePayload): Promise<Machine> {
    const res = await apiClient.post<{ success: boolean; data: Machine }>('/production/machines', payload);
    return res.data.data;
  },

  async updateMachine(id: string, payload: Partial<CreateMachinePayload>): Promise<Machine> {
    const res = await apiClient.patch<{ success: boolean; data: Machine }>(`/production/machines/${id}`, payload);
    return res.data.data;
  },

  async updateMachineStatus(id: string, status: MachineStatus): Promise<Machine> {
    const res = await apiClient.patch<{ success: boolean; data: Machine }>(`/production/machines/${id}/status`, { status });
    return res.data.data;
  },

  // BOMs
  async getBOMs(params?: { product_id?: string; status?: string; search?: string }): Promise<BOM[]> {
    const res = await apiClient.get<{ success: boolean; data: BOM[] }>('/production/boms', { params });
    return res.data.data;
  },

  async getBOMById(id: string): Promise<BOM> {
    const res = await apiClient.get<{ success: boolean; data: BOM }>(`/production/boms/${id}`);
    return res.data.data;
  },

  async createBOM(payload: CreateBOMPayload): Promise<BOM> {
    const res = await apiClient.post<{ success: boolean; data: BOM }>('/production/boms', payload);
    return res.data.data;
  },

  async activateBOM(id: string): Promise<BOM> {
    const res = await apiClient.post<{ success: boolean; data: BOM }>(`/production/boms/${id}/activate`);
    return res.data.data;
  },

  // Routings
  async getRoutings(params?: { product_id?: string; status?: string; search?: string }): Promise<Routing[]> {
    const res = await apiClient.get<{ success: boolean; data: Routing[] }>('/production/routings', { params });
    return res.data.data;
  },

  async getRoutingById(id: string): Promise<Routing> {
    const res = await apiClient.get<{ success: boolean; data: Routing }>(`/production/routings/${id}`);
    return res.data.data;
  },

  async createRouting(payload: CreateRoutingPayload): Promise<Routing> {
    const res = await apiClient.post<{ success: boolean; data: Routing }>('/production/routings', payload);
    return res.data.data;
  },

  // Production Orders
  async getOrders(params?: ProductionFilterParams): Promise<{
    data: ProductionOrder[];
    pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: ProductionOrder[];
      pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
    }>('/production/orders', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  async getOrderById(id: string): Promise<ProductionOrder> {
    const res = await apiClient.get<{ success: boolean; data: ProductionOrder }>(`/production/orders/${id}`);
    return res.data.data;
  },

  async createOrder(payload: CreateProductionOrderPayload): Promise<ProductionOrder> {
    const res = await apiClient.post<{ success: boolean; data: ProductionOrder }>('/production/orders', payload);
    return res.data.data;
  },

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<ProductionOrder> {
    const res = await apiClient.patch<{ success: boolean; data: ProductionOrder }>(`/production/orders/${id}/status`, { status, notes });
    return res.data.data;
  },

  async updateOperationStatus(
    operationId: string,
    payload: { status?: string; completed_quantity?: number; rejected_quantity?: number; operator_id?: string; notes?: string }
  ): Promise<any> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/production/operations/${operationId}/status`, payload);
    return res.data.data;
  },

  async recordMaterialConsumption(id: string, payload: RecordMaterialConsumptionPayload): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/production/orders/${id}/material-consumption`, payload);
    return res.data.data;
  },

  async recordProductionOutput(id: string, payload: RecordProductionOutputPayload): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/production/orders/${id}/output`, payload);
    return res.data.data;
  },
};
