-- ============================================================================
-- KOLMEKS ERP — PURCHASE INVOICING & ACCOUNTS PAYABLE SCHEMA
-- Migration: 19_purchase_invoicing_ap_schema.sql
-- Prompt 29: Purchase Invoicing + Accounts Payable + Supplier Payments + Aging
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SAFETY CHECK: Do NOT drop or truncate any existing tables.
-- Only create new tables or safely add columns if not already existing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PURCHASE INVOICES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core identifiers
    internal_invoice_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_invoice_number VARCHAR(100) NOT NULL,

    -- Relationships
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    grn_id UUID REFERENCES public.goods_receipts(id) ON DELETE SET NULL,

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,

    -- Financial
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_terms TEXT,

    -- Calculated Amounts (server-calculated, stored for performance)
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,

    -- Workflow & Match Status
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED', 'CANCELLED')),
    match_status VARCHAR(30) NOT NULL DEFAULT 'MATCHED'
        CHECK (match_status IN ('MATCHED', 'QUANTITY_VARIANCE', 'PRICE_VARIANCE', 'BOTH_VARIANCE', 'PENDING_REVIEW', 'APPROVED_EXCEPTION')),

    -- Accounting integration
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,

    -- Notes & Variance Exception Notes
    notes TEXT,
    variance_reason TEXT,

    -- Audit & Approvals
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id),
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,

    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate supplier invoices from same supplier
    CONSTRAINT unq_supplier_invoice_no UNIQUE (supplier_id, supplier_invoice_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pi_internal_no ON public.purchase_invoices(internal_invoice_number);
CREATE INDEX IF NOT EXISTS idx_pi_supplier_no ON public.purchase_invoices(supplier_invoice_number);
CREATE INDEX IF NOT EXISTS idx_pi_supplier ON public.purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_pi_po ON public.purchase_invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_pi_grn ON public.purchase_invoices(grn_id);
CREATE INDEX IF NOT EXISTS idx_pi_date ON public.purchase_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_pi_due ON public.purchase_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_pi_status ON public.purchase_invoices(status);
CREATE INDEX IF NOT EXISTS idx_pi_match ON public.purchase_invoices(match_status);

-- ----------------------------------------------------------------------------
-- 2. PURCHASE INVOICE LINES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id) ON DELETE CASCADE,
    purchase_order_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
    grn_item_id UUID REFERENCES public.goods_receipt_items(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

    -- Details
    description TEXT NOT NULL,
    ordered_quantity NUMERIC(12, 4) DEFAULT 0.00,
    received_quantity NUMERIC(12, 4) DEFAULT 0.00,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'Pcs',

    po_unit_price NUMERIC(15, 4) DEFAULT 0.00,
    unit_price NUMERIC(15, 4) NOT NULL CHECK (unit_price >= 0),

    discount NUMERIC(15, 4) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(15, 4) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),

    line_subtotal NUMERIC(15, 4) NOT NULL CHECK (line_subtotal >= 0),
    line_total NUMERIC(15, 4) NOT NULL CHECK (line_total >= 0),

    quantity_variance NUMERIC(12, 4) DEFAULT 0.00,
    price_variance NUMERIC(15, 4) DEFAULT 0.00,

    line_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pil_invoice ON public.purchase_invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_pil_product ON public.purchase_invoice_lines(product_id);

-- ----------------------------------------------------------------------------
-- 3. INTERNAL PURCHASE INVOICE NUMBER SEQUENCE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.purchase_invoice_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_purchase_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    seq_val BIGINT;
    year_str TEXT;
BEGIN
    SELECT nextval('public.purchase_invoice_seq') INTO seq_val;
    year_str := TO_CHAR(NOW(), 'YYYY');
    RETURN 'PINV-' || year_str || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. SUPPLIER PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Unique payment number
    payment_number VARCHAR(50) UNIQUE NOT NULL,

    -- Relationships
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    bank_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,

    -- Details
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    reference_number VARCHAR(200),

    allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (allocated_amount >= 0),
    unallocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'POSTED', 'VOIDED')),

    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,

    notes TEXT,

    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,

    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_spay_allocation CHECK (allocated_amount <= amount)
);

CREATE INDEX IF NOT EXISTS idx_spay_number ON public.supplier_payments(payment_number);
CREATE INDEX IF NOT EXISTS idx_spay_supplier ON public.supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_spay_date ON public.supplier_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_spay_status ON public.supplier_payments(status);

-- ----------------------------------------------------------------------------
-- 5. SUPPLIER PAYMENT NUMBER SEQUENCE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.supplier_payment_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_supplier_payment_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    seq_val BIGINT;
    year_str TEXT;
BEGIN
    SELECT nextval('public.supplier_payment_seq') INTO seq_val;
    year_str := TO_CHAR(NOW(), 'YYYY');
    RETURN 'SPAY-' || year_str || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 6. SUPPLIER PAYMENT ALLOCATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.supplier_payments(id) ON DELETE CASCADE,
    purchase_invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(15, 2) NOT NULL CHECK (allocated_amount > 0),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unq_spay_alloc UNIQUE (payment_id, purchase_invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_spala_payment ON public.supplier_payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_spala_invoice ON public.supplier_payment_allocations(purchase_invoice_id);

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payment_allocations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read purchase invoicing & AP tables
CREATE POLICY "Authenticated users can read purchase invoices"
    ON public.purchase_invoices FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can read purchase invoice lines"
    ON public.purchase_invoice_lines FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can read supplier payments"
    ON public.supplier_payments FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can read supplier payment allocations"
    ON public.supplier_payment_allocations FOR SELECT
    TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete purchase invoicing & AP data
CREATE POLICY "Authenticated users can insert purchase invoices"
    ON public.purchase_invoices FOR INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase invoices"
    ON public.purchase_invoices FOR UPDATE
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert purchase invoice lines"
    ON public.purchase_invoice_lines FOR INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase invoice lines"
    ON public.purchase_invoice_lines FOR UPDATE
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete purchase invoice lines"
    ON public.purchase_invoice_lines FOR DELETE
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert supplier payments"
    ON public.supplier_payments FOR INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update supplier payments"
    ON public.supplier_payments FOR UPDATE
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert supplier payment allocations"
    ON public.supplier_payment_allocations FOR INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete supplier payment allocations"
    ON public.supplier_payment_allocations FOR DELETE
    TO authenticated USING (true);
