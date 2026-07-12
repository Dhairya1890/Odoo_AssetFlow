# 🚀 AssetFlow

AssetFlow is a comprehensive, enterprise-grade Asset Management System that streamlines the entire lifecycle of corporate assets—from onboarding and allocation to maintenance, audits, and retirement. Built with a modern tech stack (React + Node.js + PostgreSQL), AssetFlow offers powerful role-based access controls, automated background jobs, real-time notifications, and rich analytics.

---

## ✨ Key Features

### 🏢 Organization & User Management
- **Hierarchical Structure**: Organize your company into distinct departments and sub-departments.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions featuring four distinct roles:
  - **Admin**: Unrestricted access to all modules, settings, and users.
  - **Asset Manager**: Full control over assets, allocations, maintenance, and audits, with restricted access to organizational setup (e.g., cannot edit Employees or Departments).
  - **Department Head**: Can view and manage assets and allocations specific to their department.
  - **Employee**: Can view their own assigned assets, book new assets, and raise maintenance requests.
- **Employee Directory**: Seamlessly manage staff, assign roles, and handle account statuses.

### 💻 Asset Lifecycle & Registry
- **Asset Onboarding**: Create and categorize assets, generate unique Asset Tags, and assign them to departments.
- **Dynamic Status Tracking**: Assets automatically transition between statuses (`available`, `allocated`, `maintenance`, `lost`, `retired`) based on real-time activity.
- **Asset Categories**: Group assets logically (e.g., Laptops, Software, Furniture).

### 🔄 Allocations, Bookings & Transfers
- **Direct Allocations**: Asset Managers/Admins can instantly assign available assets to users with an Expected Return Date.
- **Employee Bookings**: Employees can request/book assets for a specific time period.
- **Transfer Pipelines**: Approved bookings seamlessly convert into active Allocations or Transfer Requests.
- **Return Management**: Returning an asset gracefully updates its condition and frees it up in the registry.

### 🛠️ Maintenance & Servicing
- **Issue Reporting**: Employees can quickly report faulty assets.
- **Workflow Pipeline**: Track maintenance requests from `pending` -> `approved` -> `in_progress` -> `completed`.
- **Automated Locking**: Assets under maintenance are locked out of the allocation pool to prevent double-booking.

### 📋 Audits & Compliance
- **Audit Cycles**: Schedule and run audits on specific departments or locations.
- **Auditor Assignments**: Assign dedicated staff to verify physical assets.
- **Automated Remediation**: Closing an audit automatically flags `missing` assets and transitions their status to `lost` system-wide.

### 🔔 Automation & Real-Time Intelligence
- **Cron Jobs**:
  - **Overdue Checker**: Runs daily at midnight to flag active allocations past their expected return date.
  - **Booking Reminders**: Checks every 15 minutes to notify users of approved bookings starting in 1 hour.
- **Real-Time Notifications**: WebSocket (Socket.io) integration for instant alerts (e.g., "Transfer Request Approved", "Asset Overdue").
- **Activity Logging**: Full audit trails of every critical action taken in the system.

### 📊 Dashboards & Reporting
- **Interactive Dashboards**: Role-tailored dashboards displaying relevant KPIs (Active Bookings, Overdue Returns, Maintenance counts).
- **Rich Analytics**: Visual data representations using Recharts (Pie charts, Bar charts, Area charts).
- **One-Click Exports**: Instantly export Utilization and Department Summary reports to Excel/CSV.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: Zustand (Global), React Query (Data Fetching)
- **Routing**: React Router DOM
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Real-time**: Socket.io-client
- **Date Handling**: Date-fns, Moment

### Backend (Server)
- **Environment**: Node.js & Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Validation**: Express-validator
- **Real-time**: Socket.io
- **Background Jobs**: Node-cron
- **File Uploads/Exports**: Multer, ExcelJS, json2csv
- **Security**: Helmet, CORS

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `assetflow_db`:
```sql
CREATE DATABASE assetflow_db;
```

### 2. Backend Setup
Navigate to the `server` directory, install dependencies, and configure your environment:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the following:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_postgres_username
DB_PASS=your_postgres_password
DB_NAME=assetflow_db
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```
Run Database Migrations and Start the Server:
```bash
npx sequelize-cli db:migrate
npm run dev
```

### 3. Frontend Setup
Navigate to the `client` directory, install dependencies, and start the Vite development server:
```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🔐 Default Admin Credentials
When you run the system, an initial super-admin is usually required. If not created via a seeder, register via the UI, or insert an admin user directly into the database.

---

## 🏗️ Project Structure Highlights
- `/client/src/components/` - Reusable UI elements, Layouts, and specific Module Modals.
- `/client/src/pages/` - Core views (Dashboard, OrgSetup, Assets, Allocations, Audits, etc).
- `/client/src/store/` - Zustand stores for state management (authStore).
- `/server/src/controllers/` - Core business logic for handling API requests.
- `/server/src/models/` - Sequelize database schemas and table relationships.
- `/server/src/jobs/` - Node-cron automated background tasks.
- `/server/src/routes/` - Express API routing definitions.

---

Made with ❤️ for efficient Enterprise Asset Management.