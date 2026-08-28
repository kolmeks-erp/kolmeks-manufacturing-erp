-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: MAINTENANCE & ASSET MANAGEMENT MODULE SCHEMA
-- Migration Script: 15_maintenance_asset_management_schema.sql
-- ==============================================================================

-- 1. SAFELY EXTEND INVENTORY TRANSACTIONS MOVEMENT_TYPE CHECK CONSTRAINT
ALTER TABLE public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_movement_type_check;
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_movement_type_check CHECK (
  movement_type IN (
    'RECEIPT',
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'PRODUCTION_CONSUMPTION',
    'PRODUCTION_OUTPUT',
    'SALES_ISSUE',
    'MAINTENANCE_CONSUMPTION'
  )
);

-- 2. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  asset_type VARCHAR(50) NOT NULL DEFAULT 'CNC_MACHINE' CHECK (asset_type IN ('CNC_MACHINE', 'MILLING_MACHINE', 'TURNING_MACHINE', 'GRINDING_MACHINE', 'COMPRESSOR', 'ELECTRICAL', 'INSPECTION_EQUIPMENT', 'MATERIAL_HANDLING', 'OTHER')),
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  work_center_id UUID REFERENCES public.work_centers(id) ON DELETE SET NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  installation_date DATE,
  location VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('ACTIVE', 'AVAILABLE', 'RUNNING', 'UNDER_MAINTENANCE', 'BREAKDOWN', 'INACTIVE', 'RETIRED')),
  criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. MAINTENANCE SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_number VARCHAR(50) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(30) NOT NULL DEFAULT 'PREVENTIVE' CHECK (maintenance_type IN ('PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'CALIBRATION', 'LUBRICATION', 'CLEANING', 'OTHER')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  frequency_type VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (frequency_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM_DAYS')),
  frequency_value INT NOT NULL DEFAULT 30 CHECK (frequency_value > 0),
  last_completed_date DATE,
  next_due_date DATE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OVERDUE', 'COMPLETED')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_maintenance_schedules_updated_at ON public.maintenance_schedules;
CREATE TRIGGER update_maintenance_schedules_updated_at
BEFORE UPDATE ON public.maintenance_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. MAINTENANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  issue VARCHAR(200) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'REVIEWED', 'APPROVED', 'CONVERTED_TO_WORK_ORDER', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_maintenance_requests_updated_at ON public.maintenance_requests;
CREATE TRIGGER update_maintenance_requests_updated_at
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. MAINTENANCE WORK ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_number VARCHAR(50) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
  maintenance_schedule_id UUID REFERENCES public.maintenance_schedules(id) ON DELETE SET NULL,
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  maintenance_type VARCHAR(30) NOT NULL DEFAULT 'CORRECTIVE',
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  planned_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  downtime_minutes NUMERIC(10, 2) DEFAULT 0.00 CHECK (downtime_minutes >= 0),
  root_cause TEXT,
  resolution TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_maintenance_work_orders_updated_at ON public.maintenance_work_orders;
CREATE TRIGGER update_maintenance_work_orders_updated_at
BEFORE UPDATE ON public.maintenance_work_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. MAINTENANCE CHECKLISTS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.maintenance_work_orders(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  sequence INT NOT NULL DEFAULT 10,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MAINTENANCE SPARE PARTS CONSUMPTION TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.maintenance_work_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12, 2) DEFAULT 0.00,
  total_cost NUMERIC(12, 2) DEFAULT 0.00,
  inventory_transaction_id UUID REFERENCES public.inventory_transactions(id) ON DELETE SET NULL,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DOWNTIME LOGS TABLE
