import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { permissionSchema, type Permission } from '@/lib/schemas';

export function usePermission(id: number) {
  return useQuery<Permission>({
    queryKey: queryKeys.permissions.detail(id),
    queryFn: () => fetchApi(`/permissions/${id}`, permissionSchema),
    enabled: !!id,
  });
}
