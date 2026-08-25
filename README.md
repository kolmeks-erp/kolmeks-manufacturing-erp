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
│   │   ├── routes/             # Express API routes
│   │   └── server.js           # Express app listener
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
- Health Check: `GET http://localhost:5000/api/health`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
- Open `http://localhost:5173` for the Public Website
- Open `http://localhost:5173/secure-kolmeks-x0y0` for the Secure ERP Portal

---

## 📌 Implementation Status (Prompt 01)
- [x] React + Vite + TypeScript Frontend architecture set up with industrial theme
- [x] Express Backend initialized with `/api/health` check endpoint
- [x] Public Layout (Header, Dropdowns, Responsive Mobile Drawer, Footer)
- [x] Secure ERP Layout (`/secure-kolmeks-x0y0` with sidebar & header bar)
- [x] Supabase integration architecture prepared
- [x] Industrial design primitives built
#
