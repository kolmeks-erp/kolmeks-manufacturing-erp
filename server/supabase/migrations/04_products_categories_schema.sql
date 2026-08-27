-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: PRODUCT & PRODUCT CATEGORY MASTER MIGRATION
-- Migration Script: 04_products_categories_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.CATEGORIES TABLE SAFELY
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Seed initial product categories if none exist
INSERT INTO public.categories (name, description, status)
VALUES
  ('CNC Components', 'Precision CNC machined components, shafts, and housings', 'active'),
  ('Assemblies', 'Sub-assemblies, mechanical modules, and integrated components', 'active'),
  ('Electric Motor Components', 'Stators, rotors, motor frames, and winding parts', 'active'),
  ('Engineering Components', 'Custom engineered tooling, fixtures, and specialized parts', 'active'),
  ('Raw Materials', 'Raw metal bars, castings, forgings, and stock materials', 'active'),
  ('Finished Products', 'Completed pumps, motors, and ready-to-ship products', 'active'),
  ('Other', 'Miscellaneous tools, accessories, and unclassified items', 'active')
ON CONFLICT (name) DO NOTHING;

-- 2. EXTEND PUBLIC.PRODUCTS TABLE SAFELY
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS material VARCHAR(100),
  ADD COLUMN IF NOT EXISTS part_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Remove rigid product_type check constraint if it exists to allow standard ERP product types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_product_type_check' 
    AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products DROP CONSTRAINT products_product_type_check;
  END IF;
END $$;

-- Re-add flexible product_type check constraint
ALTER TABLE public.products 
  ADD CONSTRAINT products_product_type_check 
  CHECK (product_type IN ('component', 'assembly', 'finished_product', 'raw_material', 'service', 'other', 'motor_part', 'custom'));

-- 3. PRODUCT CODE SEQUENCE AND GENERATOR
CREATE SEQUENCE IF NOT EXISTS public.product_code_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_next_product_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.product_code_seq') INTO next_val;
  formatted_code := 'PRD-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

-- 4. RLS POLICIES FOR CATEGORIES AND PRODUCTS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Service Role (Full Access)
DROP POLICY IF EXISTS service_role_all_categories ON public.categories;
CREATE POLICY service_role_all_categories ON public.categories FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_products ON public.products;
CREATE POLICY service_role_all_products ON public.products FOR ALL TO service_role USING (true);

-- Authenticated Staff Access
DROP POLICY IF EXISTS authenticated_read_categories ON public.categories;
CREATE POLICY authenticated_read_categories ON public.categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_write_categories ON public.categories;
CREATE POLICY authenticated_write_categories ON public.categories FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_products ON public.products;
CREATE POLICY authenticated_read_products ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_write_products ON public.products;
CREATE POLICY authenticated_write_products ON public.products FOR ALL TO authenticated USING (true);

-- Indexes for optimal lookup and filtering
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_part_number ON public.products(part_number);
