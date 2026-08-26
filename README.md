# Kolmeks - Industrial Contract Manufacturing Platform & ERP

A high-performance, enterprise-grade industrial manufacturing web platform and internal ERP portal for Kolmeks.

---

## 🚀 Overview

The platform consists of two distinct separated subsystems:
1. **Public Corporate Web Application**: Highlighting contract manufacturing capabilities, CNC machining, electric motor components, quality management, careers, news, and RFQ submission.
2. **Secure Internal ERP Portal**: Accessible strictly via `/secure-kolmeks-x0y0` for internal production operations, inventory management, CNC machine monitoring, CMM quality control, RFQ processing, and logistics.

---

## 🎨 Public Website Design System & Foundation (Prompt 04)

The public corporate web application features a high-precision industrial aesthetic communicating engineering rigor, manufacturing capability, and quality consistency.

### Key Visual & Architectural Tokens:
- **Palette**: Deep Industrial Blue (`#0B1E36`, `#0F2C59`), Professional Blue accents (`#1D4ED8`), Light Neutral (`#F8FAFC`), Charcoal (`#0F172A`), and Emerald Green (`#10B981`) quality indicators.
- **Typography Hierarchy**: Modern sans-serif system with defined utilities (`h1`, `h2`, `h3`, `h4`, `body`, `caption`, `mono`).
- **Responsive Layout**: Reusable `Container` component preventing unwanted line stretching across wide viewports.
- **Top Engineering Banner**: ISO certified operations highlight & link to internal ERP portal.
- **Navbar Dropdown**: Keyboard-accessible capabilities menu (`Contract Manufacturing`, `CNC Machining`, `Assembly`, `Electric Motors`, `Supply Chain`) and prominent `Request a Quote` CTA.
- **Mobile Menu Drawer**: Expandable capabilities section with smooth slide drawer.

### Reusable Public UI Components (`client/src/components/public/`):
- `HeroSection`: Reusable hero with eyebrow, main heading, description, CTAs, and industrial SVG graphic panel.
- `CapabilityCard`: Industrial competency card with hover effects and action link.
- `ProcessSection`: 6-step manufacturing execution workflow (Engineering ➔ Material Sourcing ➔ CNC Machining ➔ Quality Inspection ➔ Assembly ➔ Logistics Delivery).
- `QualitySection`: Quality assurance focus section ("Precision You Can Measure") detailing CMM inspection and raw material traceability.
- `GlobalPresenceSection`: International presence foundation with location cards (using verified placeholders).
- `IndustriesSection`: Target industrial sectors highlight (OEM Machinery, Transportation, Electrical, Automation, Energy).
- `WhyKolmeksSection`: Engineering value propositions section.
- `StatCard`: Metrics card for verified operational statistics.
- `CTASection`: Banner driving visitors to `/request-quote` and `/contact`.
- `PageHeader`: Inner page header with eyebrow badge, title, description, and breadcrumbs.
- `Breadcrumbs`: Accessible navigation path for inner pages.
- `SEO`: Document title and meta tag manager.

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
│   │   │   ├── public/         # HeroSection, CapabilityCard, ProcessSection, QualitySection, PageHeader, SEO
│   │   │   └── ui/             # Container, Button, Card, Badge, Input, Select, Textarea
│   │   ├── constants/          # Navigation matrix & public nav config
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
