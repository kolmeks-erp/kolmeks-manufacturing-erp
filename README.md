# Kolmeks - Industrial Contract Manufacturing Platform & ERP

A high-performance, enterprise-grade industrial manufacturing web platform and internal ERP portal for Kolmeks.

---

## 🚀 Overview

The platform consists of two distinct separated subsystems:
1. **Public Corporate Web Application**: Highlighting contract manufacturing capabilities, CNC machining, electric motor components, quality management, careers, news, and RFQ submission.
2. **Secure Internal ERP Portal**: Accessible strictly via `/secure-kolmeks-x0y0` for internal production operations, inventory management, CNC machine monitoring, CMM quality control, RFQ processing, and logistics.

---

## 🛠️ Technology Stack

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React, Axios, TanStack Query, React Hook Form, Recharts.
- **Backend**: Node.js, Express.js.
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth.
- **Deployment Strategy**: Frontend (Vercel), Backend (Render).

*Strict Architecture Rule: No MongoDB, No Mongoose, No Firebase.*

---

## 🗄️ Database Architecture & Migrations (Prompt 02)

The database schema is organized into 32 PostgreSQL relational tables with full normalized relationships, B-Tree indexes, UUID primary keys, timestamp triggers (`updated_at`), non-negative quantity/price constraints, and Row Level Security (RLS).

### Database Migration Files:
- [`server/supabase/migrations/01_initial_schema.sql`](file:///d:/CHARUSAT/Projects/Kolmeks_ERP/server/supabase/migrations/01_initial_schema.sql): Complete SQL DDL for all 32 tables, triggers, constraints, indexes, and RLS policies.
- [`server/supabase/seed.sql`](file:///d:/CHARUSAT/Projects/Kolmeks_ERP/server/supabase/seed.sql): Default application roles and clearly marked development demo seed data.

### How to Apply Migration Schema to Supabase:
1. Open your Supabase Project Dashboard -> **SQL Editor**.
2. Copy and execute [`server/supabase/migrations/01_initial_schema.sql`](file:///d:/CHARUSAT/Projects/Kolmeks_ERP/server/supabase/migrations/01_initial_schema.sql).
3. Copy and execute [`server/supabase/seed.sql`](file:///d:/CHARUSAT/Projects/Kolmeks_ERP/server/supabase/seed.sql) to seed default roles and development demo records.

---

## 📂 Project Structure

```
Kolmeks_ERP/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── assets/             # Brand icons, logo, graphics
│   │   ├── components/         # Reusable design system primitives (Button, Card, Input, etc.)
│   │   ├── constants/          # App constants & navigation configs
│   │   ├── layouts/            # PublicLayout & ERPLayout
│   │   ├── pages/              # Public & ERP page views
│   │   ├── routes/             # App Router mapping public & secure ERP routes
│   │   ├── services/           # Axios HTTP client setup
│   │   └── types/              # Global TypeScript interfaces
├── server/                     # Express.js Backend API
│   ├── src/
│   │   ├── config/             # Supabase & app configuration
│   │   ├── middleware/         # Centralized error handler & security middleware
│   │   ├── routes/             # Express API routes (/api/health)
│   │   ├── scripts/            # CLI test utilities (test-db-connection.js)
│   │   ├── services/           # Database service & data access layer (db.service.js)
│   │   └── server.js           # Express app listener
│   └── supabase/               # PostgreSQL Database Migrations & Seeds
│       ├── migrations/         # 01_initial_schema.sql
│       └── seed.sql            # Default roles & demo seed data
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
- Test DB Connection CLI: `node src/scripts/test-db-connection.js`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
- Open `http://localhost:5173` for the Public Website
- Open `http://localhost:5173/secure-kolmeks-x0y0` for the Secure ERP Portal

---

## 📌 Implementation Status
- [x] **Prompt 01**: React + Vite + TypeScript Frontend & Express Backend setup with public/ERP routing.
- [x] **Prompt 02**: Supabase PostgreSQL database schema, migrations, RLS policies, indexing, seed data, and Express database service layer.
