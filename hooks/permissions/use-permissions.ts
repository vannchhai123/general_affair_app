import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import {
  permissionsResponseSchema,
  permissionsListResponseSchema,
  type Permission,
  type PermissionsPaginatedResponse,
} from '@/lib/schemas';

export function usePermissions(category?: string) {
  const filters = category ? { category } : undefined;
  const queryParams = filters ? new URLSearchParams(filters) : null;
  const queryString = queryParams && queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<Permission[]>({
    queryKey: queryKeys.permissions.list(filters || {}),
    queryFn: async () => {
      const data = await fetchApi<PermissionsPaginatedResponse, typeof permissionsResponseSchema>(
        `/permissions${queryString}`,
        permissionsResponseSchema,
      );

      return data.content ?? [];
    },
  }) as {
    data: Permission[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}
