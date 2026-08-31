-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — ADVANCED INVENTORY & STOCK CONTROL MODULE
-- Migration Version: 24_advanced_inventory_schema.sql
-- ==============================================================================

-- 1. SAFELY EXTEND EXISTING INVENTORY & STORAGE LOCATIONS TABLES
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS quarantined_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (quarantined_quantity >= 0),
  ADD COLUMN IF NOT EXISTS rejected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (rejected_quantity >= 0),
  ADD COLUMN IF NOT EXISTS damaged_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (damaged_quantity >= 0);

ALTER TABLE public.storage_locations
  ADD COLUMN IF NOT EXISTS location_type VARCHAR(30) NOT NULL DEFAULT 'STORAGE' CHECK (location_type IN (
    'RECEIVING',
    'STORAGE',
    'WIP',
    'FINISHED_GOODS',
    'QUARANTINE',
    'SCRAP',
    'OTHER'
  ));

-- 2. SEQUENCES AND GENERATOR FUNCTIONS FOR DOCUMENT NUMBERS

-- Stock Transfers
CREATE SEQUENCE IF NOT EXISTS stock_transfer_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_stock_transfer_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('stock_transfer_number_seq') INTO next_val;
  RETURN 'TRF-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Stock Adjustments
CREATE SEQUENCE IF NOT EXISTS stock_adj_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_stock_adjustment_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('stock_adj_number_seq') INTO next_val;
  RETURN 'ADJ-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Stock Reservations
CREATE SEQUENCE IF NOT EXISTS stock_res_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_stock_reservation_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('stock_res_number_seq') INTO next_val;
  RETURN 'RES-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Stock Batches
CREATE SEQUENCE IF NOT EXISTS stock_batch_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_stock_batch_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('stock_batch_number_seq') INTO next_val;
  RETURN 'BAT-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Stock Serials
