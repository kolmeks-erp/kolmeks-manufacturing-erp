import { apiClient } from './api';
import {
  GoodsReceipt,
  GRNFilters,
  GRNFormPayload,
  GRNListResponse,
  EligiblePO,
  GoodsReceiptActivity,
} from '../types/grn';

export class GrnService {
  /**
   * Fetch eligible Purchase Orders for GRN creation
   */
  static async getEligiblePurchaseOrders() {
    const response = await apiClient.get<{
      success: boolean;
      data: EligiblePO[];
    }>('/purchase-orders/eligible-for-receiving');

    return response.data.data;
  }

  /**
   * Fetch paginated list of Goods Receipts
   */
  static async getGoodsReceipts(filters: GRNFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.purchase_order_id) params.append('purchase_order_id', filters.purchase_order_id);
    if (filters.receipt_date) params.append('receipt_date', filters.receipt_date);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<GRNListResponse>(`/goods-receipts?${params.toString()}`);

    return response.data;
  }

  /**
   * Fetch single Goods Receipt by ID
   */
  static async getGoodsReceiptById(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: GoodsReceipt;
    }>(`/goods-receipts/${id}`);

    return response.data.data;
  }

  /**
   * Create a new Goods Receipt note
   */
  static async createGoodsReceipt(payload: GRNFormPayload) {
    const response = await apiClient.post<{
      success: boolean;
      data: GoodsReceipt;
      message: string;
    }>('/goods-receipts', payload);

    return response.data;
  }

  /**
   * Update draft / in-progress Goods Receipt
   */
  static async updateGoodsReceipt(id: string, payload: Partial<GRNFormPayload>) {
    const response = await apiClient.patch<{
      success: boolean;
      data: GoodsReceipt;
      message: string;
    }>(`/goods-receipts/${id}`, payload);

    return response.data;
  }

  /**
   * Mark Goods Receipt as COMPLETED
   */
  static async completeGoodsReceipt(id: string) {
    const response = await apiClient.post<{
      success: boolean;
      data: GoodsReceipt;
      message: string;
    }>(`/goods-receipts/${id}/complete`, {});

    return response.data;
  }

  /**
   * Cancel Goods Receipt
   */
  static async cancelGoodsReceipt(id: string, reason?: string) {
    const response = await apiClient.post<{
      success: boolean;
      data: GoodsReceipt;
      message: string;
    }>(`/goods-receipts/${id}/cancel`, { reason });

    return response.data;
  }

  /**
   * Fetch GRN activity log timeline
   */
  static async getGRNActivities(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: GoodsReceiptActivity[];
    }>(`/goods-receipts/${id}/activity`);

    return response.data.data;
  }
}
