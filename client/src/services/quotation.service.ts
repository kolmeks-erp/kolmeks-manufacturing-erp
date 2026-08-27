import { apiClient } from './api';
import {
  Quotation,
  QuotationFilters,
  QuotationListResponse,
  QuotationFormPayload,
  QuotationActivity,
} from '../types/quotation';

export const QuotationService = {
  /**
   * Fetch paginated list of quotations with search and multi-filters
   */
  async getQuotations(filters: QuotationFilters = {}): Promise<QuotationListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.customer_id && filters.customer_id !== 'all') params.append('customer_id', filters.customer_id);
    if (filters.rfq_id && filters.rfq_id !== 'all') params.append('rfq_id', filters.rfq_id);
    if (filters.currency && filters.currency !== 'all') params.append('currency', filters.currency);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<QuotationListResponse>(`/quotations?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch single quotation record by ID with line items and activities
   */
  async getQuotationById(id: string): Promise<{ success: boolean; data: Quotation }> {
    const response = await apiClient.get<{ success: boolean; data: Quotation }>(`/quotations/${id}`);
    return response.data;
  },

  /**
   * Create a new commercial quotation with line items
   */
  async createQuotation(payload: QuotationFormPayload): Promise<{ success: boolean; data: Quotation; message: string }> {
    const response = await apiClient.post<{ success: boolean; data: Quotation; message: string }>('/quotations', payload);
    return response.data;
  },

  /**
   * Update existing draft/under_review quotation
   */
  async updateQuotation(id: string, payload: Partial<QuotationFormPayload>): Promise<{ success: boolean; data: Quotation; message: string }> {
    const response = await apiClient.patch<{ success: boolean; data: Quotation; message: string }>(`/quotations/${id}`, payload);
    return response.data;
  },

  /**
   * Update quotation status (DRAFT, UNDER_REVIEW, APPROVED, SENT, ACCEPTED, REJECTED, EXPIRED, CANCELLED)
   */
  async updateStatus(id: string, status: string): Promise<{ success: boolean; data: Quotation; message: string }> {
    const response = await apiClient.patch<{ success: boolean; data: Quotation; message: string }>(`/quotations/${id}/status`, { status });
    return response.data;
  },

  /**
   * Fetch activity timeline log for a quotation
   */
  async getActivityTimeline(id: string): Promise<{ success: boolean; data: QuotationActivity[] }> {
    const response = await apiClient.get<{ success: boolean; data: QuotationActivity[] }>(`/quotations/${id}/activity`);
    return response.data;
  },
};
