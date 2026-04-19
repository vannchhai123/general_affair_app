import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/client';
import { queryKeys, ApiError } from '@/lib/api/fetcher';
import {
  officerPermissionsResponseSchema,
  backendOfficerPermissionsPaginatedResponseSchema,
  type OfficerPermission,
} from '@/lib/schemas';

export function useOfficerPermissions() {
  return useQuery({
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
      const parsed = backendOfficerPermissionsPaginatedResponseSchema.parse(data);

      return officerPermissionsResponseSchema.parse(
        parsed.content.map((assignment) => ({
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
  }) as {
    data: OfficerPermission[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}
