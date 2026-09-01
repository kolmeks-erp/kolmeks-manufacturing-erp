-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED MAINTENANCE & ASSET RELIABILITY SCHEMA
-- Migration Script: 37_advanced_maintenance_reliability_schema.sql
-- ==============================================================================

-- 1. BREAKDOWN TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_breakdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakdown_number VARCHAR(50) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
  work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  failure_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  failure_type VARCHAR(50) NOT NULL DEFAULT 'MECHANICAL' CHECK (failure_type IN ('MECHANICAL', 'ELECTRICAL', 'SOFTWARE', 'HYDRAULIC', 'PNEUMATIC', 'OTHER')),
  severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT NOT NULL,
  immediate_cause TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  downtime_minutes NUMERIC(10, 2) DEFAULT 0.00 CHECK (downtime_minutes >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'CONVERTED_TO_WORK_ORDER', 'RESOLVED', 'CLOSED')),
  ncr_id UUID REFERENCES public.non_conformance_reports(id) ON DELETE SET NULL,
  capa_id UUID REFERENCES public.capa_records(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.maintenance_work_orders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_maintenance_breakdowns_updated_at ON public.maintenance_breakdowns;
CREATE TRIGGER update_maintenance_breakdowns_updated_at
BEFORE UPDATE ON public.maintenance_breakdowns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. SAFELY EXTEND MAINTENANCE_REQUESTS TABLE
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS converted_work_order_id UUID REFERENCES public.maintenance_work_orders(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. SAFELY EXTEND MAINTENANCE_SCHEDULES TABLE (MAINTENANCE PLANS)
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS plan_number VARCHAR(50);
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS plan_name VARCHAR(200);
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS team_name VARCHAR(100);
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS operating_hours_interval NUMERIC(10, 2);
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS cycle_count_interval INT;
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS checklist_json JSONB;
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS fixed_asset_id UUID REFERENCES public.fixed_assets(id) ON DELETE SET NULL;

-- 4. SAFELY EXTEND MAINTENANCE_WORK_ORDERS TABLE
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS breakdown_id UUID REFERENCES public.maintenance_breakdowns(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS maintenance_plan_id UUID REFERENCES public.maintenance_schedules(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS fixed_asset_id UUID REFERENCES public.fixed_assets(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS labor_hours NUMERIC(10, 2) DEFAULT 0.00 CHECK (labor_hours >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS labor_rate NUMERIC(12, 2) DEFAULT 0.00 CHECK (labor_rate >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS labor_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (labor_cost >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS parts_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (parts_cost >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS external_service_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (external_service_cost >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS other_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (other_cost >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS total_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_cost >= 0);
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS ncr_id UUID REFERENCES public.non_conformance_reports(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_work_orders ADD COLUMN IF NOT EXISTS capa_id UUID REFERENCES public.capa_records(id) ON DELETE SET NULL;

-- Add constraint link back from breakdown to work order if breakdown created WO
ALTER TABLE public.maintenance_breakdowns ADD CONSTRAINT fk_maint_bd_wo FOREIGN KEY (work_order_id) REFERENCES public.maintenance_work_orders(id) ON DELETE SET NULL NOT VALID;

-- 5. SAFELY EXTEND DOWNTIME_LOGS TABLE
ALTER TABLE public.downtime_logs ADD COLUMN IF NOT EXISTS production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL;
ALTER TABLE public.downtime_logs ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL;
ALTER TABLE public.downtime_logs ADD COLUMN IF NOT EXISTS breakdown_id UUID REFERENCES public.maintenance_breakdowns(id) ON DELETE SET NULL;

-- 6. RLS POLICIES FOR BREAKDOWNS
ALTER TABLE public.maintenance_breakdowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_breakdowns ON public.maintenance_breakdowns;
CREATE POLICY service_role_all_breakdowns ON public.maintenance_breakdowns FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS authenticated_all_breakdowns ON public.maintenance_breakdowns;
CREATE POLICY authenticated_all_breakdowns ON public.maintenance_breakdowns FOR ALL TO authenticated USING (true);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_breakdown_num ON public.maintenance_breakdowns(breakdown_number);
CREATE INDEX IF NOT EXISTS idx_breakdown_asset ON public.maintenance_breakdowns(asset_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_status ON public.maintenance_breakdowns(status);
CREATE INDEX IF NOT EXISTS idx_breakdown_type ON public.maintenance_breakdowns(failure_type);
CREATE INDEX IF NOT EXISTS idx_maint_wo_cost_center ON public.maintenance_work_orders(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_maint_wo_fixed_asset ON public.maintenance_work_orders(fixed_asset_id);
