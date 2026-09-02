-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: WORKFLOW & APPROVAL ENGINE SCHEMA
-- Migration Version: 45_workflow_approval_engine_schema.sql
-- ==============================================================================

-- 1. WORKFLOW DEFINITIONS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  module VARCHAR(100) NOT NULL, -- 'Procurement', 'Documents', 'Sales', 'HR', 'Quality', 'Finance', 'Maintenance', 'Inventory', 'Production', 'CRM'
  entity_type VARCHAR(100) NOT NULL, -- 'purchase_order', 'document', 'leave_request', 'sales_quotation', 'invoice', 'capa', 'ncr', 'maintenance_work_order', 'stock_adjustment'
  status VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Inactive', 'Archived')),
  active_version_number INT NOT NULL DEFAULT 1,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WORKFLOW VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  change_summary TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Inactive', 'Archived')),
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workflow_version UNIQUE(workflow_id, version_number)
);

-- 3. WORKFLOW STAGES TABLE
CREATE TABLE IF NOT EXISTS public.workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  approval_mode VARCHAR(30) NOT NULL DEFAULT 'SINGLE' CHECK (approval_mode IN ('SINGLE', 'SEQUENTIAL', 'PARALLEL', 'ANY_ONE', 'ALL_REQUIRED')),
  rejection_behavior VARCHAR(40) NOT NULL DEFAULT 'REJECT_WORKFLOW' CHECK (rejection_behavior IN ('REJECT_WORKFLOW', 'RETURN_TO_REQUESTER', 'RETURN_TO_PREVIOUS_STAGE', 'CHANGES_REQUESTED')),
  deadline_hours INT NOT NULL DEFAULT 48,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WORKFLOW STEPS (APPROVERS CONFIGURATION) TABLE
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.workflow_stages(id) ON DELETE CASCADE,
  sequence INT NOT NULL DEFAULT 1,
  step_name VARCHAR(150) NOT NULL,
  approver_type VARCHAR(40) NOT NULL CHECK (approver_type IN ('SPECIFIC_USER', 'EMPLOYEE_ROLE', 'DEPARTMENT_MANAGER', 'DEPARTMENT', 'RECORD_OWNER', 'APPROVAL_GROUP')),
  approver_value VARCHAR(255) NOT NULL, -- Role code, profile UUID, department ID, or group code
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WORKFLOW CONDITIONS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.workflow_stages(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL, -- e.g. 'total_amount', 'confidentiality_level', 'priority', 'discount_percent'
  operator VARCHAR(30) NOT NULL CHECK (operator IN ('equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'contains', 'is_empty', 'is_not_empty')),
  value_text TEXT NOT NULL,
  logic_group VARCHAR(10) NOT NULL DEFAULT 'AND' CHECK (logic_group IN ('AND', 'OR')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. APPROVAL GROUPS & MEMBERS TABLES
CREATE TABLE IF NOT EXISTS public.approval_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.approval_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.approval_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'MEMBER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_group_member UNIQUE(group_id, user_id)
);

-- Seed Default Approval Groups
INSERT INTO public.approval_groups (code, name, description) VALUES
  ('GRP_FINANCE_APPROVERS', 'Finance Executive Sign-off Group', 'Finance managers authorized for invoice & voucher sign-offs'),
  ('GRP_QUALITY_LEADS', 'Quality Control Sign-off Group', 'Quality managers authorized for CAPA and inspection releases'),
  ('GRP_PROCUREMENT_HEADS', 'Procurement Leadership Group', 'Purchasing directors authorized for high-value PO approvals')
ON CONFLICT (code) DO NOTHING;

-- 7. WORKFLOW INSTANCES TABLE
CREATE SEQUENCE IF NOT EXISTS public.workflow_instance_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_workflow_instance_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  current_year TEXT;
  seq_num TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num := LPAD(NEXTVAL('public.workflow_instance_seq')::TEXT, 6, '0');
  RETURN 'WFI-' || current_year || '-' || seq_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_workflow_instance_number(),
  workflow_id UUID NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE RESTRICT,
  version_id UUID NOT NULL REFERENCES public.workflow_versions(id) ON DELETE RESTRICT,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  entity_reference VARCHAR(100),
  current_stage_id UUID REFERENCES public.workflow_stages(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Approved', 'Rejected', 'Changes Requested', 'Cancelled', 'Completed', 'Failed', 'Suspended')),
  attempt_number INT NOT NULL DEFAULT 1,
  started_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- 8. WORKFLOW TASKS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.workflow_stages(id) ON DELETE SET NULL,
  step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignee_role VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Approved', 'Rejected', 'Changes Requested', 'Cancelled', 'Completed', 'Expired')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  decision VARCHAR(30) CHECK (decision IN ('Approved', 'Rejected', 'Changes Requested')),
  comments TEXT,
  decided_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 9. WORKFLOW HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'WORKFLOW_STARTED', 'STAGE_STARTED', 'TASK_ASSIGNED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'RESUBMITTED', 'REASSIGNED', 'CANCELLED', 'COMPLETED'
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.workflow_stages(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.workflow_tasks(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. WORKFLOW DELEGATIONS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  scope_module VARCHAR(100) NOT NULL DEFAULT 'ALL',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. WORKFLOW EXCEPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  error_code VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'IGNORED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_wf_def_module ON public.workflow_definitions(module);
CREATE INDEX IF NOT EXISTS idx_wf_def_entity ON public.workflow_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_wf_inst_entity ON public.workflow_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_wf_inst_status ON public.workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_assignee ON public.workflow_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_status ON public.workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_wf_history_inst ON public.workflow_history(instance_id);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_exceptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_all_wf_defs ON public.workflow_definitions;
CREATE POLICY authenticated_all_wf_defs ON public.workflow_definitions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_versions ON public.workflow_versions;
CREATE POLICY authenticated_all_wf_versions ON public.workflow_versions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_stages ON public.workflow_stages;
CREATE POLICY authenticated_all_wf_stages ON public.workflow_stages FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_steps ON public.workflow_steps;
CREATE POLICY authenticated_all_wf_steps ON public.workflow_steps FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_conditions ON public.workflow_conditions;
CREATE POLICY authenticated_all_wf_conditions ON public.workflow_conditions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_approval_groups ON public.approval_groups;
CREATE POLICY authenticated_all_approval_groups ON public.approval_groups FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_group_members ON public.approval_group_members;
CREATE POLICY authenticated_all_group_members ON public.approval_group_members FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_instances ON public.workflow_instances;
CREATE POLICY authenticated_all_wf_instances ON public.workflow_instances FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_tasks ON public.workflow_tasks;
CREATE POLICY authenticated_all_wf_tasks ON public.workflow_tasks FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_history ON public.workflow_history;
CREATE POLICY authenticated_all_wf_history ON public.workflow_history FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_delegations ON public.workflow_delegations;
CREATE POLICY authenticated_all_wf_delegations ON public.workflow_delegations FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_wf_exceptions ON public.workflow_exceptions;
CREATE POLICY authenticated_all_wf_exceptions ON public.workflow_exceptions FOR ALL TO authenticated USING (true);

-- 14. SEED DEFAULT WORKFLOW DEFINITIONS, VERSIONS, STAGES & STEPS
DO $$
DECLARE
  v_po_def_id UUID;
  v_po_ver_id UUID;
  v_po_stg1_id UUID;
  v_po_stg2_id UUID;

  v_doc_def_id UUID;
  v_doc_ver_id UUID;
  v_doc_stg1_id UUID;

  v_capa_def_id UUID;
  v_capa_ver_id UUID;
  v_capa_stg1_id UUID;
BEGIN
  -- Purchase Order Approval Workflow
  INSERT INTO public.workflow_definitions (code, name, description, module, entity_type, status, active_version_number)
  VALUES ('PO_APPROVAL_WF', 'Purchase Order Approval Workflow', 'Standard multi-stage approval for PO purchases', 'Procurement', 'purchase_order', 'Active', 1)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_po_def_id;

  IF v_po_def_id IS NOT NULL THEN
    INSERT INTO public.workflow_versions (workflow_id, version_number, change_summary, status)
    VALUES (v_po_def_id, 1, 'Initial PO approval version', 'Active')
    ON CONFLICT (workflow_id, version_number) DO UPDATE SET status = 'Active' RETURNING id INTO v_po_ver_id;

    IF v_po_ver_id IS NOT NULL THEN
      INSERT INTO public.workflow_stages (version_id, sequence, name, description, approval_mode, rejection_behavior, deadline_hours)
      VALUES (v_po_ver_id, 1, 'Department Manager Approval', 'Review by department manager', 'SINGLE', 'CHANGES_REQUESTED', 24)
      RETURNING id INTO v_po_stg1_id;

      INSERT INTO public.workflow_stages (version_id, sequence, name, description, approval_mode, rejection_behavior, deadline_hours)
      VALUES (v_po_ver_id, 2, 'Finance & Procurement Sign-off', 'Final sign-off by purchasing director', 'SINGLE', 'REJECT_WORKFLOW', 48)
      RETURNING id INTO v_po_stg2_id;

      IF v_po_stg1_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (stage_id, sequence, step_name, approver_type, approver_value)
        VALUES (v_po_stg1_id, 1, 'Department Manager Sign-off', 'EMPLOYEE_ROLE', 'purchase_manager');
      END IF;

      IF v_po_stg2_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (stage_id, sequence, step_name, approver_type, approver_value)
        VALUES (v_po_stg2_id, 1, 'Finance Controller Sign-off', 'EMPLOYEE_ROLE', 'finance_manager');
      END IF;
    END IF;
  END IF;

  -- Document Management Approval Workflow
  INSERT INTO public.workflow_definitions (code, name, description, module, entity_type, status, active_version_number)
  VALUES ('DOC_APPROVAL_WF', 'Document Revision Approval Workflow', 'Approval for company SOPs and quality documents', 'Documents', 'document', 'Active', 1)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_doc_def_id;

  IF v_doc_def_id IS NOT NULL THEN
    INSERT INTO public.workflow_versions (workflow_id, version_number, change_summary, status)
    VALUES (v_doc_def_id, 1, 'Initial document approval version', 'Active')
    ON CONFLICT (workflow_id, version_number) DO UPDATE SET status = 'Active' RETURNING id INTO v_doc_ver_id;

    IF v_doc_ver_id IS NOT NULL THEN
      INSERT INTO public.workflow_stages (version_id, sequence, name, description, approval_mode, rejection_behavior, deadline_hours)
      VALUES (v_doc_ver_id, 1, 'Quality Manager Sign-off', 'Review and approval of document contents', 'SINGLE', 'CHANGES_REQUESTED', 48)
      RETURNING id INTO v_doc_stg1_id;

      IF v_doc_stg1_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (stage_id, sequence, step_name, approver_type, approver_value)
        VALUES (v_doc_stg1_id, 1, 'Quality Manager Approval', 'EMPLOYEE_ROLE', 'quality_manager');
      END IF;
    END IF;
  END IF;
END $$;
