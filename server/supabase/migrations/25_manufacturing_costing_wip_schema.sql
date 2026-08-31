-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: MANUFACTURING COSTING & WIP ACCOUNTING MODULE SCHEMA
-- Migration Script: 25_manufacturing_costing_wip_schema.sql
-- Prompt 34: Production Costing, Material/Labor/Overhead, WIP Tracking, Variance, Accounting Integration
-- ==============================================================================

-- 1. SEQUENCES FOR COSTING NUMBERS
CREATE SEQUENCE IF NOT EXISTS mfg_cost_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS wip_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS variance_seq START WITH 1 INCREMENT BY 1;

-- 2. MANUFACTURING COST CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS public.manufacturing_cost_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  costing_method VARCHAR(30) NOT NULL DEFAULT 'ACTUAL_COST' CHECK (costing_method IN ('ACTUAL_COST', 'STANDARD_COST')),
  
  -- Default Labor & Overhead Rates
  default_hourly_labor_rate NUMERIC(12, 2) DEFAULT 250.00 CHECK (default_hourly_labor_rate >= 0),
  default_hourly_overhead_rate NUMERIC(12, 2) DEFAULT 150.00 CHECK (default_hourly_overhead_rate >= 0),
  overhead_allocation_basis VARCHAR(30) NOT NULL DEFAULT 'PER_HOUR' CHECK (overhead_allocation_basis IN ('PER_HOUR', 'PER_UNIT', 'PERCENT_DIRECT_LABOR')),
  
  -- Account Mappings (GL Chart of Accounts Foreign Keys)
  raw_material_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  wip_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  finished_goods_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  labor_cost_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  overhead_cost_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  variance_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Work Center Specific Labor & Overhead Rates Table
CREATE TABLE IF NOT EXISTS public.work_center_cost_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_center_id UUID NOT NULL REFERENCES public.work_centers(id) ON DELETE CASCADE,
  hourly_labor_rate NUMERIC(12, 2) NOT NULL DEFAULT 250.00 CHECK (hourly_labor_rate >= 0),
  hourly_overhead_rate NUMERIC(12, 2) NOT NULL DEFAULT 150.00 CHECK (hourly_overhead_rate >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_work_center_cost_rate UNIQUE (work_center_id)
);

-- 3. MANUFACTURING COSTS MASTER HEADER TABLE
CREATE TABLE IF NOT EXISTS public.manufacturing_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  costing_number VARCHAR(50) UNIQUE NOT NULL,
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  
  -- Quantities
  planned_quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00 CHECK (planned_quantity > 0),
  completed_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (completed_quantity >= 0),
  wip_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (wip_quantity >= 0),
  
  -- Actual Cost Components
  material_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (material_cost >= 0),
  labor_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (labor_cost >= 0),
  overhead_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (overhead_cost >= 0),
  total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_cost >= 0),
  unit_cost NUMERIC(15, 4) NOT NULL DEFAULT 0.0000 CHECK (unit_cost >= 0),
  
  -- Planned Baseline Costs (from BOM & Routing)
  planned_material_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (planned_material_cost >= 0),
  planned_labor_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (planned_labor_cost >= 0),
  planned_overhead_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (planned_overhead_cost >= 0),
  planned_total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (planned_total_cost >= 0),
  
  -- Variances
  material_variance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  labor_variance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  overhead_variance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_variance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_variance_pct NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  
  -- Status & Accounting Links
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CALCULATED', 'REVIEW', 'POSTED', 'CLOSED', 'VOIDED')),
  costing_method VARCHAR(30) NOT NULL DEFAULT 'ACTUAL_COST',
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  
  calculated_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_mfg_cost_prod_order UNIQUE (production_order_id)
);

