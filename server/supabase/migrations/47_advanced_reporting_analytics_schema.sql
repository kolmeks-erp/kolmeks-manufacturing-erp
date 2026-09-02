-- ==============================================================================
-- KOLMEKS MANUFACTURING ERP: ADVANCED REPORTING & ANALYTICS SCHEMA
-- Migration Version: 47_advanced_reporting_analytics_schema.sql
-- ==============================================================================

-- 1. SAVED REPORT CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL, -- e.g. 'sales', 'procurement', 'inventory', 'production', 'quality', 'finance', 'hr', 'crm', 'workflows', 'documents', 'audit'
  filters JSONB DEFAULT '{}'::jsonb,
  grouping VARCHAR(100),
  sorting JSONB DEFAULT '{}'::jsonb,
  visible_columns JSONB DEFAULT '[]'::jsonb,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REPORT SCHEDULES FOUNDATION TABLE
CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  saved_report_id UUID REFERENCES public.saved_reports(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  recipients TEXT[] DEFAULT '{}',
  format VARCHAR(20) NOT NULL DEFAULT 'csv', -- 'csv', 'excel', 'pdf'
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REPORTING INDEXES FOR HIGH-PERFORMANCE ANALYTICS
CREATE INDEX IF NOT EXISTS idx_saved_reports_user ON public.saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_type ON public.saved_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_schedules_user ON public.report_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON public.report_schedules(is_active);

-- Enable RLS for saved reports & schedules
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own saved reports"
  ON public.saved_reports
  FOR ALL
  USING (auth.uid() = user_id OR is_shared = true)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their report schedules"
  ON public.report_schedules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
