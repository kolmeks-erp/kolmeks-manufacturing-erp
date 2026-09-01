-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED QUALITY MANAGEMENT & CAPA SCHEMA
-- Migration Script: 36_advanced_quality_capa_schema.sql
-- ==============================================================================

-- 1. DEFECT CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.quality_defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  defect_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'DIMENSIONAL' CHECK (category IN ('DIMENSIONAL', 'SURFACE_FINISH', 'MATERIAL_DEFECT', 'ASSEMBLY', 'ELECTRICAL', 'PACKAGING', 'DOCUMENTATION', 'OTHER')),
  severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INSPECTION DEFECT RECORDS (LINKS INSPECTION TO DEFECTS FOUND)
CREATE TABLE IF NOT EXISTS public.inspection_defect_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.quality_inspections(id) ON DELETE CASCADE,
  defect_id UUID REFERENCES public.quality_defects(id) ON DELETE SET NULL,
  defect_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  location_operation VARCHAR(100),
  description TEXT,
  evidence_url TEXT,
  severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SAFELY EXTEND QUALITY_INSPECTIONS TABLE
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS serial_number_id UUID REFERENCES public.stock_serials(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS sample_size INT DEFAULT 1;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS lot_quantity NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- 4. SAFELY EXTEND NON_CONFORMANCE_REPORTS TABLE
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL;
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS serial_number_id UUID REFERENCES public.stock_serials(id) ON DELETE SET NULL;
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL;
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS containment_action TEXT;
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.non_conformance_reports ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- 5. ROOT CAUSE ANALYSES TABLE (5-WHY / FISHBONE FOR NCRS)
CREATE TABLE IF NOT EXISTS public.root_cause_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ncr_id UUID NOT NULL REFERENCES public.non_conformance_reports(id) ON DELETE CASCADE,
  root_cause TEXT NOT NULL,
  analysis_method VARCHAR(50) DEFAULT '5_WHY' CHECK (analysis_method IN ('5_WHY', 'FISHBONE', 'MANUAL_ANALYSIS', '8D_REPORT')),
  why_1 TEXT,
  why_2 TEXT,
  why_3 TEXT,
  why_4 TEXT,
  why_5 TEXT,
  category_manpower TEXT,
  category_machine TEXT,
  category_material TEXT,
  category_method TEXT,
  category_measurement TEXT,
  category_environment TEXT,
  evidence_url TEXT,
  analyst_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  analysis_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CORRECTIVE & PREVENTIVE ACTION (CAPA) HEADER TABLE
CREATE TABLE IF NOT EXISTS public.capa_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capa_number VARCHAR(50) UNIQUE NOT NULL,
  ncr_id UUID REFERENCES public.non_conformance_reports(id) ON DELETE SET NULL,
  title VARCHAR(250) NOT NULL,
  description TEXT NOT NULL,
  source_type VARCHAR(50) DEFAULT 'NCR' CHECK (source_type IN ('NCR', 'AUDIT', 'CUSTOMER_COMPLAINT', 'INTERNAL_INSPECTION', 'SUPPLIER_REJECT', 'CONTINUOUS_IMPROVEMENT')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED', 'OVERDUE', 'CANCELLED')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CAPA ACTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.capa_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capa_id UUID NOT NULL REFERENCES public.capa_records(id) ON DELETE CASCADE,
  action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('CORRECTIVE', 'PREVENTIVE')),
  description TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED')),
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  evidence_url TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CUSTOMER COMPLAINTS / RMA TABLE
CREATE TABLE IF NOT EXISTS public.customer_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  batch_number VARCHAR(100),
  serial_number VARCHAR(100),
  complaint_date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED', 'REJECTED')),
  ncr_id UUID REFERENCES public.non_conformance_reports(id) ON DELETE SET NULL,
  capa_id UUID REFERENCES public.capa_records(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SAFELY EXTEND QUALITY HOLDS TABLE FOR FULL QUARANTINE WORKFLOW
ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL;
ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS serial_number_id UUID REFERENCES public.stock_serials(id) ON DELETE SET NULL;
ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS rejected_quantity NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS scrapped_quantity NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.quality_holds ADD COLUMN IF NOT EXISTS ncr_id UUID REFERENCES public.non_conformance_reports(id) ON DELETE SET NULL;

-- Enable RLS for all new tables
ALTER TABLE public.quality_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_defect_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.root_cause_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_complaints ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY service_role_all_quality_defects ON public.quality_defects FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_inspection_defect_records ON public.inspection_defect_records FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_root_cause_analyses ON public.root_cause_analyses FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_capa_records ON public.capa_records FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_capa_actions ON public.capa_actions FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_customer_complaints ON public.customer_complaints FOR ALL TO service_role USING (true);

-- Authenticated users access
CREATE POLICY authenticated_all_quality_defects ON public.quality_defects FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_inspection_defect_records ON public.inspection_defect_records FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_root_cause_analyses ON public.root_cause_analyses FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_capa_records ON public.capa_records FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_capa_actions ON public.capa_actions FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_customer_complaints ON public.customer_complaints FOR ALL TO authenticated USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_defects_code ON public.quality_defects(defect_code);
CREATE INDEX IF NOT EXISTS idx_defects_category ON public.quality_defects(category);
CREATE INDEX IF NOT EXISTS idx_capa_number ON public.capa_records(capa_number);
CREATE INDEX IF NOT EXISTS idx_capa_ncr ON public.capa_records(ncr_id);
CREATE INDEX IF NOT EXISTS idx_capa_status ON public.capa_records(status);
CREATE INDEX IF NOT EXISTS idx_complaints_number ON public.customer_complaints(complaint_number);
CREATE INDEX IF NOT EXISTS idx_complaints_customer ON public.customer_complaints(customer_id);

-- SEED INITIAL DEFECT CODES
INSERT INTO public.quality_defects (defect_code, name, description, category, severity)
VALUES
  ('DEF-DIM-001', 'Oversized Outside Diameter', 'Measured OD exceeds maximum specification tolerance', 'DIMENSIONAL', 'HIGH'),
  ('DEF-DIM-002', 'Undersized Bore Diameter', 'Internal bore size is below allowable tolerance limit', 'DIMENSIONAL', 'HIGH'),
  ('DEF-DIM-003', 'Thread Pitch Error', 'Machined thread pitch is out of spec', 'DIMENSIONAL', 'CRITICAL'),
  ('DEF-SUR-001', 'Surface Roughness Exceeded', 'Ra value higher than allowable micro-finish limit', 'SURFACE_FINISH', 'MEDIUM'),
  ('DEF-SUR-002', 'Machining Burrs & Flash', 'Excess burr along edge bevel after turning/milling', 'SURFACE_FINISH', 'LOW'),
  ('DEF-MAT-001', 'Porosity / Inclusion', 'Internal casting voids found during ultrasonic / X-ray check', 'MATERIAL_DEFECT', 'CRITICAL'),
  ('DEF-MAT-002', 'Hardness Out of Spec', 'Material hardness (HRC/HB) outside drawing requirement', 'MATERIAL_DEFECT', 'HIGH'),
  ('DEF-ASM-001', 'Missing O-Ring Seal', 'Seal component omitted during sub-assembly phase', 'ASSEMBLY', 'CRITICAL'),
  ('DEF-ELE-001', 'Winding Resistance High', 'Motor stator winding resistance exceeds spec', 'ELECTRICAL', 'HIGH')
ON CONFLICT (defect_code) DO NOTHING;
