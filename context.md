# AssetFlow — Backend Implementation Brief

## Project Overview

You are building the backend for **AssetFlow**, an Enterprise Asset & Resource Management System. This is a hackathon project. The backend is a **Node.js + Express** REST API with **MySQL** via **Sequelize ORM**, **Socket.io** for real-time notifications, and **node-cron** for scheduled jobs.

The repo is already scaffolded. Your job is to implement everything inside `server/`.

---

## Directory Structure (already exists)

```
server/
├── src/
│   ├── config/db.js                  ← Sequelize connection (done)
│   ├── models/                       ← Define all models here
│   ├── routes/                       ← Route stubs exist, wire them up
│   ├── controllers/                  ← Controller stubs exist, implement them
│   ├── middleware/
│   │   ├── auth.middleware.js        ← JWT verify (done)
│   │   ├── role.middleware.js        ← requireRole() guard (done)
│   │   └── upload.middleware.js      ← multer (done)
│   ├── services/
│   │   ├── assetTag.service.js       ← AF-0001 generator (done)
│   │   ├── allocation.service.js     ← conflict check (done)
│   │   ├── booking.service.js        ← overlap validation (done)
│   │   └── notification.service.js   ← persist + socket emit (done)
│   ├── jobs/
│   │   └── overdueChecker.job.js     ← node-cron daily job (done)
│   ├── utils/
│   │   └── response.js               ← ok(), created(), error() helpers (done)
│   └── app.js                        ← Express + Socket.io bootstrap (done)
├── migrations/
├── seeders/
└── .env
```

---

## Environment Variables (already in `.env`)

```
PORT=5000
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET, JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m, JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
```

---

## Roles (hardcoded enum, never self-assigned)

```
admin | asset_manager | department_head | employee
```

- Signup always creates `employee`
- Only `admin` can promote users to other roles via the Employee Directory
- Seed one default admin user on first run

---

## Step 1 — Sequelize Models

Create all models in `src/models/`. Use `sequelize.define()` or class syntax. Add associations in each model file and call them all in an `index.js` that exports `{ sequelize, ...models }`.

---

### `User`
```
id            INT PK AI
name          STRING NOT NULL
email         STRING UNIQUE NOT NULL
passwordHash  STRING NOT NULL
role          ENUM('admin','asset_manager','department_head','employee') DEFAULT 'employee'
departmentId  FK → Department (nullable)
status        ENUM('active','inactive') DEFAULT 'active'
timestamps
```

### `Department`
```
id            INT PK AI
name          STRING UNIQUE NOT NULL
parentId      FK → Department (self-ref, nullable) — for hierarchy
headId        FK → User (nullable) — Department Head
status        ENUM('active','inactive') DEFAULT 'active'
timestamps
```

### `AssetCategory`
```
id              INT PK AI
name            STRING UNIQUE NOT NULL
customFields    JSON (nullable) — e.g. { "warrantyPeriod": "months" }
timestamps
```

### `Asset`
```
id                INT PK AI
assetTag          STRING UNIQUE NOT NULL        — AF-0001 auto-generated
name              STRING NOT NULL
categoryId        FK → AssetCategory NOT NULL
serialNumber      STRING (nullable)
acquisitionDate   DATE (nullable)
acquisitionCost   DECIMAL(12,2) (nullable)      — for reports only
condition         ENUM('new','good','fair','poor') DEFAULT 'good'
location          STRING (nullable)
status            ENUM('available','allocated','reserved','under_maintenance','lost','retired','disposed') DEFAULT 'available'
isBookable        BOOLEAN DEFAULT false          — shared/bookable flag
photoUrl          STRING (nullable)
documentUrl       STRING (nullable)
departmentId      FK → Department (nullable)     — owning department
timestamps
```

### `Allocation`
```
id                  INT PK AI
assetId             FK → Asset NOT NULL
userId              FK → User NOT NULL           — allocated to
allocatedById       FK → User NOT NULL           — who allocated it
departmentId        FK → Department (nullable)
expectedReturnDate  DATE (nullable)
actualReturnDate    DATE (nullable)
status              ENUM('active','returned','overdue','transfer_requested') DEFAULT 'active'
conditionOnReturn   STRING (nullable)
notes               TEXT (nullable)
timestamps
```

