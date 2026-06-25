# GET /api/v1/organizations/office - API Inspection & Setup

## ✅ Response Format Verification

Your backend endpoint now returns:

```json
{
  "content": [
    {
      "id": 1,
      "uuid": "uuid-123",
      "name": "Planning & Finance",
      "code": "FIN",
      "manager": "Sok Vann",
      "adminId": 12,
      "adminName": "Vann Chhai",
      "adminUsername": "v.chhai",
      "officer_count": 24,
      "status": "ACTIVE",
      "description": "Finance and planning office"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

## 📋 Frontend Setup Complete

### 1. **Schema Definition**

- File: `lib/schemas/organization/organization.schema.ts`
- Added `officeApiSchema` - Validates raw API response
- Added `officeSchema` - Transforms to frontend format
- Added `officesListResponseSchema` - Handles paginated response
- Exported types: `Office`, `OfficeApi`, `OfficesListResponse`

### 2. **API Integration**

- File: `lib/api/organization.api.ts`
- Added `getOffices(params)` - Fetches list of offices with filters
- Added `getOffice(id)` - Fetches single office by ID

### 3. **Query Management**

- File: `lib/api/query-keys.ts`
- Added `queryKeys.organization.offices` - Query key hierarchy
  - `.all` - All offices cache
  - `.list(filters)` - Paginated lists with filters
  - `.detail(id)` - Individual office detail

### 4. **React Hook**

- File: `hooks/organization/use-offices.ts`
- **`useOffices(filters?)`** - Hook to fetch offices list
  - Returns: `{ offices, pagination, total, isLoading, isError, mutate, ... }`
  - Supports filters: `search`, `status`, `page`, `size`
- **`useOffice(id, enabled?)`** - Hook to fetch single office
  - Returns: `{ data, isLoading, isError, ... }`

## 🔌 Usage Example

```tsx
'use client';

import { useOffices } from '@/hooks/organization/use-offices';

export function OfficesGrid() {
  const { offices, isLoading, pagination, mutate } = useOffices({
    page: 0,
    size: 10,
    status: 'active',
  });

  if (isLoading) return <div>Loading offices...</div>;

  return (
    <div>
      {offices.map((office) => (
        <div key={office.id}>
          <h3>
            {office.name} ({office.code})
          </h3>
          <p>Manager: {office.manager}</p>
          <p>
            Admin: {office.adminName} ({office.adminUsername})
          </p>
          <p>Officers: {office.officerCount}</p>
        </div>
      ))}
      <p>Total: {pagination.totalElements}</p>
    </div>
  );
}
```

## 🎯 Field Mapping

| Frontend        | Backend         | Type                   | Notes                    |
| --------------- | --------------- | ---------------------- | ------------------------ |
| `id`            | `id`            | number                 | Office ID                |
| `uuid`          | `uuid`          | string                 | Unique identifier        |
| `name`          | `name`          | string                 | Office name              |
| `code`          | `code`          | string                 | Office code (FIN, etc)   |
| `manager`       | `manager`       | string                 | Manager name             |
| `adminId`       | `adminId`       | number                 | Admin officer ID         |
| `adminName`     | `adminName`     | string                 | Admin full name          |
| `adminUsername` | `adminUsername` | string                 | Admin username           |
| `officerCount`  | `officer_count` | number                 | Total officers in office |
| `status`        | `status`        | 'active' \| 'inactive' | Office status            |
| `description`   | `description`   | string                 | Office description       |

## ✨ Features

- ✅ Full pagination support (page, size, totalElements, totalPages)
- ✅ Admin assignment tracking (adminId, adminName, adminUsername)
- ✅ Filtering by search term and status
- ✅ Type-safe with Zod schemas
- ✅ Automatic query caching with TanStack Query
- ✅ Single and list fetch modes
