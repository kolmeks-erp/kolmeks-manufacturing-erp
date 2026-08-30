-- ============================================================================
-- KOLMEKS ERP — BUDGETING & COST MANAGEMENT SCHEMA
-- Migration: 20_budgeting_cost_management_schema.sql
-- Prompt 30: Budgeting + Cost Centers + Budget Periods + Budget Lines + Budget vs Actual + Variance Analysis
-- ============================================================================

-- 1. COST CENTERS TABLE
CREATE TABLE IF NOT EXISTS public.cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. BUDGET SEQUENCE & BUDGETS HEADER TABLE
CREATE SEQUENCE IF NOT EXISTS budget_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_code VARCHAR(50) UNIQUE NOT NULL,
    budget_name VARCHAR(150) NOT NULL,
    period_id UUID NOT NULL REFERENCES public.financial_periods(id) ON DELETE RESTRICT,
    version INT NOT NULL DEFAULT 1,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'LOCKED',
        'ARCHIVED'
    )),
    description TEXT,
    total_budget_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_budget_amount >= 0),
    owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    
    -- Submission Audit
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Review / Approval Audit
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Version Hierarchy
    parent_version_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. BUDGET LINES TABLE
CREATE TABLE IF NOT EXISTS public.budget_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
    period_id UUID REFERENCES public.financial_periods(id) ON DELETE SET NULL,
    budget_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (budget_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR BUDGETING & COST CENTER QUERIES
CREATE INDEX IF NOT EXISTS idx_cost_centers_code ON public.cost_centers(code);
CREATE INDEX IF NOT EXISTS idx_cost_centers_parent ON public.cost_centers(parent_id);
CREATE INDEX IF NOT EXISTS idx_budgets_code ON public.budgets(budget_code);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON public.budgets(period_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON public.budgets(status);
CREATE INDEX IF NOT EXISTS idx_budget_lines_budget ON public.budget_lines(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_lines_account ON public.budget_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_budget_lines_cost_center ON public.budget_lines(cost_center_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR AUTHENTICATED USERS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cost_centers;
CREATE POLICY "Enable read access for authenticated users" ON public.cost_centers
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.cost_centers;
CREATE POLICY "Enable all access for authenticated staff" ON public.cost_centers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.budgets;
CREATE POLICY "Enable read access for authenticated users" ON public.budgets
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.budgets;
CREATE POLICY "Enable all access for authenticated staff" ON public.budgets
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.budget_lines;
CREATE POLICY "Enable read access for authenticated users" ON public.budget_lines
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all access for authenticated staff" ON public.budget_lines;
CREATE POLICY "Enable all access for authenticated staff" ON public.budget_lines
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
