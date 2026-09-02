export interface SalesDashboardKPIs {
  totalQuotationCount: number;
  totalQuotationValue: number;
  openOrdersCount: number;
  openOrdersValue: number;
  pendingDeliveries: number;
  deliveriesToday: number;
  totalReturnsCount: number;
  outstandingReceivables: number;
}

export interface SalesFunnelData {
  draftQuotations: number;
  approvedQuotations: number;
  confirmedOrders: number;
  totalOrders: number;
  deliveredOrders: number;
}

export interface SalesDashboardData {
  kpis: SalesDashboardKPIs;
  funnel: SalesFunnelData;
}

export interface AdvancedQuotationItem {
  id?: string;
  quotation_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: 'percentage' | 'amount';
  discount: number;
  tax_rate: number;
  tax: number;
  line_subtotal: number;
  line_total: number;
  line_order: number;
}

export interface AdvancedQuotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  opportunity_id?: string;
  rfq_id?: string;
  quotation_date: string;
  valid_until?: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer_master?: {
    id: string;
    company_name: string;
    customer_code?: string;
  };
  opportunity_master?: {
    id: string;
    title: string;
    stage: string;
    value: number;
  };
  items?: AdvancedQuotationItem[];
}

export interface AdvancedSalesOrderItem {
  id?: string;
  sales_order_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: 'percentage' | 'amount';
  discount: number;
  tax_rate: number;
  tax: number;
  line_subtotal: number;
  line_total: number;
  line_order: number;
  reserved_quantity: number;
  picked_quantity: number;
  packed_quantity: number;
  delivered_quantity: number;
  backorder_quantity: number;
}

export interface AdvancedSalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  quotation_id?: string;
  opportunity_id?: string;
  rfq_id?: string;
  warehouse_id?: string;
  order_date: string;
  requested_delivery_date?: string;
  delivery_date?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  customer_reference?: string;
  payment_terms?: string;
  delivery_terms?: string;
  notes?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'CONFIRMED' | 'IN_PRODUCTION' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'DELIVERED' | 'ON_HOLD' | 'CANCELLED' | 'CLOSED';
  is_approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer_master?: {
    id: string;
    company_name: string;
    customer_code?: string;
  };
  items?: AdvancedSalesOrderItem[];
}

export interface FulfillmentSummaryItem {
  id: string;
  order_number: string;
  customer_id: string;
  customer_reference?: string;
  order_date: string;
  delivery_date?: string;
  status: string;
  total: number;
  totalOrdered: number;
  totalReserved: number;
  totalDelivered: number;
  totalBackorder: number;
  fulfillmentPct: number;
}

export interface PickingList {
  id: string;
  picking_number: string;
  sales_order_id: string;
  warehouse_id: string;
  picker_id?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PARTIALLY_PICKED' | 'PICKED' | 'CANCELLED';
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface PackingList {
  id: string;
  packing_number: string;
  sales_order_id: string;
  picking_id?: string;
  packer_id?: string;
  total_packages: number;
  total_weight_kg: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PACKED' | 'CANCELLED';
  notes?: string;
  packed_at?: string;
  created_at: string;
}

export interface DeliveryOrder {
  id: string;
  delivery_number: string;
  sales_order_id: string;
  customer_id: string;
  warehouse_id?: string;
  packing_id?: string;
  delivery_address?: string;
  carrier?: string;
  tracking_reference?: string;
  dispatch_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'DRAFT' | 'READY' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'FAILED' | 'CANCELLED';
  proof_reference?: string;
  notes?: string;
  created_at: string;
  customer_master?: {
    id: string;
    company_name: string;
  };
  items?: {
    id: string;
    product_id: string;
    quantity: number;
  }[];
}

export interface SalesReturn {
  id: string;
  return_number: string;
  sales_order_id?: string;
  delivery_id?: string;
  customer_id: string;
  return_date: string;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'RECEIVED' | 'INSPECTING' | 'ACCEPTED' | 'REJECTED' | 'CREDITED' | 'CLOSED';
  notes?: string;
  created_at: string;
}

export interface CreditNote {
  id: string;
  credit_note_number: string;
  sales_return_id?: string;
  invoice_id?: string;
  customer_id: string;
  credit_date: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  notes?: string;
  created_at: string;
}

export interface PricingRule {
  id: string;
  product_id: string;
  customer_id?: string;
  base_price: number;
  min_quantity: number;
  discount_percentage: number;
  currency: string;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
}
