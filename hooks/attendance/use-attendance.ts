import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import {
  attendanceResponseSchema,
  absentOfficersResponseSchema,
  type AttendanceResponse,
  type AbsentOfficersResponse,
} from '@/lib/schemas';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Half-day'
  | 'Approved'
  | 'Rejected'
  | 'Pending'
  | 'Leave'
  | string;
export type AttendanceViewMode = 'daily' | 'monthly';

export type AttendanceListParams = {
  page?: number;
  size?: number;
  search?: string;
  date?: string;
  department?: string;
  status?: AttendanceStatus;
  viewMode?: AttendanceViewMode;
};

export function useAttendance(params?: AttendanceListParams) {
  const queryParams = new URLSearchParams();
  const filters: Record<string, string> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === '') return;

    const normalizedValue = String(value);
    queryParams.set(key, normalizedValue);
    filters[key] = normalizedValue;
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<AttendanceResponse, ApiError>({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => fetchApi(`/attendance${queryString}`, attendanceResponseSchema),
  });
}

export function useTodayPresentAttendance(params?: {
  date?: string;
  status?: string;
  search?: string;
  department?: string;
  page?: number;
  size?: number;
}) {
  const queryParams = new URLSearchParams();
  const filters: Record<string, string> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    const normalizedValue = String(value);
    queryParams.set(key, normalizedValue);
    filters[key] = normalizedValue;
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<AttendanceResponse, ApiError>({
    queryKey: queryKeys.attendance.todayPresent(filters),
    queryFn: () => fetchApi(`/attendance/today/present${queryString}`, attendanceResponseSchema),
  });
}

export function useTodayAbsentAttendance(params?: {
  date?: string;
  search?: string;
  department?: string;
  page?: number;
  size?: number;
}) {
  const queryParams = new URLSearchParams();
  const filters: Record<string, string> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    const normalizedValue = String(value);
    queryParams.set(key, normalizedValue);
    filters[key] = normalizedValue;
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<AbsentOfficersResponse, ApiError>({
    queryKey: queryKeys.attendance.todayAbsent(filters),
    queryFn: () => fetchApi(`/attendance/today/absent${queryString}`, absentOfficersResponseSchema),
  });
}
