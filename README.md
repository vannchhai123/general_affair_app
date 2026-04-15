# General Affair Management System

A modern officer management system with permission-based access control, built with Next.js 16, TypeScript, and shadcn/ui.

## Features

- 👥 **Officer Management** - Create, update, and manage officer records
- 📊 **Attendance Tracking** - Monitor and approve attendance records
- 🎫 **Invitation Management** - Manage event invitations and responses
- 🎯 **Mission Management** - Track and approve officer missions
- 🏖️ **Leave Requests** - Handle leave applications and approvals
- ⏰ **Shift Management** - Configure and manage work shifts
- 🔐 **Permission System** - Hierarchical permission assignment with tree selection UI
- 📈 **Reports & Analytics** - Comprehensive reports and audit logs

## Tech Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **Icons**: Lucide React
- **State**: TanStack React Query v5 for data fetching
- **Validation**: Zod for runtime type validation
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toast

## Type-Safe API Layer

This project uses **React Query** with **Zod** for fully type-safe API fetching with runtime validation.

### Architecture

```
lib/
├── schemas/
│   └── api-schemas.ts      # Zod schemas for all API types
├── api/
│   └── fetcher.ts          # Type-safe fetcher with Zod validation
└── hooks/
    └── use-api.ts          # React Query hooks for all endpoints
```

### Key Features

- **Zod Schemas**: All API request/response types validated at runtime
- **TypeScript Types**: Automatically inferred from Zod schemas
- **React Query Hooks**: Pre-built hooks for CRUD operations on all entities
- **Automatic Invalidation**: Mutations automatically invalidate relevant queries
- **Toast Notifications**: Built-in success/error toast messages
- **Query Keys**: Structured query key factory for consistent caching

### Usage Examples

#### Fetching Data

```tsx
import { useOfficers, usePermissions } from '@/lib/hooks/use-api';

function MyComponent() {
  // Fetch officers with optional filters
  const { data: officers, isLoading } = useOfficers({
    department: 'Operations',
    status: 'active',
  });

  // Fetch permissions by category
  const { data: permissions } = usePermissions('Officers');

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {officers?.map((officer) => (
        <li key={officer.id}>
          {officer.first_name} {officer.last_name}
        </li>
      ))}
    </ul>
  );
}
```

#### Mutating Data

```tsx
import { useCreateOfficer, useDeletePermission } from '@/lib/hooks/use-api';

function MyForm() {
  const createOfficer = useCreateOfficer();
  const deletePermission = useDeletePermission();

  const handleCreate = async (data) => {
    await createOfficer.mutateAsync(data);
    // Toast notification shown automatically
  };

  const handleDelete = async (id) => {
    await deletePermission.mutateAsync(id);
  };

  return (
    <button
      onClick={() => handleCreate({ first_name: 'John', last_name: 'Doe' })}
      disabled={createOfficer.isPending}
    >
      Create Officer
    </button>
  );
}
```

#### Role Permissions

```tsx
import { useRolePermissions } from '@/lib/hooks/use-api';

function RolePermissionsView({ roleId }) {
  const { data, isLoading } = useRolePermissions(roleId, {
    page: 0,
    size: 10,
  });

  return (
    <div>
      <p>Total: {data?.totalElements} permissions</p>
      <p>
        Page: {data?.page} of {data?.totalPages}
      </p>
      {data?.content.map((perm) => (
        <div key={perm.id}>{perm.permission_name}</div>
      ))}
    </div>
  );
}
```

### Available Hooks