CREATE TABLE IF NOT EXISTS public.downtime_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.maintenance_work_orders(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes NUMERIC(10, 2),
  reason VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_downtime_logs_updated_at ON public.downtime_logs;
CREATE TRIGGER update_downtime_logs_updated_at
BEFORE UPDATE ON public.downtime_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. MAINTENANCE ACTIVITIES TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.maintenance_work_orders(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.maintenance_schedules(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(150),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downtime_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_activities ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS service_role_all_assets ON public.assets;
CREATE POLICY service_role_all_assets ON public.assets FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_schedules ON public.maintenance_schedules;
CREATE POLICY service_role_all_schedules ON public.maintenance_schedules FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_requests ON public.maintenance_requests;
CREATE POLICY service_role_all_requests ON public.maintenance_requests FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_work_orders ON public.maintenance_work_orders;
CREATE POLICY service_role_all_work_orders ON public.maintenance_work_orders FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_checklists ON public.maintenance_checklists;
CREATE POLICY service_role_all_checklists ON public.maintenance_checklists FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_parts ON public.maintenance_parts;
CREATE POLICY service_role_all_parts ON public.maintenance_parts FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_downtime ON public.downtime_logs;
CREATE POLICY service_role_all_downtime ON public.downtime_logs FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_activities ON public.maintenance_activities;
CREATE POLICY service_role_all_activities ON public.maintenance_activities FOR ALL TO service_role USING (true);

-- Authenticated users access
DROP POLICY IF EXISTS authenticated_all_assets ON public.assets;
CREATE POLICY authenticated_all_assets ON public.assets FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_schedules ON public.maintenance_schedules;
CREATE POLICY authenticated_all_schedules ON public.maintenance_schedules FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_requests ON public.maintenance_requests;
CREATE POLICY authenticated_all_requests ON public.maintenance_requests FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_work_orders ON public.maintenance_work_orders;
CREATE POLICY authenticated_all_work_orders ON public.maintenance_work_orders FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_checklists ON public.maintenance_checklists;
CREATE POLICY authenticated_all_checklists ON public.maintenance_checklists FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_parts ON public.maintenance_parts;
CREATE POLICY authenticated_all_parts ON public.maintenance_parts FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_downtime ON public.downtime_logs;
CREATE POLICY authenticated_all_downtime ON public.downtime_logs FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_activities ON public.maintenance_activities;
CREATE POLICY authenticated_all_activities ON public.maintenance_activities FOR ALL TO authenticated USING (true);

-- 11. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_machine ON public.assets(machine_id);
CREATE INDEX IF NOT EXISTS idx_assets_wc ON public.assets(work_center_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON public.assets(criticality);

CREATE INDEX IF NOT EXISTS idx_maint_schedules_num ON public.maintenance_schedules(schedule_number);
CREATE INDEX IF NOT EXISTS idx_maint_schedules_asset ON public.maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maint_schedules_due ON public.maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maint_schedules_status ON public.maintenance_schedules(status);

CREATE INDEX IF NOT EXISTS idx_maint_requests_num ON public.maintenance_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_maint_requests_asset ON public.maintenance_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_maint_requests_status ON public.maintenance_requests(status);

CREATE INDEX IF NOT EXISTS idx_maint_wo_num ON public.maintenance_work_orders(work_order_number);
CREATE INDEX IF NOT EXISTS idx_maint_wo_asset ON public.maintenance_work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_maint_wo_status ON public.maintenance_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_maint_wo_assigned ON public.maintenance_work_orders(assigned_to);

CREATE INDEX IF NOT EXISTS idx_downtime_asset ON public.downtime_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_downtime_wo ON public.downtime_logs(work_order_id);
CREATE INDEX IF NOT EXISTS idx_downtime_status ON public.downtime_logs(status);

-- 12. SEED INITIAL ASSETS FROM EXISTING MACHINES & DEMO ASSETS
DO $$
DECLARE
  mach_record RECORD;
  wc_record RECORD;
  ast_id UUID;
BEGIN
  -- Sync existing CNC machines into Assets
  FOR mach_record IN SELECT * FROM public.machines LOOP
    IF NOT EXISTS (SELECT 1 FROM public.assets WHERE machine_id = mach_record.id OR asset_code = 'AST-' || COALESCE(mach_record.code, 'MACH-' || SUBSTRING(mach_record.id::text, 1, 8))) THEN
      INSERT INTO public.assets (
        asset_code,
        name,
        asset_type,
        machine_id,
        work_center_id,
        manufacturer,
        model,
        serial_number,
        location,
        status,
        criticality,
        description
      ) VALUES (
        'AST-' || COALESCE(mach_record.code, 'MACH-' || SUBSTRING(mach_record.id::text, 1, 8)),
        mach_record.name,
        CASE 
          WHEN mach_record.machine_type ILIKE '%LATHE%' THEN 'TURNING_MACHINE'
          WHEN mach_record.machine_type ILIKE '%MILL%' OR mach_record.machine_type ILIKE '%VMC%' THEN 'MILLING_MACHINE'
          ELSE 'CNC_MACHINE'
        END,
        mach_record.id,
        mach_record.work_center_id,
        COALESCE(mach_record.manufacturer, 'Kolmeks Spec'),
        COALESCE(mach_record.model, 'V1'),
        COALESCE(mach_record.serial_number, 'SN-2026-001'),
        'Tikkurila Plant - Machining Bay 1',
        'AVAILABLE',
        'HIGH',
        mach_record.description
      );
    END IF;
  END LOOP;

  -- Create non-machine auxiliary plant assets (Compressor, Inspection CMM)
  IF NOT EXISTS (SELECT 1 FROM public.assets WHERE asset_code = 'AST-COMP-001') THEN
    INSERT INTO public.assets (
      asset_code,
      name,
      asset_type,
      manufacturer,
      model,
      serial_number,
      location,
      status,
      criticality,
      description
    ) VALUES (
      'AST-COMP-001',
      'Atlas Copco GA37 VSD+ Screw Air Compressor',
      'COMPRESSOR',
      'Atlas Copco',
      'GA37 VSD+',
      'AC-884920-2025',
      'Utility Room 2',
      'AVAILABLE',
      'CRITICAL',
      'Central plant compressed air supply for CNC pneumatic clamps & spindle blow'
    ) RETURNING id INTO ast_id;

    -- Add sample PM schedule for compressor
    IF ast_id IS NOT NULL THEN
      INSERT INTO public.maintenance_schedules (
        schedule_number,
        asset_id,
        maintenance_type,
        title,
        description,
        frequency_type,
        frequency_value,
        last_completed_date,
        next_due_date,
        priority,
        status
      ) VALUES (
        'PM-2026-000001',
        ast_id,
        'PREVENTIVE',
        'Monthly Air Compressor Filter & Oil Level Check',
        'Inspect air intake filter, check oil reservoir level, drain condensate trap',
        'MONTHLY',
        30,
        CURRENT_DATE - INTERVAL '25 days',
        CURRENT_DATE + INTERVAL '5 days',
        'HIGH',
        'ACTIVE'
      );
    END IF;
  END IF;
END $$;
