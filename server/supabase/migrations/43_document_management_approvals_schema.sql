-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: DOCUMENT MANAGEMENT & DIGITAL APPROVALS SCHEMA
-- Migration Version: 43_document_management_approvals_schema.sql
-- ==============================================================================

-- 1. DOCUMENT TYPES TABLE (CONFIGURABLE)
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'General',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial standard ERP document types safely
INSERT INTO public.document_types (code, name, description, category) VALUES
  ('SOP', 'Standard Operating Procedure', 'Official standard operating procedure document', 'Quality'),
  ('WORK_INSTRUCTION', 'Work Instruction', 'Step-by-step technical work instruction', 'Production'),
  ('POLICY', 'Company Policy', 'Official company policy document', 'HR'),
  ('CERTIFICATE', 'Quality/Compliance Certificate', 'ISO/CE/UL regulatory certificate', 'Quality'),
  ('CONTRACT', 'Legal Contract / Agreement', 'Binding legal contract or SLA', 'Legal'),
  ('PURCHASE_DOC', 'Purchase Requisition/Order Document', 'Procurement supporting document', 'Procurement'),
  ('SUPPLIER_DOC', 'Supplier Profile / Qualification', 'Supplier audit, tax, or banking document', 'Procurement'),
  ('CUSTOMER_DOC', 'Customer Contract / SLA', 'Customer agreement or specification', 'Sales'),
  ('QUALITY_DOC', 'Quality Inspection Plan / Report', 'Quality control plan or inspection result', 'Quality'),
  ('NCR_DOC', 'Non-Conformance Report (NCR)', 'Defect non-conformance log and evidence', 'Quality'),
  ('CAPA_DOC', 'CAPA Action Document', 'Corrective and preventive action plan', 'Quality'),
  ('EMPLOYEE_DOC', 'Employee HR Record', 'Confidential employee joining/ID document', 'HR'),
  ('TRAINING_DOC', 'Training Certificate / Manual', 'Employee skill and safety training record', 'HR'),
  ('MAINTENANCE_DOC', 'Equipment Manual / Service Log', 'Asset maintenance manual or breakdown log', 'Maintenance'),
  ('PRODUCTION_DOC', 'BOM / Production Order Spec', 'Manufacturing engineering specification', 'Production'),
  ('FINANCE_DOC', 'Financial Statement / Audit', 'Company financial or audit report', 'Finance'),
  ('INVOICE_ATTACHMENT', 'Invoice Support / Receipt', 'Supplier or Sales invoice supporting attachment', 'Finance'),
  ('DELIVERY_DOC', 'Delivery Note / Packing Slip', 'Shipping delivery receipt or proof of transport', 'Logistics'),
  ('DRAWING', 'CAD / Engineering Drawing', '2D/3D technical drawing or CAD file', 'Engineering'),
  ('SPECIFICATION', 'Technical Specification', 'Component or material technical spec', 'Engineering'),
  ('GENERAL', 'General ERP Document', 'Uncategorized ERP document', 'General')
ON CONFLICT (code) DO NOTHING;

