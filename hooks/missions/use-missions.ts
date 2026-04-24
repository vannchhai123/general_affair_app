import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { missionsResponseSchema, type MissionsResponse } from '@/lib/schemas';

export function useMissions() {
  return useQuery<MissionsResponse, ApiError>({
    queryKey: queryKeys.missions.lists(),
    queryFn: () => fetchApi('/missions', missionsResponseSchema),
  });
}
