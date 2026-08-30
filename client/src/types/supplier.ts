export type SupplierStatus = 'active' | 'inactive' | 'blocked' | 'pending_approval';
export type SupplierType = 'RAW_MATERIAL' | 'COMPONENT' | 'SERVICE' | 'EQUIPMENT' | 'LOGISTICS' | 'OTHER';
export type ContactStatus = 'active' | 'inactive';

export interface SupplierContact {
  id: string;
  supplier_id: string;
  first_name: string;
  last_name: string;
  job_title?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  is_primary: boolean;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface Supplier {
  id: string;
  supplier_code: string;
  company_name: string;
  supplier_name?: string;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  country: string;
  state?: string | null;
  city?: string | null;
  postal_code?: string | null;
  address?: string | null;
  industry?: string | null;
  supplier_type: SupplierType;
  payment_terms?: string | null;
  status: SupplierStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  contacts?: SupplierContact[];
}

export interface SupplierFormData {
  company_name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  industry?: string;
  supplier_type: SupplierType;
  status: SupplierStatus;
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

export interface SupplierFilters {
  search?: string;
  status?: string;
  country?: string;
  supplier_type?: string;
  industry?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SupplierResponse {
  success: boolean;
  data: Supplier[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
