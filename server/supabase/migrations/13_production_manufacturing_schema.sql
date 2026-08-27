-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: PRODUCTION & MANUFACTURING MODULE SCHEMA
-- Migration Script: 13_production_manufacturing_schema.sql
-- ==============================================================================

-- 1. WORK CENTERS TABLE
CREATE TABLE IF NOT EXISTS public.work_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'CNC Machining',
  capacity NUMERIC(10, 2) DEFAULT 1.00 CHECK (capacity >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_work_centers_updated_at ON public.work_centers;
CREATE TRIGGER update_work_centers_updated_at
BEFORE UPDATE ON public.work_centers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. MACHINES TABLE
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  machine_type VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure compatibility if machines table was created in migration 01
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS machine_type VARCHAR(50);
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100);
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS description TEXT;

-- Drop legacy constraints from migration 01 on machines
ALTER TABLE public.machines DROP CONSTRAINT IF EXISTS machines_status_check;
ALTER TABLE public.machines ADD CONSTRAINT machines_status_check CHECK (
  status IN ('AVAILABLE', 'RUNNING', 'MAINTENANCE', 'BREAKDOWN', 'INACTIVE', 'running', 'idle', 'offline')
);

-- Drop NOT NULL constraints from legacy migration 01 columns if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='machines' AND column_name='machine_code' AND is_nullable='NO') THEN
    ALTER TABLE public.machines ALTER COLUMN machine_code DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='machines' AND column_name='type' AND is_nullable='NO') THEN
    ALTER TABLE public.machines ALTER COLUMN type DROP NOT NULL;
  END IF;
END $$;

-- Sync columns from initial schema version if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='machines' AND column_name='machine_code') THEN
    UPDATE public.machines SET code = machine_code WHERE code IS NULL;
    UPDATE public.machines SET machine_code = code WHERE machine_code IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='machines' AND column_name='type') THEN
    UPDATE public.machines SET machine_type = type WHERE machine_type IS NULL;
    UPDATE public.machines SET type = machine_type WHERE type IS NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_machines_updated_at ON public.machines;
CREATE TRIGGER update_machines_updated_at
BEFORE UPDATE ON public.machines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. BILLS OF MATERIALS (BOM) HEADER TABLE
CREATE TABLE IF NOT EXISTS public.boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  version VARCHAR(20) NOT NULL DEFAULT 'V1',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'OBSOLETE')),
  description TEXT,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_bom_version UNIQUE (product_id, version)
);

DROP TRIGGER IF EXISTS update_boms_updated_at ON public.boms;
CREATE TRIGGER update_boms_updated_at
BEFORE UPDATE ON public.boms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. BOM ITEMS (COMPONENT LINE ITEMS) TABLE
CREATE TABLE IF NOT EXISTS public.bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES public.boms(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_per NUMERIC(12, 4) NOT NULL CHECK (quantity_per > 0),
  unit VARCHAR(20) DEFAULT 'pcs',
  scrap_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (scrap_percentage >= 0),
  notes TEXT,
  line_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_bom_items_updated_at ON public.bom_items;
CREATE TRIGGER update_bom_items_updated_at
BEFORE UPDATE ON public.bom_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. MANUFACTURING ROUTINGS HEADER TABLE
CREATE TABLE IF NOT EXISTS public.routings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  version VARCHAR(20) NOT NULL DEFAULT 'V1',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'OBSOLETE')),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_routing_version UNIQUE (product_id, version)
);

