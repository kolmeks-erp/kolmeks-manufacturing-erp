export type GRNStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface GoodsReceiptItem {
  id: string;
  goods_receipt_id: string;
  purchase_order_item_id: string;
  product_id?: string | null;
  description: string;
  ordered_quantity: number;
  previously_received_quantity: number;
  received_quantity: number;
  rejected_quantity: number;
  accepted_quantity: number;
  unit: string;
  rejection_reason?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  product_master?: {
    id: string;
    name: string;
    product_code: string;
    drawing_number?: string;
  } | null;
}

export interface GoodsReceiptActivity {
  id: string;
  goods_receipt_id: string;
  action: string;
  performed_by?: string | null;
  details?: Record<string, any>;
  created_at: string;
}

export interface GoodsReceiptTotals {
  total_ordered: number;
  total_previously_received: number;
  total_received: number;
  total_rejected: number;
  total_accepted: number;
  item_count?: number;
}

export interface GoodsReceipt {
  id: string;
  grn_number: string;
  purchase_order_id: string;
  supplier_id: string;
  receipt_date: string;
  delivery_reference?: string | null;
  received_by?: string | null;
  warehouse_id?: string | null;
  status: GRNStatus;
  notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: string;
    supplier_code: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  purchase_order?: {
    id: string;
    po_number: string;
    status: string;
  } | null;
  warehouse?: {
    id: string;
    code: string;
    name: string;
    location?: string;
  } | null;
  receiver_user?: {
    id: string;
    full_name: string;
    email: string;
    department?: string;
  } | null;
  creator_user?: {
    id: string;
    full_name: string;
    email: string;
    department?: string;
  } | null;
  items?: GoodsReceiptItem[];
  activities?: GoodsReceiptActivity[];
  totals?: GoodsReceiptTotals;
}

export interface GRNFilters {
  search?: string;
  status?: string;
  supplier_id?: string;
  purchase_order_id?: string;
  receipt_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GRNListResponse {
  success: boolean;
  data: GoodsReceipt[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GRNItemInput {
  purchase_order_item_id: string;
  received_quantity: number;
  rejected_quantity: number;
  rejection_reason?: string;
  notes?: string;
}

export interface GRNFormPayload {
  purchase_order_id: string;
  receipt_date: string;
  delivery_reference?: string;
  warehouse_id?: string;
  notes?: string;
  items: GRNItemInput[];
}

export interface EligiblePOItem {
  id: string;
  purchase_order_id: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  received_quantity: number;
  ordered_quantity: number;
  previously_received_quantity: number;
  remaining_quantity: number;
  unit: string;
  unit_price: number;
  product_master?: {
    id: string;
    name: string;
    product_code: string;
  } | null;
}

export interface EligiblePO {
  id: string;
  po_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery?: string | null;
  status: string;
  total: number;
  currency: string;
  supplier?: {
    id: string;
    supplier_code: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  items: EligiblePOItem[];
  total_remaining_quantity: number;
}
