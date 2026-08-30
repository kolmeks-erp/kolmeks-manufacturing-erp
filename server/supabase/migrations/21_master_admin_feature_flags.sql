-- ========================================================
-- Migration 21: Master Admin & Feature Flags Schema
-- Allows Master Admin to toggle ERP modules ON/OFF and manage user status.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.system_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.system_feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow public read access to feature flags (so frontend sidebar can read flags)
CREATE POLICY "Allow authenticated read feature flags" ON public.system_feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow public read feature flags" ON public.system_feature_flags
  FOR SELECT TO anon USING (true);

-- Allow admins/service role full access
CREATE POLICY "Allow admin full access to feature flags" ON public.system_feature_flags
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed default feature flags for all module categories
INSERT INTO public.system_feature_flags (key, label, category, description, is_enabled)
VALUES
  ('module_sales', 'Sales & Quotations', 'Sales', 'Customer RFQs, Quotations, Sales Orders, and Sales Invoicing', true),
  ('module_procurement', 'Procurement & Purchasing', 'Procurement', 'Suppliers, Purchase Requisitions, Purchase Orders, GRNs, and AP Invoices', true),
  ('module_products', 'Products Master', 'Products', 'Product Catalog, Categories, Variants, and Raw Materials Master', true),
  ('module_inventory', 'Inventory & Warehouses', 'Inventory', 'Inventory Balances, Stock Movements, Warehouses, and Bins', true),
  ('module_production', 'Production & Manufacturing', 'Production', 'Production Orders, BOMs, Routings, Operations Board, and Work Centers', true),
  ('module_quality', 'Quality Management', 'Quality', 'Inspections, Inspection Plans, Non-Conformance (NCR), and Quality Holds', true),
  ('module_maintenance', 'Maintenance & Asset Mgmt', 'Maintenance', 'Asset Directory, Maintenance Work Orders, PM Schedules, and Downtime Tracker', true),
  ('module_hr', 'HR & Operations', 'HR & Operations', 'Workforce Directory, Attendance, Shift Rosters, Leave Requests, and Holidays', true),
  ('module_finance', 'Finance & Accounting', 'Finance & Accounting', 'Finance Dashboards, Budgets, Cost Centers, AR/AP Aging, Ledger, and Financial Reports', true),
  ('module_self_service', 'Employee Self-Service', 'Self Service', 'Employee Portal, Attendance Check-in, and Leave Applications', true)
ON CONFLICT (key) DO NOTHING;

-- Add is_active and is_master_admin column to profiles if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_master_admin BOOLEAN DEFAULT false;
