import { apiClient } from './api';
import {
  Supplier,
  SupplierFormData,
  ContactFormData,
  SupplierContact,
  SupplierFilters,
  SupplierResponse,
  SupplierStatus,
  ContactStatus,
} from '../types/supplier';

export const SupplierService = {
  /**
   * Fetch supplier list with pagination, search, status, type, country, industry, and sorting
   */
  async getSuppliers(filters: SupplierFilters = {}): Promise<SupplierResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.country) params.append('country', filters.country);
    if (filters.supplier_type) params.append('supplier_type', filters.supplier_type);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<SupplierResponse>(`/suppliers?${params.toString()}`);
    return response.data;
  },

  /**
   * Check for potential duplicate suppliers
   */
  async checkDuplicate(companyName?: string, email?: string, website?: string): Promise<Supplier[]> {
    const params = new URLSearchParams();
    if (companyName) params.append('company_name', companyName);
    if (email) params.append('email', email);
    if (website) params.append('website', website);

    const response = await apiClient.get<{ success: boolean; duplicates: Supplier[] }>(
      `/suppliers/check-duplicate?${params.toString()}`
    );
    return response.data.duplicates || [];
  },

  /**
   * Fetch supplier profile by ID (with contacts)
   */
  async getSupplierById(id: string): Promise<Supplier> {
    const response = await apiClient.get<{ success: boolean; data: Supplier }>(`/suppliers/${id}`);
    return response.data.data;
  },

  /**
   * Create a new supplier record
   */
  async createSupplier(data: SupplierFormData): Promise<Supplier> {
    const response = await apiClient.post<{ success: boolean; data: Supplier }>('/suppliers', data);
    return response.data.data;
  },

  /**
   * Update an existing supplier record
   */
  async updateSupplier(id: string, data: Partial<SupplierFormData>): Promise<Supplier> {
    const response = await apiClient.put<{ success: boolean; data: Supplier }>(`/suppliers/${id}`, data);
    return response.data.data;
  },

  /**
   * Toggle supplier status (active, inactive, blocked, pending_approval)
   */
  async patchSupplierStatus(id: string, status: SupplierStatus): Promise<Supplier> {
    const response = await apiClient.patch<{ success: boolean; data: Supplier }>(`/suppliers/${id}/status`, { status });
    return response.data.data;
  },

  // ==============================================================================
  // CONTACTS SERVICES
  // ==============================================================================

  /**
   * Fetch contacts for supplier
   */
  async getContacts(supplierId: string): Promise<SupplierContact[]> {
    const response = await apiClient.get<{ success: boolean; data: SupplierContact[] }>(`/suppliers/${supplierId}/contacts`);
    return response.data.data;
  },

  /**
   * Create contact for supplier
   */
  async createContact(supplierId: string, data: ContactFormData): Promise<SupplierContact> {
    const response = await apiClient.post<{ success: boolean; data: SupplierContact }>(`/suppliers/${supplierId}/contacts`, data);
    return response.data.data;
  },

  /**
   * Update contact for supplier
   */
  async updateContact(supplierId: string, contactId: string, data: Partial<ContactFormData>): Promise<SupplierContact> {
    const response = await apiClient.put<{ success: boolean; data: SupplierContact }>(
      `/suppliers/${supplierId}/contacts/${contactId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Toggle contact status
   */
  async patchContactStatus(supplierId: string, contactId: string, status: ContactStatus): Promise<SupplierContact> {
    const response = await apiClient.patch<{ success: boolean; data: SupplierContact }>(
      `/suppliers/${supplierId}/contacts/${contactId}/status`,
      { status }
    );
    return response.data.data;
  },
};
