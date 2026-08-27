-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: SALES ORDER MANAGEMENT & AUDIT SCHEMA
-- Migration Script: 09_sales_order_management_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.SALES_ORDERS TABLE SAFELY (Preserving all existing records)
ALTER TABLE public.sales_orders
  ADD COLUMN IF NOT EXISTS rfq_id UUID REFERENCES public.rfqs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  ADD COLUMN IF NOT EXISTS customer_reference VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_terms TEXT,
  ADD COLUMN IF NOT EXISTS delivery_terms TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Relax status & priority check constraints to support uppercase & additional ERP workflow statuses
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_status_check'
  ) THEN
    ALTER TABLE public.sales_orders DROP CONSTRAINT sales_orders_status_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_orders_priority_check'
  ) THEN
    ALTER TABLE public.sales_orders DROP CONSTRAINT sales_orders_priority_check;
  END IF;
END $$;

-- 2. EXTEND PUBLIC.SALES_ORDER_ITEMS TABLE SAFELY
ALTER TABLE public.sales_order_items
  ADD COLUMN IF NOT EXISTS line_order INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) NOT NULL DEFAULT 'amount',
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS line_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- 3. CREATE PUBLIC.SALES_ORDER_ACTIVITIES TABLE (Audit Timeline Log)
CREATE TABLE IF NOT EXISTS public.sales_order_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(150),
  activity_type VARCHAR(50) NOT NULL, -- e.g. 'CREATED', 'CREATED_FROM_QUOTATION', 'UPDATED', 'STATUS_CHANGED', 'CONFIRMED', 'CANCELLED'
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_activities ENABLE ROW LEVEL SECURITY;

-- Block anonymous access to sales orders, line items, and audit logs
DROP POLICY IF EXISTS anon_no_select_sales_orders ON public.sales_orders;
CREATE POLICY anon_no_select_sales_orders ON public.sales_orders FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_sales_order_items ON public.sales_order_items;
CREATE POLICY anon_no_select_sales_order_items ON public.sales_order_items FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_sales_order_activities ON public.sales_order_activities;
CREATE POLICY anon_no_select_sales_order_activities ON public.sales_order_activities FOR SELECT TO anon USING (false);

-- Service Role Policies (Full Access)
DROP POLICY IF EXISTS service_role_all_sales_orders ON public.sales_orders;
CREATE POLICY service_role_all_sales_orders ON public.sales_orders FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_sales_order_items ON public.sales_order_items;
CREATE POLICY service_role_all_sales_order_items ON public.sales_order_items FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_sales_order_activities ON public.sales_order_activities;
CREATE POLICY service_role_all_sales_order_activities ON public.sales_order_activities FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
DROP POLICY IF EXISTS authenticated_all_sales_orders ON public.sales_orders;
CREATE POLICY authenticated_all_sales_orders ON public.sales_orders FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_sales_order_items ON public.sales_order_items;
CREATE POLICY authenticated_all_sales_order_items ON public.sales_order_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_sales_order_activities ON public.sales_order_activities;
CREATE POLICY authenticated_all_sales_order_activities ON public.sales_order_activities FOR ALL TO authenticated USING (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON public.sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON public.sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_quotation ON public.sales_orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_rfq ON public.sales_orders(rfq_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON public.sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_req_delivery ON public.sales_orders(requested_delivery_date);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order ON public.sales_order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_activities_order ON public.sales_order_activities(sales_order_id);
