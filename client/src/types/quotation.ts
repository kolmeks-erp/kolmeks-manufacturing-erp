export type QuotationStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | string;

export interface QuotationItemLine {
  id?: string;
  quotation_id?: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type?: 'amount' | 'percentage';
  discount: number;
  tax_rate?: number;
  tax?: number;
  line_subtotal?: number;
  line_total: number;
  line_order?: number;
  product_master?: {
    id: string;
    name: string;
    product_code: string;
    drawing_number?: string;
    revision?: string;
  } | null;
}

export interface QuotationActivity {
  id: string;
  quotation_id: string;
  actor_id?: string | null;
  actor_name: string;
  activity_type: string;
  description: string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  rfq_id?: string | null;
  quotation_date: string;
  valid_until?: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: QuotationStatus;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  delivery_time?: string | null;
  terms?: string | null;
  notes?: string | null;
  created_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relationships
  customer_master?: {
    id: string;
    company_name: string;
    customer_code: string;
    email?: string;
    phone?: string;
  } | null;

  rfq_master?: {
    id: string;
    rfq_number: string;
    component_name?: string;
    requirement_type?: string;
  } | null;

  creator_user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;

  approver_user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;

  items?: QuotationItemLine[];
  activities?: QuotationActivity[];
}

export interface QuotationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer_id?: string;
  rfq_id?: string;
  currency?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuotationListResponse {
  success: boolean;
  data: Quotation[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuotationFormPayload {
  customer_id: string;
  rfq_id?: string | null;
  quotation_date?: string;
  valid_until?: string | null;
  currency: string;
  payment_terms?: string;
  delivery_terms?: string;
  delivery_time?: string;
  terms?: string;
  notes?: string;
  items: Array<{
    product_id?: string | null;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_type: 'amount' | 'percentage';
    discount: number;
    tax_rate: number;
  }>;
}
