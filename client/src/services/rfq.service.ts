import { apiClient } from './api';
import {
  RFQFilters,
  RFQListResponse,
  RFQDetailResponse,
  RFQItem,
  RFQNote,
  RFQActivity,
} from '../types/rfq';

export interface RFQFormPayload {
  full_name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  requirement_type: string;
  other_requirement?: string;
  project_name: string;
  description: string;
  estimated_quantity: number;
  unit: string;
  target_delivery_date?: string;
  material?: string;
  surface_finish?: string;
  tolerance_requirements?: string;
  hp_field?: string; // Honeypot field
  files?: File[];
}

export interface RFQResponseData {
  requestNumber: string;
  id: string;
  createdAt: string;
  filesAttachedCount: number;
}

export interface RFQSubmissionResponse {
  success: boolean;
  message: string;
  data: RFQResponseData;
}

/**
 * Public RFQ submission API call (Prompt 11)
 */
export const submitRFQPayload = async (payload: RFQFormPayload): Promise<RFQSubmissionResponse> => {
  const formData = new FormData();

  formData.append('full_name', payload.full_name);
  formData.append('company', payload.company);
  formData.append('email', payload.email);
  if (payload.phone) formData.append('phone', payload.phone);
  formData.append('country', payload.country);
  formData.append('requirement_type', payload.requirement_type);
  if (payload.other_requirement) formData.append('other_requirement', payload.other_requirement);
  formData.append('project_name', payload.project_name);
  formData.append('description', payload.description);
  formData.append('estimated_quantity', payload.estimated_quantity.toString());
  formData.append('unit', payload.unit || 'Pcs');
  if (payload.target_delivery_date) formData.append('target_delivery_date', payload.target_delivery_date);
  if (payload.material) formData.append('material', payload.material);
  if (payload.surface_finish) formData.append('surface_finish', payload.surface_finish);
  if (payload.tolerance_requirements) formData.append('tolerance_requirements', payload.tolerance_requirements);
  if (payload.hp_field) formData.append('hp_field', payload.hp_field);

  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.post<RFQSubmissionResponse>('/rfq', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
  });

  return response.data;
};

/**
 * Internal ERP RFQ Management API Service
 */
export const RFQService = {
  getRFQs: async (filters: RFQFilters = {}): Promise<RFQListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.requirement_type) params.append('requirement_type', filters.requirement_type);
    if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<RFQListResponse>(`/rfqs?${params.toString()}`);
    return response.data;
  },

  getRFQById: async (id: string): Promise<RFQDetailResponse> => {
    const response = await apiClient.get<RFQDetailResponse>(`/rfqs/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<{ success: boolean; message: string; data: RFQItem }> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: RFQItem }>(`/rfqs/${id}/status`, { status });
    return response.data;
  },

  updateAssignment: async (id: string, assigned_to: string | null): Promise<{ success: boolean; message: string; data: RFQItem }> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: RFQItem }>(`/rfqs/${id}/assignment`, { assigned_to });
    return response.data;
  },

  linkCustomer: async (id: string, customer_id: string | null): Promise<{ success: boolean; message: string; data: RFQItem }> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: RFQItem }>(`/rfqs/${id}/customer`, { customer_id });
    return response.data;
  },

  linkProduct: async (id: string, product_id: string | null): Promise<{ success: boolean; message: string; data: RFQItem }> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: RFQItem }>(`/rfqs/${id}/product`, { product_id });
    return response.data;
  },

  getNotes: async (id: string): Promise<{ success: boolean; data: RFQNote[] }> => {
    const response = await apiClient.get<{ success: boolean; data: RFQNote[] }>(`/rfqs/${id}/notes`);
    return response.data;
  },

  addNote: async (id: string, note: string): Promise<{ success: boolean; data: RFQNote; message: string }> => {
    const response = await apiClient.post<{ success: boolean; data: RFQNote; message: string }>(`/rfqs/${id}/notes`, { note });
    return response.data;
  },

  getActivity: async (id: string): Promise<{ success: boolean; data: RFQActivity[] }> => {
    const response = await apiClient.get<{ success: boolean; data: RFQActivity[] }>(`/rfqs/${id}/activity`);
    return response.data;
  },
};