| Hook                                | Description                          | Returns                              |
| ----------------------------------- | ------------------------------------ | ------------------------------------ |
| `useOfficers(filters?)`             | Fetch officers with optional filters | `{ data, isLoading, refetch }`       |
| `useOfficer(id)`                    | Fetch single officer by ID           | `{ data, isLoading }`                |
| `useCreateOfficer()`                | Create new officer                   | `{ mutate, mutateAsync, isPending }` |
| `useUpdateOfficer()`                | Update officer                       | `{ mutate, mutateAsync, isPending }` |
| `useDeleteOfficer()`                | Delete officer                       | `{ mutate, mutateAsync, isPending }` |
| `usePermissions(category?)`         | Fetch permissions                    | `{ data, isLoading }`                |
| `useCreatePermission()`             | Create permission                    | `{ mutate, mutateAsync }`            |
| `useUpdatePermission()`             | Update permission                    | `{ mutate, mutateAsync }`            |
| `useDeletePermission()`             | Delete permission                    | `{ mutate, mutateAsync }`            |
| `useRolePermissions(role, params?)` | Fetch role permissions (paginated)   | `{ data, isLoading }`                |
| `useOfficerPermissions(filters?)`   | Fetch officer-permission assignments | `{ data, isLoading }`                |
| `useAssignPermission()`             | Assign permission to officer         | `{ mutate, mutateAsync }`            |
| `useRevokePermission()`             | Revoke permission from officer       | `{ mutate, mutateAsync }`            |
| `useAttendance()`                   | Fetch attendance records             | `{ data, isLoading }`                |
| `useInvitations()`                  | Fetch invitations                    | `{ data, isLoading }`                |
| `useMissions()`                     | Fetch missions                       | `{ data, isLoading }`                |
| `useLeaveRequests()`                | Fetch leave requests                 | `{ data, isLoading }`                |
| `useShifts()`                       | Fetch shifts                         | `{ data, isLoading }`                |
| `useDashboard()`                    | Fetch dashboard stats                | `{ data, isLoading }`                |
| `useReports()`                      | Fetch reports data                   | `{ data, isLoading }`                |

### Query Key Factory

Access query keys for manual cache management:

```tsx
import { queryKeys } from '@/lib/api/fetcher';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate all officer queries
queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });

// Invalidate specific officer
queryClient.invalidateQueries({ queryKey: queryKeys.officers.detail(1) });

// Invalidate role permissions
queryClient.invalidateQueries({
  queryKey: queryKeys.rolePermissions.byRole('admin'),
});
```

## Getting Started

### Installation

```bash
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### 🔐 Authentication

| Method | Endpoint           | Description                                          |
| ------ | ------------------ | ---------------------------------------------------- |
| POST   | `/api/auth/login`  | Login with username/password, creates session cookie |
| POST   | `/api/auth/logout` | Destroy current session                              |

**Login Request Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

### 👥 Officers

| Method | Endpoint            | Description                            |
| ------ | ------------------- | -------------------------------------- |
| GET    | `/api/officers`     | Get all officers with optional filters |
| POST   | `/api/officers`     | Create new officer                     |
| PUT    | `/api/officers/:id` | Update officer                         |
| DELETE | `/api/officers/:id` | Delete officer                         |

**Query Parameters (GET):**

- `search` - Filter by name or email
- `department` - Filter by department
- `status` - Filter by status (active, on_leave, inactive)

**Request Body (POST/PUT):**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@gov.org",
  "position": "Senior Officer",
  "department": "Operations",
  "phone": "555-0123",
  "status": "active"
}
```

---

### 📊 Attendance

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| GET    | `/api/attendance`     | Get all attendance records (paginated) |
| POST   | `/api/attendance`     | Create attendance record          |
| PUT    | `/api/attendance/:id` | Update attendance (e.g., approve) |

**Query Parameters (GET):**

- `page` - Page number (default: 0)
- `size` - Items per page (default: 10)

**Response (GET):**

```json
{
  "content": [
    {
      "id": 1,
      "officerId": 1,
      "firstName": "John",
      "lastName": "Doe",
      "department": "Human Resources",
      "officerCode": "OFF-001",
      "date": "2026-04-14",
      "checkIn": "2026-04-14T08:00:00",
      "checkOut": "2026-04-14T17:00:00",
      "totalWorkMin": 480,
      "totalLateMin": 0,
      "status": "Present",
      "sessions": [
        {
          "id": 1,
          "shiftName": "Morning Shift",
          "checkIn": "08:00",
          "checkOut": "12:00",
          "status": "Present"
        },
        {
          "id": 2,
          "shiftName": "Afternoon Shift",
          "checkIn": "13:00",
          "checkOut": "17:00",
          "status": "Present"
        }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "last": true
}
```

