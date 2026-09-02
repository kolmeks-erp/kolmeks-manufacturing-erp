-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED SALES & DISTRIBUTION MODULE
-- Migration Script: 41_advanced_sales_distribution_schema.sql
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SAFELY EXTEND QUOTATIONS TABLE
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS terms TEXT;

-- 2. SAFELY EXTEND SALES ORDERS TABLE
ALTER TABLE public.sales_orders
  ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 3. SAFELY EXTEND SALES ORDER ITEMS TABLE (FOR RESERVATION & FULFILLMENT LOGIC)
ALTER TABLE public.sales_order_items
  ADD COLUMN IF NOT EXISTS reserved_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (reserved_quantity >= 0),
  ADD COLUMN IF NOT EXISTS picked_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (picked_quantity >= 0),
  ADD COLUMN IF NOT EXISTS packed_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (packed_quantity >= 0),
  ADD COLUMN IF NOT EXISTS delivered_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (delivered_quantity >= 0),
  ADD COLUMN IF NOT EXISTS backorder_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (backorder_quantity >= 0);

-- 4. SEQUENCES AND GENERATOR FUNCTIONS FOR DOCUMENT NUMBERS

-- Pickings Sequence
CREATE SEQUENCE IF NOT EXISTS sales_picking_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_sales_picking_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('sales_picking_number_seq') INTO next_val;
  RETURN 'PK-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Packings Sequence
CREATE SEQUENCE IF NOT EXISTS sales_packing_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_sales_packing_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('sales_packing_number_seq') INTO next_val;
  RETURN 'PAK-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Delivery Orders Sequence
CREATE SEQUENCE IF NOT EXISTS delivery_order_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_delivery_order_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('delivery_order_number_seq') INTO next_val;
  RETURN 'DO-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Sales Returns Sequence
CREATE SEQUENCE IF NOT EXISTS sales_return_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_sales_return_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('sales_return_number_seq') INTO next_val;
  RETURN 'SR-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Credit Notes Sequence
CREATE SEQUENCE IF NOT EXISTS credit_note_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_credit_note_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year VARCHAR(4);
  next_val INT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT nextval('credit_note_number_seq') INTO next_val;
  RETURN 'CN-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 5. PRICING RULES & CUSTOMER PRICING TABLE
CREATE TABLE IF NOT EXISTS public.sales_pricings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE, -- NULL means default product price
  base_price NUMERIC(15, 2) NOT NULL CHECK (base_price >= 0),
  min_quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00 CHECK (min_quantity > 0),
  discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PICKING LISTS TABLE
CREATE TABLE IF NOT EXISTS public.sales_pickings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picking_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_sales_picking_number(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  picker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'IN_PROGRESS',
    'PARTIALLY_PICKED',
    'PICKED',
    'CANCELLED'
  )),
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PICKING ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sales_picking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picking_id UUID NOT NULL REFERENCES public.sales_pickings(id) ON DELETE CASCADE,
  sales_order_item_id UUID REFERENCES public.sales_order_items(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  requested_quantity NUMERIC(12, 2) NOT NULL CHECK (requested_quantity > 0),
  picked_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (picked_quantity >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PICKED', 'SHORTAGE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PACKING TABLE
CREATE TABLE IF NOT EXISTS public.sales_packings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_sales_packing_number(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
  picking_id UUID REFERENCES public.sales_pickings(id) ON DELETE SET NULL,
  packer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_packages INT NOT NULL DEFAULT 1 CHECK (total_packages >= 1),
  total_weight_kg NUMERIC(10, 2) DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'IN_PROGRESS',
    'PACKED',
    'CANCELLED'
  )),
  notes TEXT,
  packed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PACKING ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sales_packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_id UUID NOT NULL REFERENCES public.sales_packings(id) ON DELETE CASCADE,
  sales_order_item_id UUID REFERENCES public.sales_order_items(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  package_number VARCHAR(50) NOT NULL DEFAULT 'PKG-01',
  packed_quantity NUMERIC(12, 2) NOT NULL CHECK (packed_quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DELIVERY ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_delivery_order_number(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  packing_id UUID REFERENCES public.sales_packings(id) ON DELETE SET NULL,
  delivery_address TEXT,
  carrier VARCHAR(100),
  tracking_reference VARCHAR(100),
  dispatch_date TIMESTAMPTZ,
  expected_delivery_date DATE,
  actual_delivery_date TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT',
    'READY',
    'DISPATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'PARTIALLY_DELIVERED',
    'FAILED',
    'CANCELLED'
  )),
  proof_reference TEXT,
  confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DELIVERY ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  sales_order_item_id UUID REFERENCES public.sales_order_items(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL,
  serial_number_id UUID REFERENCES public.stock_serials(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SALES RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.sales_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_sales_return_number(),
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  delivery_id UUID REFERENCES public.delivery_orders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
    'REQUESTED',
    'APPROVED',
    'RECEIVED',
    'INSPECTING',
    'ACCEPTED',
    'REJECTED',
    'CREDITED',
    'CLOSED'
  )),
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SALES RETURN ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sales_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES public.sales_returns(id) ON DELETE CASCADE,
  sales_order_item_id UUID REFERENCES public.sales_order_items(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  inspected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (inspected_quantity >= 0),
  quarantined_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (quarantined_quantity >= 0),
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CREDIT NOTES TABLE
CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_credit_note_number(),
  sales_return_id UUID REFERENCES public.sales_returns(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.sales_invoices(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  credit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOIDED')),
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_sales_pricings_prod ON public.sales_pricings(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_pricings_cust ON public.sales_pricings(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_pickings_so ON public.sales_pickings(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_pickings_status ON public.sales_pickings(status);
CREATE INDEX IF NOT EXISTS idx_sales_packings_so ON public.sales_packings(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_so ON public.delivery_orders(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_cust ON public.delivery_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON public.delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_returns_so ON public.sales_returns(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_cust ON public.sales_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_status ON public.sales_returns(status);
CREATE INDEX IF NOT EXISTS idx_credit_notes_return ON public.credit_notes(sales_return_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_cust ON public.credit_notes(customer_id);

-- 16. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.sales_pricings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_pickings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_picking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_packings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Full Access)
CREATE POLICY service_role_all_sales_pricings ON public.sales_pricings FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_pickings ON public.sales_pickings FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_picking_items ON public.sales_picking_items FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_packings ON public.sales_packings FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_packing_items ON public.sales_packing_items FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_delivery_orders ON public.delivery_orders FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_delivery_order_items ON public.delivery_order_items FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_returns ON public.sales_returns FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_return_items ON public.sales_return_items FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_credit_notes ON public.credit_notes FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
CREATE POLICY auth_all_sales_pricings ON public.sales_pricings FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_sales_pickings ON public.sales_pickings FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_sales_picking_items ON public.sales_picking_items FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_sales_packings ON public.sales_packings FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_sales_packing_items ON public.sales_packing_items FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_delivery_orders ON public.delivery_orders FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_delivery_order_items ON public.delivery_order_items FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_sales_returns ON public.sales_returns FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_sales_return_items ON public.sales_return_items FOR ALL TO authenticated USING (true);
CREATE POLICY auth_all_credit_notes ON public.credit_notes FOR ALL TO authenticated USING (true);