DROP TRIGGER IF EXISTS update_routings_updated_at ON public.routings;
CREATE TRIGGER update_routings_updated_at
BEFORE UPDATE ON public.routings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. ROUTING OPERATIONS TABLE
CREATE TABLE IF NOT EXISTS public.routing_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_id UUID NOT NULL REFERENCES public.routings(id) ON DELETE CASCADE,
  sequence INT NOT NULL DEFAULT 10 CHECK (sequence > 0),
  operation_name VARCHAR(150) NOT NULL,
  work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  setup_time_mins NUMERIC(8, 2) DEFAULT 0.00 CHECK (setup_time_mins >= 0),
  run_time_mins NUMERIC(8, 2) DEFAULT 0.00 CHECK (run_time_mins >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_routing_operations_updated_at ON public.routing_operations;
CREATE TRIGGER update_routing_operations_updated_at
BEFORE UPDATE ON public.routing_operations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. PRODUCTION ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_number VARCHAR(50),
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  bom_id UUID REFERENCES public.boms(id) ON DELETE SET NULL,
  routing_id UUID REFERENCES public.routings(id) ON DELETE SET NULL,
  planned_quantity NUMERIC(12, 2) DEFAULT 1.00,
  completed_quantity NUMERIC(12, 2) DEFAULT 0.00,
  rejected_quantity NUMERIC(12, 2) DEFAULT 0.00,
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  status VARCHAR(20) DEFAULT 'DRAFT',
  planned_start DATE,
  planned_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure compatibility if production_orders table was created in migration 01
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS production_order_number VARCHAR(50);
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS bom_id UUID REFERENCES public.boms(id) ON DELETE SET NULL;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS routing_id UUID REFERENCES public.routings(id) ON DELETE SET NULL;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS planned_quantity NUMERIC(12, 2) DEFAULT 1.00;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS rejected_quantity NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS planned_start DATE;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS planned_end DATE;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Drop legacy check constraints from migration 01 on production_orders
ALTER TABLE public.production_orders DROP CONSTRAINT IF EXISTS production_orders_status_check;
ALTER TABLE public.production_orders DROP CONSTRAINT IF EXISTS production_orders_priority_check;
ALTER TABLE public.production_orders DROP CONSTRAINT IF EXISTS production_orders_quantity_check;
ALTER TABLE public.production_orders DROP CONSTRAINT IF EXISTS production_orders_completed_quantity_check;

ALTER TABLE public.production_orders ADD CONSTRAINT production_orders_status_check CHECK (
  status IN ('DRAFT', 'PLANNED', 'RELEASED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'planned', 'material_pending', 'ready', 'in_production', 'quality_check')
);

ALTER TABLE public.production_orders ADD CONSTRAINT production_orders_priority_check CHECK (
  priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'low', 'medium', 'high', 'urgent')
);

-- Drop NOT NULL constraints from legacy migration 01 columns if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='production_orders' AND column_name='production_number' AND is_nullable='NO') THEN
    ALTER TABLE public.production_orders ALTER COLUMN production_number DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='production_orders' AND column_name='quantity' AND is_nullable='NO') THEN
    ALTER TABLE public.production_orders ALTER COLUMN quantity DROP NOT NULL;
  END IF;
END $$;

-- Sync columns from initial schema version if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='production_orders' AND column_name='production_number') THEN
    UPDATE public.production_orders SET production_order_number = production_number WHERE production_order_number IS NULL;
    UPDATE public.production_orders SET production_number = production_order_number WHERE production_number IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='production_orders' AND column_name='quantity') THEN
    UPDATE public.production_orders SET planned_quantity = quantity WHERE planned_quantity IS NULL;
    UPDATE public.production_orders SET quantity = FLOOR(planned_quantity)::INT WHERE quantity IS NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_production_orders_updated_at ON public.production_orders;
CREATE TRIGGER update_production_orders_updated_at
BEFORE UPDATE ON public.production_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. PRODUCTION OPERATIONS EXECUTION TABLE
CREATE TABLE IF NOT EXISTS public.production_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  routing_operation_id UUID REFERENCES public.routing_operations(id) ON DELETE SET NULL,
  sequence INT NOT NULL DEFAULT 10,
  operation_name VARCHAR(150) NOT NULL,
  work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  planned_quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
  completed_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  rejected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  planned_start DATE,
  planned_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_production_operations_updated_at ON public.production_operations;
CREATE TRIGGER update_production_operations_updated_at
BEFORE UPDATE ON public.production_operations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. PRODUCTION MATERIAL CONSUMPTION TABLE
CREATE TABLE IF NOT EXISTS public.production_material_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  production_operation_id UUID REFERENCES public.production_operations(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) DEFAULT 'pcs',
  inventory_transaction_id UUID REFERENCES public.inventory_transactions(id) ON DELETE SET NULL,
  consumed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- 10. PRODUCTION OUTPUT (FINISHED GOODS RECORDING) TABLE
