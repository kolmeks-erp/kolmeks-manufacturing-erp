-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: QUOTATION MANAGEMENT & AUDIT SCHEMA
-- Migration Script: 08_quotation_management_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.QUOTATIONS TABLE SAFELY (Preserving all existing records)
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS payment_terms TEXT,
  ADD COLUMN IF NOT EXISTS delivery_terms TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Relax status check constraint to support uppercase & additional ERP workflow statuses
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotations_status_check'
  ) THEN
    ALTER TABLE public.quotations DROP CONSTRAINT quotations_status_check;
  END IF;
END $$;

-- 2. EXTEND PUBLIC.QUOTATION_ITEMS TABLE SAFELY
ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS line_order INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) NOT NULL DEFAULT 'amount',
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS line_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- 3. CREATE PUBLIC.QUOTATION_ACTIVITIES TABLE (Audit Timeline Log)
CREATE TABLE IF NOT EXISTS public.quotation_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(150),
  activity_type VARCHAR(50) NOT NULL, -- e.g. 'CREATED', 'UPDATED', 'STATUS_CHANGED', 'APPROVED', 'REJECTED', 'SENT', 'CANCELLED'
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_activities ENABLE ROW LEVEL SECURITY;

-- Block anonymous access to quotations, line items, and audit logs
DROP POLICY IF EXISTS anon_no_select_quotations ON public.quotations;
CREATE POLICY anon_no_select_quotations ON public.quotations FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_quotation_items ON public.quotation_items;
CREATE POLICY anon_no_select_quotation_items ON public.quotation_items FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_quotation_activities ON public.quotation_activities;
CREATE POLICY anon_no_select_quotation_activities ON public.quotation_activities FOR SELECT TO anon USING (false);

-- Service Role Policies (Full Access)
DROP POLICY IF EXISTS service_role_all_quotations ON public.quotations;
CREATE POLICY service_role_all_quotations ON public.quotations FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_quotation_items ON public.quotation_items;
CREATE POLICY service_role_all_quotation_items ON public.quotation_items FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_quotation_activities ON public.quotation_activities;
CREATE POLICY service_role_all_quotation_activities ON public.quotation_activities FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
DROP POLICY IF EXISTS authenticated_all_quotations ON public.quotations;
CREATE POLICY authenticated_all_quotations ON public.quotations FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_quotation_items ON public.quotation_items;
CREATE POLICY authenticated_all_quotation_items ON public.quotation_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_quotation_activities ON public.quotation_activities;
CREATE POLICY authenticated_all_quotation_activities ON public.quotation_activities FOR ALL TO authenticated USING (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_quotations_number ON public.quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON public.quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON public.quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON public.quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_activities_quotation ON public.quotation_activities(quotation_id);
