import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { officerSchema } from '@/lib/schemas';
import { type Officer } from '@/lib/schemas';

export function useOfficer(id: number) {
  return useQuery({
    queryKey: queryKeys.officers.detail(id),
    queryFn: () => fetchApi(`/api/officer/${id}`, officerSchema),
    enabled: !!id,
  });
}