### `TransferRequest`
```
id              INT PK AI
assetId         FK → Asset NOT NULL
fromUserId      FK → User NOT NULL
toUserId        FK → User NOT NULL
requestedById   FK → User NOT NULL
status          ENUM('pending','approved','rejected') DEFAULT 'pending'
approvedById    FK → User (nullable)
notes           TEXT (nullable)
timestamps
```

### `Booking`
```
id            INT PK AI
assetId       FK → Asset NOT NULL              — must have isBookable=true
userId        FK → User NOT NULL               — booked by
startTime     DATE NOT NULL
endTime       DATE NOT NULL
status        ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming'
notes         TEXT (nullable)
timestamps
```

### `MaintenanceRequest`
```
id              INT PK AI
assetId         FK → Asset NOT NULL
raisedById      FK → User NOT NULL
priority        ENUM('low','medium','high','critical') DEFAULT 'medium'
issueDescription TEXT NOT NULL
photoUrl        STRING (nullable)
status          ENUM('pending','approved','rejected','assigned','in_progress','resolved') DEFAULT 'pending'
approvedById    FK → User (nullable)
technicianId    FK → User (nullable)
resolutionNotes TEXT (nullable)
timestamps
```

### `AuditCycle`
```
id            INT PK AI
name          STRING NOT NULL
scope         ENUM('department','location') NOT NULL
scopeValue    STRING NOT NULL               — department id or location string
startDate     DATE NOT NULL
endDate       DATE NOT NULL
status        ENUM('active','closed') DEFAULT 'active'
createdById   FK → User NOT NULL
timestamps
```

### `AuditItem`
```
id              INT PK AI
auditCycleId    FK → AuditCycle NOT NULL
assetId         FK → Asset NOT NULL
auditorId       FK → User NOT NULL
status          ENUM('pending','verified','missing','damaged') DEFAULT 'pending'
notes           TEXT (nullable)
timestamps
```

### `AuditCycleAuditor` (junction)
```
auditCycleId    FK → AuditCycle
userId          FK → User
```

### `Notification`
```
id          INT PK AI
userId      FK → User NOT NULL
type        ENUM('asset_assigned','maintenance_approved','maintenance_rejected',
                 'booking_confirmed','booking_cancelled','booking_reminder',
                 'transfer_approved','transfer_rejected','overdue_return',
                 'audit_discrepancy') NOT NULL
message     TEXT NOT NULL
metadata    JSON (nullable)
isRead      BOOLEAN DEFAULT false
timestamps
```

### `ActivityLog`
```
id          INT PK AI
userId      FK → User NOT NULL
action      STRING NOT NULL              — e.g. 'ASSET_ALLOCATED'
entityType  STRING NOT NULL              — e.g. 'Asset'
entityId    INT NOT NULL
metadata    JSON (nullable)
timestamps (createdAt only)
```

---

## Step 2 — Migrations

Generate a Sequelize migration for each model in dependency order:

```
1. departments
2. users
3. asset_categories
4. assets
5. allocations
6. transfer_requests
7. bookings
8. maintenance_requests
9. audit_cycles
10. audit_cycle_auditors
11. audit_items
12. notifications
13. activity_logs
```

---

## Step 3 — Seeders

Create one seeder `01-seed-admin.js`:

```js
// Creates default admin user
email: admin@assetflow.com
password: Admin@123  (bcrypt hashed)
role: admin
name: System Admin
```

---

## Step 4 — Auth Routes (`/api/auth`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/signup` | public | Create employee account. Hash password with bcrypt. |
| POST | `/login` | public | Return `accessToken` + `refreshToken` + user object (without passwordHash). |
| POST | `/refresh` | public | Verify refreshToken, return new accessToken. |
| POST | `/logout` | authenticated | Invalidate session (client-side is fine for hackathon). |
| POST | `/forgot-password` | public | Stub — return success message. |

JWT payload: `{ id, email, role, name }`

---

## Step 5 — User Routes (`/api/users`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | admin | List all users with department. |
| GET | `/:id` | admin, self | Get user profile. |
| PATCH | `/:id/role` | admin only | Promote role. Body: `{ role }`. Validate it's not 'admin' (can't create second admin). |
| PATCH | `/:id/status` | admin only | Activate/deactivate. Body: `{ status }`. |
| PATCH | `/:id` | self | Update own name, departmentId. |

---

