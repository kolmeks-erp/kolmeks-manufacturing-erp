-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: SUPPLIER & SUPPLIER CONTACTS MIGRATION
-- Migration Script: 06_suppliers_contacts_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.SUPPLIERS TABLE SAFELY (Preserving existing data)
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS supplier_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS legal_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
  ADD COLUMN IF NOT EXISTS supplier_type VARCHAR(50) DEFAULT 'COMPONENT',
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. SUPPLIER CODE SEQUENCE & AUTOMATED GENERATOR
CREATE SEQUENCE IF NOT EXISTS public.supplier_code_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_next_supplier_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.supplier_code_seq') INTO next_val;
  formatted_code := 'SUP-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

-- Backfill missing supplier_codes for pre-existing supplier records safely
DO $$
DECLARE
  s_rec RECORD;
BEGIN
  FOR s_rec IN SELECT id FROM public.suppliers WHERE supplier_code IS NULL OR supplier_code = '' LOOP
    UPDATE public.suppliers 
    SET supplier_code = public.generate_next_supplier_code() 
    WHERE id = s_rec.id;
  END LOOP;
END $$;

-- Enforce Unique constraint on supplier_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_supplier_code_key'
  ) THEN
    ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_supplier_code_key UNIQUE (supplier_code);
  END IF;
END $$;

-- 3. CREATE PUBLIC.SUPPLIER_CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Trigger for supplier_contacts updated_at
DROP TRIGGER IF EXISTS update_supplier_contacts_updated_at ON public.supplier_contacts;
CREATE TRIGGER update_supplier_contacts_updated_at
BEFORE UPDATE ON public.supplier_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to maintain a single primary contact per supplier
CREATE OR REPLACE FUNCTION public.handle_supplier_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.supplier_contacts
    SET is_primary = false
    WHERE supplier_id = NEW.supplier_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_primary_supplier_contact ON public.supplier_contacts;
CREATE TRIGGER ensure_single_primary_supplier_contact
BEFORE INSERT OR UPDATE ON public.supplier_contacts
FOR EACH ROW EXECUTE FUNCTION public.handle_supplier_primary_contact();

-- 4. RLS POLICIES FOR SUPPLIERS AND SUPPLIER_CONTACTS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Full Access)
DROP POLICY IF EXISTS service_role_all_suppliers ON public.suppliers;
CREATE POLICY service_role_all_suppliers ON public.suppliers FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_supplier_contacts ON public.supplier_contacts;
CREATE POLICY service_role_all_supplier_contacts ON public.supplier_contacts FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
DROP POLICY IF EXISTS authenticated_read_suppliers ON public.suppliers;
CREATE POLICY authenticated_read_suppliers ON public.suppliers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_write_suppliers ON public.suppliers;
CREATE POLICY authenticated_write_suppliers ON public.suppliers FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_supplier_contacts ON public.supplier_contacts;
CREATE POLICY authenticated_read_supplier_contacts ON public.supplier_contacts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_write_supplier_contacts ON public.supplier_contacts;
CREATE POLICY authenticated_write_supplier_contacts ON public.supplier_contacts FOR ALL TO authenticated USING (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_name ON public.suppliers(company_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON public.suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON public.suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON public.suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_industry ON public.suppliers(industry);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier ON public.supplier_contacts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_primary ON public.supplier_contacts(is_primary);
