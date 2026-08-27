import { apiClient } from './api';
import {
  SalesOrder,
  SalesOrderFilters,
  SalesOrderFormPayload,
  SalesOrderActivity,
} from '../types/sales_order';

export interface SalesOrdersResponse {
  success: boolean;
  data: SalesOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleSalesOrderResponse {
  success: boolean;
  data: SalesOrder;
  message?: string;
}

export interface CreateFromQuotationResponse {
  success: boolean;
  data?: SalesOrder;
  message?: string;
  existingSalesOrderId?: string;
  existingOrderNumber?: string;
  error?: string;
}

export const salesOrderService = {
  /**
   * Fetch paginated list of sales orders with search and filters
   */
  async getSalesOrders(filters: SalesOrderFilters = {}): Promise<SalesOrdersResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.customer_id && filters.customer_id !== 'all') params.append('customer_id', filters.customer_id);
    if (filters.quotation_id && filters.quotation_id !== 'all') params.append('quotation_id', filters.quotation_id);
    if (filters.currency && filters.currency !== 'all') params.append('currency', filters.currency);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/sales-orders?${queryString}` : '/sales-orders';
    const response = await apiClient.get<SalesOrdersResponse>(endpoint);
    return response.data;
  },

  /**
   * Fetch single sales order details by ID
   */
  async getSalesOrderById(id: string): Promise<SingleSalesOrderResponse> {
    const response = await apiClient.get<SingleSalesOrderResponse>(`/sales-orders/${id}`);
    return response.data;
  },

  /**
   * Create a new manual sales order
   */
  async createSalesOrder(payload: SalesOrderFormPayload): Promise<SingleSalesOrderResponse> {
    const response = await apiClient.post<SingleSalesOrderResponse>('/sales-orders', payload);
    return response.data;
  },

  /**
   * Create sales order from an accepted quotation
   */
  async createSalesOrderFromQuotation(quotationId: string): Promise<CreateFromQuotationResponse> {
    const response = await apiClient.post<CreateFromQuotationResponse>(`/quotations/${quotationId}/create-sales-order`, {});
    return response.data;
  },

  /**
   * Update existing sales order
   */
  async updateSalesOrder(id: string, payload: SalesOrderFormPayload): Promise<SingleSalesOrderResponse> {
    const response = await apiClient.patch<SingleSalesOrderResponse>(`/sales-orders/${id}`, payload);
    return response.data;
  },

  /**
   * Update sales order workflow status
   */
  async updateStatus(id: string, status: string): Promise<SingleSalesOrderResponse> {
    const response = await apiClient.patch<SingleSalesOrderResponse>(`/sales-orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Fetch audit activity log for a sales order
   */
  async getActivityTimeline(id: string): Promise<{ success: boolean; data: SalesOrderActivity[] }> {
    const response = await apiClient.get<{ success: boolean; data: SalesOrderActivity[] }>(`/sales-orders/${id}/activity`);
    return response.data;
  },
};
