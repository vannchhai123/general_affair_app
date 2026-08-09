import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { z } from 'zod';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { backendOfficerPermissionSchema, successResponseSchema } from '@/lib/schemas';

const roleAssignResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
});

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
    mutationFn: (data: { officerId: number; roleName: string }) =>
      fetchApi(`/officer-permissions/officers/${data.officerId}/role`, roleAssignResponseSchema, {
        method: 'PUT',
        body: JSON.stringify({ roleName: data.roleName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      toast.success('កំណត់តួនាទីជោគជ័យ');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
