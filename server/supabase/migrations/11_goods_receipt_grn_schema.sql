-- ==============================================================================
-- KOLMEKS ERP — GOODS RECEIPT / GRN MANAGEMENT SCHEMA MIGRATION
-- Migration File: 11_goods_receipt_grn_schema.sql
-- Description: Creates sequence generator, goods_receipts header, goods_receipt_items,
--              goods_receipt_activities tables, indexes, triggers and RLS policies.
-- ==============================================================================

-- 1. SEQUENCE & GENERATOR FUNCTION FOR GRN NUMBER (GRN-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS public.grn_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_grn_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year TEXT;
  seq_num TEXT;
  new_grn_number VARCHAR(50);
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num := LPAD(NEXTVAL('public.grn_number_seq')::TEXT, 6, '0');
  new_grn_number := 'GRN-' || current_year || '-' || seq_num;
  RETURN new_grn_number;
END;
$$ LANGUAGE plpgsql;

-- 2. GOODS RECEIPTS HEADER TABLE
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_grn_number(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_reference VARCHAR(100),
  received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  status VARCHAR(25) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on goods_receipts
CREATE TRIGGER update_goods_receipts_updated_at
BEFORE UPDATE ON public.goods_receipts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. GOODS RECEIPT ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  purchase_order_item_id UUID NOT NULL REFERENCES public.purchase_order_items(id) ON DELETE RESTRICT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  ordered_quantity NUMERIC(12, 2) NOT NULL CHECK (ordered_quantity > 0),
  previously_received_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (previously_received_quantity >= 0),
  received_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (received_quantity >= 0),
  rejected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (rejected_quantity >= 0),
  accepted_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (accepted_quantity >= 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on goods_receipt_items
CREATE TRIGGER update_goods_receipt_items_updated_at
BEFORE UPDATE ON public.goods_receipt_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. GOODS RECEIPT ACTIVITIES / AUDIT TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.goods_receipt_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_goods_receipts_grn_number ON public.goods_receipts(grn_number);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_po_id ON public.goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_supplier_id ON public.goods_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON public.goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_receipt_date ON public.goods_receipts(receipt_date);

CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_grn_id ON public.goods_receipt_items(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_po_item_id ON public.goods_receipt_items(purchase_order_item_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_activities_grn_id ON public.goods_receipt_activities(goods_receipt_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_all_goods_receipts ON public.goods_receipts;
CREATE POLICY authenticated_all_goods_receipts ON public.goods_receipts FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_goods_receipt_items ON public.goods_receipt_items;
CREATE POLICY authenticated_all_goods_receipt_items ON public.goods_receipt_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_goods_receipt_activities ON public.goods_receipt_activities;
CREATE POLICY authenticated_all_goods_receipt_activities ON public.goods_receipt_activities FOR ALL TO authenticated USING (true);