CREATE TABLE IF NOT EXISTS public.production_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  rejected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (rejected_quantity >= 0),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  inventory_transaction_id UUID REFERENCES public.inventory_transactions(id) ON DELETE SET NULL,
  produced_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  produced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- 11. PRODUCTION ACTIVITIES AUDIT TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.production_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(150),
  activity_type VARCHAR(50) NOT NULL, -- e.g. 'CREATED', 'RELEASED', 'OPERATION_STARTED', 'OPERATION_COMPLETED', 'MATERIAL_CONSUMED', 'OUTPUT_RECORDED'
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_material_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_activities ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
DROP POLICY IF EXISTS anon_no_select_work_centers ON public.work_centers;
CREATE POLICY anon_no_select_work_centers ON public.work_centers FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_production_orders ON public.production_orders;
CREATE POLICY anon_no_select_production_orders ON public.production_orders FOR SELECT TO anon USING (false);

-- Service role full access
DROP POLICY IF EXISTS service_role_all_work_centers ON public.work_centers;
CREATE POLICY service_role_all_work_centers ON public.work_centers FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_machines ON public.machines;
CREATE POLICY service_role_all_machines ON public.machines FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_boms ON public.boms;
CREATE POLICY service_role_all_boms ON public.boms FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_bom_items ON public.bom_items;
CREATE POLICY service_role_all_bom_items ON public.bom_items FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_routings ON public.routings;
CREATE POLICY service_role_all_routings ON public.routings FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_routing_operations ON public.routing_operations;
CREATE POLICY service_role_all_routing_operations ON public.routing_operations FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_production_orders ON public.production_orders;
CREATE POLICY service_role_all_production_orders ON public.production_orders FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_production_operations ON public.production_operations;
CREATE POLICY service_role_all_production_operations ON public.production_operations FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_production_consumptions ON public.production_material_consumptions;
CREATE POLICY service_role_all_production_consumptions ON public.production_material_consumptions FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_production_outputs ON public.production_outputs;
CREATE POLICY service_role_all_production_outputs ON public.production_outputs FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_production_activities ON public.production_activities;
CREATE POLICY service_role_all_production_activities ON public.production_activities FOR ALL TO service_role USING (true);

-- Authenticated staff access
DROP POLICY IF EXISTS authenticated_all_work_centers ON public.work_centers;
CREATE POLICY authenticated_all_work_centers ON public.work_centers FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_machines ON public.machines;
CREATE POLICY authenticated_all_machines ON public.machines FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_boms ON public.boms;
CREATE POLICY authenticated_all_boms ON public.boms FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_bom_items ON public.bom_items;
CREATE POLICY authenticated_all_bom_items ON public.bom_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_routings ON public.routings;
CREATE POLICY authenticated_all_routings ON public.routings FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_routing_operations ON public.routing_operations;
CREATE POLICY authenticated_all_routing_operations ON public.routing_operations FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_production_orders ON public.production_orders;
CREATE POLICY authenticated_all_production_orders ON public.production_orders FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_production_operations ON public.production_operations;
CREATE POLICY authenticated_all_production_operations ON public.production_operations FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_production_consumptions ON public.production_material_consumptions;
CREATE POLICY authenticated_all_production_consumptions ON public.production_material_consumptions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_production_outputs ON public.production_outputs;
CREATE POLICY authenticated_all_production_outputs ON public.production_outputs FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_production_activities ON public.production_activities;
CREATE POLICY authenticated_all_production_activities ON public.production_activities FOR ALL TO authenticated USING (true);

