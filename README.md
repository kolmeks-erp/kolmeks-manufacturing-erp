# Kolmeks - Industrial Contract Manufacturing Platform & ERP

A high-performance, enterprise-grade industrial manufacturing web platform and internal ERP portal for Kolmeks.

---

## 🚀 Overview

The platform consists of two distinct separated subsystems:
1. **Public Corporate Web Application**: Highlighting contract manufacturing capabilities, CNC machining, electric motor components, quality management, careers, news, and RFQ submission.
2. **Secure Internal ERP Portal**: Accessible strictly via `/secure-kolmeks-x0y0` for internal production operations, inventory management, CNC machine monitoring, CMM quality control, RFQ processing, and logistics.

---

## 🏭 Complete Professional Home Page (Prompt 05)

The Home Page is structured as a complete, high-precision B2B industrial landing page consisting of 12 flowing sections in exact order:

1. **Navbar** (From `PublicLayout.tsx` with top banner, capabilities dropdown, and `Request a Quote` CTA).
2. **Hero Section** (`PRECISION MANUFACTURING` eyebrow, main heading, supporting text, primary CTA `/request-quote`, secondary CTA `/cnc-machining`, micro-positioning keywords, and modular `VisualPlaceholder`).
3. **Trust / Positioning Strip** (`PositioningStrip.tsx` with `Precision Manufacturing`, `Engineering Expertise`, `Quality Focus`, `Reliable Supply`).
4. **About / Company Introduction** (`AboutSection.tsx` asymmetric layout with technical blueprint indicators and `/about` CTA).
5. **Capabilities Section** (Grid of `CapabilityCard` items for Contract Manufacturing, CNC Machining, Sub-Assembly, Electric Motors, and Supply Chain + Section CTA).
6. **Manufacturing Process Workflow** (`ProcessSection.tsx` 6-step conceptual timeline: Engineering ➔ Material Sourcing ➔ Machining ➔ Quality Inspection ➔ Assembly ➔ Delivery).
7. **Precision / Quality Section** (`QualitySection.tsx` "Precision You Can Measure" visual area, CMM inspection, and traceability highlights).
8. **Global Presence Section** (`GlobalPresenceSection.tsx` SVG world map graphic foundation with `LOCATION DATA TO BE VERIFIED` badges and `LocationCard` grid).
9. **Industries & Applications** (`IndustriesSection.tsx` targeting OEM Machinery, Transportation, Electrical, Automation, Fluid & Pump, Energy).
10. **Why Kolmeks Editorial Section** (`WhyKolmeksSection.tsx` 01 to 06 numbered principles on engineering expertise, precision, quality focus, supply chain, collaboration, and global coordination).
11. **Statistics Area** (Structural metrics cards using `StatCard` clearly marked for verified operational data).
12. **Final Customer Call-to-Action** (`CTASection.tsx` high-impact industrial banner driving visitors to `/request-quote` and `/contact`).
13. **Footer** (Multi-column corporate footer from `PublicLayout.tsx`).

### Content & Media Architecture:
- Structured data stored in `client/src/data/homeContent.ts` to keep JSX components modular and clean.
- Modular visual placeholder frame (`VisualPlaceholder.tsx`) ensuring effortless image swapping when approved company media is provided in later prompts.
- Open Graph metadata integration in `SEO.tsx` (`og:title`, `og:description`, `og:type`, `og:url`).

---

## 🔐 Authentication & Security Architecture (Prompt 03)

The application uses **Supabase Auth** for enterprise authentication coupled with custom PostgreSQL **profiles** and **roles** tables for Role-Based Access Control (RBAC).

```
USER
  ↓
ERP LOGIN PAGE (/secure-kolmeks-x0y0/login)
  ↓
SUPABASE AUTH (JWT Access Token)
  ↓
REACT AUTH CONTEXT (Loads profile & role)
  ↓
PROTECTED ROUTE GUARD (Validates Session & Status)
  ↓
EXPRESS API (Verifies Bearer Token & Role Authorization)
  ↓
SUPABASE POSTGRESQL (RLS Enforcement)
```

---

## 👥 Roles & Authorization Matrix

