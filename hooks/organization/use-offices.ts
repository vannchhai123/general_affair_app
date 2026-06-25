'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/fetcher';
import { organizationApi, type DepartmentListParams } from '@/lib/api/organization.api';
import { ApiError } from '@/lib/api/fetcher';
import type { OfficesListResponse } from '@/lib/schemas';

function toFilterRecord(filters: DepartmentListParams) {
  return Object.fromEntries(
    Object.entries({
      search: filters.search?.trim(),
      status: filters.status,
      page: filters.page?.toString(),
      size: filters.size?.toString(),
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string>;
}

export function useOffices(filters: DepartmentListParams = {}) {
  const query = useQuery<OfficesListResponse, ApiError>({
    queryKey: queryKeys.organization.offices.list(toFilterRecord(filters)),
    queryFn: () => organizationApi.getOffices(filters),
    retry: false,
  });

  return {
    ...query,
    offices: query.data?.content ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          size: query.data.size,
          totalElements: query.data.totalElements,
          totalPages: query.data.totalPages,
          last: query.data.last,
        }
      : {
          page: filters.page ?? 0,
          size: filters.size ?? 10,
          totalElements: 0,
          totalPages: 0,
          last: true,
        },
    total: query.data?.totalElements ?? 0,
    mutate: query.refetch,
  };
}

export function useOffice(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.organization.offices.detail(id),
    queryFn: () => organizationApi.getOffice(id),
    enabled,
  });
}
