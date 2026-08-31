import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { z } from 'zod';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { backendOfficerPermissionSchema, successResponseSchema } from '@/lib/schemas';
import { PRESET_ROLES } from '@/lib/auth/permissions';

export function useAssignPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { officer_id: number; permission_id: number }) =>
      fetchApi('/officer-permissions', backendOfficerPermissionSchema, {
        method: 'POST',
        body: JSON.stringify({
          officerId: data.officer_id,
          permissionId: data.permission_id,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useRevokePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/officer-permissions/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useAssignRoleToOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      officerId: number;
      userId?: number | null;
      roleIds?: number[];
      roleCodes?: string[];
      roleName?: string;
    }) => {
      const targetUserId = data.userId || data.officerId;

      let resolvedRoleIds = data.roleIds;
      if (!resolvedRoleIds || resolvedRoleIds.length === 0) {
        if (data.roleCodes?.length) {
          resolvedRoleIds = data.roleCodes
            .map((c) => PRESET_ROLES.find((r) => r.code === c)?.id)
            .filter((id): id is number => typeof id === 'number');
        } else if (data.roleName) {
          const found = PRESET_ROLES.find((r) => r.code === data.roleName);
          if (found) resolvedRoleIds = [found.id];
        }
      }

      return await fetchApi(`/super-admin/users/${targetUserId}/roles`, z.any(), {
        method: 'PUT',
        body: JSON.stringify({
          roleIds: resolvedRoleIds ?? [7],
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      queryClient.invalidateQueries({ queryKey: ['officer'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error assigning roles');
    },
  });
}
