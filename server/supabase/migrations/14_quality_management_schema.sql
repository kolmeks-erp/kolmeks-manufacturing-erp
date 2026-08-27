-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: QUALITY MANAGEMENT & INSPECTION MODULE SCHEMA
-- Migration Script: 14_quality_management_schema.sql
-- ==============================================================================

-- 1. INSPECTION PLANS HEADER TABLE
CREATE TABLE IF NOT EXISTS public.inspection_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL DEFAULT 'V1',
  inspection_type VARCHAR(50) NOT NULL DEFAULT 'INCOMING' CHECK (inspection_type IN ('INCOMING', 'IN_PROCESS', 'FINAL', 'FIRST_ARTICLE')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'OBSOLETE')),
  description TEXT,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_plan_version UNIQUE (product_id, version, inspection_type)
);

DROP TRIGGER IF EXISTS update_inspection_plans_updated_at ON public.inspection_plans;
CREATE TRIGGER update_inspection_plans_updated_at
BEFORE UPDATE ON public.inspection_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. INSPECTION PLAN CHARACTERISTICS TABLE
CREATE TABLE IF NOT EXISTS public.inspection_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.inspection_plans(id) ON DELETE CASCADE,
  sequence INT NOT NULL DEFAULT 10 CHECK (sequence > 0),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL DEFAULT 'NUMERIC' CHECK (type IN ('NUMERIC', 'TEXT', 'BOOLEAN', 'OPTION')),
  target_value NUMERIC(12, 4),
  min_value NUMERIC(12, 4),
  max_value NUMERIC(12, 4),
  unit VARCHAR(20) DEFAULT 'mm',
  required BOOLEAN NOT NULL DEFAULT TRUE,
  sampling_type VARCHAR(30) DEFAULT '100%' CHECK (sampling_type IN ('100%', 'SAMPLE')),
  sample_quantity INT DEFAULT 1 CHECK (sample_quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_inspection_plan_items_updated_at ON public.inspection_plan_items;
CREATE TRIGGER update_inspection_plan_items_updated_at
BEFORE UPDATE ON public.inspection_plan_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. QUALITY INSPECTIONS TABLE (SAFELY EXTENDING EXISTING MIGRATION 01 TABLE)
CREATE TABLE IF NOT EXISTS public.quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number VARCHAR(50) UNIQUE NOT NULL,
  inspection_type VARCHAR(50) NOT NULL DEFAULT 'INCOMING',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  grn_id UUID REFERENCES public.goods_receipts(id) ON DELETE SET NULL,
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  production_operation_id UUID REFERENCES public.production_operations(id) ON DELETE SET NULL,
  inspection_plan_id UUID REFERENCES public.inspection_plans(id) ON DELETE SET NULL,
  quantity_inspected NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  quantity_accepted NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  quantity_rejected NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  quantity_passed NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  result VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  inspected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  inspection_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safely extend columns if quality_inspections table existed in migration 01
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS inspection_type VARCHAR(50) DEFAULT 'INCOMING';
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS grn_id UUID REFERENCES public.goods_receipts(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS po_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS production_operation_id UUID REFERENCES public.production_operations(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS inspection_plan_id UUID REFERENCES public.inspection_plans(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS quantity_accepted NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS inspected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS inspection_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Drop legacy check constraint on result if it exists
ALTER TABLE public.quality_inspections DROP CONSTRAINT IF EXISTS quality_inspections_result_check;
ALTER TABLE public.quality_inspections ADD CONSTRAINT quality_inspections_result_check CHECK (
  result IN ('PASS', 'FAIL', 'PARTIAL', 'PENDING', 'pass', 'fail', 'rework')
);

-- Drop NOT NULL constraints from legacy migration 01 columns if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_inspections' AND column_name='quantity_passed' AND is_nullable='NO') THEN
    ALTER TABLE public.quality_inspections ALTER COLUMN quantity_passed DROP NOT NULL;
  END IF;
END $$;

-- Sync legacy columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_inspections' AND column_name='quantity_passed') THEN
    UPDATE public.quality_inspections SET quantity_accepted = quantity_passed WHERE quantity_accepted IS NULL OR quantity_accepted = 0.00;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quality_inspections' AND column_name='inspector_id') THEN
    UPDATE public.quality_inspections SET inspected_by = inspector_id WHERE inspected_by IS NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_quality_inspections_updated_at ON public.quality_inspections;
CREATE TRIGGER update_quality_inspections_updated_at
BEFORE UPDATE ON public.quality_inspections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. INSPECTION RESULTS (MEASURED CHARACTERISTICS) TABLE
CREATE TABLE IF NOT EXISTS public.inspection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.quality_inspections(id) ON DELETE CASCADE,
  plan_item_id UUID REFERENCES public.inspection_plan_items(id) ON DELETE SET NULL,
  characteristic_name VARCHAR(150) NOT NULL,
  characteristic_type VARCHAR(30) NOT NULL DEFAULT 'NUMERIC',
  target_value NUMERIC(12, 4),
  min_value NUMERIC(12, 4),
  max_value NUMERIC(12, 4),
  measured_value NUMERIC(12, 4),
  text_value TEXT,
  boolean_value BOOLEAN,
  unit VARCHAR(20) DEFAULT 'mm',
  result VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (result IN ('PASS', 'FAIL', 'PENDING')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_inspection_results_updated_at ON public.inspection_results;
CREATE TRIGGER update_inspection_results_updated_at
BEFORE UPDATE ON public.inspection_results
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. QUALITY HOLDS TABLE
CREATE TABLE IF NOT EXISTS public.quality_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hold_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  grn_id UUID REFERENCES public.goods_receipts(id) ON DELETE SET NULL,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  inspection_id UUID REFERENCES public.quality_inspections(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  released_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (released_quantity >= 0),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ON_HOLD' CHECK (status IN ('ON_HOLD', 'RELEASED', 'REJECTED')),
  placed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  released_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_quality_holds_updated_at ON public.quality_holds;
CREATE TRIGGER update_quality_holds_updated_at
BEFORE UPDATE ON public.quality_holds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. NON-CONFORMANCE REPORTS (NCR) TABLE
CREATE TABLE IF NOT EXISTS public.non_conformance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ncr_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  source_type VARCHAR(50) NOT NULL DEFAULT 'INCOMING_INSPECTION' CHECK (source_type IN ('INCOMING_INSPECTION', 'IN_PROCESS_INSPECTION', 'FINAL_INSPECTION', 'SUPPLIER', 'PRODUCTION', 'CUSTOMER', 'OTHER')),
  source_id UUID,
  inspection_id UUID REFERENCES public.quality_inspections(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  grn_id UUID REFERENCES public.goods_receipts(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_INVESTIGATION', 'ACTION_REQUIRED', 'IN_PROGRESS', 'VERIFICATION', 'CLOSED', 'CANCELLED')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  due_date DATE,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_non_conformance_reports_updated_at ON public.non_conformance_reports;
CREATE TRIGGER update_non_conformance_reports_updated_at
BEFORE UPDATE ON public.non_conformance_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. QUALITY ACTIVITIES AUDIT TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.quality_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.quality_inspections(id) ON DELETE CASCADE,
  ncr_id UUID REFERENCES public.non_conformance_reports(id) ON DELETE CASCADE,
  hold_id UUID REFERENCES public.quality_holds(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(150),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.inspection_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_activities ENABLE ROW LEVEL SECURITY;

-- Anonymous restriction
DROP POLICY IF EXISTS anon_no_select_quality ON public.quality_inspections;
CREATE POLICY anon_no_select_quality ON public.quality_inspections FOR SELECT TO anon USING (false);

-- Service role full access
DROP POLICY IF EXISTS service_role_all_inspection_plans ON public.inspection_plans;
CREATE POLICY service_role_all_inspection_plans ON public.inspection_plans FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_inspection_plan_items ON public.inspection_plan_items;
CREATE POLICY service_role_all_inspection_plan_items ON public.inspection_plan_items FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_quality_inspections ON public.quality_inspections;
CREATE POLICY service_role_all_quality_inspections ON public.quality_inspections FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_inspection_results ON public.inspection_results;
CREATE POLICY service_role_all_inspection_results ON public.inspection_results FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_quality_holds ON public.quality_holds;
CREATE POLICY service_role_all_quality_holds ON public.quality_holds FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_ncrs ON public.non_conformance_reports;
CREATE POLICY service_role_all_ncrs ON public.non_conformance_reports FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_quality_activities ON public.quality_activities;
CREATE POLICY service_role_all_quality_activities ON public.quality_activities FOR ALL TO service_role USING (true);

-- Authenticated users access
DROP POLICY IF EXISTS authenticated_all_inspection_plans ON public.inspection_plans;
CREATE POLICY authenticated_all_inspection_plans ON public.inspection_plans FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_inspection_plan_items ON public.inspection_plan_items;
CREATE POLICY authenticated_all_inspection_plan_items ON public.inspection_plan_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_quality_inspections ON public.quality_inspections;
CREATE POLICY authenticated_all_quality_inspections ON public.quality_inspections FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_inspection_results ON public.inspection_results;
CREATE POLICY authenticated_all_inspection_results ON public.inspection_results FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_quality_holds ON public.quality_holds;
CREATE POLICY authenticated_all_quality_holds ON public.quality_holds FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_ncrs ON public.non_conformance_reports;
CREATE POLICY authenticated_all_ncrs ON public.non_conformance_reports FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_quality_activities ON public.quality_activities;
CREATE POLICY authenticated_all_quality_activities ON public.quality_activities FOR ALL TO authenticated USING (true);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_inspection_plans_number ON public.inspection_plans(plan_number);
CREATE INDEX IF NOT EXISTS idx_inspection_plans_product ON public.inspection_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_number ON public.quality_inspections(inspection_number);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_product ON public.quality_inspections(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_grn ON public.quality_inspections(grn_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_po ON public.quality_inspections(po_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_prod ON public.quality_inspections(production_order_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_supplier ON public.quality_inspections(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_status ON public.quality_inspections(status);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_result ON public.quality_inspections(result);
CREATE INDEX IF NOT EXISTS idx_quality_holds_number ON public.quality_holds(hold_number);
CREATE INDEX IF NOT EXISTS idx_quality_holds_product ON public.quality_holds(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_holds_status ON public.quality_holds(status);
CREATE INDEX IF NOT EXISTS idx_ncrs_number ON public.non_conformance_reports(ncr_number);
CREATE INDEX IF NOT EXISTS idx_ncrs_product ON public.non_conformance_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_ncrs_supplier ON public.non_conformance_reports(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ncrs_status ON public.non_conformance_reports(status);
CREATE INDEX IF NOT EXISTS idx_ncrs_assigned ON public.non_conformance_reports(assigned_to);

-- 10. SAMPLE SEED INSPECTION PLANS & CHARACTERISTICS
DO $$
DECLARE
  prod_id UUID;
  plan_id UUID;
BEGIN
  SELECT id INTO prod_id FROM public.products LIMIT 1;
  IF prod_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.inspection_plans WHERE plan_number = 'IP-2026-000001') THEN
      INSERT INTO public.inspection_plans (plan_number, product_id, version, inspection_type, status, description)
      VALUES ('IP-2026-000001', prod_id, 'V1', 'INCOMING', 'ACTIVE', 'Standard incoming quality verification plan')
      RETURNING id INTO plan_id;

      IF plan_id IS NOT NULL THEN
        INSERT INTO public.inspection_plan_items (plan_id, sequence, name, description, type, target_value, min_value, max_value, unit, required)
        VALUES 
          (plan_id, 10, 'Outer Diameter (OD)', 'Critical mounting dimension', 'NUMERIC', 25.0000, 24.9500, 25.0500, 'mm', true),
          (plan_id, 20, 'Overall Length (L)', 'Overall body length', 'NUMERIC', 120.0000, 119.8000, 120.2000, 'mm', true),
          (plan_id, 30, 'Surface Roughness (Ra)', 'Mating surface finish', 'NUMERIC', 0.8000, 0.0000, 1.6000, 'µm', false),
          (plan_id, 40, 'Visual Surface Finish', 'Free of scratches, burrs, and rust', 'BOOLEAN', NULL, NULL, NULL, NULL, true),
          (plan_id, 50, 'Material Certificate Verification', 'Mill test certificate review', 'OPTION', NULL, NULL, NULL, NULL, true);
      END IF;
    END IF;
  END IF;
END $$;
