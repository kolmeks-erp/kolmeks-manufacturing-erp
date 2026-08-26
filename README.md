# Kolmeks - Industrial Contract Manufacturing Platform & ERP

A high-performance, enterprise-grade industrial manufacturing web platform and internal ERP portal for Kolmeks.

---

## 🚀 Overview

The platform consists of two distinct separated subsystems:
1. **Public Corporate Web Application**: Highlighting contract manufacturing capabilities, CNC machining, electric motor components, quality management, careers, news, and RFQ submission.
2. **Secure Internal ERP Portal**: Accessible strictly via `/secure-kolmeks-x0y0` for internal production operations, inventory management, CNC machine monitoring, CMM quality control, RFQ processing, and logistics.

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

### Key Security Principles:
- **No Password Storage**: Passwords are handled strictly by Supabase Auth (`auth.users`). Passwords are never logged or stored in application tables.
- **Backend Token Verification**: Express middleware (`auth.middleware.js`) verifies Supabase Bearer JWT tokens on every protected request. Client input roles are never trusted directly.
- **Profile Status Check**: Users must have `status = 'active'` in `public.profiles` to access the ERP. Inactive or suspended accounts are denied entry.
- **Role-Aware Navigation**: UI menu items and sub-routes filter based on centralized role configurations (`navigation.ts` & `rbac.middleware.js`).

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

## 👤 How to Create the First Administrator Account

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Navigate to **Authentication** ➔ **Users**.
3. Click **Add User** ➔ **Create user**.
4. Enter the user details:
   - **Email**: `admin@kolmeks.fi` (or your staff email)
   - **Password**: `<secure-password>`
   - Check **Auto Confirm User**.
5. Copy the generated User **UUID**.
6. Open **SQL Editor** in Supabase and execute the following query to grant the `admin` role:
   ```sql
   UPDATE public.profiles
   SET role_id = (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1),
       status = 'active'
   WHERE id = 'YOUR_USER_UUID_HERE';
   ```
7. Log into `/secure-kolmeks-x0y0/login` with your credentials.

---

## 🗄️ Database Architecture & Migrations (Prompt 02)

The database schema is organized into 32 PostgreSQL relational tables with full normalized relationships, B-Tree indexes, UUID primary keys, timestamp triggers (`updated_at`), non-negative quantity/price constraints, and Row Level Security (RLS).

### Database Migration Files:
- [`server/supabase/migrations/01_initial_schema.sql`](file:///d:/CHARUSAT/Projects/Kolmeks_ERP/server/supabase/migrations/01_initial_schema.sql): DDL for all 32 tables, triggers, constraints, indexes, and RLS policies.
- [`server/supabase/seed.sql`](file:///d:/CHARUSAT/Projects/Kolmeks_ERP/server/supabase/seed.sql): Default application roles and development demo seed data.

---

## 📂 Project Structure

```
Kolmeks_ERP/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute guard
│   │   │   └── ui/             # Reusable UI primitives
│   │   ├── constants/          # App constants & role navigation matrix
│   │   ├── context/            # AuthContext & AuthProvider
│   │   ├── layouts/            # PublicLayout & ERPLayout (with role-aware header/sidebar)
│   │   ├── pages/
│   │   │   ├── erp/            # ERPLoginPage, ERPDashboardPage, UnauthorizedPage
│   │   │   └── public/         # Public corporate website pages
│   │   ├── routes/             # AppRoutes (Public vs Protected ERP mapping)
│   │   ├── services/           # Supabase client, auth.service, profile.service, Axios API
│   │   └── types/              # UserRole, UserProfile, Navigation interfaces
├── server/                     # Express.js Backend API
│   ├── src/
│   │   ├── config/             # Supabase client & admin client configuration
│   │   ├── middleware/         # auth.middleware, rbac.middleware, errorHandler
│   │   ├── routes/             # health.routes, auth.routes, erp.routes
│   │   ├── scripts/            # CLI test-db-connection.js
│   │   ├── services/           # db.service.js
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
- Secure ERP Login: `http://localhost:5173/secure-kolmeks-x0y0/login`
- Secure ERP Dashboard: `http://localhost:5173/secure-kolmeks-x0y0/dashboard`

---

## 📌 Implementation Status
- [x] **Prompt 01**: React + Vite + TypeScript Frontend & Express Backend setup with public/ERP routing.
- [x] **Prompt 02**: Supabase PostgreSQL database schema, migrations, RLS policies, indexing, seed data, and Express database service layer.
- [x] **Prompt 03**: Authentication & ERP Security Foundation (Supabase Auth, profiles/roles RBAC, protected routes, Express Bearer token middleware, and industrial login UI).
