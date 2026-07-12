# AssetFlow

> **Enterprise Asset Management System** — A full-stack web application for managing organizational assets, allocations, bookings, maintenance, and audit cycles across department hierarchies.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Server Setup](#server-setup)
  - [Client Setup](#client-setup)
  - [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Seeded Demo Accounts](#seeded-demo-accounts)

---

## Overview

AssetFlow is a production-ready ERP module for asset lifecycle management. It provides structured workflows for registering assets, allocating them to users or departments, managing bookings for shared resources, tracking maintenance requests, and running structured audit cycles — all under a role-based access control system.

---

## Features

### 🗂️ Asset Management
- Register assets with tag auto-generation, photos, documents, and QR codes
- Full lifecycle tracking: available → allocated → under maintenance → retired/disposed/lost
- Per-asset history modal showing all allocation and maintenance records
- Live search and filtering by status, category, and keyword

### 📦 Allocation & Transfers
- Allocate assets to users with expected return dates
- Transfer request workflow: raise → approve/reject → allocate
- Overdue detection with automated status escalation
- Department-scoped views for Department Heads

### 📅 Bookings
- Book shared/bookable resources on a weekly calendar grid
- Booking quota tracking per user
- Reschedule and cancel support

### 🔧 Maintenance Pipeline
- Raise maintenance requests with photo evidence
- Priority levels: Low / Medium / High / Critical
- Status pipeline: Pending → Approved → In Progress → Resolved
- Filter by priority, status, and keyword

### 🔍 Audit Management
- Create structured audit cycles scoped to department or location
- Assign multiple auditors per cycle
- Auditors mark each asset: Verified / Missing / Damaged with inline notes
- Auto-generated discrepancy report with summary cards and flagged item tables
- Close Cycle action: locks the cycle and marks confirmed-missing assets as `Lost`
- Exportable audit reports as CSV
- Full audit history retained per cycle

### 📊 Reports & Dashboard
- KPI dashboard: Available, Allocated, Maintenance, Bookings, Transfers, Overdue counts
- Recent activity feed with timeline
- Excel/CSV export for asset and allocation reports

### 🔔 Notifications
- In-app notification system for asset assignments, transfers, and booking events
- Real-time updates via Socket.IO

### ⚙️ Org Setup (Admin)
- Manage users, departments, asset categories
- Update user roles and reset passwords
- Department hierarchy support (parent/child)

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL |
| ORM | Sequelize 6 |
| Auth | JWT (access + refresh token) |
| File uploads | Multer |
| QR Codes | `qrcode` |
| Real-time | Socket.IO |
| Scheduled Jobs | node-cron |
| Reports | ExcelJS, json2csv |
| Security | Helmet, bcryptjs |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| State | Zustand |
| Data Fetching | Axios + TanStack Query |
| Styling | Tailwind CSS v4 (Vanilla CSS design tokens) |
| UI Icons | Lucide React |
| Charts | Recharts |
| Calendar | react-big-calendar |
| Forms | React Hook Form + Zod |
| Toasts | react-hot-toast |

---

## Project Structure

```
AssetFlow/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── api/               # Axios client
│       ├── components/        # Shared components (layout, assets, modals)
│       ├── pages/             # Page components
│       │   ├── Auth/          # Login / Signup
│       │   ├── Dashboard/
│       │   ├── Assets/        # Asset list + per-asset history
│       │   ├── Allocations/   # Allocations + transfer requests
│       │   ├── Bookings/      # Calendar booking view
│       │   ├── Maintenance/   # Maintenance pipeline
│       │   ├── Audits/        # Audit cycles (list, detail, checklist, report)
│       │   ├── Reports/
│       │   ├── Settings/
│       │   └── OrgSetup/      # Admin: users, departments, categories
│       └── store/             # Zustand stores (auth, notifications)
│
└── server/                    # Express backend
    ├── src/
    │   ├── config/            # Sequelize DB config
    │   ├── controllers/       # Business logic
    │   ├── middleware/        # Auth, role guard, upload
    │   ├── models/            # Sequelize models
    │   ├── routes/            # Express routers
    │   ├── services/          # Notification, allocation, activity logger
    │   ├── jobs/              # Cron jobs (overdue detection)
    │   └── utils/             # Response helpers
    ├── migrations/            # Sequelize migrations
    └── seeders/               # Seed data
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ (running locally or via Docker)
- **npm** v9+

---

### Database Setup

```bash
# Create the database and user (run in psql)
CREATE USER assetflow WITH PASSWORD 'AssetFlow@123';
CREATE DATABASE assetflow OWNER assetflow;
GRANT ALL PRIVILEGES ON DATABASE assetflow TO assetflow;
```

---

### Server Setup

```bash
cd server

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your DB credentials and JWT secrets

# Run database migrations
npm run db:migrate

# Seed demo data (users, departments, assets)
npm run db:seed
```

---

### Client Setup

```bash
cd client

# Install dependencies
npm install
```

---

### Running the App

Open two terminals:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

**Reset database (wipe + re-migrate + re-seed):**
```bash
cd server
npm run db:reset
```

---

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=assetflow
DB_USER=assetflow
DB_PASSWORD=AssetFlow@123

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client (for CORS and reset links)
CLIENT_URL=http://localhost:5173

# File uploads
UPLOAD_DIR=uploads

# Email (optional — for forgot password)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=you@gmail.com
# SMTP_PASS=your_app_password
```

---

## API Reference

All endpoints are prefixed with `/api`.

| Resource | Base Path | Notes |
|---|---|---|
| Auth | `/api/auth` | login, signup, refresh, logout, forgot-password |
| Users | `/api/users` | CRUD, role/status/password management |
| Departments | `/api/departments` | CRUD with hierarchy |
| Categories | `/api/categories` | Asset categories |
| Assets | `/api/assets` | CRUD, QR code, status update |
| Allocations | `/api/allocations` | Allocate, return, overdue, transfers |
| Bookings | `/api/bookings` | Create, cancel, reschedule |
| Maintenance | `/api/maintenance` | Raise, update, status pipeline |
| Audits | `/api/audits` | Cycles, items, report, close |
| Reports | `/api/reports` | Asset & allocation export (Excel/CSV) |
| Dashboard | `/api/dashboard` | KPI aggregates |
| Notifications | `/api/notifications` | List, mark read |
| Activity Log | `/api/activities` | System-wide audit trail |

---

## Role-Based Access Control

| Permission | Admin | Asset Manager | Dept Head | Employee |
|---|:---:|:---:|:---:|:---:|
| Register / Edit / Delete assets | ✅ | ✅ | ❌ | ❌ |
| View all assets | ✅ | ✅ | Dept only | ✅ |
| View per-asset history | ✅ | ✅ | ✅ | ❌ |
| Create / manage allocations | ✅ | ✅ | ❌ | ❌ |
| View allocations | ✅ | ✅ | Dept only | Own only |
| Approve / reject transfers | ✅ | ✅ | Dept only | ❌ |
| Execute transfer (allocate) | ✅ | ✅ | ❌ | ❌ |
| Book shared resources | ✅ | ✅ | ✅ | ✅ |
| Raise maintenance request | ✅ | ✅ | ✅ | ✅ |
| Manage maintenance pipeline | ✅ | ✅ | ❌ | ❌ |
| Create / close audit cycles | ✅ | ❌ | ❌ | ❌ |
| Mark audit items | ✅ | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ | ❌ |
| Org setup (users, depts) | ✅ | ❌ | ❌ | ❌ |

---

## Seeded Demo Accounts

After running `npm run db:seed`, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@assetflow.com` | `AssetFlow@123` |
| Asset Manager | `manager@assetflow.com` | `AssetFlow@123` |
| Department Head | `head@assetflow.com` | `AssetFlow@123` |
| Employee | `employee@assetflow.com` | `AssetFlow@123` |

> New users created by admins are assigned the default password `AssetFlow@123` and should change it on first login.