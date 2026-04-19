import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { officerPermissionSchema, successResponseSchema } from '@/lib/schemas';

export function useAssignPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { officer_id: number; permission_id: number }) =>
      fetchApi('/officer-permissions', officerPermissionSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
      toast.success('Permission assigned to officer successfully');
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
      toast.success('Permission revoked from officer successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
