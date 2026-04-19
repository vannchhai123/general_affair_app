'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { officerSchema } from '@/lib/schemas';
import type { Officer } from '@/lib/schemas';

const paginatedOfficersResponseSchema = z.object({
  content: z.array(officerSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

type PaginatedOfficers = z.infer<typeof paginatedOfficersResponseSchema>;
type OfficersQueryData = {
  officers: Officer[];
  total: number;
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
      const data = await fetchApi<PaginatedOfficers, typeof paginatedOfficersResponseSchema>(
        `/officer${queryString}`,
        paginatedOfficersResponseSchema,
      );

      return {
        officers: data.content ?? [],
        total: data.totalElements ?? 0,
      };
    },
  });

  return {
    ...query,
    officers: query.data?.officers ?? [],
    total: query.data?.total ?? 0,
    mutate: query.refetch,
  };
}
