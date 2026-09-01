-- ==============================================================================
-- KOLMEKS ERP — ATTENDANCE, SHIFT, LEAVE, OVERTIME & PAYROLL FOUNDATION SCHEMA
-- Migration Version: 39_attendance_leave_payroll_foundation_schema.sql
-- ==============================================================================

-- 1. OVERTIME RECORDS TABLE
CREATE SEQUENCE IF NOT EXISTS public.overtime_seq START WITH 101 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_next_overtime_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  current_yr TEXT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.overtime_seq') INTO next_val;
  SELECT TO_CHAR(CURRENT_DATE, 'YYYY') INTO current_yr;
  formatted_code := 'OT-' || current_yr || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.overtime_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overtime_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_overtime_number(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.attendance_records(id) ON DELETE SET NULL,
  overtime_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC(5,2) NOT NULL CHECK (hours > 0),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  hourly_rate NUMERIC(15,2) DEFAULT 0.00,
  overtime_amount NUMERIC(15,2) DEFAULT 0.00,
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_overtime_records_updated_at ON public.overtime_records;
CREATE TRIGGER update_overtime_records_updated_at
BEFORE UPDATE ON public.overtime_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. WORKING CALENDAR SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.working_calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  weekly_off_days TEXT[] NOT NULL DEFAULT ARRAY['Sunday'],
  work_start_time TIME NOT NULL DEFAULT '09:00:00',
  work_end_time TIME NOT NULL DEFAULT '18:00:00',
  grace_period_minutes INT NOT NULL DEFAULT 15,
  overtime_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.50,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default calendar settings
INSERT INTO public.working_calendar_settings (year, weekly_off_days, work_start_time, work_end_time, grace_period_minutes, overtime_multiplier)
VALUES (2026, ARRAY['Sunday'], '09:00:00', '18:00:00', 15, 1.50)
ON CONFLICT DO NOTHING;

-- 3. EMPLOYEE COMPENSATION / SALARY STRUCTURE
CREATE TABLE IF NOT EXISTS public.employee_compensation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID UNIQUE NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (basic_salary >= 0),
  allowances NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (allowances >= 0),
  hourly_rate NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (hourly_rate >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_employee_compensation_updated_at ON public.employee_compensation;
CREATE TRIGGER update_employee_compensation_updated_at
BEFORE UPDATE ON public.employee_compensation
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. PAYROLL PERIODS TABLE
CREATE TABLE IF NOT EXISTS public.payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'PROCESSING', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'CLOSED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_payroll_period_dates CHECK (start_date <= end_date)
);

DROP TRIGGER IF EXISTS update_payroll_periods_updated_at ON public.payroll_periods;
CREATE TRIGGER update_payroll_periods_updated_at
BEFORE UPDATE ON public.payroll_periods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. PAYROLL RUN SEQUENCE & TABLE
CREATE SEQUENCE IF NOT EXISTS public.payroll_run_seq START WITH 101 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_next_payroll_run_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  current_yr TEXT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.payroll_run_seq') INTO next_val;
  SELECT TO_CHAR(CURRENT_DATE, 'YYYY') INTO current_yr;
  formatted_code := 'PAY-' || current_yr || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_payroll_run_number(),
  payroll_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_employees INT NOT NULL DEFAULT 0,
  gross_payroll NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (gross_payroll >= 0),
  total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (total_deductions >= 0),
  net_payroll NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (net_payroll >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PROCESSING', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'CANCELLED')),
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_payroll_runs_updated_at ON public.payroll_runs;
CREATE TRIGGER update_payroll_runs_updated_at
BEFORE UPDATE ON public.payroll_runs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. PAYSLIP SEQUENCE & PAYROLL ENTRIES TABLE
CREATE SEQUENCE IF NOT EXISTS public.payslip_seq START WITH 101 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_next_payslip_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  current_yr TEXT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.payslip_seq') INTO next_val;
  SELECT TO_CHAR(CURRENT_DATE, 'YYYY') INTO current_yr;
  formatted_code := 'PS-' || current_yr || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  payslip_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_payslip_number(),
  basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  allowances NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  overtime_pay NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  bonus NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  other_earnings NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  gross_pay NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  loan_deductions NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  unpaid_leave_deductions NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  other_deductions NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  net_pay NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'POSTED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_employee_payroll_run UNIQUE (payroll_run_id, employee_id)
);

DROP TRIGGER IF EXISTS update_payroll_entries_updated_at ON public.payroll_entries;
CREATE TRIGGER update_payroll_entries_updated_at
BEFORE UPDATE ON public.payroll_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. PAYROLL COMPONENT LINES TABLE
CREATE TABLE IF NOT EXISTS public.payroll_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_entry_id UUID NOT NULL REFERENCES public.payroll_entries(id) ON DELETE CASCADE,
  component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('EARNING', 'DEDUCTION')),
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PAYROLL ACCOUNT MAPPINGS TABLE
CREATE TABLE IF NOT EXISTS public.payroll_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_expense_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  payroll_payable_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  overtime_expense_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  description TEXT DEFAULT 'Default Payroll Accounting Mappings',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default payroll GL accounts mapping
DO $$
DECLARE
  v_exp_id UUID;
  v_liab_id UUID;
BEGIN
  SELECT id INTO v_exp_id FROM public.chart_of_accounts WHERE account_code = '5200' LIMIT 1;
  SELECT id INTO v_liab_id FROM public.chart_of_accounts WHERE account_code = '2120' LIMIT 1;

  IF v_exp_id IS NOT NULL AND v_liab_id IS NOT NULL THEN
    INSERT INTO public.payroll_account_mappings (salary_expense_account_id, payroll_payable_account_id, overtime_expense_account_id, description)
    VALUES (v_exp_id, v_liab_id, v_exp_id, 'Default Factory Salary & Wages Ledger Mapping')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_overtime_employee ON public.overtime_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_status ON public.overtime_records(status);
CREATE INDEX IF NOT EXISTS idx_overtime_date ON public.overtime_records(overtime_date);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON public.payroll_runs(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_run ON public.payroll_entries(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_emp ON public.payroll_entries(employee_id);

-- 10. RLS POLICIES
ALTER TABLE public.overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_account_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_overtime ON public.overtime_records;
CREATE POLICY service_role_all_overtime ON public.overtime_records FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_working_cal ON public.working_calendar_settings;
CREATE POLICY service_role_all_working_cal ON public.working_calendar_settings FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_compensation ON public.employee_compensation;
CREATE POLICY service_role_all_compensation ON public.employee_compensation FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_payroll_periods ON public.payroll_periods;
CREATE POLICY service_role_all_payroll_periods ON public.payroll_periods FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_payroll_runs ON public.payroll_runs;
CREATE POLICY service_role_all_payroll_runs ON public.payroll_runs FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_payroll_entries ON public.payroll_entries;
CREATE POLICY service_role_all_payroll_entries ON public.payroll_entries FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_payroll_components ON public.payroll_components;
CREATE POLICY service_role_all_payroll_components ON public.payroll_components FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_payroll_mappings ON public.payroll_account_mappings;
CREATE POLICY service_role_all_payroll_mappings ON public.payroll_account_mappings FOR ALL TO service_role USING (true);

-- Authenticated Users Policies
DROP POLICY IF EXISTS authenticated_read_working_cal ON public.working_calendar_settings;
CREATE POLICY authenticated_read_working_cal ON public.working_calendar_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_payroll_periods ON public.payroll_periods;
CREATE POLICY authenticated_read_payroll_periods ON public.payroll_periods FOR SELECT TO authenticated USING (true);
