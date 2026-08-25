-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — INITIAL SUPABASE POSTGRESQL DATABASE SCHEMA
-- Migration Version: 01_initial_schema.sql
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Centralized Function to auto-update updated_at timestamp columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. IDENTITY & ACCESS CONTROL MODULE
-- ==============================================================================

-- 1.1 ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 1.2 PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  department VARCHAR(100),
  profile_image TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically create profile on new Supabase user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'production_manager' LIMIT 1;

  INSERT INTO public.profiles (id, full_name, email, role_id, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    default_role_id,
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution after auth.users signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. MASTER DATA MODULE
-- ==============================================================================

-- 2.1 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.2 MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- e.g. Cast Iron, Stainless Steel, Aluminum, Copper
  grade VARCHAR(50),
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  description TEXT,
  minimum_stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (minimum_stock >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.3 PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  product_type VARCHAR(50) NOT NULL DEFAULT 'component' CHECK (product_type IN ('component', 'assembly', 'motor_part', 'custom')),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  description TEXT,
  drawing_number VARCHAR(100),
  revision VARCHAR(20) DEFAULT 'R0',
  image_url TEXT, -- Intended for Cloudinary URL storage
  minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (minimum_stock >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.4 CUSTOMERS TABLE (B2B Manufacturing Clients)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100) NOT NULL DEFAULT 'Finland',
  address TEXT,
  website VARCHAR(255),
  tax_id VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.5 SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100) NOT NULL DEFAULT 'Finland',
  address TEXT,
  payment_terms VARCHAR(100) DEFAULT 'Net 30',
  lead_time INTEGER DEFAULT 14 CHECK (lead_time >= 0), -- lead time in days
  rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.6 MACHINES TABLE (CNC & Industrial Machinery)
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- e.g. 5-Axis CNC Milling, CNC Lathe, Winding Machine
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  location VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'idle' CHECK (status IN ('running', 'idle', 'maintenance', 'breakdown', 'offline')),
  capacity NUMERIC(10, 2) DEFAULT 100.00 CHECK (capacity >= 0),
  utilization NUMERIC(5, 2) DEFAULT 0.00 CHECK (utilization >= 0 AND utilization <= 100),
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_machines_updated_at
BEFORE UPDATE ON public.machines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.7 WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_warehouses_updated_at
BEFORE UPDATE ON public.warehouses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. SALES / CUSTOMER WORKFLOW MODULE
-- ==============================================================================

-- 3.1 RFQS TABLE (Request for Quotations)
CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  component_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  material VARCHAR(100),
  target_date DATE,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'need_more_information', 'quoted', 'won', 'lost', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_rfqs_updated_at
BEFORE UPDATE ON public.rfqs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.2 RFQ ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.rfq_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- Intended for Cloudinary URL storage
  file_type VARCHAR(50),
  file_size BIGINT CHECK (file_size >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  rfq_id UUID REFERENCES public.rfqs(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  valid_until DATE,
  delivery_time VARCHAR(100),
  terms TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.4 QUOTATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, -- Optional for custom components
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_quotation_items_updated_at
BEFORE UPDATE ON public.quotation_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.5 SALES ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_sales_orders_updated_at
BEFORE UPDATE ON public.sales_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.6 SALES ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_sales_order_items_updated_at
BEFORE UPDATE ON public.sales_order_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. PURCHASING MODULE
-- ==============================================================================

-- 4.1 PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  status VARCHAR(25) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'partially_received', 'received', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4.2 PURCHASE ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  received_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (received_quantity >= 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_purchase_order_items_updated_at
BEFORE UPDATE ON public.purchase_order_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. INVENTORY & STOCK MOVEMENTS MODULE
-- ==============================================================================

-- 5.1 INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  available_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (available_quantity >= 0),
  reserved_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (reserved_quantity >= 0),
  in_production_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (in_production_quantity >= 0),
  minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (minimum_stock >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('received', 'issued', 'transferred', 'consumed', 'adjusted', 'returned')),
  quantity NUMERIC(12, 2) NOT NULL,
  reference_type VARCHAR(50), -- e.g. Purchase Order, Production Order, Delivery, Manual
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. MANUFACTURING & PRODUCTION MODULE
-- ==============================================================================

-- 6.1 PRODUCTION ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_number VARCHAR(50) UNIQUE NOT NULL,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  completed_quantity INTEGER NOT NULL DEFAULT 0 CHECK (completed_quantity >= 0),
  progress NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress >= 0.00 AND progress <= 100.00),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  expected_completion DATE,
  status VARCHAR(25) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'material_pending', 'ready', 'in_production', 'quality_check', 'completed', 'on_hold', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_production_orders_updated_at
BEFORE UPDATE ON public.production_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6.2 PRODUCTION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  operator VARCHAR(150),
  quantity_produced INTEGER NOT NULL DEFAULT 0 CHECK (quantity_produced >= 0),
  quantity_rejected INTEGER NOT NULL DEFAULT 0 CHECK (quantity_rejected >= 0),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. QUALITY CONTROL & METROLOGY MODULE
-- ==============================================================================

-- 7.1 QUALITY INSPECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number VARCHAR(50) UNIQUE NOT NULL,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity_inspected INTEGER NOT NULL CHECK (quantity_inspected >= 0),
  quantity_passed INTEGER NOT NULL DEFAULT 0 CHECK (quantity_passed >= 0),
  quantity_rejected INTEGER NOT NULL DEFAULT 0 CHECK (quantity_rejected >= 0),
  inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  result VARCHAR(20) NOT NULL DEFAULT 'pass' CHECK (result IN ('pass', 'fail', 'rework')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_quality_inspections_updated_at
BEFORE UPDATE ON public.quality_inspections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7.2 QUALITY MEASUREMENTS TABLE (CMM Dimensional Telemetry)
CREATE TABLE IF NOT EXISTS public.quality_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quality_inspection_id UUID NOT NULL REFERENCES public.quality_inspections(id) ON DELETE CASCADE,
  parameter_name VARCHAR(100) NOT NULL, -- e.g. Bore Diameter, Flatness, Surface Roughness
  nominal_value NUMERIC(10, 4) NOT NULL,
  actual_value NUMERIC(10, 4) NOT NULL,
  tolerance NUMERIC(10, 4) NOT NULL DEFAULT 0.0050,
  unit VARCHAR(20) NOT NULL DEFAULT 'mm',
  result VARCHAR(20) NOT NULL DEFAULT 'pass' CHECK (result IN ('pass', 'fail')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. MAINTENANCE MODULE
-- ==============================================================================

-- 8.1 MAINTENANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  technician VARCHAR(150),
  description TEXT NOT NULL,
  parts_used TEXT,
  downtime NUMERIC(6, 2) DEFAULT 0.00 CHECK (downtime >= 0), -- downtime in hours
  next_maintenance DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_maintenance_records_updated_at
BEFORE UPDATE ON public.maintenance_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 9. LOGISTICS & DELIVERY MODULE
-- ==============================================================================

-- 9.1 DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_number VARCHAR(50) UNIQUE NOT NULL,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  dispatch_date DATE,
  expected_delivery DATE,
  tracking_number VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'dispatched', 'in_transit', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_deliveries_updated_at
BEFORE UPDATE ON public.deliveries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9.2 DELIVERY ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_delivery_items_updated_at
BEFORE UPDATE ON public.delivery_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 10. APPLICATION & COMMUNICATIONS MODULE
-- ==============================================================================

-- 10.1 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('rfq', 'low_stock', 'production', 'quality', 'maintenance', 'delivery', 'system')),
  reference_type VARCHAR(50),
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.2 NEWS TABLE (Public Website CMS)
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT, -- Intended for Cloudinary image URL
  category VARCHAR(50) DEFAULT 'Announcements',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 11. INDEXING FOR PERFORMANCE & FAST SEARCH
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_material ON public.products(material_id);
CREATE INDEX IF NOT EXISTS idx_materials_code ON public.materials(material_code);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON public.suppliers(email);
CREATE INDEX IF NOT EXISTS idx_machines_code ON public.machines(machine_code);
CREATE INDEX IF NOT EXISTS idx_rfqs_number ON public.rfqs(rfq_number);
CREATE INDEX IF NOT EXISTS idx_rfqs_customer ON public.rfqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON public.quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON public.quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON public.sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON public.sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON public.purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_production_orders_number ON public.production_orders(production_number);
CREATE INDEX IF NOT EXISTS idx_production_orders_machine ON public.production_orders(machine_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_production ON public.quality_inspections(production_order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_number ON public.deliveries(delivery_number);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) & PUBLIC RFQ SUBMISSION POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Service Role (Server Backend) Full Access Policies
CREATE POLICY service_role_all_roles ON public.roles FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_profiles ON public.profiles FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_categories ON public.categories FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_materials ON public.materials FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_products ON public.products FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_customers ON public.customers FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_suppliers ON public.suppliers FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_machines ON public.machines FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_warehouses ON public.warehouses FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_rfqs ON public.rfqs FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_rfq_attachments ON public.rfq_attachments FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_quotations ON public.quotations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sales_orders ON public.sales_orders FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_purchase_orders ON public.purchase_orders FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_inventory ON public.inventory FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_production ON public.production_orders FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_quality ON public.quality_inspections FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_deliveries ON public.deliveries FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_news ON public.news FOR ALL TO service_role USING (true);

-- Public Website Policies
-- 12.1 Public News Read Policy (Anonymous can view published articles only)
CREATE POLICY public_read_published_news ON public.news FOR SELECT TO anon USING (status = 'published');

-- 12.2 Public RFQ Anonymous Insert Policy (Website RFQ Submission)
-- Allows anonymous visitors to submit RFQs without reading existing RFQs
CREATE POLICY anon_insert_rfq ON public.rfqs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_insert_rfq_attachment ON public.rfq_attachments FOR INSERT TO anon WITH CHECK (true);

-- Authenticated Staff Full Access Policy
CREATE POLICY authenticated_staff_access ON public.profiles FOR SELECT TO authenticated USING (true);
