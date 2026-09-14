import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import {
  leaveRequestsResponseSchema,
  leaveRequestsCountResponseSchema,
  type LeaveRequestsResponse,
  type LeaveRequestsCountResponse,
} from '@/lib/schemas';

export function useLeaveRequests() {
  return useQuery<LeaveRequestsResponse, ApiError>({
    queryKey: queryKeys.leaveRequests.lists(),
    queryFn: () => fetchApi('/leave-requests', leaveRequestsResponseSchema),
  });
}

export function useTodayApprovedLeaveRequests(params?: { date?: string }) {
  const queryParams = new URLSearchParams();
  const filters: Record<string, string> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    const normalizedValue = String(value);
    queryParams.set(key, normalizedValue);
    filters[key] = normalizedValue;
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<LeaveRequestsResponse, ApiError>({
    queryKey: queryKeys.leaveRequests.todayApproved(filters),
    queryFn: () =>
      fetchApi(`/leave-requests/today/approved${queryString}`, leaveRequestsResponseSchema),
  });
}

export function useLeaveRequestsApprovedCount(params?: { date?: string }) {
  const queryParams = new URLSearchParams();
  const filters: Record<string, string> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    const normalizedValue = String(value);
    queryParams.set(key, normalizedValue);
    filters[key] = normalizedValue;
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<LeaveRequestsCountResponse, ApiError>({
    queryKey: queryKeys.leaveRequests.approvedCount(filters),
    queryFn: () =>
      fetchApi(`/leave-requests/count/approved${queryString}`, leaveRequestsCountResponseSchema),
  });
}
