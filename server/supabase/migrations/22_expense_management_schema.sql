-- ============================================================================
-- KOLMEKS ERP — EXPENSE MANAGEMENT & REIMBURSEMENT SCHEMA
-- Migration: 22_expense_management_schema.sql
-- Prompt 31: Expenses + Expense Claims + Categories + Receipts + Approval + Reimbursements + Budget Check + Accounting Integration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. EXPENSE CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exp_cat_code ON public.expense_categories(code);
CREATE INDEX IF NOT EXISTS idx_exp_cat_active ON public.expense_categories(is_active);

-- ----------------------------------------------------------------------------
-- 2. EXPENSE CLAIM SEQUENCES & EXPENSE CLAIMS TABLE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS expense_claim_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    claim_date DATE NOT NULL,
    description TEXT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    approved_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (approved_amount >= 0),
    reimbursed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (reimbursed_amount >= 0),
    outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (outstanding_amount >= 0),
    cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT',
        'SUBMITTED',
        'MANAGER_REVIEW',
        'FINANCE_REVIEW',
        'APPROVED',
        'REJECTED',
        'RETURNED',
        'REIMBURSEMENT_PENDING',
        'PARTIALLY_REIMBURSED',
        'REIMBURSED',
        'CANCELLED'
    )),
    
    -- Submission Audit
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Review / Approval Audit
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    returned_at TIMESTAMPTZ,
    returned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    return_reason TEXT,
    
    -- Accounting Journal Entry Reference
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exp_claims_number ON public.expense_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_exp_claims_emp ON public.expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_exp_claims_status ON public.expense_claims(status);
CREATE INDEX IF NOT EXISTS idx_exp_claims_date ON public.expense_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_exp_claims_cost_center ON public.expense_claims(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_exp_claims_budget ON public.expense_claims(budget_id);

-- ----------------------------------------------------------------------------
-- 3. EXPENSE ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.expense_claims(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    receipt_url TEXT,
    receipt_public_id TEXT,
    notes TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    approved_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (approved_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exp_items_claim ON public.expense_items(claim_id);
CREATE INDEX IF NOT EXISTS idx_exp_items_category ON public.expense_items(category_id);
CREATE INDEX IF NOT EXISTS idx_exp_items_date ON public.expense_items(expense_date);

-- ----------------------------------------------------------------------------
-- 4. REIMBURSEMENTS SEQUENCE & REIMBURSEMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS reimbursement_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reimbursement_number VARCHAR(50) UNIQUE NOT NULL,
    claim_id UUID NOT NULL REFERENCES public.expense_claims(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    reimbursement_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER' CHECK (payment_method IN (
        'CASH', 'BANK_TRANSFER', 'CHEQUE', 'CORPORATE_CARD', 'OTHER'
    )),
    reference_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'POSTED' CHECK (status IN (
        'DRAFT', 'POSTED', 'VOIDED'
    )),
    notes TEXT,
    
    -- Accounting Journal Entry Reference
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    
    -- Void Audit
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    void_reason TEXT,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reimb_number ON public.reimbursements(reimbursement_number);
CREATE INDEX IF NOT EXISTS idx_reimb_claim ON public.reimbursements(claim_id);
CREATE INDEX IF NOT EXISTS idx_reimb_emp ON public.reimbursements(employee_id);
CREATE INDEX IF NOT EXISTS idx_reimb_status ON public.reimbursements(status);

-- ----------------------------------------------------------------------------
-- 5. EXPENSE AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES public.expense_claims(id) ON DELETE CASCADE,
    reimbursement_id UUID REFERENCES public.reimbursements(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exp_audit_claim ON public.expense_audit_logs(claim_id);

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.expense_categories;
CREATE POLICY "Enable read access for authenticated users" ON public.expense_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.expense_categories;
CREATE POLICY "Enable all access for authenticated staff" ON public.expense_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.expense_claims;
CREATE POLICY "Enable read access for authenticated users" ON public.expense_claims FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.expense_claims;
CREATE POLICY "Enable all access for authenticated staff" ON public.expense_claims FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.expense_items;
CREATE POLICY "Enable read access for authenticated users" ON public.expense_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.expense_items;
CREATE POLICY "Enable all access for authenticated staff" ON public.expense_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reimbursements;
CREATE POLICY "Enable read access for authenticated users" ON public.reimbursements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.reimbursements;
CREATE POLICY "Enable all access for authenticated staff" ON public.reimbursements FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.expense_audit_logs;
CREATE POLICY "Enable read access for authenticated users" ON public.expense_audit_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.expense_audit_logs;
CREATE POLICY "Enable all access for authenticated staff" ON public.expense_audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. INITIAL SEED EXPENSE CATEGORIES
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_admin_acc_id UUID;
    v_maint_acc_id UUID;
BEGIN
    SELECT id INTO v_admin_acc_id FROM public.chart_of_accounts WHERE account_code = '5500' LIMIT 1;
    SELECT id INTO v_maint_acc_id FROM public.chart_of_accounts WHERE account_code = '5300' LIMIT 1;

    INSERT INTO public.expense_categories (code, name, description, default_account_id)
    VALUES 
        ('CAT-TRAVEL', 'Business Travel & Transport', 'Outstation business trips, flights, train tickets & cab fares', v_admin_acc_id),
        ('CAT-ACCOM', 'Hotel & Accommodation', 'Lodging and hotel stays during official business trips', v_admin_acc_id),
        ('CAT-MEAL', 'Meals & Client Entertainment', 'Official client meetings, lunches, and employee team meals', v_admin_acc_id),
        ('CAT-TRANS', 'Local Conveyance & Fuel', 'Daily commute reimbursement, fuel allowance, and parking charges', v_admin_acc_id),
        ('CAT-OFFICE', 'Office Supplies & Stationery', 'Paper, printer cartridges, desk accessories & consumables', v_admin_acc_id),
        ('CAT-COMM', 'Mobile & Internet Expense', 'Official mobile postpaid plans and remote broadband expenses', v_admin_acc_id),
        ('CAT-TRAIN', 'Training & Certification', 'Professional courses, technical certifications, and workshop fees', v_admin_acc_id),
        ('CAT-MAINT', 'Plant Spares & Emergency Repairs', 'Emergency machine spares and local factory maintenance expenses', v_maint_acc_id),
        ('CAT-MISC', 'Miscellaneous Expense', 'General petty expenses not covered under other specific categories', v_admin_acc_id)
    ON CONFLICT (code) DO NOTHING;
END $$;