---

### 🎫 Invitations

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | `/api/invitations`     | Get all invitations   |
| POST   | `/api/invitations`     | Create new invitation |
| PUT    | `/api/invitations/:id` | Update invitation     |
| DELETE | `/api/invitations/:id` | Delete invitation     |

**Request Body (POST):**

```json
{
  "title": "Annual Security Conference 2026",
  "organizer": "National Security Agency",
  "date": "2026-03-15",
  "location": "Convention Center Hall A",
  "status": "active"
}
```

---

### 🎯 Missions

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/missions`     | Get all missions               |
| POST   | `/api/missions`     | Create new mission             |
| PUT    | `/api/missions/:id` | Update mission (e.g., approve) |
| DELETE | `/api/missions/:id` | Delete mission                 |

**Request Body (POST):**

```json
{
  "officer_id": 1,
  "start_date": "2026-04-10",
  "end_date": "2026-04-15",
  "purpose": "Border patrol assessment",
  "location": "Southern District"
}
```

---

### 🏖️ Leave Requests

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/api/leave-requests`     | Get all leave requests               |
| POST   | `/api/leave-requests`     | Create leave request                 |
| PUT    | `/api/leave-requests/:id` | Update leave request (e.g., approve) |

**Request Body (POST):**

```json
{
  "officer_id": 1,
  "start_date": "2026-04-15",
  "end_date": "2026-04-20",
  "leave_type": "Annual",
  "total_days": 5,
  "reason": "Family vacation"
}
```

---

### ⏰ Shifts

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | `/api/shifts`     | Get all shifts   |
| POST   | `/api/shifts`     | Create new shift |
| PUT    | `/api/shifts/:id` | Update shift     |
| DELETE | `/api/shifts/:id` | Delete shift     |

**Request Body (POST):**

```json
{
  "name": "Morning Shift",
  "start_time": "06:00:00",
  "end_time": "14:00:00",
  "is_active": true
}
```

---

### 🔐 Permissions

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | `/api/permissions`     | Get all permissions   |
| POST   | `/api/permissions`     | Create new permission |
| PUT    | `/api/permissions/:id` | Update permission     |
| DELETE | `/api/permissions/:id` | Delete permission     |

**Query Parameters (GET):**

- `category` - Filter by permission category

**Response (GET):**

```json
[
  {
    "id": 1,
    "permission_name": "officer.view",
    "description": "View officer records and information",
    "category": "Officers"
  },
  {
    "id": 2,
    "permission_name": "officer.create",
    "description": "Create new officer records",
    "category": "Officers"
  }
]
```

**Request Body (POST):**

```json
{
  "permission_name": "officer.create",
  "description": "Create new officer records",
  "category": "Officers"
}
```

**Response (POST - 201 Created):**

```json
{
  "id": 11,
  "permission_name": "officer.create",
  "description": "Create new officer records",
  "category": "Officers"
}
```

**Request Body (PUT):**

```json
{
  "permission_name": "officer.edit",
  "description": "Edit officer records",
  "category": "Officers"
}
```

**Response (PUT):**

```json
{
  "id": 3,
  "permission_name": "officer.edit",
  "description": "Edit officer records",
  "category": "Officers"
}
```

**Response (DELETE):**

```json
{
  "success": true
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "error": "Permission name is required"
}

// 404 Not Found
{
  "error": "Permission not found"
}

// 409 Conflict (duplicate)
{
  "error": "Permission already exists"
}
```

---

### 🔑 Role Permissions

| Method | Endpoint                       | Description                                             |
| ------ | ------------------------------ | ------------------------------------------------------- |
| GET    | `/api/roles/:role/permissions` | Get permissions assigned to a specific role (paginated) |

**Path Parameters:**

- `role` - Role ID or identifier (e.g., `1`, `admin`)

**Query Parameters (GET):**

- `page` - Page number (default: 0)
- `size` - Items per page (default: 10)

**Response (GET):**

