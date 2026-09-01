-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED HR & EMPLOYEE MANAGEMENT SCHEMA
-- Migration Script: 38_advanced_hr_employee_lifecycle_schema.sql
-- ==============================================================================

-- 1. EXTEND DEPARTMENTS TABLE SAFELY
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- 2. EXTEND DESIGNATIONS TABLE SAFELY
ALTER TABLE public.designations ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;

-- 3. EXTEND EMPLOYEES TABLE SAFELY
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Factory Plant 1';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS probation_start_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS probation_end_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS confirmation_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS confirmation_remarks TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS resignation_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS notice_period_days INT DEFAULT 30;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS last_working_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS resignation_reason TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS termination_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS termination_reason TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS termination_remarks TEXT;

-- Prevent employee from reporting to themselves
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS chk_employee_manager_not_self;
ALTER TABLE public.employees ADD CONSTRAINT chk_employee_manager_not_self CHECK (manager_id IS NULL OR manager_id <> id);

-- 4. EMPLOYEE HISTORY TABLE (LIFECYCLE, TRANSFERS, PROMOTIONS)
CREATE TABLE IF NOT EXISTS public.employee_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('JOINING', 'PROBATION', 'CONFIRMATION', 'TRANSFER', 'PROMOTION', 'STATUS_CHANGE', 'RESIGNATION', 'TERMINATION', 'OTHER')),
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  old_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  new_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  old_designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  new_designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  old_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  new_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  old_location VARCHAR(100),
  new_location VARCHAR(100),
  old_cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  new_cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EMPLOYEE SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE' CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'MASTER')),
  years_of_experience NUMERIC(4,1) DEFAULT 0,
  last_verified_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EMPLOYEE QUALIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.employee_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  qualification_title VARCHAR(150) NOT NULL,
  institution VARCHAR(200) NOT NULL,
  year_completed INT,
  specialization VARCHAR(150),
  status VARCHAR(30) DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'IN_PROGRESS', 'DISCONTINUED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EMPLOYEE CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.employee_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  certification_name VARCHAR(150) NOT NULL,
  issuing_organization VARCHAR(200) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status VARCHAR(30) DEFAULT 'VALID' CHECK (status IN ('VALID', 'EXPIRING_SOON', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EMPLOYEE HR PRIVATE NOTES TABLE
CREATE TABLE IF NOT EXISTS public.employee_hr_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EXTEND EMPLOYEE DOCUMENTS METADATA SAFELY
ALTER TABLE public.employee_documents ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.employee_documents ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'VALID' CHECK (status IN ('VALID', 'EXPIRING_SOON', 'EXPIRED'));
ALTER TABLE public.employee_documents ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 10. RLS POLICIES FOR NEW TABLES
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_hr_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_emp_history ON public.employee_history;
CREATE POLICY service_role_all_emp_history ON public.employee_history FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_emp_skills ON public.employee_skills;
CREATE POLICY service_role_all_emp_skills ON public.employee_skills FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_emp_qualifications ON public.employee_qualifications;
CREATE POLICY service_role_all_emp_qualifications ON public.employee_qualifications FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_emp_certifications ON public.employee_certifications;
CREATE POLICY service_role_all_emp_certifications ON public.employee_certifications FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_emp_hr_notes ON public.employee_hr_notes;
CREATE POLICY service_role_all_emp_hr_notes ON public.employee_hr_notes FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS authenticated_all_emp_history ON public.employee_history;
CREATE POLICY authenticated_all_emp_history ON public.employee_history FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_emp_skills ON public.employee_skills;
CREATE POLICY authenticated_all_emp_skills ON public.employee_skills FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_emp_qualifications ON public.employee_qualifications;
CREATE POLICY authenticated_all_emp_qualifications ON public.employee_qualifications FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_emp_certifications ON public.employee_certifications;
CREATE POLICY authenticated_all_emp_certifications ON public.employee_certifications FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_emp_hr_notes ON public.employee_hr_notes;
CREATE POLICY authenticated_all_emp_hr_notes ON public.employee_hr_notes FOR ALL TO authenticated USING (true);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_emp_history_emp ON public.employee_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_skills_emp ON public.employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_qualifications_emp ON public.employee_qualifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_certifications_emp ON public.employee_certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_hr_notes_emp ON public.employee_hr_notes(employee_id);
