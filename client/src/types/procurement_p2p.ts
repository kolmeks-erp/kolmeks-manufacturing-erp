export interface SupplierEvaluation {
  id: string;
  supplier_id: string;
  evaluator_id?: string;
  evaluation_date: string;
  quality_score: number;
  delivery_score: number;
  price_score: number;
  service_score: number;
  overall_score: number;
  remarks?: string;
  created_at: string;
  evaluator?: {
    full_name?: string;
    email?: string;
  };
}

export interface SupplierDocument {
  id: string;
  supplier_id: string;
  document_name: string;
  category: 'Certification' | 'Agreement' | 'Compliance' | 'Banking' | 'Other';
  file_path: string;
  expiry_date?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  uploaded_by?: string;
  created_at: string;
}

export interface SupplierQuotationItem {
  id?: string;
  supplier_quotation_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percentage: number;
  line_subtotal: number;
}

export interface SupplierQuotation {
  id: string;
  quotation_number: string;
  supplier_reference?: string;
  rfq_id?: string;
  supplier_id: string;
  quote_date: string;
  validity_date?: string;
  lead_time_days: number;
  delivery_date?: string;
  currency: string;
  payment_terms: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'DRAFT' | 'RECEIVED' | 'UNDER_REVIEW' | 'SELECTED' | 'REJECTED' | 'EXPIRED';
  remarks?: string;
  supplier?: {
    id: string;
    company_name: string;
    supplier_code: string;
    rating?: number;
    overall_score?: number;
  };
  items?: SupplierQuotationItem[];
  isLowestPrice?: boolean;
}

export interface PurchaseOrderAmendment {
  id: string;
  purchase_order_id: string;
  amendment_number: number;
  field_name: string;
  old_value?: string;
  new_value?: string;
  reason: string;
  changed_by?: string;
  approved_by?: string;
  created_at: string;
}

export interface SupplierReturnItem {
  id?: string;
  supplier_return_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  reason?: string;
}

export interface SupplierReturn {
  id: string;
  return_number: string;
  supplier_id: string;
  goods_receipt_id?: string;
  purchase_order_id?: string;
  return_date: string;
  reason: string;
  status: 'DRAFT' | 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'COMPLETED' | 'REJECTED';
  total_amount: number;
  notes?: string;
  created_at: string;
  supplier?: {
    company_name: string;
    supplier_code: string;
  };
  items?: SupplierReturnItem[];
}

export interface ThreeWayMatchResult {
  invoiceId: string;
  matchStatus: 'MATCHED' | 'QUANTITY_VARIANCE' | 'PRICE_VARIANCE' | 'BOTH_VARIANCE' | 'PENDING_REVIEW';
  hasPriceVariance: boolean;
  hasQtyVariance: boolean;
  poReference: string;
  grnReference: string;
}

export interface ProcurementTelemetry {
  openRequisitionsCount: number;
  openRFQsCount: number;
  pendingQuotesCount: number;
  openPOsCount: number;
  pendingReceiptsCount: number;
  qualityHoldsCount: number;
  supplierReturnsCount: number;
  outstandingAPAmount: number;
}