```json
{
  "content": [
    {
      "id": 1,
      "permission_name": "officer.view",
      "description": "View officer records",
      "category": "Officers"
    },
    {
      "id": 2,
      "permission_name": "officer.create",
      "description": "Create new officer records",
      "category": "Officers"
    },
    {
      "id": 3,
      "permission_name": "officer.edit",
      "description": "Edit officer records",
      "category": "Officers"
    },
    {
      "id": 4,
      "permission_name": "officer.delete",
      "description": "Delete officer records",
      "category": "Officers"
    },
    {
      "id": 5,
      "permission_name": "MANAGE_ROLES",
      "description": "Manage system roles and permissions",
      "category": "System"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 5,
  "totalPages": 1,
  "last": true
}
```

---

### 🔑 Officer Permissions (Assignments)

| Method | Endpoint                       | Description                            |
| ------ | ------------------------------ | -------------------------------------- |
| GET    | `/api/officer-permissions`     | Get all officer-permission assignments |
| POST   | `/api/officer-permissions`     | Assign permission to officer           |
| DELETE | `/api/officer-permissions/:id` | Revoke permission from officer         |

**Query Parameters (GET):**

- `officer_id` - Filter by officer
- `permission_id` - Filter by permission

**Request Body (POST):**

```json
{
  "officer_id": 1,
  "permission_id": 2
}
```

**Response (GET):**

```json
[
  {
    "id": 1,
    "officer_id": 1,
    "permission_id": 2,
    "granted_at": "2026-01-15T08:00:00",
    "officer_name": "James Wilson",
    "officer_department": "Operations",
    "permission_name": "officer.create",
    "permission_category": "Officers"
  }
]
```

---

### 📈 Dashboard

| Method | Endpoint         | Description                         |
| ------ | ---------------- | ----------------------------------- |
| GET    | `/api/dashboard` | Get aggregated dashboard statistics |

**Response:**

```json
{
  "officers": {
    "total": 8,
    "active": 6,
    "on_leave": 1,
    "inactive": 1
  },
  "attendance": {
    "total": 8,
    "approved": 5,
    "pending": 2,
    "absent": 1
  },
  "invitations": {
    "total": 3,
    "active": 2,
    "completed": 1
  },
  "missions": {
    "total": 3,
    "approved": 1,
    "pending": 2
  },
  "leave_requests": {
    "total": 3,
    "approved": 1,
    "pending": 2
  },
  "recent_attendance": []
}
```

---

### 📊 Reports

| Method | Endpoint       | Description                   |
| ------ | -------------- | ----------------------------- |
| GET    | `/api/reports` | Get comprehensive report data |

**Response includes:**

- Attendance summary by department
- Officers by department and status
- Invitation response rates
- Leave summary by type
- Mission summary by status
- Full audit log

---

## Permission System

The permission system uses a hierarchical tree structure with categories:

### Permission Categories

- **Officers** - officer.view, officer.create, officer.edit, officer.delete
- **Attendance** - attendance.view, attendance.approve
- **Missions** - mission.view, mission.approve
- **Leave Management** - leave.view, leave.approve
- **Invitations** - invitation management permissions
- **Shifts** - shift management permissions
- **Reports** - report viewing permissions
- **System** - system administration permissions

### Permission Assignment

- Navigate to **Dashboard > Permissions**
- Use the **"Assign to Officers"** tab
- Click **"Assign Permissions"** for any officer
- Use the tree selection UI to grant/revoke permissions
- Changes are batched and applied on "Assign" button click

