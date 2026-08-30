-- ============================================================================
-- KOLMEKS ERP — SALES INVOICING & ACCOUNTS RECEIVABLE SCHEMA
-- Migration: 18_sales_invoicing_ar_schema.sql
-- Prompt 28: Sales Invoicing + Accounts Receivable + Customer Payments
-- ============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SAFETY CHECK: Do NOT drop or truncate any existing tables.
-- Only create new tables or safely add columns if not already existing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SALES INVOICES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core identifiers
    invoice_number VARCHAR(50) UNIQUE NOT NULL,

    -- Relationships
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,

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

    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED', 'CANCELLED')),

    -- Accounting integration
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,

    -- References and notes
    billing_address TEXT,
    notes TEXT,

    -- Void tracking
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,

    -- Audit
    issued_at TIMESTAMPTZ,
    issued_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_si_number ON public.sales_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_si_customer ON public.sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_si_sales_order ON public.sales_invoices(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_si_invoice_date ON public.sales_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_si_due_date ON public.sales_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_si_status ON public.sales_invoices(status);

-- ----------------------------------------------------------------------------
-- 2. SALES INVOICE LINES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
    sales_order_item_id UUID REFERENCES public.sales_order_items(id) ON DELETE SET NULL,

    -- Product reference (optional, some invoices are service-based)
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

    -- Line details
    description TEXT NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'Pcs',
    unit_price NUMERIC(15, 4) NOT NULL CHECK (unit_price >= 0),

    -- Discount
    discount_type VARCHAR(20) NOT NULL DEFAULT 'amount' CHECK (discount_type IN ('amount', 'percentage')),
    discount NUMERIC(15, 4) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),

    -- Tax (configurable, no hardcoded rates)
    tax_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(15, 4) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),

    -- Calculated
    line_subtotal NUMERIC(15, 4) NOT NULL CHECK (line_subtotal >= 0),
    line_total NUMERIC(15, 4) NOT NULL CHECK (line_total >= 0),

    -- Ordering
    line_order INT NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sil_invoice ON public.sales_invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sil_product ON public.sales_invoice_lines(product_id);

-- ----------------------------------------------------------------------------
-- 3. INVOICE NUMBER SEQUENCE (Safe, atomic, DB-level)
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.sales_invoice_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    seq_val BIGINT;
    year_str TEXT;
BEGIN
    SELECT nextval('public.sales_invoice_seq') INTO seq_val;
    year_str := TO_CHAR(NOW(), 'YYYY');
    RETURN 'INV-' || year_str || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. CUSTOMER PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Unique payment identifier
    payment_number VARCHAR(50) UNIQUE NOT NULL,

    -- Relationships
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,

    -- Payment details
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    -- Method (extensible, not hardcoded)
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    reference_number VARCHAR(200),

    -- Allocation tracking
    allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (allocated_amount >= 0),
    unallocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'POSTED', 'VOIDED')),

    -- Accounting integration
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    -- Void tracking
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,

    -- Audit
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Financial constraint: allocated <= amount
    CONSTRAINT chk_payment_allocation CHECK (allocated_amount <= amount)
);

CREATE INDEX IF NOT EXISTS idx_cp_number ON public.customer_payments(payment_number);
CREATE INDEX IF NOT EXISTS idx_cp_customer ON public.customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_cp_date ON public.customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_cp_status ON public.customer_payments(status);

-- ----------------------------------------------------------------------------
-- 5. PAYMENT NUMBER SEQUENCE (Safe, atomic, DB-level)
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.customer_payment_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    seq_val BIGINT;
    year_str TEXT;
BEGIN
    SELECT nextval('public.customer_payment_seq') INTO seq_val;
    year_str := TO_CHAR(NOW(), 'YYYY');
    RETURN 'PAY-' || year_str || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 6. PAYMENT ALLOCATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payment_id UUID NOT NULL REFERENCES public.customer_payments(id) ON DELETE RESTRICT,
    invoice_id UUID NOT NULL REFERENCES public.sales_invoices(id) ON DELETE RESTRICT,

    allocated_amount NUMERIC(15, 2) NOT NULL CHECK (allocated_amount > 0),

    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate allocation of same payment to same invoice
    CONSTRAINT uq_payment_invoice UNIQUE (payment_id, invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_pa_payment ON public.payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_pa_invoice ON public.payment_allocations(invoice_id);

-- ----------------------------------------------------------------------------
-- 7. AUTO-UPDATE TIMESTAMPS
-- ----------------------------------------------------------------------------
-- Reuse existing update_updated_at_column function from earlier migrations

DROP TRIGGER IF EXISTS update_sales_invoices_updated_at ON public.sales_invoices;
CREATE TRIGGER update_sales_invoices_updated_at
BEFORE UPDATE ON public.sales_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_payments_updated_at ON public.customer_payments;
CREATE TRIGGER update_customer_payments_updated_at
BEFORE UPDATE ON public.customer_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;

-- Block anonymous access to all financial records
DROP POLICY IF EXISTS anon_no_sales_invoices ON public.sales_invoices;
CREATE POLICY anon_no_sales_invoices ON public.sales_invoices FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS anon_no_sales_invoice_lines ON public.sales_invoice_lines;
CREATE POLICY anon_no_sales_invoice_lines ON public.sales_invoice_lines FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS anon_no_customer_payments ON public.customer_payments;
CREATE POLICY anon_no_customer_payments ON public.customer_payments FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS anon_no_payment_allocations ON public.payment_allocations;
CREATE POLICY anon_no_payment_allocations ON public.payment_allocations FOR ALL TO anon USING (false);

-- Service role full access
DROP POLICY IF EXISTS service_role_all_sales_invoices ON public.sales_invoices;
CREATE POLICY service_role_all_sales_invoices ON public.sales_invoices FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_sales_invoice_lines ON public.sales_invoice_lines;
CREATE POLICY service_role_all_sales_invoice_lines ON public.sales_invoice_lines FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_customer_payments ON public.customer_payments;
CREATE POLICY service_role_all_customer_payments ON public.customer_payments FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_payment_allocations ON public.payment_allocations;
CREATE POLICY service_role_all_payment_allocations ON public.payment_allocations FOR ALL TO service_role USING (true);

-- Authenticated users read/write access (backend enforces role-based permissions)
DROP POLICY IF EXISTS auth_all_sales_invoices ON public.sales_invoices;
CREATE POLICY auth_all_sales_invoices ON public.sales_invoices FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS auth_all_sales_invoice_lines ON public.sales_invoice_lines;
CREATE POLICY auth_all_sales_invoice_lines ON public.sales_invoice_lines FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS auth_all_customer_payments ON public.customer_payments;
CREATE POLICY auth_all_customer_payments ON public.customer_payments FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS auth_all_payment_allocations ON public.payment_allocations;
CREATE POLICY auth_all_payment_allocations ON public.payment_allocations FOR ALL TO authenticated USING (true);
