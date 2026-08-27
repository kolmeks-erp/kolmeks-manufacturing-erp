export type SalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY_FOR_DELIVERY'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED'
  | string;

export type SalesOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string;

export interface SalesOrderItemLine {
  id?: string;
  sales_order_id?: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: 'amount' | 'percentage';
  discount: number;
  tax_rate: number;
  tax?: number;
  line_subtotal?: number;
  line_total?: number;
  line_order?: number;
  product_master?: {
    id: string;
    name: string;
    product_code: string;
    drawing_number?: string;
    revision?: string;
  } | null;
}

export interface SalesOrderActivity {
  id: string;
  sales_order_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  activity_type: string;
  description: string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  quotation_id?: string | null;
  rfq_id?: string | null;
  order_date: string;
  requested_delivery_date?: string | null;
  delivery_date?: string | null;
  priority: SalesOrderPriority;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  customer_reference?: string | null;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  notes?: string | null;
  status: SalesOrderStatus;
  created_by?: string | null;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
  customer_master?: {
    id: string;
    company_name: string;
    customer_code?: string;
    email?: string;
    phone?: string;
  } | null;
  quotation_master?: {
    id: string;
    quotation_number: string;
    status: string;
    total: number;
    currency: string;
  } | null;
  rfq_master?: {
    id: string;
    rfq_number: string;
    project_name?: string;
    requirement_type?: string;
  } | null;
  creator_user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
  confirmer_user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
  items?: SalesOrderItemLine[];
  activities?: SalesOrderActivity[];
}

export interface SalesOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  customer_id?: string;
  quotation_id?: string;
  currency?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalesOrderFormPayload {
  customer_id: string;
  quotation_id?: string | null;
  rfq_id?: string | null;
  order_date?: string;
  requested_delivery_date?: string | null;
  priority?: string;
  currency?: string;
  customer_reference?: string;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  items: SalesOrderItemLine[];
}
