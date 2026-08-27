-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — EMPLOYEE & HR MANAGEMENT SCHEMA
-- Migration Version: 03_employees_hr_schema.sql
-- ==============================================================================

-- 1. Ensure HR role exists in roles table
INSERT INTO public.roles (name, description)
VALUES ('hr', 'Human Resources Manager with employee lifecycle management permissions')
ON CONFLICT (name) DO NOTHING;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for departments updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Default Manufacturing Departments
INSERT INTO public.departments (code, name, description)
VALUES
  ('HR', 'Human Resources', 'Talent acquisition, employee relations, and HR compliance'),
  ('SALES', 'Sales & Marketing', 'B2B RFQ quoting, client management, and sales engineering'),
  ('PROC', 'Procurement & Purchasing', 'Supplier management, raw material sourcing, and purchase orders'),
  ('PROD', 'Production & Manufacturing', 'CNC machining operations, component assembly, and shop floor scheduling'),
  ('QUAL', 'Quality Assurance & Metrology', 'CMM dimensional inspection, ISO quality compliance, and testing'),
  ('ENG', 'Engineering & R&D', 'CAD drawing evaluation, tooling design, and manufacturing process optimization'),
  ('INV', 'Inventory & Logistics', 'Warehouse management, stock movements, and shipping coordination'),
  ('FIN', 'Finance & Accounting', 'Cost estimation, invoicing, and financial management'),
  ('MGMT', 'Executive Management', 'Corporate strategy, plant operations leadership, and governance'),
  ('IT', 'Information Technology', 'ERP system administration, infrastructure, and industrial IT security')
ON CONFLICT (code) DO NOTHING;

-- 3. EMPLOYEE CODE SEQUENCE
CREATE SEQUENCE IF NOT EXISTS public.employee_code_seq START WITH 101 INCREMENT BY 1;

-- Function to safely generate formatted employee codes e.g. EMP-000101
CREATE OR REPLACE FUNCTION public.generate_next_employee_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.employee_code_seq') INTO next_val;
  formatted_code := 'EMP-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

-- 4. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_code VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_employee_code(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  designation VARCHAR(150) NOT NULL,
  employment_type VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME' CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY')),
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'Finland',
  postal_code VARCHAR(30),
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(50),
  relationship VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Trigger for employees updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. INDEXES FOR FAST SEARCH & FILTERING
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_joining ON public.employees(joining_date);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access Policies
DROP POLICY IF EXISTS service_role_all_departments ON public.departments;
CREATE POLICY service_role_all_departments ON public.departments FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_employees ON public.employees;
CREATE POLICY service_role_all_employees ON public.employees FOR ALL TO service_role USING (true);

-- Authenticated Staff View Departments Policy
DROP POLICY IF EXISTS authenticated_read_departments ON public.departments;
CREATE POLICY authenticated_read_departments ON public.departments FOR SELECT TO authenticated USING (true);

-- Authenticated Staff Read Employees Policy (Strictly authenticated staff)
DROP POLICY IF EXISTS authenticated_read_employees ON public.employees;
CREATE POLICY authenticated_read_employees ON public.employees FOR SELECT TO authenticated USING (true);
