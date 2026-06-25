'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import {
  paginatedOfficersResponseSchema,
  type Officer,
  type PaginatedOfficersResponse,
} from '@/lib/schemas';
type OfficersQueryData = {
  officers: Officer[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  last: boolean;
};

export function useOfficers(filters?: {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.department) queryParams.set('department', filters.department);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.page !== undefined) {
    queryParams.set('page', String(filters.page - 1));
  }
  if (filters?.pageSize !== undefined) queryParams.set('size', String(filters.pageSize));
  // Default to newest first so recently created officers appear at the top
  queryParams.set('sort', 'id,desc');

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const query = useQuery<OfficersQueryData>({
    queryKey: queryKeys.officers.list(
      Object.fromEntries(
        Object.entries({
          search: filters?.search,
          department: filters?.department,
          status: filters?.status,
          page: filters?.page?.toString(),
          pageSize: filters?.pageSize?.toString(),
        }).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ) as Record<string, string>,
    ),
    queryFn: async () => {
      const data = await fetchApi<
        PaginatedOfficersResponse,
        typeof paginatedOfficersResponseSchema
      >(`/officer${queryString}`, paginatedOfficersResponseSchema);

      return {
        officers: data.content ?? [],
        total: data.totalElements ?? 0,
        page: data.page ?? 0,
        size: data.size ?? filters?.pageSize ?? 10,
        totalPages: data.totalPages ?? 0,
        last: data.last ?? true,
      };
    },
  });

  return {
    ...query,
    officers: query.data?.officers ?? [],
    total: query.data?.total ?? 0,
    pagination: {
      page: query.data?.page ?? (filters?.page ?? 1) - 1,
      size: query.data?.size ?? filters?.pageSize ?? 10,
      totalPages: query.data?.totalPages ?? 0,
      last: query.data?.last ?? true,
    },
    mutate: query.refetch,
  };
}
