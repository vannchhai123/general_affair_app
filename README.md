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
| GET    | `/api/attendance`     | Get all attendance records        |
| POST   | `/api/attendance`     | Create attendance record          |
| PUT    | `/api/attendance/:id` | Update attendance (e.g., approve) |

**Query Parameters (GET):**

- No required parameters, returns all records sorted by date (newest first)

**Request Body (POST):**

```json
{
  "officer_id": 1,
  "date": "2026-04-07",
  "total_work_minutes": 480,
  "total_late_minutes": 0,
  "status": "PENDING"
}
```

**Request Body (PUT):**

```json
{
  "status": "APPROVED"
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

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager1`, password: `manager123`

## License

This is a project built for demonstration purposes.
