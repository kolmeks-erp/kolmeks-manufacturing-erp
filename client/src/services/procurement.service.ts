import { apiClient } from './api';
import {
  PurchaseRequisition,
  PurchaseRequisitionFilters,
  PurchaseRequisitionFormPayload,
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderFormPayload,
  ProcurementActivity,
} from '../types/procurement';

export class ProcurementService {
  // ============================================================================
  // PURCHASE REQUISITION API METHODS
  // ============================================================================

  static async getRequisitions(filters: PurchaseRequisitionFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.department) params.append('department', filters.department);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.requested_by) params.append('requested_by', filters.requested_by);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<{
      success: boolean;
      data: PurchaseRequisition[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/purchase-requisitions?${params.toString()}`);

    return response.data;
  }

  static async getRequisitionById(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: PurchaseRequisition;
    }>(`/purchase-requisitions/${id}`);

    return response.data.data;
  }

  static async createRequisition(payload: PurchaseRequisitionFormPayload) {
    const response = await apiClient.post<{
      success: boolean;
      data: PurchaseRequisition;
      message: string;
    }>('/purchase-requisitions', payload);

    return response.data;
  }

  static async updateRequisition(id: string, payload: Partial<PurchaseRequisitionFormPayload>) {
    const response = await apiClient.patch<{
      success: boolean;
      data: PurchaseRequisition;
      message: string;
    }>(`/purchase-requisitions/${id}`, payload);

    return response.data;
  }

  static async updateRequisitionStatus(id: string, status: string) {
    const response = await apiClient.patch<{
      success: boolean;
      data: PurchaseRequisition;
      message: string;
    }>(`/purchase-requisitions/${id}/status`, { status });

    return response.data;
  }

  static async approveRequisition(id: string) {
    const response = await apiClient.post<{
      success: boolean;
      data: PurchaseRequisition;
      message: string;
    }>(`/purchase-requisitions/${id}/approve`, {});

    return response.data;
  }

  static async rejectRequisition(id: string, reason?: string) {
    const response = await apiClient.post<{
      success: boolean;
      data: PurchaseRequisition;
      message: string;
    }>(`/purchase-requisitions/${id}/reject`, { reason });

    return response.data;
  }

  static async convertRequisitionToPO(
    id: string,
    payload?: { supplier_id?: string; currency?: string; payment_terms?: string; delivery_terms?: string; notes?: string }
  ) {
    const response = await apiClient.post<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>(`/purchase-requisitions/${id}/create-purchase-order`, payload || {});

    return response.data;
  }

  static async getRequisitionActivities(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: ProcurementActivity[];
    }>(`/purchase-requisitions/${id}/activity`);

    return response.data.data;
  }

  // ============================================================================
  // PURCHASE ORDER API METHODS
  // ============================================================================

  static async getPurchaseOrders(filters: PurchaseOrderFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.requisition_id) params.append('requisition_id', filters.requisition_id);
    if (filters.currency) params.append('currency', filters.currency);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<{
      success: boolean;
      data: PurchaseOrder[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/purchase-orders?${params.toString()}`);

    return response.data;
  }

  static async getPurchaseOrderById(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: PurchaseOrder;
    }>(`/purchase-orders/${id}`);

    return response.data.data;
  }

  static async createPurchaseOrder(payload: PurchaseOrderFormPayload) {
    const response = await apiClient.post<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>('/purchase-orders', payload);

    return response.data;
  }

  static async updatePurchaseOrder(id: string, payload: Partial<PurchaseOrderFormPayload>) {
    const response = await apiClient.patch<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>(`/purchase-orders/${id}`, payload);

    return response.data;
  }

  static async updatePOStatus(id: string, status: string) {
    const response = await apiClient.patch<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>(`/purchase-orders/${id}/status`, { status });

    return response.data;
  }

  static async getPOActivities(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: ProcurementActivity[];
    }>(`/purchase-orders/${id}/activity`);

    return response.data.data;
  }
}
