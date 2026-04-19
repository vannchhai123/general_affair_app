# Permission Hooks Usage Guide

## Available Hooks

### 1. `usePermissionsByRole(role, params?)`

Fetch permissions assigned to a specific role with pagination.

```tsx
import { usePermissionsByRole } from '@/hooks/permissions/use-role-permissions';

function RolePermissions({ role }: { role: string }) {
  const { data, isLoading, isError } = usePermissionsByRole(role, { page: 0, size: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading permissions</div>;

  return (
    <div>
      <h2>Permissions for {role}</h2>
      <p>Total: {data?.totalElements}</p>
      <ul>
        {data?.content.map((permission) => (
          <li key={permission.id}>
            {permission.permission_name} - {permission.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. `useCreatePermission()`

Create a new permission.

```tsx
import { useCreatePermission } from '@/hooks/permissions/use-permission-mutations';

function CreatePermissionForm() {
  const mutation = useCreatePermission();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutation.mutate({
      permissionName: formData.get('permissionName') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="permissionName" placeholder="Permission Name" required />
      <input name="description" placeholder="Description" required />
      <input name="category" placeholder="Category" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Permission'}
      </button>
    </form>
  );
}
```

### 3. `useUpdatePermission()`

Update an existing permission.

```tsx
import { useUpdatePermission } from '@/hooks/permissions/use-permission-mutations';

function EditPermission({ permissionId }: { permissionId: number }) {
  const mutation = useUpdatePermission();

  const handleUpdate = () => {
    mutation.mutate({
      id: permissionId,
      data: {
        permissionName: 'USER_WRITE',
        description: 'Allows the user to modify profile details.',
        category: 'USER_MANAGEMENT',
      },
    });
  };

  return (
    <button onClick={handleUpdate} disabled={mutation.isPending}>
      {mutation.isPending ? 'Updating...' : 'Update Permission'}
    </button>
  );
}
```

### 4. `useDeletePermission()`

Delete a permission.

```tsx
import { useDeletePermission } from '@/hooks/permissions/use-permission-mutations';

function DeletePermissionButton({ permissionId }: { permissionId: number }) {
  const mutation = useDeletePermission();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this permission?')) {
      mutation.mutate(permissionId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={mutation.isPending}>
      {mutation.isPending ? 'Deleting...' : 'Delete Permission'}
    </button>
  );
}
```

### 5. `useAssignPermissionToRole()`

Assign a permission to a role.

```tsx
import { useAssignPermissionToRole } from '@/hooks/permissions/use-role-permissions';

function AssignPermissionForm({ role }: { role: string }) {
  const mutation = useAssignPermissionToRole();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutation.mutate({
      role,
      data: {
        permissionName: formData.get('permissionName') as string,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="permissionName" placeholder="Permission Name" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Assigning...' : 'Assign Permission'}
      </button>
    </form>
  );
}
```

## Complete Example: Permission Management Component

```tsx
'use client';

import { useState } from 'react';
import {
  usePermissionsByRole,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useAssignPermissionToRole,
} from '@/hooks/permissions/use-permission-mutations';
import { usePermissionsByRole } from '@/hooks/permissions/use-role-permissions';

export default function PermissionManager() {
  const [selectedRole, setSelectedRole] = useState('ROLE_ADMIN');
  const [page, setPage] = useState(0);

  // Fetch permissions by role
  const { data, isLoading, isError } = usePermissionsByRole(selectedRole, {
    page,
    size: 10,
  });

  // Mutations
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();
  const assignPermission = useAssignPermissionToRole();

  if (isLoading) return <div>Loading permissions...</div>;
  if (isError) return <div>Error loading permissions</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Permission Manager</h1>

      {/* Role Selector */}
      <div className="mb-4">
        <label className="mr-2">Role:</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border p-2"
        >
          <option value="ROLE_ADMIN">ROLE_ADMIN</option>
          <option value="ROLE_USER">ROLE_USER</option>
        </select>
      </div>

      {/* Permissions List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Permissions for {selectedRole}</h2>
        <p className="mb-2">
          Total: {data?.totalElements} | Page: {data?.page} of {data?.totalPages}
        </p>
        <ul className="space-y-2">
          {data?.content.map((permission) => (
            <li key={permission.id} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{permission.permission_name}</h3>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                  <p className="text-xs text-gray-500">Category: {permission.category}</p>
                </div>
                <button
                  onClick={() => deletePermission.mutate(permission.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data?.last}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Permission Form */}
      <div className="mb-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Create Permission</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createPermission.mutate({
              permissionName: formData.get('permissionName') as string,
              description: formData.get('description') as string,
              category: formData.get('category') as string,
            });
            e.currentTarget.reset();
          }}
          className="space-y-2"
        >
          <input
            name="permissionName"
            placeholder="Permission Name"
            className="border p-2 w-full"
            required
          />
          <input
            name="description"
            placeholder="Description"
            className="border p-2 w-full"
            required
          />
          <input name="category" placeholder="Category" className="border p-2 w-full" required />
          <button
            type="submit"
            disabled={createPermission.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createPermission.isPending ? 'Creating...' : 'Create Permission'}
          </button>
        </form>
      </div>

      {/* Assign Permission to Role */}
      <div className="mb-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Assign Permission to Role</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            assignPermission.mutate({
              role: selectedRole,
              data: {
                permissionName: formData.get('permissionName') as string,
              },
            });
            e.currentTarget.reset();
          }}
          className="space-y-2"
        >
          <input
            name="permissionName"
            placeholder="Permission Name"
            className="border p-2 w-full"
            required
          />
          <button
            type="submit"
            disabled={assignPermission.isPending}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {assignPermission.isPending ? 'Assigning...' : 'Assign to Role'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

## API Response Types

### PermissionsByRole Response

```typescript
{
  content: Array<{
    id: number;
    permission_name: string;
    description?: string | null;
    category?: string | null;
  }>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

## Key Features

✅ **Zod Validation**: All API responses are validated against Zod schemas
✅ **Type Safety**: Full TypeScript types inferred from Zod schemas
✅ **Auto Invalidation**: Cache automatically invalidates after mutations
✅ **Toast Notifications**: Success/error messages via sonner
✅ **Pagination Support**: Built-in pagination for role permissions
✅ **Error Handling**: Centralized error handling with toast notifications
