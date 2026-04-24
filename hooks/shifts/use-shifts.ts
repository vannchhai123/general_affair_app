import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { shiftsResponseSchema, type ShiftsResponse } from '@/lib/schemas';

export function useShifts() {
  return useQuery<ShiftsResponse, ApiError>({
    queryKey: queryKeys.shifts.lists(),
    queryFn: () => fetchApi('/shifts', shiftsResponseSchema),
  });
}