-- 2. DOCUMENT CATEGORIES TABLE (CONFIGURABLE HIERARCHICAL)
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.document_categories(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial document categories safely
INSERT INTO public.document_categories (code, name, description) VALUES
  ('QUALITY', 'Quality Management', 'Quality assurance, SOPs, NCRs, and CAPAs'),
  ('PROCUREMENT', 'Procurement & Purchasing', 'Supplier files, POs, and RFQ quotes'),
  ('SALES', 'Sales & Distribution', 'Customer contracts, quotes, and delivery orders'),
  ('ENGINEERING', 'Engineering & R&D', 'CAD models, drawings, and technical specs'),
  ('MANUFACTURING', 'Manufacturing & Production', 'Work instructions, BOMs, and routing specs'),
  ('MAINTENANCE', 'Asset & Maintenance', 'Equipment manuals, PM schedules, and calibration'),
  ('HUMAN_RESOURCES', 'Human Resources', 'Employee files, policies, and training'),
  ('FINANCE', 'Finance & Accounting', 'Invoices, receipts, tax docs, and budgets'),
  ('GENERAL', 'General Corporate', 'General company documents')
ON CONFLICT (code) DO NOTHING;

-- 3. DOCUMENTS MASTER TABLE
CREATE SEQUENCE IF NOT EXISTS public.document_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_document_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  current_year TEXT;
  seq_num TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num := LPAD(NEXTVAL('public.document_seq')::TEXT, 6, '0');
  RETURN 'DOC-' || current_year || '-' || seq_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_document_number(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.document_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'PUBLISHED', 'ARCHIVED')),
  confidentiality_level VARCHAR(30) NOT NULL DEFAULT 'INTERNAL' CHECK (confidentiality_level IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'HIGHLY_CONFIDENTIAL')),
  effective_date DATE,
  review_date DATE,
  next_review_date DATE,
  expiry_date DATE,
  retention_category VARCHAR(100),
  retention_start_date DATE,
  retention_end_date DATE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DOCUMENT VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number VARCHAR(20) NOT NULL DEFAULT '1.0',
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT DEFAULT 0 CHECK (file_size >= 0),
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'PUBLISHED')),
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DOCUMENT RELATIONSHIPS TABLE (CROSS-MODULE LINKS)
CREATE TABLE IF NOT EXISTS public.document_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  module_name VARCHAR(100) NOT NULL CHECK (module_name IN (
    'Employee', 'Supplier', 'Customer', 'Product', 'SalesOrder', 'Quotation',
    'Delivery', 'PurchaseRequisition', 'RFQ', 'PurchaseOrder', 'GRN',
    'SupplierInvoice', 'QualityInspection', 'NCR', 'CAPA', 'MaintenanceWorkOrder',
    'Asset', 'ProductionOrder', 'Invoice', 'Payment', 'General'
  )),
  record_id UUID NOT NULL,
  record_reference VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DOCUMENT DIGITAL APPROVAL WORKFLOWS
CREATE TABLE IF NOT EXISTS public.document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approval_type VARCHAR(30) NOT NULL DEFAULT 'SEQUENTIAL' CHECK (approval_type IN ('SEQUENTIAL', 'PARALLEL')),
  target_role VARCHAR(100) DEFAULT 'DEPARTMENT_MANAGER',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  due_date DATE,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES public.document_approvals(id) ON DELETE CASCADE,
  step_number INT NOT NULL DEFAULT 1,
  approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approver_role VARCHAR(100),
  decision VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (decision IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  comments TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DOCUMENT ACCESS PERMISSIONS OVERRIDES
CREATE TABLE IF NOT EXISTS public.document_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  grantee_type VARCHAR(30) NOT NULL CHECK (grantee_type IN ('USER', 'ROLE', 'DEPARTMENT')),
  grantee_id VARCHAR(100) NOT NULL,
  permission_level VARCHAR(30) NOT NULL DEFAULT 'VIEW' CHECK (permission_level IN ('VIEW', 'DOWNLOAD', 'EDIT', 'APPROVE', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DOCUMENT AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.document_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON public.documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_review ON public.documents(review_date);
CREATE INDEX IF NOT EXISTS idx_doc_versions_doc ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_rel_record ON public.document_relationships(record_id, module_name);
CREATE INDEX IF NOT EXISTS idx_doc_approvals_doc ON public.document_approvals(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_approvals_status ON public.document_approvals(status);
CREATE INDEX IF NOT EXISTS idx_doc_steps_approval ON public.document_approval_steps(approval_id);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_all_document_types ON public.document_types;
CREATE POLICY authenticated_all_document_types ON public.document_types FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_categories ON public.document_categories;
CREATE POLICY authenticated_all_document_categories ON public.document_categories FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_documents ON public.documents;
CREATE POLICY authenticated_all_documents ON public.documents FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_versions ON public.document_versions;
CREATE POLICY authenticated_all_document_versions ON public.document_versions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_relationships ON public.document_relationships;
CREATE POLICY authenticated_all_document_relationships ON public.document_relationships FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_approvals ON public.document_approvals;
CREATE POLICY authenticated_all_document_approvals ON public.document_approvals FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_approval_steps ON public.document_approval_steps;
CREATE POLICY authenticated_all_document_approval_steps ON public.document_approval_steps FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_access_permissions ON public.document_access_permissions;
CREATE POLICY authenticated_all_document_access_permissions ON public.document_access_permissions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_document_audit_logs ON public.document_audit_logs;
CREATE POLICY authenticated_all_document_audit_logs ON public.document_audit_logs FOR ALL TO authenticated USING (true);