---

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── officers/       # Officer CRUD
│   │   ├── attendance/     # Attendance management
│   │   ├── invitations/    # Invitation management
│   │   ├── missions/       # Mission management
│   │   ├── leave-requests/ # Leave request management
│   │   ├── shifts/         # Shift management
│   │   ├── permissions/    # Permission management
│   │   ├── officer-permissions/ # Permission assignments
│   │   ├── dashboard/      # Dashboard stats
│   │   └── reports/        # Reports and analytics
│   └── dashboard/          # Dashboard pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── permission-dialog.tsx
│   ├── permission-assignment-dialog.tsx
│   └── app-sidebar.tsx
├── lib/
│   ├── mock-data.ts        # Mock data store
│   ├── utils.ts            # Utility functions
│   └── client.ts           # API client
└── hooks/                  # Custom hooks
```

## Database Design

### Schema Overview

```
┌─────────────┐       ┌──────────────────┐       ┌───────────────────┐
│  officers   │       │   attendance     │       │attendance_sessions│
├─────────────┤       ├──────────────────┤       ├───────────────────┤
│ id (PK)     │──┐    │ id (PK)          │  ┌───│ id (PK)           │
│ employee_code│ │    │ officer_id (FK)  │──┘   │ shift_id (FK)     │
│ first_name  │ │    │ date             │       │ session_date      │
│ last_name   │ │    │ check_in         │       │ label             │
│ email       │ │    │ check_out        │       │ created_by (FK)   │
│ department  │ │    │ total_work_min   │       └───────────────────┘
│ position    │ │    │ total_late_min   │
│ status      │ │    │ status           │       ┌───────────────────┐
└─────────────┘ │    │ approved_by (FK) │       │     shifts        │
                │    │ notes            │       ├───────────────────┤
                │    └──────────────────┘       │ id (PK)           │
                │                               │ name              │
                │    ┌──────────────────┐       │ start_time        │
                └───│qr_session_checkins│       │ end_time          │
                    ├──────────────────┤       │ is_active         │
                    │ id (PK)          │       └───────────────────┘
                    │ qr_session_id(FK)│
                    │ officer_id (FK)  │       ┌───────────────────┐
                    │ action           │       │   qr_sessions     │
                    │ status           │       ├───────────────────┤
                    │ scanned_at       │──┐    │ id (PK)           │
                    │ device_info      │  │    │ token             │
                    └──────────────────┘  └───│ status            │
                                              │ location          │
                    ┌──────────────────┐      │ valid_until       │
                    │qr_session_logs   │      │ qr_refresh_interval│
                    ├──────────────────┤      │ created_by (FK)   │
                    │ id (PK)          │      │ started_at        │
                    │ qr_session_id(FK)│      │ stopped_at        │
                    │ action           │      └───────────────────┘
                    │ performed_by(FK) │
                    │ details          │
                    └──────────────────┘
