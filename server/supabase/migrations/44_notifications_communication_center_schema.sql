-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: NOTIFICATIONS & COMMUNICATION CENTER SCHEMA
-- Migration Version: 44_notifications_communication_center_schema.sql
-- ==============================================================================

-- 1. NOTIFICATION TYPES TABLE
CREATE TABLE IF NOT EXISTS public.notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'System',
  description TEXT,
  default_priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (default_priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if public.notification_types table pre-existed
ALTER TABLE public.notification_types ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'System';
ALTER TABLE public.notification_types ADD COLUMN IF NOT EXISTS default_priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL';
ALTER TABLE public.notification_types ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Seed comprehensive ERP notification types safely
INSERT INTO public.notification_types (code, name, category, default_priority, description) VALUES
  -- Approvals
  ('APPROVAL_REQUIRED', 'Approval Required', 'Approvals', 'HIGH', 'Notification sent when a user action requires digital approval sign-off'),
  ('APPROVAL_COMPLETED', 'Approval Completed', 'Approvals', 'NORMAL', 'Notification sent when an approval request is approved'),
  ('APPROVAL_REJECTED', 'Approval Rejected', 'Approvals', 'HIGH', 'Notification sent when an approval request is rejected'),
  ('CHANGES_REQUESTED', 'Changes Requested', 'Approvals', 'HIGH', 'Notification sent when an approver requests changes'),

  -- Document Management
  ('DOCUMENT_SUBMITTED', 'Document Submitted', 'Documents', 'NORMAL', 'Notification when a document is submitted for review'),
  ('DOCUMENT_APPROVED', 'Document Approved', 'Documents', 'NORMAL', 'Notification when a document version is approved'),
  ('DOCUMENT_REJECTED', 'Document Rejected', 'Documents', 'HIGH', 'Notification when a document version is rejected'),
  ('DOCUMENT_PUBLISHED', 'Document Published', 'Documents', 'NORMAL', 'Notification when an approved document is published company-wide'),
  ('DOCUMENT_EXPIRING', 'Document Expiring Soon', 'Documents', 'HIGH', 'Notification when a compliance document is nearing expiry'),
  ('DOCUMENT_REVIEW_DUE', 'Document Review Due', 'Documents', 'NORMAL', 'Notification when an SOP or policy requires periodic review'),

  -- Procurement & P2P
  ('PURCHASE_REQUISITION_SUBMITTED', 'Purchase Requisition Submitted', 'Procurement', 'NORMAL', 'Notification when a new PR is created'),
  ('PURCHASE_REQUISITION_APPROVED', 'Purchase Requisition Approved', 'Procurement', 'NORMAL', 'Notification when a PR is approved'),
  ('RFQ_CREATED', 'RFQ Dispatched', 'Procurement', 'NORMAL', 'Notification when a Request For Quotation is sent to suppliers'),
  ('QUOTATION_RECEIVED', 'Supplier Quotation Received', 'Procurement', 'NORMAL', 'Notification when a supplier submits a quotation'),
  ('PURCHASE_ORDER_SUBMITTED', 'Purchase Order Submitted', 'Procurement', 'HIGH', 'Notification when a PO is submitted for approval'),
  ('PURCHASE_ORDER_APPROVED', 'Purchase Order Approved', 'Procurement', 'NORMAL', 'Notification when a PO is signed off'),
  ('PURCHASE_ORDER_REJECTED', 'Purchase Order Rejected', 'Procurement', 'HIGH', 'Notification when a PO is rejected'),
  ('GRN_CREATED', 'Goods Receipt Created', 'Procurement', 'NORMAL', 'Notification when goods are received at warehouse'),
  ('SUPPLIER_ISSUE', 'Supplier Quality Issue', 'Procurement', 'HIGH', 'Notification when a supplier delivery exception occurs'),

  -- Sales & Distribution
  ('QUOTATION_APPROVAL', 'Sales Quote Approval', 'Sales', 'NORMAL', 'Notification when a sales quote requires sign-off'),
  ('SALES_ORDER_CONFIRMED', 'Sales Order Confirmed', 'Sales', 'NORMAL', 'Notification when a customer order is confirmed'),
  ('ORDER_EXCEPTION', 'Sales Order Exception', 'Sales', 'HIGH', 'Notification when an order hold or delay occurs'),
  ('DELIVERY_UPDATE', 'Delivery Order Update', 'Sales', 'NORMAL', 'Notification when goods are shipped or delivered'),

  -- Quality Control
  ('INSPECTION_FAILED', 'Quality Inspection Failed', 'Quality', 'URGENT', 'Notification when an incoming or production batch fails QC inspection'),
  ('NCR_CREATED', 'NCR Defect Created', 'Quality', 'HIGH', 'Notification when a Non-Conformance Report is logged'),
  ('CAPA_ASSIGNED', 'CAPA Action Assigned', 'Quality', 'HIGH', 'Notification when a corrective action is assigned to an employee'),
  ('CAPA_DUE', 'CAPA Action Due Soon', 'Quality', 'URGENT', 'Notification when a CAPA deadline is approaching'),

  -- Asset Maintenance
  ('WORK_ORDER_ASSIGNED', 'Maintenance Work Order Assigned', 'Maintenance', 'NORMAL', 'Notification when a technician is assigned to a work order'),
  ('BREAKDOWN_REPORTED', 'Machine Breakdown Reported', 'Maintenance', 'URGENT', 'Notification when a critical machine experiences an emergency breakdown'),
  ('PREVENTIVE_MAINTENANCE_DUE', 'Preventive Maintenance Due', 'Maintenance', 'HIGH', 'Notification when planned maintenance is due'),

  -- Inventory & Warehouse
  ('INVENTORY_LOW_STOCK', 'Low Stock Alert', 'Inventory', 'HIGH', 'Notification when inventory drops below safety stock reorder point'),
  ('STOCK_EXCEPTION', 'Stock Variance Exception', 'Inventory', 'NORMAL', 'Notification when a cycle count variance is recorded'),
  ('MATERIAL_SHORTAGE', 'Production Material Shortage', 'Inventory', 'URGENT', 'Notification when raw materials are insufficient for production'),

  -- Manufacturing Production
  ('PRODUCTION_ORDER_ASSIGNED', 'Production Order Assigned', 'Production', 'NORMAL', 'Notification when a work order is released to shopfloor'),
  ('PRODUCTION_DELAY', 'Production Line Delay', 'Production', 'HIGH', 'Notification when a production schedule delay occurs'),

  -- Human Resources & Payroll
  ('LEAVE_REQUEST', 'Leave Request Submitted', 'HR', 'NORMAL', 'Notification when an employee requests leave'),
  ('LEAVE_APPROVED', 'Leave Request Approved', 'HR', 'NORMAL', 'Notification when leave is approved'),
  ('LEAVE_REJECTED', 'Leave Request Rejected', 'HR', 'NORMAL', 'Notification when leave is rejected'),
  ('ATTENDANCE_EXCEPTION', 'Attendance Exception', 'HR', 'NORMAL', 'Notification regarding late arrival or unauthorized absence'),

  -- Finance & Accounting
  ('INVOICE_APPROVAL', 'Supplier Invoice Approval', 'Finance', 'HIGH', 'Notification when an invoice requires finance sign-off'),
  ('PAYMENT_APPROVAL', 'Payment Voucher Approval', 'Finance', 'HIGH', 'Notification when a payment batch is pending approval'),
  ('BUDGET_WARNING', 'Cost Center Budget Warning', 'Finance', 'URGENT', 'Notification when a cost center exceeds budget threshold'),

  -- CRM & System
  ('LEAD_ASSIGNED', 'CRM Lead Assigned', 'CRM', 'NORMAL', 'Notification when a sales lead is assigned'),
  ('FOLLOWUP_DUE', 'CRM Follow-up Due', 'CRM', 'HIGH', 'Notification when a customer touchpoint follow-up is due'),
  ('SYSTEM_ALERT', 'System Security Alert', 'System', 'URGENT', 'Notification regarding system configuration or security events'),
  ('GENERAL_INFO', 'General ERP Information', 'System', 'LOW', 'General system notification')
ON CONFLICT (code) DO NOTHING;

-- 2. NOTIFICATION TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  notification_type_id UUID REFERENCES public.notification_types(id) ON DELETE CASCADE,
  title_template VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP', 'EMAIL')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MASTER NOTIFICATIONS TABLE
CREATE SEQUENCE IF NOT EXISTS public.notification_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_notification_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  current_year TEXT;
  seq_num TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num := LPAD(NEXTVAL('public.notification_seq')::TEXT, 6, '0');
  RETURN 'NOTIF-' || current_year || '-' || seq_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_number VARCHAR(50) UNIQUE NOT NULL DEFAULT public.generate_notification_number(),
  type_id UUID REFERENCES public.notification_types(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'System',
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  related_module VARCHAR(100) DEFAULT 'General',
  related_record_id UUID,
  related_record_reference VARCHAR(100),
  related_route VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  event_key VARCHAR(255), -- Idempotency key to prevent duplicate notifications
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if public.notifications table pre-existed
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'System';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_module VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_record_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_record_reference VARCHAR(100);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_route VARCHAR(255);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS event_key VARCHAR(255);

-- 4. REMINDERS TABLE (CALENDAR & ERP ACTIVITY REMINDERS)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  reminder_time TIMESTAMPTZ NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'TRIGGERED', 'DISMISSED', 'COMPLETED')),
  related_module VARCHAR(100) DEFAULT 'General',
  related_record_id UUID,
  related_record_reference VARCHAR(100),
  related_route VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. USER NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  in_app_approvals BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_documents BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_procurement BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_sales BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_quality BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_maintenance BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_hr BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_finance BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_crm BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_system BOOLEAN NOT NULL DEFAULT TRUE,
  email_approvals BOOLEAN NOT NULL DEFAULT TRUE,
  email_urgent BOOLEAN NOT NULL DEFAULT TRUE,
  email_daily_digest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. NOTIFICATION DELIVERY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP', 'EMAIL')),
  status VARCHAR(20) NOT NULL DEFAULT 'SENT' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_event_key ON public.notifications(event_key);
CREATE INDEX IF NOT EXISTS idx_reminders_recipient ON public.reminders(recipient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON public.reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_all_notification_types ON public.notification_types;
CREATE POLICY authenticated_all_notification_types ON public.notification_types FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_all_notification_templates ON public.notification_templates;
CREATE POLICY authenticated_all_notification_templates ON public.notification_templates FOR ALL TO authenticated USING (true);

-- Users can read & update only their own notifications
DROP POLICY IF EXISTS user_own_notifications ON public.notifications;
CREATE POLICY user_own_notifications ON public.notifications FOR ALL TO authenticated USING (recipient_id = auth.uid());

-- Users can read & update only their own reminders
DROP POLICY IF EXISTS user_own_reminders ON public.reminders;
CREATE POLICY user_own_reminders ON public.reminders FOR ALL TO authenticated USING (recipient_id = auth.uid());

-- Users can read & update only their own notification preferences
DROP POLICY IF EXISTS user_own_preferences ON public.notification_preferences;
CREATE POLICY user_own_preferences ON public.notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_own_delivery_logs ON public.notification_delivery_logs;
CREATE POLICY user_own_delivery_logs ON public.notification_delivery_logs FOR ALL TO authenticated USING (true);
