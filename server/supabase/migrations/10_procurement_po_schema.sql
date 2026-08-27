-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP — PROCUREMENT, REQUISITIONS & PURCHASE ORDERS SCHEMA
-- Migration Version: 10_procurement_po_schema.sql
-- ==============================================================================

-- 1. PURCHASE REQUISITIONS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_number VARCHAR(50) UNIQUE NOT NULL,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  department VARCHAR(100) DEFAULT 'Manufacturing',
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  reason VARCHAR(150) NOT NULL DEFAULT 'Production requirement',
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED')),
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at on purchase_requisitions
DROP TRIGGER IF EXISTS update_purchase_requisitions_updated_at ON public.purchase_requisitions;
CREATE TRIGGER update_purchase_requisitions_updated_at
BEFORE UPDATE ON public.purchase_requisitions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. PURCHASE REQUISITION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_requisition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  required_date DATE,
  estimated_unit_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (estimated_unit_cost >= 0),
  notes TEXT,
  line_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at on purchase_requisition_items
DROP TRIGGER IF EXISTS update_purchase_requisition_items_updated_at ON public.purchase_requisition_items;
CREATE TRIGGER update_purchase_requisition_items_updated_at
BEFORE UPDATE ON public.purchase_requisition_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. PURCHASE REQUISITION ACTIVITIES (Audit Log)
CREATE TABLE IF NOT EXISTS public.purchase_requisition_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SAFELY EXTEND EXISTING PURCHASE ORDERS TABLE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'requisition_id') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN requisition_id UUID REFERENCES public.purchase_requisitions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'currency') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN currency VARCHAR(10) DEFAULT 'EUR';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'subtotal') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN subtotal NUMERIC(12, 2) DEFAULT 0.00 CHECK (subtotal >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'discount_amount') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN discount_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (discount_amount >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'tax_amount') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN tax_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (tax_amount >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'payment_terms') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN payment_terms VARCHAR(150) DEFAULT 'Net 30 Days';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'delivery_terms') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN delivery_terms VARCHAR(150) DEFAULT 'FOB Factory';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'supplier_reference') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN supplier_reference VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'notes') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'approved_by') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'approved_at') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'priority') THEN
    ALTER TABLE public.purchase_orders ADD COLUMN priority VARCHAR(20) DEFAULT 'NORMAL';
  END IF;
END $$;

-- Safely relax/update purchase_orders status constraint
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_status_check
  CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'ON_HOLD', 'CANCELLED', 'draft', 'ordered', 'partially_received', 'received', 'cancelled'));

-- 5. SAFELY EXTEND EXISTING PURCHASE ORDER ITEMS TABLE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'discount_type') THEN
    ALTER TABLE public.purchase_order_items ADD COLUMN discount_type VARCHAR(20) DEFAULT 'amount' CHECK (discount_type IN ('amount', 'percentage'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'discount') THEN
    ALTER TABLE public.purchase_order_items ADD COLUMN discount NUMERIC(12, 2) DEFAULT 0.00 CHECK (discount >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'tax_rate') THEN
    ALTER TABLE public.purchase_order_items ADD COLUMN tax_rate NUMERIC(5, 2) DEFAULT 0.00 CHECK (tax_rate >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'line_subtotal') THEN
    ALTER TABLE public.purchase_order_items ADD COLUMN line_subtotal NUMERIC(12, 2) DEFAULT 0.00 CHECK (line_subtotal >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'line_tax') THEN
    ALTER TABLE public.purchase_order_items ADD COLUMN line_tax NUMERIC(12, 2) DEFAULT 0.00 CHECK (line_tax >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_items' AND column_name = 'line_order') THEN
    ALTER TABLE public.purchase_order_items ADD COLUMN line_order INT DEFAULT 0;
  END IF;
END $$;

-- 6. PURCHASE ORDER ACTIVITIES (Audit Log)
CREATE TABLE IF NOT EXISTS public.purchase_order_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_number ON public.purchase_requisitions(requisition_number);
CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_requested_by ON public.purchase_requisitions(requested_by);
CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_status ON public.purchase_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_priority ON public.purchase_requisitions(priority);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_requisition ON public.purchase_orders(requisition_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON public.purchase_orders(order_date);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requisition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requisition_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_activities ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS service_role_all_purchase_requisitions ON public.purchase_requisitions;
CREATE POLICY service_role_all_purchase_requisitions ON public.purchase_requisitions FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_purchase_requisition_items ON public.purchase_requisition_items;
CREATE POLICY service_role_all_purchase_requisition_items ON public.purchase_requisition_items FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_purchase_requisition_activities ON public.purchase_requisition_activities;
CREATE POLICY service_role_all_purchase_requisition_activities ON public.purchase_requisition_activities FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_purchase_orders ON public.purchase_orders;
CREATE POLICY service_role_all_purchase_orders ON public.purchase_orders FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_purchase_order_items ON public.purchase_order_items;
CREATE POLICY service_role_all_purchase_order_items ON public.purchase_order_items FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_purchase_order_activities ON public.purchase_order_activities;
CREATE POLICY service_role_all_purchase_order_activities ON public.purchase_order_activities FOR ALL TO service_role USING (true);

-- Allow authenticated users to view/manage procurement records
DROP POLICY IF EXISTS authenticated_all_purchase_requisitions ON public.purchase_requisitions;
CREATE POLICY authenticated_all_purchase_requisitions ON public.purchase_requisitions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_purchase_requisition_items ON public.purchase_requisition_items;
CREATE POLICY authenticated_all_purchase_requisition_items ON public.purchase_requisition_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_purchase_requisition_activities ON public.purchase_requisition_activities;
CREATE POLICY authenticated_all_purchase_requisition_activities ON public.purchase_requisition_activities FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_purchase_orders ON public.purchase_orders;
CREATE POLICY authenticated_all_purchase_orders ON public.purchase_orders FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_purchase_order_items ON public.purchase_order_items;
CREATE POLICY authenticated_all_purchase_order_items ON public.purchase_order_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_purchase_order_activities ON public.purchase_order_activities;
CREATE POLICY authenticated_all_purchase_order_activities ON public.purchase_order_activities FOR ALL TO authenticated USING (true);
