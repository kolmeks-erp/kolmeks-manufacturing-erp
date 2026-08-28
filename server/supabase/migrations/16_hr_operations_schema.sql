-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — HR OPERATIONS & ATTENDANCE SCHEMA
-- Migration Version: 16_hr_operations_schema.sql
-- ==============================================================================

-- 1. DESIGNATIONS TABLE
CREATE TABLE IF NOT EXISTS public.designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_designations_updated_at ON public.designations;
CREATE TRIGGER update_designations_updated_at
BEFORE UPDATE ON public.designations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Manufacturing Designations
INSERT INTO public.designations (code, name, description)
VALUES
  ('DES-PROD-MGR', 'Production Manager', 'Shop floor operational lead and production routing manager'),
  ('DES-CNC-OPT', 'CNC Operator', 'Precision 2-axis & 4-axis lathe/milling machine operator'),
  ('DES-QUAL-ENG', 'Quality Engineer', 'CMM metrology inspector and quality assurance specialist'),
  ('DES-MNT-TECH', 'Maintenance Technician', 'Preventive & breakdown machine maintenance engineer'),
  ('DES-HR-EXEC', 'HR Operations Executive', 'Talent management, attendance compliance & HR manager'),
  ('DES-PROC-OFF', 'Procurement Officer', 'Raw materials buyer & vendor relationship manager'),
  ('DES-WH-MGR', 'Warehouse Manager', 'Raw material, WIP and finished goods inventory manager'),
  ('DES-PLNT-DIR', 'Plant Director', 'General manager of factory operations & corporate strategy')
ON CONFLICT (code) DO NOTHING;

-- 2. SHIFTS TABLE
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  break_duration_minutes INT NOT NULL DEFAULT 60,
  grace_minutes INT NOT NULL DEFAULT 15,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_shifts_updated_at ON public.shifts;
CREATE TRIGGER update_shifts_updated_at
BEFORE UPDATE ON public.shifts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Default Manufacturing Shifts
INSERT INTO public.shifts (shift_code, name, start_time, end_time, break_duration_minutes, grace_minutes, description)
VALUES
  ('SHIFT-GEN', 'General Day Shift', '09:00:00', '18:00:00', 60, 15, 'Standard office & management 9-to-6 shift'),
  ('SHIFT-A', 'Morning Production Shift A', '06:00:00', '14:30:00', 45, 10, 'Early morning CNC shop floor machining shift'),
  ('SHIFT-B', 'Evening Production Shift B', '14:30:00', '23:00:00', 45, 10, 'Afternoon/evening assembly & machining shift'),
  ('SHIFT-N', 'Night Duty Shift', '23:00:00', '06:30:00', 45, 10, 'Overnight continuous machining & maintenance shift')
ON CONFLICT (shift_code) DO NOTHING;

-- Safely add shift_id reference to existing public.employees table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'shift_id'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. EMPLOYEE SHIFT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.employee_shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_employee_shift_assignments_updated_at ON public.employee_shift_assignments;
CREATE TRIGGER update_employee_shift_assignments_updated_at
BEFORE UPDATE ON public.employee_shift_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF')),
  worked_minutes INT NOT NULL DEFAULT 0,
  late_minutes INT NOT NULL DEFAULT 0,
  early_exit_minutes INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, attendance_date)
);

DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON public.attendance_records;
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. ATTENDANCE CORRECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  requested_check_in TIMESTAMPTZ,
  requested_check_out TIMESTAMPTZ,
  requested_status VARCHAR(20) CHECK (requested_status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE')),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_attendance_corrections_updated_at ON public.attendance_corrections;
CREATE TRIGGER update_attendance_corrections_updated_at
BEFORE UPDATE ON public.attendance_corrections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. LEAVE TYPES TABLE
CREATE TABLE IF NOT EXISTS public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  paid BOOLEAN NOT NULL DEFAULT true,
  default_days INT NOT NULL DEFAULT 12,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_leave_types_updated_at ON public.leave_types;
CREATE TRIGGER update_leave_types_updated_at
BEFORE UPDATE ON public.leave_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Default Leave Types
INSERT INTO public.leave_types (code, name, description, paid, default_days)
VALUES
  ('CL', 'Casual Leave', 'Short-term unplanned leave for emergency personal needs', true, 12),
  ('SL', 'Sick Leave', 'Medical absence due to illness or health checkups', true, 10),
  ('AL', 'Annual Paid Leave', 'Earned annual vacation entitlement', true, 18),
  ('UL', 'Unpaid Leave (LWP)', 'Leave without pay for extended absence', false, 30)
ON CONFLICT (code) DO NOTHING;

-- 7. LEAVE BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  allocated_days NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  used_days NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  pending_days NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  adjustment_days NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  remaining_days NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_employee_leave_type_year UNIQUE (employee_id, leave_type_id, year)
);

DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON public.leave_balances;
CREATE TRIGGER update_leave_balances_updated_at
BEFORE UPDATE ON public.leave_balances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. LEAVE REQUEST SEQUENCE & FUNCTION
CREATE SEQUENCE IF NOT EXISTS public.leave_request_seq START WITH 101 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_next_leave_request_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  current_yr TEXT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.leave_request_seq') INTO next_val;
  SELECT TO_CHAR(CURRENT_DATE, 'YYYY') INTO current_yr;
  formatted_code := 'LR-' || current_yr || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

-- 9. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_leave_request_number(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  half_day VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (half_day IN ('NONE', 'FIRST_HALF', 'SECOND_HALF')),
  leave_days NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  approver_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  holiday_date DATE UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_holidays_updated_at ON public.holidays;
CREATE TRIGGER update_holidays_updated_at
BEFORE UPDATE ON public.holidays
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Sample 2026 Holidays
INSERT INTO public.holidays (name, holiday_date, description)
VALUES
  ('New Year Day', '2026-01-01', 'Official corporate new year holiday'),
  ('Epiphany', '2026-01-06', 'Traditional holiday'),
  ('Good Friday', '2026-04-03', 'Easter holiday'),
  ('Easter Monday', '2026-04-06', 'Easter monday holiday'),
  ('May Day / Labor Day', '2026-05-01', 'International Labor Day'),
  ('Midsummer Eve', '2026-06-19', 'Factory summer closure day'),
  ('Independence Day', '2026-12-06', 'National Independence Day'),
  ('Christmas Day', '2026-12-25', 'Christmas day holiday')
ON CONFLICT (holiday_date) DO NOTHING;

-- 11. EMPLOYEE DOCUMENTS METADATA TABLE
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL DEFAULT 'OTHER' CHECK (document_type IN ('OFFER_LETTER', 'ID_DOCUMENT', 'QUALIFICATION', 'CONTRACT', 'RESUME', 'OTHER')),
  document_name VARCHAR(150) NOT NULL,
  file_url TEXT NOT NULL,
  notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_employee_documents_updated_at ON public.employee_documents;
CREATE TRIGGER update_employee_documents_updated_at
BEFORE UPDATE ON public.employee_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. INDEXES FOR FAST REPORTING & SELF-SERVICE LOOKUPS
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON public.attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON public.leave_balances(employee_id, year);

CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee ON public.employee_shift_assignments(employee_id);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Full Unrestricted Access for Service Role Backend)
DROP POLICY IF EXISTS service_role_all_designations ON public.designations;
CREATE POLICY service_role_all_designations ON public.designations FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_shifts ON public.shifts;
CREATE POLICY service_role_all_shifts ON public.shifts FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_shift_assignments ON public.employee_shift_assignments;
CREATE POLICY service_role_all_shift_assignments ON public.employee_shift_assignments FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_attendance ON public.attendance_records;
CREATE POLICY service_role_all_attendance ON public.attendance_records FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_corrections ON public.attendance_corrections;
CREATE POLICY service_role_all_corrections ON public.attendance_corrections FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_leave_types ON public.leave_types;
CREATE POLICY service_role_all_leave_types ON public.leave_types FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_leave_balances ON public.leave_balances;
CREATE POLICY service_role_all_leave_balances ON public.leave_balances FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_leave_requests ON public.leave_requests;
CREATE POLICY service_role_all_leave_requests ON public.leave_requests FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_holidays ON public.holidays;
CREATE POLICY service_role_all_holidays ON public.holidays FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_documents ON public.employee_documents;
CREATE POLICY service_role_all_documents ON public.employee_documents FOR ALL TO service_role USING (true);

-- Authenticated Users Read Policies (Read master settings like shifts, leave types, holidays)
DROP POLICY IF EXISTS authenticated_read_shifts ON public.shifts;
CREATE POLICY authenticated_read_shifts ON public.shifts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_leave_types ON public.leave_types;
CREATE POLICY authenticated_read_leave_types ON public.leave_types FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_holidays ON public.holidays;
CREATE POLICY authenticated_read_holidays ON public.holidays FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_designations ON public.designations;
CREATE POLICY authenticated_read_designations ON public.designations FOR SELECT TO authenticated USING (true);
