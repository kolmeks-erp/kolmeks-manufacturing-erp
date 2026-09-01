-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED CRM & CUSTOMER RELATIONSHIP MANAGEMENT SCHEMA
-- Migration Script: 40_crm_customer_relationship_management_schema.sql
-- ==============================================================================

-- 1. EXTEND PUBLIC.CUSTOMERS FOR CRM METRICS SAFELY
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS segment VARCHAR(100) DEFAULT 'SMB',
  ADD COLUMN IF NOT EXISTS health_status VARCHAR(30) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS relationship_owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- 2. SEQUENCES FOR UNIQUE IDENTIFIERS
CREATE SEQUENCE IF NOT EXISTS public.crm_lead_seq START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS public.crm_opp_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_next_lead_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.crm_lead_seq') INTO next_val;
  formatted_code := 'LEAD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_next_opp_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_val BIGINT;
  formatted_code VARCHAR(50);
BEGIN
  SELECT nextval('public.crm_opp_seq') INTO next_val;
  formatted_code := 'OPP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_code;
END;
$$ LANGUAGE plpgsql;

-- 3. CRM LEADS TABLE
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_lead_number(),
  lead_name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),
  contact_person VARCHAR(150),
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(50) NOT NULL DEFAULT 'Website',
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST', 'CLOSED')),
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  expected_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (expected_value >= 0),
  qualification_status VARCHAR(50) DEFAULT 'UNQUALIFIED',
  expected_close_date DATE,
  requirement TEXT,
  product_interest TEXT,
  notes TEXT,
  converted_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  converted_opportunity_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_followup_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Trigger for crm_leads updated_at
DROP TRIGGER IF EXISTS update_crm_leads_updated_at ON public.crm_leads;
CREATE TRIGGER update_crm_leads_updated_at
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. CRM OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_next_opp_number(),
  name VARCHAR(200) NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  expected_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (expected_value >= 0),
  probability NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  stage VARCHAR(50) NOT NULL DEFAULT 'QUALIFICATION' CHECK (stage IN ('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST')),
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  source VARCHAR(50) DEFAULT 'Direct',
  lost_reason TEXT,
  lost_date DATE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add foreign key constraint back to crm_leads if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_crm_leads_converted_opp'
  ) THEN
    ALTER TABLE public.crm_leads
      ADD CONSTRAINT fk_crm_leads_converted_opp
      FOREIGN KEY (converted_opportunity_id) REFERENCES public.crm_opportunities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Trigger for crm_opportunities updated_at
DROP TRIGGER IF EXISTS update_crm_opportunities_updated_at ON public.crm_opportunities;
CREATE TRIGGER update_crm_opportunities_updated_at
BEFORE UPDATE ON public.crm_opportunities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. CRM ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type VARCHAR(30) NOT NULL DEFAULT 'CALL' CHECK (activity_type IN ('CALL', 'MEETING', 'EMAIL', 'NOTE', 'TASK', 'OTHER')),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_time TIME,
  duration_minutes INT DEFAULT 0,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  outcome TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Trigger for crm_activities updated_at
DROP TRIGGER IF EXISTS update_crm_activities_updated_at ON public.crm_activities;
CREATE TRIGGER update_crm_activities_updated_at
BEFORE UPDATE ON public.crm_activities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. CRM FOLLOWUPS TABLE
CREATE TABLE IF NOT EXISTS public.crm_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  followup_date DATE NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 7. CRM TASKS TABLE
CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_title VARCHAR(255) NOT NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status VARCHAR(30) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 8. CRM CUSTOMER NOTES TABLE
CREATE TABLE IF NOT EXISTS public.crm_customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CRM AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.crm_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Full Access)
CREATE POLICY service_role_all_crm_leads ON public.crm_leads FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_crm_opportunities ON public.crm_opportunities FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_crm_activities ON public.crm_activities FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_crm_followups ON public.crm_followups FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_crm_tasks ON public.crm_tasks FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_crm_customer_notes ON public.crm_customer_notes FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_crm_audit_logs ON public.crm_audit_logs FOR ALL TO service_role USING (true);

-- Authenticated Staff Policies
CREATE POLICY authenticated_all_crm_leads ON public.crm_leads FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_crm_opportunities ON public.crm_opportunities FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_crm_activities ON public.crm_activities FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_crm_followups ON public.crm_followups FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_crm_tasks ON public.crm_tasks FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_crm_customer_notes ON public.crm_customer_notes FOR ALL TO authenticated USING (true);
CREATE POLICY authenticated_all_crm_audit_logs ON public.crm_audit_logs FOR ALL TO authenticated USING (true);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_crm_leads_number ON public.crm_leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_owner ON public.crm_leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_customer ON public.crm_leads(customer_id);

CREATE INDEX IF NOT EXISTS idx_crm_opp_number ON public.crm_opportunities(opportunity_number);
CREATE INDEX IF NOT EXISTS idx_crm_opp_stage ON public.crm_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_crm_opp_customer ON public.crm_opportunities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_opp_owner ON public.crm_opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_opp_close_date ON public.crm_opportunities(expected_close_date);

CREATE INDEX IF NOT EXISTS idx_crm_activities_customer ON public.crm_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON public.crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opp ON public.crm_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_date ON public.crm_activities(activity_date);

CREATE INDEX IF NOT EXISTS idx_crm_followups_date ON public.crm_followups(followup_date);
CREATE INDEX IF NOT EXISTS idx_crm_followups_status ON public.crm_followups(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON public.crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON public.crm_tasks(status);
