export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOIDED'
  | 'CANCELLED';

export interface SalesInvoiceLine {
  id?: string;
  invoice_id?: string;
  sales_order_item_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: 'amount' | 'percentage';
  discount: number;
  tax_rate: number;
  tax_amount: number;
  line_subtotal: number;
  line_total: number;
  line_order?: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit_of_measure?: string;
  };
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  allocated_amount: number;
  created_at: string;
  invoice?: {
    id: string;
    invoice_number: string;
    invoice_date: string;
    total_amount: number;
    outstanding_amount: number;
    status: InvoiceStatus;
  };
  payment?: {
    id: string;
    payment_number: string;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
  };
}

export interface SalesInvoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  sales_order_id?: string;
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
  status: InvoiceStatus;
  journal_entry_id?: string;
  billing_address?: string;
  notes?: string;
  void_reason?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    company_name: string;
    customer_code?: string;
    email?: string;
    phone?: string;
    billing_address?: string;
  };
  sales_order?: {
    id: string;
    order_number: string;
    order_date?: string;
  };
  lines?: SalesInvoiceLine[];
  allocations?: PaymentAllocation[];
  journal_entry?: {
    id: string;
    entry_number: string;
    entry_date: string;
    status: string;
  };
}

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER';
export type PaymentStatus = 'DRAFT' | 'POSTED' | 'VOIDED';

export interface CustomerPayment {
  id: string;
  payment_number: string;
  customer_id: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  allocated_amount: number;
  unallocated_amount: number;
  status: PaymentStatus;
  journal_entry_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    company_name: string;
    customer_code?: string;
    email?: string;
  };
  allocations?: PaymentAllocation[];
  journal_entry?: {
    id: string;
    entry_number: string;
    entry_date: string;
    status: string;
  };
}

export interface ReceivablesSummary {
  summary: {
    total_outstanding: number;
    total_overdue: number;
    open_invoices_count: number;
  };
  invoices: SalesInvoice[];
}

export interface AgingBucketCustomer {
  customer_id: string;
  customer_name: string;
  customer_code: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
  total: number;
}

export interface ReceivableAgingReport {
  summary: {
    current: number;
    days_1_30: number;
    days_31_60: number;
    days_61_90: number;
    days_90_plus: number;
    total: number;
  };
  by_customer: AgingBucketCustomer[];
}

export interface CustomerStatementLine {
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerStatementData {
  customer: {
    id: string;
    company_name: string;
    customer_code?: string;
    email?: string;
    phone?: string;
    billing_address?: string;
  };
  statement: CustomerStatementLine[];
  closing_balance: number;
}
