import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import {
  permissionSchema,
  successResponseSchema,
  type Permission,
  type CreatePermission,
  type UpdatePermission,
} from '@/lib/schemas';

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation<Permission, ApiError, CreatePermission>({
    mutationFn: (data: CreatePermission) =>
      fetchApi('/permissions', permissionSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.all });
      toast.success('Permission created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation<Permission, ApiError, { id: number; data: UpdatePermission }>({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermission }) =>
      fetchApi(`/permissions/${id}`, permissionSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.all });
      toast.success('Permission updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/permissions/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.all });
      toast.success('Permission deleted successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
