-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: PRODUCTION PLANNING & SCHEDULING MODULE SCHEMA
-- Migration Script: 26_production_planning_scheduling_schema.sql
-- ==============================================================================

-- 1. PRODUCTION PLAN SEQUENCES & FUNCTIONS
CREATE SEQUENCE IF NOT EXISTS public.seq_production_plan_number START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_work_order_schedule_number START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_production_plan_number()
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_seq INT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_seq := NEXTVAL('public.seq_production_plan_number');
  RETURN 'PLAN-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_schedule_number()
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_seq INT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_seq := NEXTVAL('public.seq_work_order_schedule_number');
  RETURN 'SCHED-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. WORKING CALENDARS TABLE
CREATE TABLE IF NOT EXISTS public.working_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Standard Factory Working Calendar',
  work_start_time TIME DEFAULT '08:00:00',
  work_end_time TIME DEFAULT '17:00:00',
  working_days JSONB DEFAULT '["MON","TUE","WED","THU","FRI","SAT"]'::jsonb,
  daily_capacity_hours NUMERIC(5, 2) DEFAULT 8.00 CHECK (daily_capacity_hours >= 0),
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default working calendar if empty
INSERT INTO public.working_calendars (name, work_start_time, work_end_time, working_days, daily_capacity_hours, is_default)
SELECT 'Standard Kolmeks Factory Shift', '08:00:00', '17:00:00', '["MON","TUE","WED","THU","FRI","SAT"]'::jsonb, 8.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.working_calendars);

-- 3. PRODUCTION PLANS HEADER TABLE
CREATE TABLE IF NOT EXISTS public.production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_production_plan_number(),
  plan_name VARCHAR(150) NOT NULL,
  period_type VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (period_type IN ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_plan_dates CHECK (start_date <= end_date)
);

DROP TRIGGER IF EXISTS update_production_plans_updated_at ON public.production_plans;
CREATE TRIGGER update_production_plans_updated_at
BEFORE UPDATE ON public.production_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. PRODUCTION PLAN LINES TABLE
CREATE TABLE IF NOT EXISTS public.production_plan_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_plan_id UUID NOT NULL REFERENCES public.production_plans(id) ON DELETE CASCADE,
  line_number INT NOT NULL DEFAULT 1,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  planned_quantity NUMERIC(12, 2) NOT NULL CHECK (planned_quantity > 0),
  scheduled_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (scheduled_quantity >= 0),
  completed_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (completed_quantity >= 0),
  required_date DATE NOT NULL,
  demand_source VARCHAR(30) NOT NULL DEFAULT 'SALES_ORDER' CHECK (demand_source IN ('SALES_ORDER', 'FORECAST', 'MANUAL')),
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  sales_order_item_id UUID REFERENCES public.sales_order_items(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'SCHEDULED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_production_plan_lines_updated_at ON public.production_plan_lines;
CREATE TRIGGER update_production_plan_lines_updated_at
BEFORE UPDATE ON public.production_plan_lines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. WORK ORDER SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.work_order_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_schedule_number(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  production_operation_id UUID REFERENCES public.production_operations(id) ON DELETE SET NULL,
  work_center_id UUID NOT NULL REFERENCES public.work_centers(id) ON DELETE RESTRICT,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  planned_start TIMESTAMPTZ NOT NULL,
  planned_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  setup_time_hours NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (setup_time_hours >= 0),
  run_time_hours NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (run_time_hours >= 0),
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CONFLICTED', 'RESCHEDULED', 'CANCELLED')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_schedule_dates CHECK (planned_start < planned_end)
);

DROP TRIGGER IF EXISTS update_work_order_schedules_updated_at ON public.work_order_schedules;
CREATE TRIGGER update_work_order_schedules_updated_at
BEFORE UPDATE ON public.work_order_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. SCHEDULE HISTORY (RESCHEDULING AUDIT LOG) TABLE
CREATE TABLE IF NOT EXISTS public.schedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.work_order_schedules(id) ON DELETE CASCADE,
  old_planned_start TIMESTAMPTZ,
  old_planned_end TIMESTAMPTZ,
  new_planned_start TIMESTAMPTZ NOT NULL,
  new_planned_end TIMESTAMPTZ NOT NULL,
  old_work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  new_work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  old_machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  new_machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES FOR HIGH PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_prod_plans_status ON public.production_plans(status);
CREATE INDEX IF NOT EXISTS idx_prod_plans_dates ON public.production_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_prod_plan_lines_plan ON public.production_plan_lines(production_plan_id);
CREATE INDEX IF NOT EXISTS idx_prod_plan_lines_product ON public.production_plan_lines(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_plan_lines_so ON public.production_plan_lines(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_wo_schedules_po ON public.work_order_schedules(production_order_id);
CREATE INDEX IF NOT EXISTS idx_wo_schedules_wc ON public.work_order_schedules(work_center_id);
CREATE INDEX IF NOT EXISTS idx_wo_schedules_machine ON public.work_order_schedules(machine_id);
CREATE INDEX IF NOT EXISTS idx_wo_schedules_dates ON public.work_order_schedules(planned_start, planned_end);
CREATE INDEX IF NOT EXISTS idx_wo_schedules_status ON public.work_order_schedules(status);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.working_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_plan_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_history ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated ERP users
DROP POLICY IF EXISTS "Authenticated users full access to working_calendars" ON public.working_calendars;
CREATE POLICY "Authenticated users full access to working_calendars"
  ON public.working_calendars FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to production_plans" ON public.production_plans;
CREATE POLICY "Authenticated users full access to production_plans"
  ON public.production_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to production_plan_lines" ON public.production_plan_lines;
CREATE POLICY "Authenticated users full access to production_plan_lines"
  ON public.production_plan_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to work_order_schedules" ON public.work_order_schedules;
CREATE POLICY "Authenticated users full access to work_order_schedules"
  ON public.work_order_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to schedule_history" ON public.schedule_history;
CREATE POLICY "Authenticated users full access to schedule_history"
  ON public.schedule_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
