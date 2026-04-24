import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { officerSchema, type Officer } from '@/lib/schemas';

export function useOfficer(id: number) {
  return useQuery<Officer, ApiError>({
    queryKey: queryKeys.officers.detail(id),
    queryFn: () => fetchApi(`/officer/${id}`, officerSchema),
    enabled: !!id,
  });
}
