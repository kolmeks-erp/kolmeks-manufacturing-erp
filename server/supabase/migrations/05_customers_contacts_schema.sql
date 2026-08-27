-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: CUSTOMER & CUSTOMER CONTACTS MIGRATION
-- Migration Script: 05_customers_contacts_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.CUSTOMERS TABLE SAFELY (Preserving existing data)
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS customer_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS legal_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. CUSTOMER CODE SEQUENCE & AUTOMATED GENERATOR
CREATE SEQUENCE IF NOT EXISTS public.customer_code_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_next_customer_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.customer_code_seq') INTO next_val;
  formatted_code := 'CUS-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

-- Backfill missing customer_codes for pre-existing customer records safely
DO $$
DECLARE
  c_rec RECORD;
BEGIN
  FOR c_rec IN SELECT id FROM public.customers WHERE customer_code IS NULL OR customer_code = '' LOOP
    UPDATE public.customers 
    SET customer_code = public.generate_next_customer_code() 
    WHERE id = c_rec.id;
  END LOOP;
END $$;

-- Enforce Unique constraint on customer_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_customer_code_key'
  ) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code);
  END IF;
END $$;

-- 3. CREATE PUBLIC.CUSTOMER_CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
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

-- Trigger for customer_contacts updated_at
DROP TRIGGER IF EXISTS update_customer_contacts_updated_at ON public.customer_contacts;
CREATE TRIGGER update_customer_contacts_updated_at
BEFORE UPDATE ON public.customer_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to maintain a single primary contact per customer
CREATE OR REPLACE FUNCTION public.handle_customer_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.customer_contacts
    SET is_primary = false
    WHERE customer_id = NEW.customer_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_primary_customer_contact ON public.customer_contacts;
CREATE TRIGGER ensure_single_primary_customer_contact
BEFORE INSERT OR UPDATE ON public.customer_contacts
FOR EACH ROW EXECUTE FUNCTION public.handle_customer_primary_contact();

-- 4. RLS POLICIES FOR CUSTOMERS AND CUSTOMER_CONTACTS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Full Access)
DROP POLICY IF EXISTS service_role_all_customers ON public.customers;
CREATE POLICY service_role_all_customers ON public.customers FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_customer_contacts ON public.customer_contacts;
CREATE POLICY service_role_all_customer_contacts ON public.customer_contacts FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
DROP POLICY IF EXISTS authenticated_read_customers ON public.customers;
CREATE POLICY authenticated_read_customers ON public.customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_write_customers ON public.customers;
CREATE POLICY authenticated_write_customers ON public.customers FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_customer_contacts ON public.customer_contacts;
CREATE POLICY authenticated_read_customer_contacts ON public.customer_contacts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_write_customer_contacts ON public.customer_contacts;
CREATE POLICY authenticated_write_customer_contacts ON public.customer_contacts FOR ALL TO authenticated USING (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON public.customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_country ON public.customers(country);
CREATE INDEX IF NOT EXISTS idx_customers_industry ON public.customers(industry);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer ON public.customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_primary ON public.customer_contacts(is_primary);
