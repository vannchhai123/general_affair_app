import { z } from 'zod';
import { paginationSchema } from '../common';

export const permissionSchema = z.object({
  id: z.number(),
  permission_name: z.string(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const permissionsResponseSchema = z.object({
  content: z.array(permissionSchema),
  ...paginationSchema.shape,
});

export const permissionsListResponseSchema = z.array(permissionSchema);

export const createPermissionSchema = z.object({
  permission_name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const updatePermissionSchema = z
  .object({
    permission_name: z.string().min(1, 'Permission name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
  })
  .partial();

export const assignPermissionToRoleSchema = z.object({
  permissionName: z.string().min(1, 'Permission name is required'),
});

export const rolePermissionsResponseSchema = z.object({
  content: z.array(permissionSchema),
  ...paginationSchema.shape,
});

export const officerPermissionSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  permission_id: z.number(),
  granted_at: z.string(),
  officer_name: z.string(),
  officer_department: z.string(),
  permission_name: z.string(),
  permission_category: z.string(),
});

export const officerPermissionsResponseSchema = z.array(officerPermissionSchema);

export const backendOfficerPermissionSchema = z.object({
  id: z.number(),
  officerId: z.number(),
  permissionId: z.number(),
  grantedAt: z.string(),
  grantedBy: z.number().nullable(),
  officerName: z.string(),
  officerDepartment: z.string(),
  permissionName: z.string(),
  permissionCategory: z.string(),
});

export const backendOfficerPermissionsPaginatedResponseSchema = z.object({
  content: z.array(backendOfficerPermissionSchema),
  ...paginationSchema.shape,
});

export const assignPermissionSchema = z.object({
  officer_id: z.number(),
  permission_id: z.number(),
});

export type Permission = z.infer<typeof permissionSchema>;
export type PermissionsPaginatedResponse = z.infer<typeof permissionsResponseSchema>;
export type PermissionsListResponse = z.infer<typeof permissionsListResponseSchema>;
export type CreatePermission = z.infer<typeof createPermissionSchema>;
export type UpdatePermission = z.infer<typeof updatePermissionSchema>;
export type AssignPermissionToRole = z.infer<typeof assignPermissionToRoleSchema>;
export type RolePermissionsResponse = z.infer<typeof rolePermissionsResponseSchema>;
export type OfficerPermission = z.infer<typeof officerPermissionSchema>;
export type OfficerPermissionsResponse = z.infer<typeof officerPermissionsResponseSchema>;
export type BackendOfficerPermission = z.infer<typeof backendOfficerPermissionSchema>;
export type BackendOfficerPermissionsPaginatedResponse = z.infer<
  typeof backendOfficerPermissionsPaginatedResponseSchema
>;
export type AssignPermission = z.infer<typeof assignPermissionSchema>;
