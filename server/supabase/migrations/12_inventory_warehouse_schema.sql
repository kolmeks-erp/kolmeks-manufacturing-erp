-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — INVENTORY & WAREHOUSE MANAGEMENT MODULE
-- Migration Version: 12_inventory_warehouse_schema.sql
-- ==============================================================================

-- 1. SEQUENCE GENERATOR FUNCTION FOR INVENTORY TRANSACTIONS (INV-TXN-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS inv_txn_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_inv_transaction_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
  formatted_num VARCHAR(50);
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('inv_txn_number_seq') INTO next_val;
  formatted_num := 'INV-TXN-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_num;
END;
$$ LANGUAGE plpgsql;

-- 2. SAFELY EXTEND WAREHOUSES TABLE
ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Finland',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. STORAGE LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  location_code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_warehouse_location_code UNIQUE (warehouse_id, location_code)
);

CREATE TRIGGER update_storage_locations_updated_at
BEFORE UPDATE ON public.storage_locations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. SAFELY EXTEND INVENTORY STOCK BALANCE TABLE
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS on_hand_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (on_hand_quantity >= 0),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create unique index on product + warehouse + location to ensure one stock balance row per location
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_wh_loc
ON public.inventory (product_id, warehouse_id, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 5. INVENTORY TRANSACTIONS LOG TABLE
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_inv_transaction_number(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN (
    'RECEIPT',
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'PRODUCTION_CONSUMPTION',
    'PRODUCTION_OUTPUT',
    'SALES_ISSUE'
  )),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  reference_type VARCHAR(50), -- e.g. 'GRN', 'PURCHASE_ORDER', 'ADJUSTMENT', 'TRANSFER', 'MANUAL'
  reference_id UUID,
  reason VARCHAR(100), -- e.g. 'Opening Balance', 'Counting Difference', 'Damage', 'Loss', 'Correction', 'Found Stock', 'GRN Receipt', 'Warehouse Transfer', 'Other'
  notes TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency constraint to prevent duplicate GRN stock receipts
CREATE UNIQUE INDEX IF NOT EXISTS idx_inv_txns_grn_idempotency
ON public.inventory_transactions (reference_id, product_id, warehouse_id, movement_type)
WHERE reference_type = 'GRN' AND movement_type = 'RECEIPT';

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON public.warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON public.warehouses(status);

CREATE INDEX IF NOT EXISTS idx_storage_locations_wh ON public.storage_locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_code ON public.storage_locations(location_code);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_wh ON public.inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_loc ON public.inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);

CREATE INDEX IF NOT EXISTS idx_inv_txns_number ON public.inventory_transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_inv_txns_product ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_txns_wh ON public.inventory_transactions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inv_txns_type ON public.inventory_transactions(movement_type);
CREATE INDEX IF NOT EXISTS idx_inv_txns_date ON public.inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inv_txns_ref ON public.inventory_transactions(reference_type, reference_id);

-- 7. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Warehouses Policies
DROP POLICY IF EXISTS "Authenticated users can view active warehouses" ON public.warehouses;
CREATE POLICY "Authenticated users can view active warehouses"
  ON public.warehouses FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authorized roles can manage warehouses" ON public.warehouses;
CREATE POLICY "Authorized roles can manage warehouses"
  ON public.warehouses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name IN ('admin', 'warehouse_manager', 'purchase_manager', 'inventory_manager', 'executive')
    )
  );

-- Storage Locations Policies
DROP POLICY IF EXISTS "Authenticated users can view storage locations" ON public.storage_locations;
CREATE POLICY "Authenticated users can view storage locations"
  ON public.storage_locations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authorized roles can manage storage locations" ON public.storage_locations;
CREATE POLICY "Authorized roles can manage storage locations"
  ON public.storage_locations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name IN ('admin', 'warehouse_manager', 'purchase_manager', 'inventory_manager', 'executive')
    )
  );

-- Inventory Balances Policies
DROP POLICY IF EXISTS "Authenticated users can view inventory balances" ON public.inventory;
CREATE POLICY "Authenticated users can view inventory balances"
  ON public.inventory FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authorized roles can update inventory balances" ON public.inventory;
CREATE POLICY "Authorized roles can update inventory balances"
  ON public.inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name IN ('admin', 'warehouse_manager', 'purchase_manager', 'inventory_manager', 'production_manager', 'executive')
    )
  );

-- Inventory Transactions Policies
DROP POLICY IF EXISTS "Authenticated users can view inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Authenticated users can view inventory transactions"
  ON public.inventory_transactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authorized roles can insert inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Authorized roles can insert inventory transactions"
  ON public.inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name IN ('admin', 'warehouse_manager', 'purchase_manager', 'inventory_manager', 'production_manager', 'executive')
    )
  );

-- 8. SEED DEFAULT WAREHOUSES & LOCATIONS (IF EMPTY)
INSERT INTO public.warehouses (code, name, location, address, city, state, country, description, status)
VALUES
  ('WH-001', 'Main Production & Raw Material Facility', 'Tikkurila Plant', 'Valimotie 12', 'Vantaa', 'Uusimaa', 'Finland', 'Primary raw metal stock, CNC components, and motor assembly warehouse.', 'active'),
  ('WH-002', 'Finished Goods & Logistics Center', 'Vuosaari Harbor Hub', 'Satamatie 4', 'Helsinki', 'Uusimaa', 'Finland', 'Finished CNC components, motor units, and international dispatch staging.', 'active'),
  ('WH-003', 'Component & Sub-Assembly Depot', 'Espoo Technology Park', 'Tekniikantie 8', 'Espoo', 'Uusimaa', 'Finland', 'Precision machined sub-components and electrical motor parts.', 'active')
ON CONFLICT (code) DO NOTHING;

-- Seed default storage locations for WH-001
DO $$
DECLARE
  wh1_id UUID;
BEGIN
  SELECT id INTO wh1_id FROM public.warehouses WHERE code = 'WH-001' LIMIT 1;
  IF wh1_id IS NOT NULL THEN
    INSERT INTO public.storage_locations (warehouse_id, location_code, name, description, status)
    VALUES
      (wh1_id, 'RM-A01', 'Raw Material Rack A1', 'Bar stock, heavy steel plates, and aluminum billets', 'active'),
      (wh1_id, 'RM-A02', 'Raw Material Rack A2', 'Cast iron castings and copper raw stock', 'active'),
      (wh1_id, 'CNC-B01', 'CNC WIP Staging Bin B1', 'Work-in-progress machined parts waiting for secondary assembly', 'active')
    ON CONFLICT (warehouse_id, location_code) DO NOTHING;
  END IF;
END $$;
