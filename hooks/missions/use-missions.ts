import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { missionsResponseSchema, type Mission } from '@/lib/schemas';

export function useMissions() {
  return useQuery({
    queryKey: queryKeys.missions.lists(),
    queryFn: () => fetchApi('/missions', missionsResponseSchema),
  });
}
