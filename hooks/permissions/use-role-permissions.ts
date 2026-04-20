import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import {
  permissionsResponseSchema,
  successResponseSchema,
  type PermissionsPaginatedResponse,
  type AssignPermissionToRole,
} from '@/lib/schemas';

export function usePermissionsByRole(role: string, params?: { page?: number; size?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.set('page', String(params.page));
  if (params?.size !== undefined) queryParams.set('size', String(params.size));

  return useQuery<PermissionsPaginatedResponse>({
    queryKey: queryKeys.rolePermissions.byRole(role, Object.fromEntries(queryParams)),
    queryFn: () =>
      fetchApi(
        `/permissions/${role}/permissions?${queryParams.toString()}`,
        permissionsResponseSchema,
      ),
    enabled: !!role,
  });
}

export function useAssignPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, data }: { role: string; data: AssignPermissionToRole }) =>
      fetchApi(`/permissions/roles/${role}/assign`, successResponseSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.byRole(variables.role) });
      toast.success('Permission assigned to role successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
