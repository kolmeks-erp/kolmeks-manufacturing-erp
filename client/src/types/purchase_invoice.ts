import { Supplier } from './supplier';
import { Product } from './product';

export type PurchaseInvoiceStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'POSTED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOIDED'
  | 'CANCELLED';

export type MatchStatus =
  | 'MATCHED'
  | 'QUANTITY_VARIANCE'
  | 'PRICE_VARIANCE'
  | 'BOTH_VARIANCE'
  | 'PENDING_REVIEW'
  | 'APPROVED_EXCEPTION';

export interface PurchaseInvoiceLine {
  id?: string;
  invoice_id?: string;
  purchase_order_item_id?: string | null;
  grn_item_id?: string | null;
  product_id?: string | null;
  description: string;
  ordered_quantity?: number;
  received_quantity?: number;
  quantity: number; // Invoiced quantity
  unit?: string;
  po_unit_price?: number;
  unit_price: number; // Invoiced unit price
  discount?: number;
  tax_rate?: number;
  tax_amount?: number;
  line_subtotal?: number;
  line_total?: number;
  quantity_variance?: number;
  price_variance?: number;
  line_order?: number;
  product?: Product;
}

export interface PurchaseInvoice {
  id: string;
  internal_invoice_number: string;
  supplier_invoice_number: string;
  supplier_id: string;
  purchase_order_id?: string | null;
  grn_id?: string | null;
  invoice_date: string;
  due_date: string;
  currency: string;
  payment_terms?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: PurchaseInvoiceStatus;
  match_status: MatchStatus;
  journal_entry_id?: string | null;
  notes?: string;
  variance_reason?: string;
  supplier?: Supplier;
  purchase_order?: { id: string; po_number: string };
  grn?: { id: string; grn_number: string };
  journal_entry?: { id: string; entry_number: string; status: string };
  lines?: PurchaseInvoiceLine[];
  allocations?: SupplierPaymentAllocation[];
  created_at: string;
  updated_at: string;
}

export interface SupplierPayment {
  id: string;
  payment_number: string;
  supplier_id: string;
  bank_account_id?: string | null;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'OTHER';
  reference_number?: string | null;
  allocated_amount: number;
  unallocated_amount: number;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  journal_entry_id?: string | null;
  notes?: string;
  supplier?: Supplier;
  journal_entry?: { id: string; entry_number: string };
  allocations?: SupplierPaymentAllocation[];
  created_at: string;
  updated_at: string;
}

export interface SupplierPaymentAllocation {
  id: string;
  payment_id: string;
  purchase_invoice_id: string;
  allocated_amount: number;
  created_at: string;
  invoice?: PurchaseInvoice;
  payment?: SupplierPayment;
}

export interface PayablesSummary {
  summary: {
    total_payable: number;
    total_overdue: number;
    open_invoices_count: number;
    pending_approval_count: number;
  };
  invoices: PurchaseInvoice[];
}

export interface PayableAgingBucket {
  supplier_id: string;
  supplier_name: string;
  supplier_code?: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
  total: number;
}

export interface PayableAgingReport {
  as_of_date: string;
  summary: {
    current: number;
    days_1_30: number;
    days_31_60: number;
    days_61_90: number;
    days_90_plus: number;
    total: number;
  };
  by_supplier: PayableAgingBucket[];
}

export interface SupplierStatementEntry {
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface SupplierStatementData {
  supplier: Supplier;
  closing_balance: number;
  statement: SupplierStatementEntry[];
}
