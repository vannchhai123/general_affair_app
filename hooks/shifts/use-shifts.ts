import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { shiftsResponseSchema, type Shift } from '@/lib/schemas';

export function useShifts() {
  return useQuery({
    queryKey: queryKeys.shifts.lists(),
    queryFn: () => fetchApi('/shifts', shiftsResponseSchema),
  });
}
