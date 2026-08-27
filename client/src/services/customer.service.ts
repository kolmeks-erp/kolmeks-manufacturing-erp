import { apiClient } from './api';
import {
  Customer,
  CustomerFormData,
  ContactFormData,
  CustomerContact,
  CustomerFilters,
  CustomerResponse,
  CustomerStatus,
  ContactStatus,
} from '../types/customer';

export const CustomerService = {
  /**
   * Fetch customer list with pagination, filters, and search
   */
  async getCustomers(filters: CustomerFilters = {}): Promise<CustomerResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.country) params.append('country', filters.country);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<CustomerResponse>(`/customers?${params.toString()}`);
    return response.data;
  },

  /**
   * Check for potential duplicate customers
   */
  async checkDuplicate(companyName?: string, email?: string, website?: string): Promise<Customer[]> {
    const params = new URLSearchParams();
    if (companyName) params.append('company_name', companyName);
    if (email) params.append('email', email);
    if (website) params.append('website', website);

    const response = await apiClient.get<{ success: boolean; duplicates: Customer[] }>(
      `/customers/check-duplicate?${params.toString()}`
    );
    return response.data.duplicates || [];
  },

  /**
   * Fetch customer profile by ID (with contacts and linked RFQs)
   */
  async getCustomerById(id: string): Promise<Customer> {
    const response = await apiClient.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
    return response.data.data;
  },

  /**
   * Create a new customer record
   */
  async createCustomer(data: CustomerFormData): Promise<Customer> {
    const response = await apiClient.post<{ success: boolean; data: Customer }>('/customers', data);
    return response.data.data;
  },

  /**
   * Update an existing customer record
   */
  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    const response = await apiClient.put<{ success: boolean; data: Customer }>(`/customers/${id}`, data);
    return response.data.data;
  },

  /**
   * Toggle customer status (active, inactive, blocked)
   */
  async patchCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
    const response = await apiClient.patch<{ success: boolean; data: Customer }>(`/customers/${id}/status`, { status });
    return response.data.data;
  },

  // ==============================================================================
  // CONTACTS SERVICES
  // ==============================================================================

  /**
   * Fetch contacts for customer
   */
  async getContacts(customerId: string): Promise<CustomerContact[]> {
    const response = await apiClient.get<{ success: boolean; data: CustomerContact[] }>(`/customers/${customerId}/contacts`);
    return response.data.data;
  },

  /**
   * Create contact for customer
   */
  async createContact(customerId: string, data: ContactFormData): Promise<CustomerContact> {
    const response = await apiClient.post<{ success: boolean; data: CustomerContact }>(`/customers/${customerId}/contacts`, data);
    return response.data.data;
  },

  /**
   * Update contact for customer
   */
  async updateContact(customerId: string, contactId: string, data: Partial<ContactFormData>): Promise<CustomerContact> {
    const response = await apiClient.put<{ success: boolean; data: CustomerContact }>(
      `/customers/${customerId}/contacts/${contactId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Toggle contact status
   */
  async patchContactStatus(customerId: string, contactId: string, status: ContactStatus): Promise<CustomerContact> {
    const response = await apiClient.patch<{ success: boolean; data: CustomerContact }>(
      `/customers/${customerId}/contacts/${contactId}/status`,
      { status }
    );
    return response.data.data;
  },
};
