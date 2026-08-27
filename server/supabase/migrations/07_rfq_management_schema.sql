-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: RFQ MANAGEMENT & INTERNAL AUDIT SCHEMA
-- Migration Script: 07_rfq_management_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.RFQS TABLE SAFELY (Preserving all existing records)
ALTER TABLE public.rfqs
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Relax status check constraint to support both existing and standard ERP statuses
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rfqs_status_check'
  ) THEN
    ALTER TABLE public.rfqs DROP CONSTRAINT rfqs_status_check;
  END IF;
END $$;

-- 2. CREATE PUBLIC.RFQ_NOTES TABLE
CREATE TABLE IF NOT EXISTS public.rfq_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(150),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for rfq_notes updated_at
DROP TRIGGER IF EXISTS update_rfq_notes_updated_at ON public.rfq_notes;
CREATE TRIGGER update_rfq_notes_updated_at
BEFORE UPDATE ON public.rfq_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. CREATE PUBLIC.RFQ_ACTIVITIES TABLE (Audit Timeline Log)
CREATE TABLE IF NOT EXISTS public.rfq_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(150),
  activity_type VARCHAR(50) NOT NULL, -- e.g. 'CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'CUSTOMER_LINKED', 'PRODUCT_LINKED', 'NOTE_ADDED'
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.rfq_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_activities ENABLE ROW LEVEL SECURITY;

-- Block anonymous access to private internal notes and audit logs
DROP POLICY IF EXISTS anon_no_select_rfq_notes ON public.rfq_notes;
CREATE POLICY anon_no_select_rfq_notes ON public.rfq_notes FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_rfq_activities ON public.rfq_activities;
CREATE POLICY anon_no_select_rfq_activities ON public.rfq_activities FOR SELECT TO anon USING (false);

-- Service Role Policies (Full Access)
DROP POLICY IF EXISTS service_role_all_rfq_notes ON public.rfq_notes;
CREATE POLICY service_role_all_rfq_notes ON public.rfq_notes FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_rfq_activities ON public.rfq_activities;
CREATE POLICY service_role_all_rfq_activities ON public.rfq_activities FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
DROP POLICY IF EXISTS authenticated_all_rfq_notes ON public.rfq_notes;
CREATE POLICY authenticated_all_rfq_notes ON public.rfq_notes FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_rfq_activities ON public.rfq_activities;
CREATE POLICY authenticated_all_rfq_activities ON public.rfq_activities FOR ALL TO authenticated USING (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON public.rfqs(created_at);
CREATE INDEX IF NOT EXISTS idx_rfqs_assigned_to ON public.rfqs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_rfqs_customer_id ON public.rfqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_product_id ON public.rfqs(product_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_number ON public.rfqs(rfq_number);
CREATE INDEX IF NOT EXISTS idx_rfq_notes_rfq ON public.rfq_notes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_activities_rfq ON public.rfq_activities(rfq_id);
