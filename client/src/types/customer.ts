export type CustomerStatus = 'active' | 'inactive' | 'blocked';
export type ContactStatus = 'active' | 'inactive';

export interface CustomerContact {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  status: ContactStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CustomerLinkedRFQ {
  id: string;
  rfq_number: string;
  component_name?: string;
  requirement_type?: string;
  status: string;
  created_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  company_name: string;
  legal_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  country: string;
  state?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  billing_address?: string;
  payment_terms?: string;
  industry?: string;
  tax_id?: string;
  status: CustomerStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;

  // Joined relationships
  contacts?: CustomerContact[];
  rfqs?: CustomerLinkedRFQ[];
}

export interface CustomerFormData {
  customer_code?: string;
  company_name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  country: string;
  state?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  industry?: string;
  status: CustomerStatus;
  notes?: string;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  job_title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  status: ContactStatus;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  country?: string;
  industry?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerResponse {
  success: boolean;
  data: Customer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
