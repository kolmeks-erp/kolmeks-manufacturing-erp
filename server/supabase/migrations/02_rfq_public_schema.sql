-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — PUBLIC RFQ & FILE STORAGE MIGRATION
-- Migration Version: 02_rfq_public_schema.sql
-- ==============================================================================

-- 1. Extend public.rfqs table with public submission fields if missing
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS company VARCHAR(200);
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Finland';
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS requirement_type VARCHAR(100);
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS other_requirement TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'Pcs';
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS surface_finish VARCHAR(100);
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS tolerance_requirements TEXT;

-- 2. Extend public.rfq_attachments table with Cloudinary metadata
ALTER TABLE public.rfq_attachments ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);
ALTER TABLE public.rfq_attachments ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);
ALTER TABLE public.rfq_attachments ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50);
ALTER TABLE public.rfq_attachments ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50);

-- 3. Create Views/Aliases for standard naming conventions if requested
CREATE OR REPLACE VIEW public.rfq_requests AS
SELECT 
  id,
  rfq_number AS request_number,
  full_name,
  company,
  email,
  phone,
  country,
  requirement_type,
  other_requirement,
  component_name AS project_name,
  description,
  quantity AS estimated_quantity,
  unit,
  target_date AS target_delivery_date,
  material,
  surface_finish,
  tolerance_requirements,
  status,
  created_at,
  updated_at
FROM public.rfqs;

CREATE OR REPLACE VIEW public.rfq_files AS
SELECT 
  id,
  rfq_id,
  file_name AS original_filename,
  cloudinary_public_id,
  file_url AS cloudinary_url,
  resource_type,
  file_type AS mime_type,
  file_size,
  created_at
FROM public.rfq_attachments;

-- 4. Enable Row Level Security (RLS) & Ensure Anonymous Policies
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_attachments ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous insert via policies if direct client insert is used (backend service role bypasses RLS)
DROP POLICY IF EXISTS anon_insert_rfq ON public.rfqs;
CREATE POLICY anon_insert_rfq ON public.rfqs FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS anon_insert_rfq_attachment ON public.rfq_attachments;
CREATE POLICY anon_insert_rfq_attachment ON public.rfq_attachments FOR INSERT TO anon WITH CHECK (true);

-- Ensure anonymous users CANNOT read, update, or delete existing RFQs
DROP POLICY IF EXISTS anon_no_select_rfq ON public.rfqs;
CREATE POLICY anon_no_select_rfq ON public.rfqs FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS anon_no_select_rfq_attachment ON public.rfq_attachments;
CREATE POLICY anon_no_select_rfq_attachment ON public.rfq_attachments FOR SELECT TO anon USING (false);

-- Service Role Full Access Policies
DROP POLICY IF EXISTS service_role_all_rfqs ON public.rfqs;
CREATE POLICY service_role_all_rfqs ON public.rfqs FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS service_role_all_rfq_attachments ON public.rfq_attachments;
CREATE POLICY service_role_all_rfq_attachments ON public.rfq_attachments FOR ALL TO service_role USING (true);