-- 13. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_work_centers_code ON public.work_centers(code);
CREATE INDEX IF NOT EXISTS idx_machines_code ON public.machines(code);
CREATE INDEX IF NOT EXISTS idx_machines_work_center ON public.machines(work_center_id);
CREATE INDEX IF NOT EXISTS idx_boms_product ON public.boms(product_id);
CREATE INDEX IF NOT EXISTS idx_boms_number ON public.boms(bom_number);
CREATE INDEX IF NOT EXISTS idx_bom_items_bom ON public.bom_items(bom_id);
CREATE INDEX IF NOT EXISTS idx_routings_product ON public.routings(product_id);
CREATE INDEX IF NOT EXISTS idx_routings_number ON public.routings(routing_number);
CREATE INDEX IF NOT EXISTS idx_routing_ops_routing ON public.routing_operations(routing_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_number ON public.production_orders(production_order_number);
CREATE INDEX IF NOT EXISTS idx_production_orders_so ON public.production_orders(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_product ON public.production_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON public.production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_ops_order ON public.production_operations(production_order_id);
CREATE INDEX IF NOT EXISTS idx_prod_consumption_order ON public.production_material_consumptions(production_order_id);
CREATE INDEX IF NOT EXISTS idx_prod_output_order ON public.production_outputs(production_order_id);
CREATE INDEX IF NOT EXISTS idx_prod_activities_order ON public.production_activities(production_order_id);

-- 14. SEED INITIAL SAMPLE WORK CENTERS & MACHINES
INSERT INTO public.work_centers (code, name, description, type, capacity, status)
VALUES 
  ('WC-CNC-001', 'CNC Turning Department', 'High precision CNC lathe turning center', 'CNC Turning', 1.00, 'ACTIVE'),
  ('WC-CNC-002', 'CNC Milling Department', 'Vertical & Horizontal CNC Milling Center', 'CNC Milling', 1.00, 'ACTIVE'),
  ('WC-ASSY-001', 'Motor Component Assembly', 'Final stator/rotor & pump assembly line', 'Assembly', 1.00, 'ACTIVE'),
  ('WC-QUAL-001', 'Quality Metrology Lab', 'CMM measurement & hydrostatic pressure test', 'Inspection', 1.00, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE
  wc_turning UUID;
  wc_milling UUID;
  wc_assy UUID;
BEGIN
  SELECT id INTO wc_turning FROM public.work_centers WHERE code = 'WC-CNC-001' LIMIT 1;
  SELECT id INTO wc_milling FROM public.work_centers WHERE code = 'WC-CNC-002' LIMIT 1;
  SELECT id INTO wc_assy FROM public.work_centers WHERE code = 'WC-ASSY-001' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.machines WHERE code = 'CNC-LATHE-01' OR (SELECT column_name FROM information_schema.columns WHERE table_name='machines' AND column_name='machine_code') IS NOT NULL AND machine_code = 'CNC-LATHE-01') THEN
    INSERT INTO public.machines (code, machine_code, name, machine_type, type, manufacturer, model, work_center_id, status, description)
    VALUES ('CNC-LATHE-01', 'CNC-LATHE-01', 'Okuma LB3000 EX II CNC Lathe', 'CNC Lathe', 'CNC Lathe', 'Okuma', 'LB3000 EX II', wc_turning, 'AVAILABLE', '2-axis precision CNC turning lathe');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.machines WHERE code = 'VMC-MILL-01' OR (SELECT column_name FROM information_schema.columns WHERE table_name='machines' AND column_name='machine_code') IS NOT NULL AND machine_code = 'VMC-MILL-01') THEN
    INSERT INTO public.machines (code, machine_code, name, machine_type, type, manufacturer, model, work_center_id, status, description)
    VALUES ('VMC-MILL-01', 'VMC-MILL-01', 'Haas VF-4SS 4-Axis VMC', 'VMC', 'VMC', 'Haas', 'VF-4SS', wc_milling, 'AVAILABLE', 'High speed vertical machining center');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.machines WHERE code = 'ASSY-BENCH-01' OR (SELECT column_name FROM information_schema.columns WHERE table_name='machines' AND column_name='machine_code') IS NOT NULL AND machine_code = 'ASSY-BENCH-01') THEN
    INSERT INTO public.machines (code, machine_code, name, machine_type, type, manufacturer, model, work_center_id, status, description)
    VALUES ('ASSY-BENCH-01', 'ASSY-BENCH-01', 'Hydraulic Motor Assembly Station', 'Assembly Bench', 'Assembly Bench', 'Kolmeks Custom', 'M-500', wc_assy, 'AVAILABLE', 'Pneumatic press & torque wrench station');
  END IF;
END $$;
