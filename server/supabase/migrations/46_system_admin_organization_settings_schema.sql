-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: SYSTEM ADMIN & ORGANIZATION SETTINGS SCHEMA
-- Migration Version: 46_system_admin_organization_settings_schema.sql
-- ==============================================================================

-- 1. ORGANIZATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name VARCHAR(200) NOT NULL DEFAULT 'Kolmeks Oy',
  legal_name VARCHAR(200) DEFAULT 'Kolmeks Oy Ltd',
  display_name VARCHAR(150) DEFAULT 'Kolmeks Manufacturing ERP',
  company_code VARCHAR(50) DEFAULT 'KOLMEKS-HQ',
  registration_number VARCHAR(100) DEFAULT 'FI-0123456-7',
  tax_id VARCHAR(100) DEFAULT 'FI01234567',
  address_line1 VARCHAR(255) DEFAULT 'Taimistotie 1',
  address_line2 VARCHAR(255),
  city VARCHAR(100) DEFAULT 'Turenki',
  state_province VARCHAR(100) DEFAULT 'Kanta-Häme',
  postal_code VARCHAR(20) DEFAULT '14200',
  country VARCHAR(100) DEFAULT 'Finland',
  phone VARCHAR(50) DEFAULT '+358 20 744 1400',
  email VARCHAR(255) DEFAULT 'info@kolmeks.com',
  website VARCHAR(255) DEFAULT 'https://www.kolmeks.com',
  logo_url TEXT DEFAULT '/images/kolmeks-logo.png',
  default_timezone VARCHAR(100) DEFAULT 'Europe/Helsinki',
  default_currency VARCHAR(10) DEFAULT 'EUR',
  date_format VARCHAR(30) DEFAULT 'YYYY-MM-DD',
  number_format VARCHAR(30) DEFAULT '1,234.56',
  quantity_precision INT DEFAULT 2,
  price_precision INT DEFAULT 2,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed single default organization record if empty
INSERT INTO public.organization_settings (
  org_name, legal_name, display_name, company_code, registration_number, tax_id,
  address_line1, city, state_province, postal_code, country, phone, email, website,
  default_timezone, default_currency, date_format, number_format
)
SELECT 
  'Kolmeks Oy', 'Kolmeks Oy Ltd', 'Kolmeks Manufacturing', 'KOLMEKS-HQ', 'FI-0123456-7', 'FI01234567',
  'Taimistotie 1', 'Turenki', 'Kanta-Häme', '14200', 'Finland', '+358 20 744 1400', 'info@kolmeks.com', 'https://www.kolmeks.com',
  'Europe/Helsinki', 'EUR', 'YYYY-MM-DD', '1,234.56'
WHERE NOT EXISTS (SELECT 1 FROM public.organization_settings);


-- 2. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state_province VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  timezone VARCHAR(100) DEFAULT 'Europe/Helsinki',
  currency VARCHAR(10) DEFAULT 'EUR',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default locations
INSERT INTO public.locations (code, name, address, city, country, postal_code, timezone, currency, contact_email, status)
VALUES
  ('LOC-FIN-01', 'Turenki Headquarters & Plant', 'Taimistotie 1', 'Turenki', 'Finland', '14200', 'Europe/Helsinki', 'EUR', 'turenki@kolmeks.com', 'Active'),
  ('LOC-EST-01', 'Viljandi Operations Plant', 'Vabaduse 12', 'Viljandi', 'Estonia', '71001', 'Europe/Tallinn', 'EUR', 'estonia@kolmeks.com', 'Active'),
  ('LOC-CHN-01', 'Suzhou Manufacturing Hub', 'Industrial Park 88', 'Suzhou', 'China', '215000', 'Asia/Shanghai', 'CNY', 'china@kolmeks.com', 'Active'),
  ('LOC-IND-01', 'Pune Precision Tech Center', 'Chakan MIDC Phase 2', 'Pune', 'India', '410501', 'Asia/Kolkata', 'INR', 'india@kolmeks.com', 'Active')
ON CONFLICT (code) DO NOTHING;


-- 3. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  value_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (value_type IN ('text', 'number', 'boolean', 'json')),
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed default system settings
INSERT INTO public.system_settings (category, setting_key, setting_value, value_type, description, is_system)
VALUES
  ('General', 'sys_default_language', '"en"', 'text', 'Default System Language', true),
  ('General', 'sys_default_timezone', '"Europe/Helsinki"', 'text', 'Default Server Timezone', true),
  ('General', 'sys_items_per_page', '25', 'number', 'Default Data Table Pagination Limit', false),
  ('Security', 'sec_session_timeout_mins', '60', 'number', 'Inactivity session timeout minutes', false),
  ('Security', 'sec_require_mfa_admin', 'false', 'boolean', 'Require MFA for Admin Users', false),
  ('Security', 'sec_audit_retention_days', '365', 'number', 'Audit logs retention in days', true),
  ('Approval', 'appr_auto_escalate_hours', '48', 'number', 'Hours before pending approvals escalate', false),
  ('Notifications', 'notif_email_enabled', 'true', 'boolean', 'Global Email Dispatch Enabled', false)
