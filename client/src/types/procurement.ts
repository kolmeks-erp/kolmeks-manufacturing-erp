export type PurchaseRequisitionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CONVERTED';

export type PurchaseRequisitionPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ACKNOWLEDGED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'ON_HOLD'
  | 'CANCELLED';

export interface PurchaseRequisitionItemLine {
  id?: string;
  requisition_id?: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit: string;
  required_date?: string | null;
  estimated_unit_cost?: number;
  notes?: string;
  line_order?: number;
  product_master?: {
    id: string;
    name: string;
    product_code: string;
    drawing_number?: string;
  } | null;
}

export interface PurchaseRequisition {
  id: string;
  requisition_number: string;
  requested_by: string;
  department: string;
  request_date: string;
  required_date?: string | null;
  priority: PurchaseRequisitionPriority;
  reason: string;
  status: PurchaseRequisitionStatus;
  notes?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  requester_user?: {
    id: string;
    full_name: string;
    email?: string;
    department?: string;
  } | null;
  approver_user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
  rejecter_user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
  items?: PurchaseRequisitionItemLine[];
  item_count?: number;
  linked_po?: {
    id: string;
    po_number: string;
    status: string;
  } | null;
}

export interface PurchaseRequisitionFilters {
  search?: string;
  status?: string;
  department?: string;
  priority?: string;
  requested_by?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseRequisitionFormPayload {
  department: string;
  request_date: string;
  required_date?: string | null;
  priority: PurchaseRequisitionPriority;
  reason: string;
  notes?: string;
  items: Array<{
    product_id?: string | null;
    description: string;
    quantity: number;
    unit: string;
    required_date?: string | null;
    estimated_unit_cost?: number;
    notes?: string;
  }>;
}

export interface PurchaseOrderItemLine {
  id?: string;
  purchase_order_id?: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type?: 'amount' | 'percentage';
  discount?: number;
  tax_rate?: number;
  line_subtotal?: number;
  line_tax?: number;
  line_total?: number;
  line_order?: number;
  product_master?: {
    id: string;
    name: string;
    product_code: string;
    drawing_number?: string;
  } | null;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  requisition_id?: string | null;
  order_date: string;
  expected_delivery?: string | null;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  supplier_reference?: string | null;
  notes?: string | null;
  status: PurchaseOrderStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  supplier_master?: {
    id: string;
    company_name: string;
    supplier_code: string;
  } | null;
  requisition_master?: {
    id: string;
    requisition_number: string;
    department?: string;
    reason?: string;
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
  items?: PurchaseOrderItemLine[];
}

export interface PurchaseOrderFilters {
  search?: string;
  status?: string;
  supplier_id?: string;
  requisition_id?: string;
  currency?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseOrderFormPayload {
  supplier_id: string;
  requisition_id?: string | null;
  order_date: string;
  expected_delivery?: string | null;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  currency?: string;
  payment_terms?: string;
  delivery_terms?: string;
  supplier_reference?: string;
  notes?: string;
  items: Array<{
    product_id?: string | null;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_type?: 'amount' | 'percentage';
    discount?: number;
    tax_rate?: number;
  }>;
}

export interface ProcurementActivity {
  id: string;
  requisition_id?: string;
  purchase_order_id?: string;
  user_id?: string | null;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}
