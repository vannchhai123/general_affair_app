import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { leaveRequestsResponseSchema, type LeaveRequestsResponse } from '@/lib/schemas';

export function useLeaveRequests() {
  return useQuery<LeaveRequestsResponse, ApiError>({
    queryKey: queryKeys.leaveRequests.lists(),
    queryFn: () => fetchApi('/leave-requests', leaveRequestsResponseSchema),
  });
}
