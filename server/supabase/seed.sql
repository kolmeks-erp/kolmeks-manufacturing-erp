-- ==============================================================================
-- KOLMEKS MANUFACTURING PLATFORM — SEED DATA (DEVELOPMENT / DEMO ONLY)
-- File: server/supabase/seed.sql
-- Note: All sample records are explicitly labeled with 'DEMO-' prefix.
-- ==============================================================================

-- 1. SEED APPLICATION ROLES
INSERT INTO public.roles (id, name, description)
VALUES 
  ('11111111-1111-4111-a111-111111111111', 'admin', 'System Administrator with full system control and security access'),
  ('22222222-2222-4222-a222-222222222222', 'sales_manager', 'Sales Manager overseeing customer RFQs, Quotations, and Sales Orders'),
  ('33333333-3333-4333-a333-333333333333', 'purchase_manager', 'Procurement Officer managing Suppliers, Purchase Orders, and Raw Material Sourcing'),
  ('44444444-4444-4444-a444-444444444444', 'production_manager', 'Production Manager directing Machine Dispatching, Operations, and Work Orders'),
  ('55555555-5555-4555-a555-555555555555', 'quality_manager', 'Quality Control Inspector managing CMM Metrology, Inspections, and ISO Audits'),
  ('66666666-6666-4666-a666-666666666666', 'warehouse_manager', 'Logistics & Inventory Supervisor tracking Stock Movements and Deliveries')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED DEMO CATEGORIES
INSERT INTO public.categories (id, name, description)
VALUES
  ('ca111111-1111-4111-a111-111111111111', 'DEMO - Electric Motor Stators & Rotors', 'Engineered stators, copper windings, and rotor components'),
  ('ca222222-2222-4222-a222-222222222222', 'DEMO - Machined Pump Housings', 'Precision CNC milled and turned hydraulic cast iron housings'),
  ('ca333333-3333-4333-a333-333333333333', 'DEMO - Custom Sub-Assemblies', 'Turnkey assembled mechanical modules and sub-assemblies')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED DEMO MATERIALS
INSERT INTO public.materials (id, material_code, name, type, grade, unit, minimum_stock)
VALUES
  ('ba111111-1111-4111-a111-111111111111', 'MAT-DEMO-001', 'DEMO - Cast Iron EN-GJL-250', 'Cast Iron', 'EN-GJL-250', 'kg', 5000.000),
  ('ba222222-2222-4222-a222-222222222222', 'MAT-DEMO-002', 'DEMO - Stainless Steel 316L Bar stock', 'Stainless Steel', '316L', 'kg', 2500.000),
  ('ba333333-3333-4333-a333-333333333333', 'MAT-DEMO-003', 'DEMO - Electrolytic Copper Wire 1.2mm', 'Copper', 'Cu-ETP', 'kg', 1200.000)
ON CONFLICT (material_code) DO NOTHING;

-- 4. SEED DEMO PRODUCTS
INSERT INTO public.products (id, product_code, name, category_id, material_id, product_type, unit, drawing_number, minimum_stock)
VALUES
  ('da111111-1111-4111-a111-111111111111', 'PRD-DEMO-101', 'DEMO - High Efficiency Motor Stator Core 75kW', 'ca111111-1111-4111-a111-111111111111', 'ba333333-3333-4333-a333-333333333333', 'component', 'pcs', 'DWG-KOL-75KW-01', 50.00),
  ('da222222-2222-4222-a222-222222222222', 'PRD-DEMO-102', 'DEMO - Heavy Duty Centrifugal Pump Body', 'ca222222-2222-4222-a222-222222222222', 'ba111111-1111-4111-a111-111111111111', 'component', 'pcs', 'DWG-KOL-PUMP-04', 25.00)
ON CONFLICT (product_code) DO NOTHING;

-- 5. SEED DEMO CUSTOMERS (B2B OEMs)
INSERT INTO public.customers (id, company_name, contact_person, email, phone, country, address)
VALUES
  ('ea111111-1111-4111-a111-111111111111', 'DEMO - Nordic Flow Systems Oy', 'Matti Virtanen', 'demo-matti@nordicflow.example.fi', '+358 40 1234567', 'Finland', 'Teknologiatiet 12, Helsinki'),
  ('ea222222-2222-4222-a222-222222222222', 'DEMO - Global Industrial Motors AB', 'Elin Lindqvist', 'demo-elin@industrialmotors.example.se', '+46 8 9876543', 'Sweden', 'Industrigatan 45, Stockholm')
ON CONFLICT (email) DO NOTHING;

-- 6. SEED DEMO SUPPLIERS
INSERT INTO public.suppliers (id, company_name, contact_person, email, phone, country, payment_terms)
VALUES
  ('fa111111-1111-4111-a111-111111111111', 'DEMO - European Foundry Alliance Sp. z o.o.', 'Piotr Kowalski', 'demo-piotr@foundry-alliance.example.pl', '+48 22 5550199', 'Poland', 'Net 45'),
  ('fa222222-2222-4222-a222-222222222222', 'DEMO - Specialty Alloy Metals GmbH', 'Hans Weber', 'demo-hans@specialtymetals.example.de', '+49 89 4440288', 'Germany', 'Net 30')
ON CONFLICT (email) DO NOTHING;

-- 7. SEED DEMO MACHINES
INSERT INTO public.machines (id, machine_code, name, type, manufacturer, model, location, status, capacity, utilization)
VALUES
  ('aa111111-1111-4111-a111-111111111111', 'MCH-DEMO-01', 'DEMO - 5-Axis CNC Machining Center 01', '5-Axis CNC Milling', 'DMG MORI', 'DMU 75 MonoBLOCK', 'Production Hall A', 'running', 100.00, 84.50),
  ('aa222222-2222-4222-a222-222222222222', 'MCH-DEMO-02', 'DEMO - High Precision CNC Lathe 02', 'CNC Lathe', 'Mazak', 'Quick Turn 250MSY', 'Production Hall B', 'idle', 100.00, 45.00)
ON CONFLICT (machine_code) DO NOTHING;

-- 8. SEED DEMO WAREHOUSES
INSERT INTO public.warehouses (id, code, name, location)
VALUES
  ('ab111111-1111-4111-a111-111111111111', 'WH-MAIN-01', 'DEMO - Main Factory Logistics Warehouse', 'Kolmeks Plant 1 - Zone A'),
  ('ab222222-2222-4222-a222-222222222222', 'WH-RAW-02', 'DEMO - Raw Casting & Foundry Warehouse', 'Kolmeks Plant 1 - Zone C')
ON CONFLICT (code) DO NOTHING;
