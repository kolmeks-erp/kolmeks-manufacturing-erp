-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED PROCUREMENT & PURCHASE-TO-PAY (P2P) SCHEMA
-- Migration Version: 42_advanced_procurement_p2p_schema.sql
-- ==============================================================================

-- 1. SAFELY EXTEND SUPPLIERS TABLE FOR ONBOARDING, EVALUATION & TOLERANCE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'onboarding_status') THEN
    ALTER TABLE public.suppliers ADD COLUMN onboarding_status VARCHAR(30) DEFAULT 'APPROVED' CHECK (onboarding_status IN ('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'onboarding_remarks') THEN
    ALTER TABLE public.suppliers ADD COLUMN onboarding_remarks TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'approved_by') THEN
    ALTER TABLE public.suppliers ADD COLUMN approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'approved_at') THEN
    ALTER TABLE public.suppliers ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'rating') THEN
    ALTER TABLE public.suppliers ADD COLUMN rating NUMERIC(3, 2) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'quality_score') THEN
    ALTER TABLE public.suppliers ADD COLUMN quality_score NUMERIC(5, 2) DEFAULT 100.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'delivery_score') THEN
    ALTER TABLE public.suppliers ADD COLUMN delivery_score NUMERIC(5, 2) DEFAULT 100.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'price_score') THEN
    ALTER TABLE public.suppliers ADD COLUMN price_score NUMERIC(5, 2) DEFAULT 100.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'service_score') THEN
    ALTER TABLE public.suppliers ADD COLUMN service_score NUMERIC(5, 2) DEFAULT 100.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'overall_score') THEN
    ALTER TABLE public.suppliers ADD COLUMN overall_score NUMERIC(5, 2) DEFAULT 100.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'over_receipt_tolerance_pct') THEN
    ALTER TABLE public.suppliers ADD COLUMN over_receipt_tolerance_pct NUMERIC(5, 2) DEFAULT 5.00 CHECK (over_receipt_tolerance_pct >= 0);
  END IF;
END $$;

-- 2. CREATE SUPPLIER EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quality_score NUMERIC(5, 2) DEFAULT 100.00 CHECK (quality_score BETWEEN 0 AND 100),
  delivery_score NUMERIC(5, 2) DEFAULT 100.00 CHECK (delivery_score BETWEEN 0 AND 100),
  price_score NUMERIC(5, 2) DEFAULT 100.00 CHECK (price_score BETWEEN 0 AND 100),
  service_score NUMERIC(5, 2) DEFAULT 100.00 CHECK (service_score BETWEEN 0 AND 100),
  overall_score NUMERIC(5, 2) DEFAULT 100.00 CHECK (overall_score BETWEEN 0 AND 100),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREATE SUPPLIER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  document_name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Certification', 'Agreement', 'Compliance', 'Banking', 'Other')),
  file_path TEXT NOT NULL,
  expiry_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'EXPIRING_SOON', 'EXPIRED')),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREATE SUPPLIER QUOTATIONS TABLE
CREATE SEQUENCE IF NOT EXISTS public.supplier_quotation_seq START WITH 101;

CREATE TABLE IF NOT EXISTS public.supplier_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_reference VARCHAR(100),
  rfq_id UUID REFERENCES public.rfqs(id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_date DATE,
  lead_time_days INT DEFAULT 7 CHECK (lead_time_days >= 0),
  delivery_date DATE,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  payment_terms VARCHAR(150) DEFAULT 'Net 30 Days',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('DRAFT', 'RECEIVED', 'UNDER_REVIEW', 'SELECTED', 'REJECTED', 'EXPIRED')),
  remarks TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_quotation_id UUID NOT NULL REFERENCES public.supplier_quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) DEFAULT 'pcs',
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  discount_percentage NUMERIC(5, 2) DEFAULT 0.00 CHECK (discount_percentage >= 0),
  line_subtotal NUMERIC(12, 2) NOT NULL CHECK (line_subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATE SUPPLIER SELECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
  selected_quotation_id UUID NOT NULL REFERENCES public.supplier_quotations(id) ON DELETE CASCADE,
  selected_supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  selected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CREATE PURCHASE ORDER AMENDMENTS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_order_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  amendment_number INT NOT NULL DEFAULT 1,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CREATE SUPPLIER RETURNS TABLE
CREATE SEQUENCE IF NOT EXISTS public.supplier_return_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_supplier_return_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  current_year TEXT;
  seq_num TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num := LPAD(NEXTVAL('public.supplier_return_seq')::TEXT, 6, '0');
  RETURN 'SRN-' || current_year || '-' || seq_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.supplier_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_supplier_return_number(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  goods_receipt_id UUID REFERENCES public.goods_receipts(id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('DRAFT', 'REQUESTED', 'APPROVED', 'DISPATCHED', 'COMPLETED', 'REJECTED')),
  total_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_amount >= 0),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_return_id UUID NOT NULL REFERENCES public.supplier_returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) DEFAULT 0.00 CHECK (unit_price >= 0),
  line_total NUMERIC(12, 2) DEFAULT 0.00 CHECK (line_total >= 0),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR ADVANCED PROCUREMENT PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_supplier_evaluations_supplier ON public.supplier_evaluations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_documents_supplier ON public.supplier_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotations_rfq ON public.supplier_quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotations_supplier ON public.supplier_quotations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_supplier ON public.supplier_returns(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_grn ON public.supplier_returns(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_po_amendments_po ON public.purchase_order_amendments(purchase_order_id);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.supplier_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_return_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_all_supplier_evaluations ON public.supplier_evaluations;
CREATE POLICY authenticated_all_supplier_evaluations ON public.supplier_evaluations FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_supplier_documents ON public.supplier_documents;
CREATE POLICY authenticated_all_supplier_documents ON public.supplier_documents FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_supplier_quotations ON public.supplier_quotations;
CREATE POLICY authenticated_all_supplier_quotations ON public.supplier_quotations FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_supplier_quotation_items ON public.supplier_quotation_items;
CREATE POLICY authenticated_all_supplier_quotation_items ON public.supplier_quotation_items FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_supplier_selections ON public.supplier_selections;
CREATE POLICY authenticated_all_supplier_selections ON public.supplier_selections FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_po_amendments ON public.purchase_order_amendments;
CREATE POLICY authenticated_all_po_amendments ON public.purchase_order_amendments FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_supplier_returns ON public.supplier_returns;
CREATE POLICY authenticated_all_supplier_returns ON public.supplier_returns FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_supplier_return_items ON public.supplier_return_items;
CREATE POLICY authenticated_all_supplier_return_items ON public.supplier_return_items FOR ALL TO authenticated USING (true);