CREATE SEQUENCE IF NOT EXISTS stock_serial_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_stock_serial_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('stock_serial_number_seq') INTO next_val;
  RETURN 'SER-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. STOCK BATCHES / LOT TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.stock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_stock_batch_number(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  manufacture_date DATE,
  expiry_date DATE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (quantity >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN (
    'AVAILABLE',
    'QUARANTINED',
    'EXPIRED',
    'REJECTED',
    'BLOCKED',
    'CONSUMED'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_stock_batches_updated_at
BEFORE UPDATE ON public.stock_batches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. SERIAL NUMBERS TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.stock_serials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number VARCHAR(100) NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK' CHECK (status IN (
    'IN_STOCK',
    'RESERVED',
    'ISSUED',
    'IN_PRODUCTION',
    'UNDER_MAINTENANCE',
    'SOLD',
    'SCRAPPED',
    'RETURNED'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_serial UNIQUE (product_id, serial_number)
);

CREATE TRIGGER update_stock_serials_updated_at
BEFORE UPDATE ON public.stock_serials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. STOCK RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_stock_reservation_number(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  fulfilled_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (fulfilled_quantity >= 0),
  reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('SALES_ORDER', 'PRODUCTION_ORDER', 'INTERNAL', 'OTHER')),
  reference_id UUID,
  status VARCHAR(25) NOT NULL DEFAULT 'RESERVED' CHECK (status IN (
    'DRAFT',
    'RESERVED',
    'PARTIALLY_FULFILLED',
    'FULFILLED',
    'RELEASED',
    'CANCELLED'
  )),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_stock_reservations_updated_at
BEFORE UPDATE ON public.stock_reservations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. STOCK TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_stock_transfer_number(),
  source_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  source_location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  destination_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  destination_location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL,
  serial_number_id UUID REFERENCES public.stock_serials(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  status VARCHAR(25) NOT NULL DEFAULT 'APPROVED' CHECK (status IN (
    'DRAFT',
    'REQUESTED',
    'APPROVED',
    'TRANSFERRED_OUT',
    'COMPLETED',
    'CANCELLED'
  )),
  reason VARCHAR(200) NOT NULL,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_stock_transfers_updated_at
BEFORE UPDATE ON public.stock_transfers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. STOCK ADJUSTMENTS & PHYSICAL COUNTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_stock_adjustment_number(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  expected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (expected_quantity >= 0),
  counted_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (counted_quantity >= 0),
  variance_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  adjustment_type VARCHAR(25) NOT NULL CHECK (adjustment_type IN ('ADJUSTMENT_IN', 'ADJUSTMENT_OUT')),
  reason VARCHAR(150) NOT NULL CHECK (reason IN (
    'Cycle Count Difference',
    'Damaged',
    'Expired',
    'Found',
    'Data Correction',
    'Quality Rejection',
    'Other'
  )),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'POSTED', 'REJECTED')),
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_stock_adjustments_updated_at
BEFORE UPDATE ON public.stock_adjustments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. REORDER LEVELS & SAFETY STOCK TABLE
CREATE TABLE IF NOT EXISTS public.stock_reorder_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (minimum_stock >= 0),
  reorder_point NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (reorder_point >= 0),
  safety_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (safety_stock >= 0),
  maximum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (maximum_stock >= 0),
  reorder_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (reorder_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_wh_reorder UNIQUE (product_id, warehouse_id)
);

CREATE TRIGGER update_stock_reorder_levels_updated_at
BEFORE UPDATE ON public.stock_reorder_levels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_stock_batches_prod ON public.stock_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_batches_wh ON public.stock_batches(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_batches_status ON public.stock_batches(status);
CREATE INDEX IF NOT EXISTS idx_stock_serials_prod ON public.stock_serials(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_serials_wh ON public.stock_serials(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_serials_status ON public.stock_serials(status);
CREATE INDEX IF NOT EXISTS idx_stock_res_prod ON public.stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_res_wh ON public.stock_reservations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_res_status ON public.stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_stock_trf_prod ON public.stock_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_trf_status ON public.stock_transfers(status);
CREATE INDEX IF NOT EXISTS idx_stock_adj_prod ON public.stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_status ON public.stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_reorder_levels_prod ON public.stock_reorder_levels(product_id);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reorder_levels ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated staff
CREATE POLICY "Authenticated users can view stock batches" ON public.stock_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view stock serials" ON public.stock_serials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view stock reservations" ON public.stock_reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view stock transfers" ON public.stock_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view stock adjustments" ON public.stock_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view reorder levels" ON public.stock_reorder_levels FOR SELECT TO authenticated USING (true);

-- Manage policies for authorized roles
CREATE POLICY "Authorized roles manage stock batches" ON public.stock_batches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('admin', 'warehouse_manager', 'inventory_manager', 'quality_manager', 'executive')));

CREATE POLICY "Authorized roles manage stock serials" ON public.stock_serials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('admin', 'warehouse_manager', 'inventory_manager', 'quality_manager', 'executive')));

CREATE POLICY "Authorized roles manage stock reservations" ON public.stock_reservations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('admin', 'warehouse_manager', 'inventory_manager', 'sales_manager', 'production_manager', 'executive')));

CREATE POLICY "Authorized roles manage stock transfers" ON public.stock_transfers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('admin', 'warehouse_manager', 'inventory_manager', 'executive')));

CREATE POLICY "Authorized roles manage stock adjustments" ON public.stock_adjustments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('admin', 'warehouse_manager', 'inventory_manager', 'executive')));

CREATE POLICY "Authorized roles manage reorder levels" ON public.stock_reorder_levels FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('admin', 'warehouse_manager', 'inventory_manager', 'purchase_manager', 'executive')));

-- Service role full access policies
CREATE POLICY service_role_all_batches ON public.stock_batches FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_serials ON public.stock_serials FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_reservations ON public.stock_reservations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_transfers ON public.stock_transfers FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_adjustments ON public.stock_adjustments FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_reorder ON public.stock_reorder_levels FOR ALL TO service_role USING (true);