DROP TRIGGER IF EXISTS update_mfg_costs_updated_at ON public.manufacturing_costs;
CREATE TRIGGER update_mfg_costs_updated_at
BEFORE UPDATE ON public.manufacturing_costs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ITEMIZED COST COMPONENTS TABLE
CREATE TABLE IF NOT EXISTS public.manufacturing_cost_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturing_cost_id UUID NOT NULL REFERENCES public.manufacturing_costs(id) ON DELETE CASCADE,
  component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('MATERIAL', 'LABOR', 'OVERHEAD')),
  
  -- Entity References
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, -- for material
  work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL, -- for labor & overhead
  operation_name VARCHAR(150),
  
  description TEXT NOT NULL,
  planned_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  actual_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  unit_of_measure VARCHAR(20) DEFAULT 'pcs',
  
  unit_rate NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
  planned_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  actual_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  variance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WORK IN PROGRESS (WIP) RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.wip_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wip_number VARCHAR(50) UNIQUE NOT NULL,
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  
  wip_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (wip_quantity >= 0),
  material_wip NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (material_wip >= 0),
  labor_wip NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (labor_wip >= 0),
  overhead_wip NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (overhead_wip >= 0),
  total_wip NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_wip >= 0),
  
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CLOSED')),
  
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_wip_records_updated_at ON public.wip_records;
CREATE TRIGGER update_wip_records_updated_at
BEFORE UPDATE ON public.wip_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. MANUFACTURING VARIANCE LOG TABLE
CREATE TABLE IF NOT EXISTS public.manufacturing_variances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variance_number VARCHAR(50) UNIQUE NOT NULL,
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  
  material_qty_variance NUMERIC(15, 2) DEFAULT 0.00,
  material_price_variance NUMERIC(15, 2) DEFAULT 0.00,
  labor_efficiency_variance NUMERIC(15, 2) DEFAULT 0.00,
  labor_rate_variance NUMERIC(15, 2) DEFAULT 0.00,
  overhead_variance NUMERIC(15, 2) DEFAULT 0.00,
  total_variance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  notes TEXT
);

-- 7. RLS POLICIES FOR MANUFACTURING COSTING TABLES
ALTER TABLE public.manufacturing_cost_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_center_cost_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_cost_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wip_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_variances ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY anon_no_select_mfg_costs ON public.manufacturing_costs FOR SELECT TO anon USING (false);
CREATE POLICY anon_no_select_wip ON public.wip_records FOR SELECT TO anon USING (false);

-- Full access for service_role
CREATE POLICY service_role_all_mfg_cfg ON public.manufacturing_cost_configurations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_wc_rates ON public.work_center_cost_rates FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_mfg_costs ON public.manufacturing_costs FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_mfg_cost_comp ON public.manufacturing_cost_components FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_wip ON public.wip_records FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_mfg_var ON public.manufacturing_variances FOR ALL TO service_role USING (true);

-- Authenticated staff access
CREATE POLICY authenticated_all_mfg_cfg ON public.manufacturing_cost_configurations FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_wc_rates ON public.work_center_cost_rates FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_mfg_costs ON public.manufacturing_costs FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_mfg_cost_comp ON public.manufacturing_cost_components FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_wip ON public.wip_records FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_mfg_var ON public.manufacturing_variances FOR ALL TO authenticated USING (true);

-- 8. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_mfg_costs_order ON public.manufacturing_costs(production_order_id);
CREATE INDEX IF NOT EXISTS idx_mfg_costs_product ON public.manufacturing_costs(product_id);
CREATE INDEX IF NOT EXISTS idx_mfg_costs_cost_center ON public.manufacturing_costs(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_mfg_costs_status ON public.manufacturing_costs(status);
CREATE INDEX IF NOT EXISTS idx_mfg_cost_comp_mfg_cost ON public.manufacturing_cost_components(manufacturing_cost_id);
CREATE INDEX IF NOT EXISTS idx_wip_order ON public.wip_records(production_order_id);
CREATE INDEX IF NOT EXISTS idx_wip_status ON public.wip_records(status);
CREATE INDEX IF NOT EXISTS idx_mfg_var_order ON public.manufacturing_variances(production_order_id);

-- 9. INITIAL CONFIGURATION SEEDING
INSERT INTO public.manufacturing_cost_configurations (costing_method, default_hourly_labor_rate, default_hourly_overhead_rate, overhead_allocation_basis)
SELECT 'ACTUAL_COST', 250.00, 150.00, 'PER_HOUR'
WHERE NOT EXISTS (SELECT 1 FROM public.manufacturing_cost_configurations);