| Role | Role Name | System Access & Responsibilities |
| :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin` | Full ERP access across all 32 tables, user management, and system settings. |
| 💼 **Sales Manager** | `sales_manager` | Access to Customers, RFQs, Quotations, Sales Orders, and Sales Reports. |
| 📦 **Purchase Manager** | `purchase_manager` | Access to Suppliers, Materials Master, Purchase Orders, and Inventory. |
| ⚙️ **Production Manager** | `production_manager` | Access to Production Scheduling, CNC Machine Hub, Products, and Maintenance. |
| 🔬 **Quality Manager** | `quality_manager` | Access to Quality Control (QC), CMM Measurements, and Production Inspection. |
| 🏭 **Warehouse Manager** | `warehouse_manager` | Access to Inventory Control, Warehouses, Stock Movements, and Logistics Deliveries. |

---

## 🗄️ Database Architecture & Migrations (Prompt 02)

The database schema is organized into 32 PostgreSQL relational tables with normalized relationships, B-Tree indexes, UUID primary keys, timestamp triggers (`updated_at`), non-negative constraints, and Row Level Security (RLS).

---

## 📂 Project Structure

```
Kolmeks_ERP/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute guard
│   │   │   ├── public/         # HeroSection, PositioningStrip, AboutSection, CapabilityCard, LocationCard, ProcessSection, QualitySection, GlobalPresenceSection, VisualPlaceholder, SEO
│   │   │   └── ui/             # Container, Button, Card, Badge, Input, Select, Textarea
│   │   ├── constants/          # Navigation matrix & public nav config
│   │   ├── data/               # Structured homeContent.ts configuration
│   │   ├── context/            # AuthContext & AuthProvider
│   │   ├── layouts/            # PublicLayout & ERPLayout
│   │   ├── pages/
│   │   │   ├── erp/            # ERPLoginPage, ERPDashboardPage, UnauthorizedPage
│   │   │   └── public/         # HomePage, AboutPage, CncMachiningPage, QualityPage, ContactPage, RequestQuotePage, PublicNotFoundPage
│   │   ├── routes/             # AppRoutes (Public vs Protected ERP mapping)
│   │   ├── services/           # Supabase client, auth.service, profile.service, Axios API
│   │   └── types/              # UserRole, UserProfile, Navigation interfaces
├── server/                     # Express.js Backend API
│   ├── src/
│   │   ├── config/             # Supabase client & admin client configuration
│   │   ├── middleware/         # auth.middleware, rbac.middleware, errorHandler
│   │   ├── routes/             # health.routes, auth.routes, erp.routes
│   │   └── server.js           # Express app listener
│   └── supabase/               # PostgreSQL Database Migrations & Seeds
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-secret-key
SUPABASE_JWKS_URL=https://your-supabase-project.supabase.co/rest/v1/rpc/jwks
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

---

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
- Health Check Telemetry: `GET http://localhost:5000/api/health`
- Authenticated User Endpoint: `GET http://localhost:5000/api/auth/me`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
- Public Corporate Website: `http://localhost:5173`
- Request a Quote Page: `http://localhost:5173/request-quote`
- Secure ERP Login: `http://localhost:5173/secure-kolmeks-x0y0/login`
- Secure ERP Dashboard: `http://localhost:5173/secure-kolmeks-x0y0/dashboard`

---

## 📌 Implementation Status
- [x] **Prompt 01**: React + Vite + TypeScript Frontend & Express Backend setup with public/ERP routing.
- [x] **Prompt 02**: Supabase PostgreSQL database schema, migrations, RLS policies, indexing, seed data, and Express database service layer.
- [x] **Prompt 03**: Authentication & ERP Security Foundation (Supabase Auth, profiles/roles RBAC, protected routes, Express Bearer token middleware, and industrial login UI).
- [x] **Prompt 04**: Public Website Design System & Foundation (PublicLayout, navbar dropdown, mobile menu, multi-column footer, modular components, Home page assembly, 13 public route shells, 404 page, and SEO metadata manager).
- [x] **Prompt 05**: Complete Professional Home Page (12 sequential sections, positioning strip, asymmetric About section, LocationCard grid, SVG world map foundation, editorial Why Kolmeks, VisualPlaceholder system, Open Graph metadata, and full B2B industrial responsiveness).
- [x] **Prompt 06**: About Kolmeks & Contract Manufacturing Pages (Full 11-section About page, 10-section Contract Manufacturing page, approved image assets integration, SEO metadata, breadcrumbs, zero unsupported factual claims, and responsive B2B industrial layouts).
- [x] **Prompt 07**: CNC Machining & Assembly Pages (Exact 11-section CNC Machining page, 10-section Assembly page, 5 approved `.webp` image assets integrated, educational & non-assertive language guidelines, zero unverified claims/tolerances, breadcrumb trails, responsive B2B design, and ERP isolation).
- [x] **Prompt 08**: Electric Motors & Supply Chain Pages (Exact 10-section Electric Motors page, 9-section Supply Chain page, 5 approved `.webp` image assets integrated, educational & non-assertive copy guidelines, zero unverified claims, breadcrumb trails, responsive B2B design, and ERP isolation).
- [x] **Prompt 09**: Quality & Locations Pages (Exact 9-section Quality page, 8-section Locations page, 5 approved `.webp` image assets integrated, professional location data framework notice, 4 quality principles, non-assertive metrology copy, zero unverified claims/certifications/addresses, breadcrumbs, responsive B2B design, and ERP isolation).
- [x] **Prompt 10**: Careers, News & Contact Pages (7-section Careers page with 4 career principles & job openings empty state, News & Insights page with category filters & `/news/:slug` detail fallback UI, Contact page with full client-side form validation & mock submit states, 5 approved `.webp` image assets integrated, zero unverified claims/salaries/employees/contact info, breadcrumbs, responsive B2B design, and ERP isolation).
- [x] **Full Public Corporate Platform**: 13 fully built industrial B2B pages (Home, About, Contract Manufacturing, CNC Machining, Sub-Assembly, Electric Motors, Supply Chain, Quality & Testing, Locations, Careers, News & Article Details, Contact, and Request a Quote RFQ). All pages feature responsive layouts, breadcrumbs, SEO metadata, and strict industrial standards.
