-- ============================================================================
-- KOLMEKS ERP — FINANCE & ACCOUNTING FOUNDATION SCHEMA
-- Migration: 17_finance_accounting_schema.sql
-- ============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. CHART OF ACCOUNTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    parent_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_control_account BOOLEAN DEFAULT FALSE,
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexing for fast CoA searches & parent lookups
CREATE INDEX IF NOT EXISTS idx_coa_code ON public.chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_coa_type ON public.chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_coa_parent ON public.chart_of_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_coa_status ON public.chart_of_accounts(status);

-- ----------------------------------------------------------------------------
-- 2. FINANCIAL PERIODS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES auth.users(id),
    reopened_at TIMESTAMPTZ,
    reopened_by UUID REFERENCES auth.users(id),
    reopen_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_period_dates CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_periods_dates ON public.financial_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_periods_status ON public.financial_periods(status);

-- ----------------------------------------------------------------------------
-- 3. JOURNAL ENTRIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    financial_period_id UUID REFERENCES public.financial_periods(id) NOT NULL,
    reference_type VARCHAR(50) DEFAULT 'MANUAL',
    reference_id VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOIDED')),
    total_debit NUMERIC(15, 2) DEFAULT 0.00 CHECK (total_debit >= 0),
    total_credit NUMERIC(15, 2) DEFAULT 0.00 CHECK (total_credit >= 0),
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id),
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,
    reversed_journal_id UUID REFERENCES public.journal_entries(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_je_number ON public.journal_entries(journal_number);
CREATE INDEX IF NOT EXISTS idx_je_date ON public.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_je_status ON public.journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_je_period ON public.journal_entries(financial_period_id);

-- ----------------------------------------------------------------------------
-- 4. JOURNAL ENTRY LINES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.chart_of_accounts(id) NOT NULL,
    description TEXT,
    debit NUMERIC(15, 2) DEFAULT 0.00 CHECK (debit >= 0),
    credit NUMERIC(15, 2) DEFAULT 0.00 CHECK (credit >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce Debit XOR Credit per line: Line must have either Debit > 0 or Credit > 0, but not both
    CONSTRAINT chk_debit_xor_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_jel_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jel_account ON public.journal_entry_lines(account_id);

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users read & write access
CREATE POLICY "Allow authenticated read chart_of_accounts" ON public.chart_of_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert chart_of_accounts" ON public.chart_of_accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update chart_of_accounts" ON public.chart_of_accounts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read financial_periods" ON public.financial_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert financial_periods" ON public.financial_periods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update financial_periods" ON public.financial_periods FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read journal_entries" ON public.journal_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert journal_entries" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update journal_entries" ON public.journal_entries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read journal_entry_lines" ON public.journal_entry_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert journal_entry_lines" ON public.journal_entry_lines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update journal_entry_lines" ON public.journal_entry_lines FOR UPDATE TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- 6. INITIAL SEED DATA
-- ----------------------------------------------------------------------------

-- Seed Open Financial Period for FY 2026 if empty
INSERT INTO public.financial_periods (period_name, start_date, end_date, status)
SELECT 'FY 2026', '2026-01-01', '2026-12-31', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM public.financial_periods WHERE period_name = 'FY 2026');

-- Seed Standard Industrial Chart of Accounts Hierarchy
DO $$
DECLARE
    v_asset_id UUID;
    v_curr_asset_id UUID;
    v_fixed_asset_id UUID;
    v_liab_id UUID;
    v_curr_liab_id UUID;
    v_equity_id UUID;
    v_rev_id UUID;
    v_exp_id UUID;
BEGIN
    -- 1000 ASSETS (Root Parent)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, category, description, normal_balance)
    VALUES ('1000', 'Assets Master Header', 'ASSET', 'Assets', 'Top-level asset category', 'DEBIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_asset_id;

    -- 1100 Current Assets
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1100', 'Current Assets', 'ASSET', v_asset_id, 'Current Assets', 'Liquid and operational current assets', 'DEBIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_curr_asset_id;

    -- 1110 Cash on Hand
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1110', 'Cash on Hand', 'ASSET', v_curr_asset_id, 'Current Assets', 'Factory petty cash and vault', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1120 Bank Accounts
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1120', 'Bank Operating Account', 'ASSET', v_curr_asset_id, 'Current Assets', 'Commercial bank operating account', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1130 Accounts Receivable (Control)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, is_control_account, normal_balance)
    VALUES ('1130', 'Accounts Receivable (Trade Debtors)', 'ASSET', v_curr_asset_id, 'Current Assets', 'Trade receivables subledger control account', TRUE, 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1200 Raw Materials Inventory (Control)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, is_control_account, normal_balance)
    VALUES ('1200', 'Raw Materials Inventory', 'ASSET', v_curr_asset_id, 'Current Assets', 'Raw steel, copper wire, castings stock', TRUE, 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1210 Finished Goods Inventory (Control)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, is_control_account, normal_balance)
    VALUES ('1210', 'Finished Goods Inventory', 'ASSET', v_curr_asset_id, 'Current Assets', 'Assembled electric motors and pumps stock', TRUE, 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 1500 Fixed Assets
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1500', 'Property, Plant & Equipment', 'ASSET', v_asset_id, 'Fixed Assets', 'Long-term manufacturing physical assets', 'DEBIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_fixed_asset_id;

    -- 1510 Machinery & CNC Equipment
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('1510', 'Machinery & CNC Equipment', 'ASSET', v_fixed_asset_id, 'Fixed Assets', 'CNC lathes, milling, winding machines', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 2000 LIABILITIES (Root Parent)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, category, description, normal_balance)
    VALUES ('2000', 'Liabilities Master Header', 'LIABILITY', 'Liabilities', 'Top-level liability category', 'CREDIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_liab_id;

    -- 2100 Current Liabilities
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('2100', 'Current Liabilities', 'LIABILITY', v_liab_id, 'Current Liabilities', 'Short-term obligations and payables', 'CREDIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_curr_liab_id;

    -- 2110 Accounts Payable (Control)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, is_control_account, normal_balance)
    VALUES ('2110', 'Accounts Payable (Trade Creditors)', 'LIABILITY', v_curr_liab_id, 'Current Liabilities', 'Supplier obligations subledger control account', TRUE, 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 2120 Accrued Payroll & Wages
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('2120', 'Accrued Payroll & Salaries Payable', 'LIABILITY', v_curr_liab_id, 'Current Liabilities', 'Employee wages accrued payable', 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 3000 EQUITY (Root Parent)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, category, description, normal_balance)
    VALUES ('3000', 'Equity Master Header', 'EQUITY', 'Equity', 'Top-level equity category', 'CREDIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_equity_id;

    -- 3100 Share Capital
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('3100', 'Share Capital', 'EQUITY', v_equity_id, 'Equity', 'Paid-up share capital', 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 3200 Retained Earnings
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('3200', 'Retained Earnings', 'EQUITY', v_equity_id, 'Equity', 'Accumulated retained earnings', 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 4000 REVENUE (Root Parent)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, category, description, normal_balance)
    VALUES ('4000', 'Revenue Master Header', 'REVENUE', 'Revenue', 'Operating and non-operating revenue', 'CREDIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_rev_id;

    -- 4100 Sales Revenue - Motors & Pumps
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('4100', 'Sales Revenue - Electric Motors & Pumps', 'REVENUE', v_rev_id, 'Sales Revenue', 'Gross product sales revenue', 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 4200 CNC Machining Services Revenue
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('4200', 'CNC Contract Machining Services', 'REVENUE', v_rev_id, 'Sales Revenue', 'Precision machining job work revenue', 'CREDIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5000 EXPENSES (Root Parent)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, category, description, normal_balance)
    VALUES ('5000', 'Expenses Master Header', 'EXPENSE', 'Expenses', 'Direct and indirect operating expenses', 'DEBIT')
    ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name
    RETURNING id INTO v_exp_id;

    -- 5100 Cost of Goods Sold - Raw Materials
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5100', 'COGS - Raw Materials Consumption', 'EXPENSE', v_exp_id, 'Cost of Sales', 'Direct materials consumed in production', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5200 Factory Direct Labor
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5200', 'Factory Direct Labor Expense', 'EXPENSE', v_exp_id, 'Cost of Sales', 'Shop floor machinist and operator wages', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5300 Maintenance & Repairs Expense
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5300', 'Plant Maintenance & Spares Expense', 'EXPENSE', v_exp_id, 'Operating Expenses', 'Machine preventive maintenance & spare parts', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5400 Plant Utilities & Power
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5400', 'Plant Electricity & Industrial Power', 'EXPENSE', v_exp_id, 'Operating Expenses', 'High-voltage industrial electricity bill', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;

    -- 5500 General Administrative Expenses
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, parent_account_id, category, description, normal_balance)
    VALUES ('5500', 'General Administrative & Office Expenses', 'EXPENSE', v_exp_id, 'Operating Expenses', 'Office supplies, software, legal & admin', 'DEBIT')
    ON CONFLICT (account_code) DO NOTHING;
END $$;