ON CONFLICT (setting_key) DO NOTHING;


-- 4. NUMBERING SEQUENCES TABLE
CREATE TABLE IF NOT EXISTS public.numbering_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(150) NOT NULL,
  prefix VARCHAR(30) NOT NULL,
  sequence_length INT NOT NULL DEFAULT 6,
  current_value BIGINT NOT NULL DEFAULT 1000,
  starting_number BIGINT NOT NULL DEFAULT 1000,
  suffix VARCHAR(30) DEFAULT '',
  pattern VARCHAR(100) DEFAULT '{PREFIX}-{YEAR}-{SEQUENCE}',
  reset_period VARCHAR(20) DEFAULT 'Yearly' CHECK (reset_period IN ('Never', 'Yearly', 'Monthly')),
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed default numbering sequences
INSERT INTO public.numbering_sequences (entity_type, label, prefix, sequence_length, current_value, pattern)
VALUES
  ('sales_quotation', 'Sales Quotation', 'SQ', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('sales_order', 'Sales Order', 'SO', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('purchase_requisition', 'Purchase Requisition', 'PR', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('purchase_order', 'Purchase Order', 'PO', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('goods_receipt', 'Goods Receipt Note', 'GRN', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('sales_invoice', 'Sales Invoice', 'INV', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('credit_note', 'Credit Note', 'CN', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('ncr', 'Non-Conformance Report', 'NCR', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('capa', 'CAPA Plan', 'CAPA', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('maintenance_work_order', 'Maintenance Work Order', 'MWO', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}'),
  ('employee', 'Employee Code', 'EMP', 5, 100, '{PREFIX}-{SEQUENCE}'),
  ('document', 'Document Control Number', 'DOC', 6, 1000, '{PREFIX}-{YEAR}-{SEQUENCE}')
ON CONFLICT (entity_type) DO NOTHING;


-- 5. CURRENCIES TABLE
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_precision INT NOT NULL DEFAULT 2,
  is_default BOOLEAN NOT NULL DEFAULT false,
  exchange_rate_to_default NUMERIC(15, 6) NOT NULL DEFAULT 1.000000,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Currencies
INSERT INTO public.currencies (code, name, symbol, decimal_precision, is_default, exchange_rate_to_default, status)
VALUES
  ('EUR', 'Euro', '€', 2, true, 1.000000, 'Active'),
  ('USD', 'US Dollar', '$', 2, false, 1.085000, 'Active'),
  ('GBP', 'British Pound', '£', 2, false, 0.854000, 'Active'),
  ('INR', 'Indian Rupee', '₹', 2, false, 90.150000, 'Active'),
  ('CNY', 'Chinese Yuan', '¥', 2, false, 7.820000, 'Active')
ON CONFLICT (code) DO NOTHING;


-- 6. UNITS OF MEASURE TABLE
CREATE TABLE IF NOT EXISTS public.units_of_measure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Quantity', 'Weight', 'Length', 'Volume', 'Time', 'Area')),
  symbol VARCHAR(20) NOT NULL,
  conversion_factor NUMERIC(15, 6) NOT NULL DEFAULT 1.000000,
  base_unit_code VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Units of Measure
INSERT INTO public.units_of_measure (code, name, category, symbol, conversion_factor, base_unit_code, status)
VALUES
  ('pcs', 'Pieces', 'Quantity', 'pcs', 1.000000, 'pcs', 'Active'),
  ('kg', 'Kilograms', 'Weight', 'kg', 1.000000, 'kg', 'Active'),
  ('g', 'Grams', 'Weight', 'g', 0.001000, 'kg', 'Active'),
  ('m', 'Meters', 'Length', 'm', 1.000000, 'm', 'Active'),
  ('mm', 'Millimeters', 'Length', 'mm', 0.001000, 'm', 'Active'),
  ('L', 'Liters', 'Volume', 'L', 1.000000, 'L', 'Active'),
  ('hrs', 'Hours', 'Time', 'hrs', 1.000000, 'hrs', 'Active')
ON CONFLICT (code) DO NOTHING;


-- 7. PERMISSIONS & ROLE PERMISSIONS TABLES
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Seed granular system permissions
INSERT INTO public.permissions (code, name, category, description)
VALUES
  ('dashboard.view', 'View Dashboard & Telemetry', 'Dashboard', 'Access executive dashboard KPIs'),
  ('hr.view', 'View HR Records', 'HR', 'View employee directory and structure'),
  ('hr.manage', 'Manage HR Records', 'HR', 'Create, edit, and deactivate employees'),
  ('crm.view', 'View CRM Leads & Opportunities', 'CRM', 'View customer leads and pipeline'),
  ('crm.manage', 'Manage CRM Leads & Opportunities', 'CRM', 'Create and modify sales pipeline'),
  ('sales.view', 'View Sales & Quotations', 'Sales', 'View sales orders and quotes'),
  ('sales.approve', 'Approve Sales Orders', 'Sales', 'Authorize sales discount and sign-off'),
  ('procurement.view', 'View Procurement & POs', 'Procurement', 'View requisitions and purchase orders'),
  ('procurement.approve', 'Approve Purchase Orders', 'Procurement', 'Authorize purchase orders'),
  ('inventory.view', 'View Inventory & Warehouses', 'Inventory', 'View stock levels and movements'),
  ('inventory.manage', 'Manage Inventory & Adjustments', 'Inventory', 'Execute stock adjustments and transfers'),
  ('production.view', 'View Production & BOMs', 'Production', 'View work orders and production schedule'),
  ('production.manage', 'Manage Production Orders', 'Production', 'Issue work orders and log progress'),
  ('quality.view', 'View Quality & NCR', 'Quality', 'View quality inspections and CAPA'),
  ('quality.approve', 'Approve Quality Releases', 'Quality', 'Authorize quality sign-off'),
  ('maintenance.view', 'View Maintenance & Assets', 'Maintenance', 'View work orders and equipment'),
  ('finance.view', 'View Finance & Accounting', 'Finance', 'View ledger, invoices, and budgets'),
  ('documents.view', 'View Document Control', 'Documents', 'View enterprise documents'),
  ('documents.approve', 'Approve Documents', 'Documents', 'Sign-off controlled document revisions'),
  ('workflows.manage', 'Manage Workflows', 'Workflows', 'Design and activate workflow definitions'),
  ('notifications.manage', 'Manage Notifications', 'Notifications', 'Configure alert templates and rules'),
  ('reports.view', 'View Analytics & Reports', 'Reports', 'Generate cross-module BI reports'),
  ('settings.manage', 'Manage System Settings', 'Settings', 'Full access to organization, security, and admin configuration')
ON CONFLICT (code) DO NOTHING;


-- 8. SYSTEM AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  target_record VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  severity VARCHAR(20) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'SECURITY')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_audit_actor ON public.system_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_module ON public.system_audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_audit_created ON public.system_audit_logs(created_at DESC);


-- 9. MASTER DATA OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.master_data_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  label VARCHAR(150) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, code)
);

-- Seed Master Data Options
INSERT INTO public.master_data_options (category, code, label, sort_order, is_default)
VALUES
  ('payment_terms', 'NET_30', 'Net 30 Days', 1, true),
  ('payment_terms', 'NET_60', 'Net 60 Days', 2, false),
  ('payment_terms', 'IMMEDIATE', 'Immediate / Cash on Delivery', 3, false),
  ('shipping_methods', 'EXW', 'Ex Works (EXW)', 1, true),
  ('shipping_methods', 'FOB', 'Free on Board (FOB)', 2, false),
  ('shipping_methods', 'DDP', 'Delivered Duty Paid (DDP)', 3, false),
  ('priority_levels', 'LOW', 'Low Priority', 1, false),
  ('priority_levels', 'MEDIUM', 'Normal / Medium Priority', 2, true),
  ('priority_levels', 'HIGH', 'High Priority', 3, false),
  ('priority_levels', 'URGENT', 'Urgent / Critical', 4, false)
ON CONFLICT (category, code) DO NOTHING;


-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numbering_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_data_options ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read access
CREATE POLICY authenticated_read_org ON public.organization_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_locations ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_sys_settings ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_numbering ON public.numbering_sequences FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_currencies ON public.currencies FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_uom ON public.units_of_measure FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_permissions ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_role_permissions ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_system_audit ON public.system_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_master_options ON public.master_data_options FOR SELECT TO authenticated USING (true);

-- Admin Full Access Policies
CREATE POLICY service_role_all_org ON public.organization_settings FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_locations ON public.locations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_sys_settings ON public.system_settings FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_numbering ON public.numbering_sequences FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_currencies ON public.currencies FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_uom ON public.units_of_measure FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_permissions ON public.permissions FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_role_permissions ON public.role_permissions FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_system_audit ON public.system_audit_logs FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_master_options ON public.master_data_options FOR ALL TO service_role USING (true);