## Step 6 — Department Routes (`/api/departments`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | authenticated | List all with head user info. |
| POST | `/` | admin | Create. Body: `{ name, parentId?, headId?, status }` |
| PATCH | `/:id` | admin | Edit. |
| PATCH | `/:id/status` | admin | Activate/deactivate. |

---

## Step 7 — Asset Category Routes (`/api/categories`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | authenticated | List all. |
| POST | `/` | admin, asset_manager | Create. Body: `{ name, customFields? }` |
| PATCH | `/:id` | admin, asset_manager | Edit. |

---

## Step 8 — Asset Routes (`/api/assets`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | authenticated | List with filters: `?status=&categoryId=&departmentId=&search=` (searches tag, serial, name). |
| GET | `/:id` | authenticated | Get single asset with allocation history + maintenance history. |
| POST | `/` | asset_manager | Register. Auto-generate assetTag via `assetTag.service.js`. Handle photo upload via multer. |
| PATCH | `/:id` | asset_manager | Edit asset details. |
| PATCH | `/:id/status` | asset_manager | Manually update status (e.g. mark Lost, Retired, Disposed). |
| GET | `/:id/qr` | authenticated | Return QR code as PNG buffer using `qrcode` package. |

---

## Step 9 — Allocation Routes (`/api/allocations`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | asset_manager, admin | List all allocations. Filter: `?status=&userId=&assetId=` |
| GET | `/my` | employee | Get own active allocations. |
| POST | `/` | asset_manager | Allocate asset. **Run conflict check first.** If asset is already allocated, return 409 with `{ heldBy: { id, name } }`. On success: set Asset status → `allocated`, create Allocation record, fire notification to user. |
| POST | `/:id/return` | asset_manager | Mark returned. Body: `{ conditionOnReturn, notes }`. Set Asset status → `available`. |
| GET | `/overdue` | asset_manager, admin | List overdue allocations. |

### Transfer Sub-routes

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/transfer` | employee, department_head | Raise transfer request. Body: `{ assetId, toUserId, notes }`. |
| GET | `/transfers` | asset_manager, department_head | List pending transfers. |
| PATCH | `/transfers/:id/approve` | asset_manager, department_head | Approve: re-allocate to new user, update history, notify both users. |
| PATCH | `/transfers/:id/reject` | asset_manager, department_head | Reject: notify requester. |

---

## Step 10 — Booking Routes (`/api/bookings`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | authenticated | List bookings. Filter: `?assetId=&userId=&status=` |
| GET | `/my` | employee | Own bookings. |
| POST | `/` | authenticated | Create booking. **Run overlap check first.** Asset must have `isBookable=true`. Return 409 if overlap. |
| PATCH | `/:id/cancel` | self, asset_manager | Cancel booking. Set status → `cancelled`. |
| PATCH | `/:id/reschedule` | self | Update startTime/endTime. Re-run overlap check. |

---

## Step 11 — Maintenance Routes (`/api/maintenance`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | asset_manager, admin | List all requests. Filter: `?status=&priority=&assetId=` |
| GET | `/my` | employee | Own requests. |
| POST | `/` | employee, department_head | Raise request. Body: `{ assetId, issueDescription, priority }`. Photo upload optional. |
| PATCH | `/:id/approve` | asset_manager | Approve. Set Asset status → `under_maintenance`. Notify raiser. |
| PATCH | `/:id/reject` | asset_manager | Reject. Body: `{ resolutionNotes }`. Notify raiser. |
| PATCH | `/:id/assign` | asset_manager | Assign technician. Body: `{ technicianId }`. Set status → `assigned`. |
| PATCH | `/:id/progress` | asset_manager | Set status → `in_progress`. |
| PATCH | `/:id/resolve` | asset_manager | Resolve. Body: `{ resolutionNotes }`. Set Asset status → `available`. Notify raiser. |

---

## Step 12 — Audit Routes (`/api/audits`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | admin, asset_manager | List all audit cycles. |
| POST | `/` | admin | Create audit cycle. Body: `{ name, scope, scopeValue, startDate, endDate, auditorIds[] }`. Auto-generate AuditItems for all assets in scope. |
| GET | `/:id` | admin, asset_manager, auditor | Get cycle with all items. |
| PATCH | `/:id/items/:itemId` | auditor | Mark item: `{ status: 'verified'|'missing'|'damaged', notes }`. |
| GET | `/:id/report` | admin, asset_manager | Return discrepancy report: all non-verified items grouped by status. |
| PATCH | `/:id/close` | admin | Close cycle. Lock it. Auto-update asset statuses: `missing` items → Asset status `lost`. |

---

## Step 13 — Reports Routes (`/api/reports`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/utilization` | admin, asset_manager, department_head | Asset utilization: count allocated vs available vs maintenance by category. |
| GET | `/maintenance-frequency` | admin, asset_manager | Count of maintenance requests per asset/category. |
| GET | `/department-summary` | admin, asset_manager | Assets per department, breakdown by status. |
| GET | `/booking-heatmap` | admin, asset_manager, department_head | Booking counts grouped by hour-of-day and day-of-week. |
| GET | `/overdue-assets` | admin, asset_manager | Assets overdue for return or nearing retirement. |
| GET | `/export` | admin, asset_manager | Query param `?type=utilization\|department-summary`. Returns `.xlsx` via `exceljs`. |

