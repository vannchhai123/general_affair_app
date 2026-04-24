import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/client';
import { queryKeys, ApiError } from '@/lib/api/fetcher';
import { z } from 'zod';
import {
  officerPermissionsResponseSchema,
  backendOfficerPermissionSchema,
  backendOfficerPermissionsPaginatedResponseSchema,
  type OfficerPermissionsResponse,
} from '@/lib/schemas';

export function useOfficerPermissions() {
  return useQuery<OfficerPermissionsResponse, ApiError>({
    queryKey: queryKeys.officerPermissions.lists(),
    queryFn: async () => {
      const response = await apiFetch('/officer-permissions');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          (errorData as { error?: string }).error || `API request failed: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData,
        );
      }

      const data = await response.json();
      const parsed = z
        .union([
          z.array(backendOfficerPermissionSchema),
          backendOfficerPermissionsPaginatedResponseSchema,
        ])
        .parse(data);

      const assignments = Array.isArray(parsed) ? parsed : parsed.content;

      return officerPermissionsResponseSchema.parse(
        assignments.map((assignment) => ({
          id: assignment.id,
          officer_id: assignment.officerId,
          permission_id: assignment.permissionId,
          granted_at: assignment.grantedAt,
          granted_by: assignment.grantedBy,
          officer_name: assignment.officerName,
          officer_department: assignment.officerDepartment,
          permission_name: assignment.permissionName,
          permission_category: assignment.permissionCategory,
        })),
      );
    },
  });
}
