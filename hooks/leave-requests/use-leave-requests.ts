import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { leaveRequestsResponseSchema, type LeaveRequest } from '@/lib/schemas';

export function useLeaveRequests() {
  return useQuery({
    queryKey: queryKeys.leaveRequests.lists(),
    queryFn: () => fetchApi('/leave-requests', leaveRequestsResponseSchema),
  });
}
