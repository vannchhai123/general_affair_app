import { getOfficers } from '@/lib/api/officer.api';
import useSWR from 'swr';

export function useOfficers(filters: {
  search: string;
  department: string;
  status: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.department !== 'all') params.set('department', filters.department);
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page - 1)); // Convert to 0-based index for backend
  if (filters.pageSize) params.set('size', String(filters.pageSize));

  const { data, mutate, isLoading } = useSWR(`/api/v1/officer?${params.toString()}`, () =>
    getOfficers(params.toString()),
  );

  return {
    officers: data?.content ?? [],
    total: data?.totalElements ?? 0,
    mutate,
    isLoading,
  };
}