---

## Step 14 — Notification Routes (`/api/notifications`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | authenticated | Get own notifications, newest first. |
| PATCH | `/:id/read` | authenticated | Mark single as read. |
| PATCH | `/read-all` | authenticated | Mark all as read. |

---

## Step 15 — Activity Log

Every significant action must write to `ActivityLog`. Do this inside controllers after the main operation succeeds. Use a helper:

```js
const log = (userId, action, entityType, entityId, metadata) =>
  ActivityLog.create({ userId, action, entityType, entityId, metadata });
```

Key actions to log:

```
ASSET_REGISTERED, ASSET_ALLOCATED, ASSET_RETURNED, ASSET_STATUS_CHANGED,
TRANSFER_REQUESTED, TRANSFER_APPROVED, TRANSFER_REJECTED,
BOOKING_CREATED, BOOKING_CANCELLED,
MAINTENANCE_RAISED, MAINTENANCE_APPROVED, MAINTENANCE_REJECTED, MAINTENANCE_RESOLVED,
AUDIT_CREATED, AUDIT_CLOSED,
USER_ROLE_CHANGED
```

---

## Business Rules — Critical, Do Not Miss

1. **Double allocation blocked**: Before any allocation, call `checkAllocationConflict(assetId)`. If active allocation exists, return `409` with the current holder's info.

2. **Booking overlap blocked**: Before any booking, call `checkBookingOverlap(assetId, startTime, endTime)`. If conflict exists, return `409`. Adjacent bookings are allowed (end == start of next is fine).

3. **Role assignment**: Only `admin` can change roles. Signup always produces `employee`. No endpoint allows self-promotion.

4. **Maintenance approval gates asset status**: Asset only flips to `under_maintenance` on approval, not on request creation.

5. **Audit close is irreversible**: On close, set `AuditCycle.status = 'closed'`. Any PATCH to a closed cycle's items must return `403`.

6. **Asset tag auto-generation**: Always use `assetTag.service.js`. Format: `AF-0001`. Never allow manual tag entry.

7. **Overdue cron**: Already defined in `jobs/overdueChecker.job.js`. Import and start it in `app.js` after DB connects. It runs daily at midnight and flips active allocations past their `expectedReturnDate` to `overdue`.

8. **Socket notifications**: Every time `notificationService.notify()` is called, it both persists to DB and emits to `user_{id}` socket room. The client joins this room on login.

---

## Response Shape (always use `utils/response.js`)

```js
// Success
{ success: true, message: "...", data: { ... } }

// Error
{ success: false, message: "...", errors: null | [...] }
```

---

## Implementation Order (parallelism-friendly)

Do these in order, each unblocks the next:

```
1. src/models/index.js — all models + associations
2. migrations/ — in dependency order
3. seeders/01-seed-admin.js
4. Run: npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all
5. auth controller + routes        ← everything else needs auth working
6. users controller + routes
7. departments + categories        (simple CRUD, fast)
8. assets controller + routes      (with file upload)
9. allocations + transfers
10. bookings
11. maintenance
12. audits
13. reports                        (read-only aggregation queries)
14. notifications                  (mostly reads)
15. Wire overdueChecker job in app.js
```

---

> Implement it fully. Do not leave controller stubs empty. Every route must be functional and return the correct response shape.