```

### Table: `officers`

```sql
CREATE TABLE officers (
    id              SERIAL PRIMARY KEY,
    user_id         INT NULL,
    employee_code   VARCHAR(50) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    position        VARCHAR(100),
    department      VARCHAR(100),
    phone           VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data:**
```json
{
  "id": 1,
  "user_id": 101,
  "employee_code": "EMP-001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@gov.org",
  "position": "Senior Officer",
  "department": "Operations",
  "phone": "555-0123",
  "status": "active",
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-01-15T08:00:00Z"
}
```

---

### Table: `shifts`

```sql
CREATE TABLE shifts (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data:**
```json
{
  "id": 1,
  "name": "Morning Shift",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### Table: `attendance`

```sql
CREATE TABLE attendance (
    id                  SERIAL PRIMARY KEY,
    officer_id          INT NOT NULL REFERENCES officers(id),
    date                DATE NOT NULL,
    check_in            TIME NULL,
    check_out           TIME NULL,
    total_work_minutes  INT DEFAULT 0,
    total_late_minutes  INT DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'PENDING',
    notes               TEXT NULL,
    approved_by         INT NULL REFERENCES officers(id),
    approved_at         TIMESTAMP NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(officer_id, date)
);

CREATE INDEX idx_attendance_officer_date ON attendance(officer_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
```

**Sample Data:**
```json
{
  "id": 1,
  "officer_id": 1,
  "date": "2026-04-14",
  "check_in": "08:00:00",
  "check_out": "17:00:00",
  "total_work_minutes": 480,
  "total_late_minutes": 0,
  "status": "APPROVED",
  "notes": null,
  "approved_by": 5,
  "approved_at": "2026-04-14T18:00:00Z",
  "created_at": "2026-04-14T08:00:00Z",
  "updated_at": "2026-04-14T18:00:00Z"
}
```

---

### Table: `attendance_sessions`

```sql
CREATE TABLE attendance_sessions (
    id              SERIAL PRIMARY KEY,
    shift_id        INT NULL REFERENCES shifts(id),
    session_date    DATE NOT NULL,
    label           VARCHAR(100),
    created_by      INT NOT NULL REFERENCES officers(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_date ON attendance_sessions(session_date);
```

**Sample Data:**
```json
{
  "id": 1,
  "shift_id": 1,
  "session_date": "2026-04-14",
  "label": "Morning Shift - Apr 14",
  "created_by": 5,
  "created_at": "2026-04-14T07:00:00Z",
  "updated_at": "2026-04-14T07:00:00Z"
}
```

---

### Table: `qr_sessions`

```sql
CREATE TABLE qr_sessions (
    id                  VARCHAR(50) PRIMARY KEY,
    token               VARCHAR(255) UNIQUE NOT NULL,
    status              VARCHAR(20) DEFAULT 'idle',
    location            VARCHAR(255),
    valid_until         TIMESTAMP NULL,
    qr_refresh_interval INT DEFAULT 60,
    created_by          INT NOT NULL REFERENCES officers(id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at          TIMESTAMP NULL,
    stopped_at          TIMESTAMP NULL
);

CREATE INDEX idx_qr_status ON qr_sessions(status);
CREATE INDEX idx_qr_created_by ON qr_sessions(created_by);
```

**Sample Data:**
```json
{
  "id": "sess_abc123xyz",
  "token": "attendance://sess_abc123xyz",
  "status": "active",
  "location": "Main Office - Building A",
  "valid_until": "2026-04-14T12:00:00Z",
  "qr_refresh_interval": 60,
  "created_by": 1,
  "created_at": "2026-04-14T08:00:00Z",
  "updated_at": "2026-04-14T08:00:00Z",
  "started_at": "2026-04-14T08:00:05Z",
  "stopped_at": null
}
```

---

### Table: `qr_session_checkins`

```sql
CREATE TABLE qr_session_checkins (
    id                  SERIAL PRIMARY KEY,
    qr_session_id       VARCHAR(50) NOT NULL REFERENCES qr_sessions(id) ON DELETE CASCADE,
    officer_id          INT NOT NULL REFERENCES officers(id),
    action              VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL,
    scanned_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info         JSONB NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(qr_session_id, officer_id, action)
);

CREATE INDEX idx_checkins_session ON qr_session_checkins(qr_session_id);
CREATE INDEX idx_checkins_officer ON qr_session_checkins(officer_id);
CREATE INDEX idx_checkins_scanned_at ON qr_session_checkins(scanned_at);
```

**Sample Data:**
```json
[
  {
    "id": 1,
    "qr_session_id": "sess_abc123xyz",
    "officer_id": 1,
    "action": "check-in",
    "status": "checked-in",
    "scanned_at": "2026-04-14T08:05:23Z",
    "device_info": {
      "ip": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"
    },
    "created_at": "2026-04-14T08:05:23Z"
  },
  {
    "id": 2,
    "qr_session_id": "sess_abc123xyz",
    "officer_id": 2,
    "action": "check-in",
    "status": "late",
    "scanned_at": "2026-04-14T08:45:12Z",
    "device_info": {
      "ip": "192.168.1.105",
      "user_agent": "Mozilla/5.0 (Android 14)"
    },
    "created_at": "2026-04-14T08:45:12Z"
  },
  {
    "id": 3,
    "qr_session_id": "sess_abc123xyz",
    "officer_id": 3,
    "action": "check-out",
    "status": "checked-out",
    "scanned_at": "2026-04-14T17:00:45Z",
    "device_info": null,
    "created_at": "2026-04-14T17:00:45Z"
  }
]
```

---

### Table: `qr_session_logs`

```sql
CREATE TABLE qr_session_logs (
    id              SERIAL PRIMARY KEY,
    qr_session_id   VARCHAR(50) NOT NULL REFERENCES qr_sessions(id) ON DELETE CASCADE,
    action          VARCHAR(50) NOT NULL,
    performed_by    INT NULL REFERENCES officers(id),
    details         JSONB NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qr_logs_session ON qr_session_logs(qr_session_id);
```

**Sample Data:**
```json
[
  {
    "id": 1,
    "qr_session_id": "sess_abc123xyz",
    "action": "started",
    "performed_by": 1,
    "details": null,
    "created_at": "2026-04-14T08:00:05Z"
  },
  {
    "id": 2,
    "qr_session_id": "sess_abc123xyz",
    "action": "regenerated",
    "performed_by": 1,
    "details": {
      "reason": "auto_refresh",
      "previous_token": "attendance://sess_old123"
    },
    "created_at": "2026-04-14T08:01:05Z"
  },
  {
    "id": 3,
    "qr_session_id": "sess_abc123xyz",
    "action": "paused",
    "performed_by": 1,
    "details": null,
    "created_at": "2026-04-14T09:30:00Z"
  }
]
```

---

## API Endpoints

### 📊 Attendance Endpoints

#### **GET** `/api/attendance`
Get all attendance records (paginated)

**Query Parameters:**

- `page` - Page number (default: 0)
- `size` - Items per page (default: 10)

**Sample Response:**
```json
{
  "content": [
    {
      "id": 1,
      "officerId": 1,
      "firstName": "John",
      "lastName": "Doe",
      "department": "Human Resources",
      "officerCode": "OFF-001",
      "date": "2026-04-14",
      "checkIn": "2026-04-14T08:00:00",
      "checkOut": "2026-04-14T17:00:00",
      "totalWorkMin": 480,
      "totalLateMin": 0,
      "status": "Present",
      "sessions": [
        {
          "id": 1,
          "shiftName": "Morning Shift",
          "checkIn": "08:00",
          "checkOut": "12:00",
          "status": "Present"
        },
        {
          "id": 2,
          "shiftName": "Afternoon Shift",
          "checkIn": "13:00",
          "checkOut": "17:00",
          "status": "Present"
        }
      ]
    },
    {
      "id": 2,
      "officerId": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "department": "IT Department",
      "officerCode": "OFF-002",
      "date": "2026-04-14",
      "checkIn": "2026-04-14T08:45:00",
      "checkOut": "2026-04-14T17:15:00",
      "totalWorkMin": 450,
      "totalLateMin": 45,
      "status": "Late",
      "sessions": [
        {
          "id": 3,
          "shiftName": "Morning Shift",
          "checkIn": "08:45",
          "checkOut": "12:00",
          "status": "Late"
        },
        {
          "id": 4,
          "shiftName": "Afternoon Shift",
          "checkIn": "13:00",
          "checkOut": "17:15",
          "status": "Present"
        }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "last": true
}
```

---

#### **POST** `/api/attendance`
Create a new attendance record

**Request Body:**
```json
{
  "officerId": 1,
  "date": "2026-04-14",
  "checkIn": "08:00",
  "checkOut": "17:00",
  "status": "Present"
}
```

**Sample Response (201 Created):**
```json
{
  "id": 26,
  "officerId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "department": "Operations",
  "officerCode": "OFF-001",
  "date": "2026-04-14",
  "checkIn": "08:00",
  "checkOut": "17:00",
  "totalWorkMin": 480,
  "totalLateMin": 0,
  "status": "Present",
  "sessions": []
}
```

---

#### **PUT** `/api/attendance/:id`
Update attendance record (e.g., approve, reject)

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Sample Response:**
```json
{
  "id": 1,
  "officerId": 1,
  "date": "2026-04-14",
  "totalWorkMin": 480,
  "totalLateMin": 0,
  "status": "APPROVED",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Operations"
}
```

---

### 📱 QR Attendance Endpoints

#### **POST** `/api/v1/qr-sessions`
Create a new QR attendance session

**Request Body:**
```json
{
  "created_by": 1,
  "duration_seconds": 60,
  "location": "Main Office"
}
```

**Sample Response (201 Created):**
```json
{
  "id": "sess_abc123",
  "qr_token": "attendance://sess_abc123",
  "status": "active",
  "created_at": "2026-04-14T08:00:00Z",
  "expires_at": "2026-04-14T08:01:00Z",
  "qr_code_url": "/api/qr/sess_abc123.png"
}
```

---

#### **GET** `/api/qr-sessions/:id`
Get QR session details

**Sample Response:**
```json
{
  "id": "sess_abc123",
  "status": "active",
  "created_by": 1,
  "created_at": "2026-04-14T08:00:00Z",
  "expires_at": "2026-04-14T08:01:00Z",
  "qr_token": "attendance://sess_abc123",
  "scan_count": 15,
  "location": "Main Office"
}
```

---

#### **PUT** `/api/qr-sessions/:id`
Update QR session status (pause, stop, regenerate)

**Request Body:**
```json
{
  "action": "pause"
}
```

**Allowed Actions:** `pause` | `resume` | `stop` | `regenerate`

**Sample Response:**
```json
{
  "id": "sess_abc123",
  "status": "paused",
  "updated_at": "2026-04-14T08:30:00Z"
}
```

---

#### **GET** `/api/qr-sessions/:id/checkins`
Get all check-ins for a QR session

**Sample Response:**
```json
[
  {
    "id": 1,
    "employee_name": "John Doe",
    "employee_code": "EMP-001",
    "department": "Operations",
    "status": "checked-in",
    "scanned_at": "2026-04-14T08:05:23Z"
  },
  {
    "id": 2,
    "employee_name": "Jane Smith",
    "employee_code": "EMP-002",
    "department": "HR",
    "status": "late",
    "scanned_at": "2026-04-14T08:45:12Z"
  },
  {
    "id": 3,
    "employee_name": "Mike Johnson",
    "employee_code": "EMP-003",
    "department": "IT",
    "status": "checked-out",
    "scanned_at": "2026-04-14T17:00:45Z"
  }
]
```

---

#### **POST** `/api/qr-sessions/:id/checkins`
Record a new check-in/check-out via QR scan

**Request Body:**
```json
{
  "employee_id": 1,
  "action": "check-in",
  "timestamp": "2026-04-14T08:05:23Z"
}
```

**Sample Response (201 Created):**
```json
{
  "id": 4,
  "employee_name": "David Brown",
  "employee_code": "EMP-005",
  "department": "Finance",
  "status": "checked-in",
  "scanned_at": "2026-04-14T08:05:23Z",
  "message": "Check-in successful"
}
```

---

#### **GET** `/api/qr-sessions/:id/stats`
Get statistics for a QR session

**Sample Response:**
```json
{
  "session_id": "sess_abc123",
  "total_scans": 25,
  "checked_in": 18,
  "checked_out": 5,
  "late": 2,
  "status": "active",
  "started_at": "2026-04-14T08:00:00Z",
  "last_scan_at": "2026-04-14T08:45:12Z"
}
```

---

#### **DELETE** `/api/qr-sessions/:id`
Delete/end a QR session

**Sample Response:**
```json
{
  "message": "Session ended successfully",
  "id": "sess_abc123",
  "final_stats": {
    "total_scans": 25,
    "checked_in": 18,
    "checked_out": 5,
    "late": 2
  }
}
```

---

### Endpoint Summary Table

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Attendance | GET | `/api/attendance` | Get all attendance records (paginated) |
| Attendance | POST | `/api/attendance` | Create attendance record |
| Attendance | PUT | `/api/attendance/:id` | Update attendance record |
| QR Attendance | POST | `/api/v1/qr-sessions` | Create QR session |
| QR Attendance | GET | `/api/v1/qr-sessions/:id` | Get QR session details |
| QR Attendance | PUT | `/api/v1/qr-sessions/:id` | Update session (pause/stop/regenerate) |
| QR Attendance | GET | `/api/v1/qr-sessions/:id/checkins` | Get session check-ins |
| QR Attendance | POST | `/api/v1/qr-sessions/:id/checkins` | Record check-in/out |
| QR Attendance | GET | `/api/v1/qr-sessions/:id/stats` | Get session statistics |
| QR Attendance | DELETE | `/api/v1/qr-sessions/:id` | Delete/end session |

---

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager1`, password: `manager123`

## License

This is a project built for demonstration purposes.
