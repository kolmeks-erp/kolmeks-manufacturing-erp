-- ============================================================================
-- KOLMEKS ERP — FIXED ASSET FINANCE & DEPRECIATION MODULE SCHEMA
-- Migration: 23_fixed_asset_finance_schema.sql
-- Prompt 32: Fixed Asset Finance + Capitalization + Straight Line Depreciation + Transfers + Disposals + Accounting Integration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. SEED GL ACCOUNTS IN CHART OF ACCOUNTS FOR FIXED ASSETS & DEPRECIATION
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_asset_header_id UUID;
    v_fixed_asset_header_id UUID;
    v_exp_header_id UUID;
    v_rev_header_id UUID;
BEGIN
    SELECT id INTO v_asset_header_id FROM public.chart_of_accounts WHERE account_code = '1000' LIMIT 1;
    SELECT id INTO v_fixed_asset_header_id FROM public.chart_of_accounts WHERE account_code = '1500' LIMIT 1;
    SELECT id INTO v_exp_header_id FROM public.chart_of_accounts WHERE account_code = '5000' LIMIT 1;
    SELECT id INTO v_rev_header_id FROM public.chart_of_accounts WHERE account_code = '4000' LIMIT 1;

    -- 1520 Office Equipment & Computers
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1520', 'Office Equipment & Computers', 'ASSET', v_fixed_asset_header_id, 'Fixed Assets', 'Computers, servers, network hardware & IT equipment', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1530 Vehicles & Transport Fleet
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1530', 'Vehicles & Transport Fleet', 'ASSET', v_fixed_asset_header_id, 'Fixed Assets', 'Company trucks, forklifts & transport vehicles', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1550 Accumulated Depreciation - Property, Plant & Equipment (Contra Asset - CREDIT balance)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, is_control_account, normal_balance)
    VALUES ('1550', 'Accumulated Depreciation - PPE', 'ASSET', v_fixed_asset_header_id, 'Fixed Assets', 'Accumulated valuation offset contra-asset account', TRUE, 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5600 Depreciation Expense - Property, Plant & Equipment
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5600', 'Depreciation Expense - PPE', 'EXPENSE', v_exp_header_id, 'Operating Expenses', 'Periodic fixed asset depreciation expense', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 4300 Gain on Disposal of Fixed Assets
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('4300', 'Gain on Disposal of Fixed Assets', 'REVENUE', v_rev_header_id, 'Other Revenue', 'Gain recognized on sale/disposal of fixed assets', 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5700 Loss on Disposal of Fixed Assets
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5700', 'Loss on Disposal of Fixed Assets', 'EXPENSE', v_exp_header_id, 'Other Expenses', 'Loss recognized on retirement/disposal of fixed assets', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;
END $$;

-- ----------------------------------------------------------------------------
-- 2. FIXED ASSET CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fixed_asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_asset_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    default_accumulated_depreciation_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    default_depreciation_expense_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    default_useful_life_months INT NOT NULL DEFAULT 60 CHECK (default_useful_life_months > 0),
    default_depreciation_method VARCHAR(30) NOT NULL DEFAULT 'STRAIGHT_LINE' CHECK (default_depreciation_method IN ('STRAIGHT_LINE')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fac_code ON public.fixed_asset_categories(code);
CREATE INDEX IF NOT EXISTS idx_fac_active ON public.fixed_asset_categories(is_active);

-- ----------------------------------------------------------------------------
-- 3. FIXED ASSET SEQUENCE & FIXED ASSETS TABLE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS fixed_asset_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_number VARCHAR(50) UNIQUE NOT NULL,
    operational_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL, -- Link to Prompt 25 Maintenance Asset
    asset_name VARCHAR(200) NOT NULL,
    category_id UUID NOT NULL REFERENCES public.fixed_asset_categories(id) ON DELETE RESTRICT,
    description TEXT,
    acquisition_date DATE NOT NULL,
    capitalization_date DATE,
    acquisition_cost NUMERIC(15, 2) NOT NULL CHECK (acquisition_cost >= 0),
    residual_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (residual_value >= 0),
    useful_life_months INT NOT NULL CHECK (useful_life_months > 0),
    depreciation_method VARCHAR(30) NOT NULL DEFAULT 'STRAIGHT_LINE' CHECK (depreciation_method IN ('STRAIGHT_LINE')),
    accumulated_depreciation NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (accumulated_depreciation >= 0),
    net_book_value NUMERIC(15, 2) NOT NULL CHECK (net_book_value >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT',
        'ACQUIRED',
        'PENDING_CAPITALIZATION',
        'CAPITALIZED',
        'ACTIVE',
        'FULLY_DEPRECIATED',
        'TRANSFERRED',
        'DISPOSED',
        'RETIRED'
    )),
    cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    location_id VARCHAR(100),
    purchase_invoice_id UUID REFERENCES public.purchase_invoices(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    asset_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    accumulated_depreciation_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    depreciation_expense_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    disposal_date DATE,
    disposal_value NUMERIC(15, 2),
    gain_loss_amount NUMERIC(15, 2),
    capitalization_journal_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    disposal_journal_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT chk_residual_cost CHECK (residual_value <= acquisition_cost)
);

CREATE INDEX IF NOT EXISTS idx_fa_number ON public.fixed_assets(asset_number);
CREATE INDEX IF NOT EXISTS idx_fa_category ON public.fixed_assets(category_id);
CREATE INDEX IF NOT EXISTS idx_fa_status ON public.fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_fa_cost_center ON public.fixed_assets(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_fa_operational_asset ON public.fixed_assets(operational_asset_id);
CREATE INDEX IF NOT EXISTS idx_fa_purchase_invoice ON public.fixed_assets(purchase_invoice_id);

-- ----------------------------------------------------------------------------
-- 4. DEPRECIATION RUNS & DEPRECIATION ENTRIES TABLES
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS depreciation_run_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.depreciation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_number VARCHAR(50) UNIQUE NOT NULL,
    period_id UUID REFERENCES public.financial_periods(id) ON DELETE RESTRICT,
    period_name VARCHAR(50) NOT NULL,
    run_date DATE NOT NULL,
    total_depreciation_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_depreciation_amount >= 0),
    total_assets_count INT NOT NULL DEFAULT 0 CHECK (total_assets_count >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PREVIEW', 'POSTED', 'VOIDED')),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dep_run_number ON public.depreciation_runs(run_number);
CREATE INDEX IF NOT EXISTS idx_dep_run_period ON public.depreciation_runs(period_id);
CREATE INDEX IF NOT EXISTS idx_dep_run_status ON public.depreciation_runs(status);

CREATE TABLE IF NOT EXISTS public.fixed_asset_depreciation_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.fixed_assets(id) ON DELETE CASCADE,
    depreciation_run_id UUID REFERENCES public.depreciation_runs(id) ON DELETE SET NULL,
    period_name VARCHAR(50) NOT NULL,
    depreciation_date DATE NOT NULL,
    opening_nbv NUMERIC(15, 2) NOT NULL CHECK (opening_nbv >= 0),
    depreciation_amount NUMERIC(15, 2) NOT NULL CHECK (depreciation_amount >= 0),
    accumulated_depreciation NUMERIC(15, 2) NOT NULL CHECK (accumulated_depreciation >= 0),
    closing_nbv NUMERIC(15, 2) NOT NULL CHECK (closing_nbv >= 0),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'POSTED' CHECK (status IN ('DRAFT', 'PREVIEW', 'POSTED', 'VOIDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_asset_period UNIQUE (asset_id, period_name)
);

CREATE INDEX IF NOT EXISTS idx_fade_asset ON public.fixed_asset_depreciation_entries(asset_id);
CREATE INDEX IF NOT EXISTS idx_fade_run ON public.fixed_asset_depreciation_entries(depreciation_run_id);
CREATE INDEX IF NOT EXISTS idx_fade_period ON public.fixed_asset_depreciation_entries(period_name);

-- ----------------------------------------------------------------------------
-- 5. ASSET TRANSFERS TABLE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS asset_transfer_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.fixed_asset_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID NOT NULL REFERENCES public.fixed_assets(id) ON DELETE CASCADE,
    from_cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    to_cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    transfer_date DATE NOT NULL,
    reason TEXT NOT NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fat_number ON public.fixed_asset_transfers(transfer_number);
CREATE INDEX IF NOT EXISTS idx_fat_asset ON public.fixed_asset_transfers(asset_id);

-- ----------------------------------------------------------------------------
-- 6. ASSET DISPOSALS TABLE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS asset_disposal_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.fixed_asset_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disposal_number VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID NOT NULL REFERENCES public.fixed_assets(id) ON DELETE CASCADE,
    disposal_date DATE NOT NULL,
    disposal_reason VARCHAR(50) NOT NULL CHECK (disposal_reason IN ('SOLD', 'SCRAPPED', 'LOST', 'RETIRED', 'OTHER')),
    disposal_proceeds NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (disposal_proceeds >= 0),
    book_value_at_disposal NUMERIC(15, 2) NOT NULL CHECK (book_value_at_disposal >= 0),
    accumulated_depreciation_at_disposal NUMERIC(15, 2) NOT NULL CHECK (accumulated_depreciation_at_disposal >= 0),
    gain_loss_amount NUMERIC(15, 2) NOT NULL, -- Positive = Gain, Negative = Loss
    buyer_reference VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DISPOSED', 'CANCELLED')),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fad_number ON public.fixed_asset_disposals(disposal_number);
CREATE INDEX IF NOT EXISTS idx_fad_asset ON public.fixed_asset_disposals(asset_id);
CREATE INDEX IF NOT EXISTS idx_fad_status ON public.fixed_asset_disposals(status);

-- ----------------------------------------------------------------------------
-- 7. FIXED ASSET AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fixed_asset_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.fixed_assets(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_audit_asset ON public.fixed_asset_audit_logs(asset_id);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.fixed_asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_asset_depreciation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_asset_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_asset_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_asset_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.fixed_asset_categories;
CREATE POLICY "Enable read for authenticated users" ON public.fixed_asset_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.fixed_asset_categories;
CREATE POLICY "Enable write for authenticated staff" ON public.fixed_asset_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.fixed_assets;
CREATE POLICY "Enable read for authenticated users" ON public.fixed_assets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.fixed_assets;
CREATE POLICY "Enable write for authenticated staff" ON public.fixed_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.depreciation_runs;
CREATE POLICY "Enable read for authenticated users" ON public.depreciation_runs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.depreciation_runs;
CREATE POLICY "Enable write for authenticated staff" ON public.depreciation_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.fixed_asset_depreciation_entries;
CREATE POLICY "Enable read for authenticated users" ON public.fixed_asset_depreciation_entries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.fixed_asset_depreciation_entries;
CREATE POLICY "Enable write for authenticated staff" ON public.fixed_asset_depreciation_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.fixed_asset_transfers;
CREATE POLICY "Enable read for authenticated users" ON public.fixed_asset_transfers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.fixed_asset_transfers;
CREATE POLICY "Enable write for authenticated staff" ON public.fixed_asset_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.fixed_asset_disposals;
CREATE POLICY "Enable read for authenticated users" ON public.fixed_asset_disposals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.fixed_asset_disposals;
CREATE POLICY "Enable write for authenticated staff" ON public.fixed_asset_disposals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.fixed_asset_audit_logs;
CREATE POLICY "Enable read for authenticated users" ON public.fixed_asset_audit_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated staff" ON public.fixed_asset_audit_logs;
CREATE POLICY "Enable write for authenticated staff" ON public.fixed_asset_audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 9. INITIAL SEED FIXED ASSET CATEGORIES
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_acc_mach_id UUID;
    v_acc_office_id UUID;
    v_acc_vehicle_id UUID;
    v_acc_accum_dep_id UUID;
    v_acc_dep_exp_id UUID;
BEGIN
    SELECT id INTO v_acc_mach_id FROM public.chart_of_accounts WHERE account_code = '1510' LIMIT 1;
    SELECT id INTO v_acc_office_id FROM public.chart_of_accounts WHERE account_code = '1520' LIMIT 1;
    SELECT id INTO v_acc_vehicle_id FROM public.chart_of_accounts WHERE account_code = '1530' LIMIT 1;
    SELECT id INTO v_acc_accum_dep_id FROM public.chart_of_accounts WHERE account_code = '1550' LIMIT 1;
    SELECT id INTO v_acc_dep_exp_id FROM public.chart_of_accounts WHERE account_code = '5600' LIMIT 1;

    INSERT INTO public.fixed_asset_categories (
        code, name, description, default_asset_account_id, default_accumulated_depreciation_account_id, default_depreciation_expense_account_id, default_useful_life_months, default_depreciation_method
    ) VALUES
        ('FAC-CNC', 'Machinery & CNC Equipment', 'Heavy manufacturing machinery, CNC lathes, vertical machining centers, grinding & winding plant equipment', v_acc_mach_id, v_acc_accum_dep_id, v_acc_dep_exp_id, 120, 'STRAIGHT_LINE'),
        ('FAC-IT', 'Office Equipment & Computers', 'Servers, CAD workstations, laptops, networking routers, printers, and office automation hardware', v_acc_office_id, v_acc_accum_dep_id, v_acc_dep_exp_id, 36, 'STRAIGHT_LINE'),
        ('FAC-VEH', 'Vehicles & Logistics Fleet', 'Material handling forklifts, delivery trucks, sales & executive transport vehicles', v_acc_vehicle_id, v_acc_accum_dep_id, v_acc_dep_exp_id, 60, 'STRAIGHT_LINE'),
        ('FAC-PLANT', 'Plant Tools & Auxiliary Equipment', 'Compressors, industrial cooling towers, overhead cranes, inspection CMM machines', v_acc_mach_id, v_acc_accum_dep_id, v_acc_dep_exp_id, 84, 'STRAIGHT_LINE'),
        ('FAC-FURN', 'Furniture & Fixtures', 'Conference room tables, executive desks, ergonomic chairs, cafeteria fittings', v_acc_office_id, v_acc_accum_dep_id, v_acc_dep_exp_id, 60, 'STRAIGHT_LINE'),
        ('FAC-ELEC', 'Electrical Infrastructure', 'Substation transformers, diesel backup generators, high-voltage panel boards', v_acc_mach_id, v_acc_accum_dep_id, v_acc_dep_exp_id, 120, 'STRAIGHT_LINE')
    ON CONFLICT (code) DO NOTHING;
END $$;
