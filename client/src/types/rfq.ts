export type RFQStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'NEED_MORE_INFORMATION'
  | 'QUOTATION_PREPARATION'
  | 'QUOTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED'
  | 'CANCELLED'
  | string;

export interface RFQAttachment {
  id: string;
  rfq_id: string;
  file_name: string;
  original_filename?: string;
  file_url: string;
  cloudinary_public_id?: string;
  resource_type?: string;
  file_type?: string;
  mime_type?: string;
  file_size?: number;
  created_at: string;
}

export interface RFQNote {
  id: string;
  rfq_id: string;
  author_id?: string;
  author_name: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface RFQActivity {
  id: string;
  rfq_id: string;
  actor_id?: string;
  actor_name: string;
  activity_type: string;
  description: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface RFQItem {
  id: string;
  rfq_number: string;
  full_name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  requirement_type: string;
  other_requirement?: string;
  component_name: string;
  description: string;
  quantity: number;
  unit: string;
  target_date?: string;
  material?: string;
  surface_finish?: string;
  tolerance_requirements?: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  customer_id?: string;
  product_id?: string;
  created_at: string;
  updated_at: string;

  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  } | null;

  customer_master?: {
    id: string;
    company_name: string;
    customer_code: string;
    email?: string;
    phone?: string;
    country?: string;
  } | null;

  product_master?: {
    id: string;
    name: string;
    product_code: string;
    drawing_number?: string;
    revision?: string;
  } | null;

  attachments?: RFQAttachment[];
  notes?: RFQNote[];
  activities?: RFQActivity[];
}

export interface RFQFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  requirement_type?: string;
  assigned_to?: string;
  customer_id?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RFQListResponse {
  success: boolean;
  data: RFQItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RFQDetailResponse {
  success: boolean;
  data: RFQItem;
}
