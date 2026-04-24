import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { attendanceResponseSchema, type AttendanceResponse } from '@/lib/schemas';

export function useAttendance(params?: { page?: number; size?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.set('page', String(params.page));
  if (params?.size !== undefined) queryParams.set('size', String(params.size));
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const filters: Record<string, string> = {};
  if (params?.page !== undefined) filters.page = String(params.page);
  if (params?.size !== undefined) filters.size = String(params.size);

  return useQuery<AttendanceResponse, ApiError>({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => fetchApi(`/attendance${queryString}`, attendanceResponseSchema),
  });
}
