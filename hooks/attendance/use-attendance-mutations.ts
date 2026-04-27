import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { apiFetch } from '@/lib/client';
import type { AttendanceFormData } from '@/lib/attendance/types';
import { attendanceSchema } from '@/lib/schemas';
import type { AttendanceListParams } from './use-attendance';

const attendanceImportResponseSchema = z.object({
  created: z.number(),
  updated: z.number(),
  failed: z.number(),
  errors: z.array(z.object({ row: z.number(), message: z.string() })),
});

export type AttendanceImportResponse = z.infer<typeof attendanceImportResponseSchema>;

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttendanceFormData) =>
      fetchApi('/attendance', attendanceSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      toast.success('Attendance record created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AttendanceFormData }) =>
      fetchApi(`/attendance/${id}`, attendanceSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      toast.success('Attendance updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useExportAttendance() {
  return useMutation<
    { blob: Blob; filename: string },
    ApiError,
    Omit<AttendanceListParams, 'page' | 'size'>
  >({
    mutationFn: async (params: Omit<AttendanceListParams, 'page' | 'size'>) => {
      const queryParams = new URLSearchParams();

      Object.entries({ ...params, format: 'xlsx' }).forEach(([key, value]) => {
        if (value === undefined || value === '') return;
        queryParams.set(key, String(value));
      });

      const response = await apiFetch(`/attendance/export?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          (errorData as { message?: string }).message || 'Unable to export attendance',
          response.status,
          response.statusText,
          errorData,
        );
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename =
        contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ||
        `attendance-${params.date || 'export'}.xlsx`;

      return { blob, filename };
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useImportAttendance() {
  const queryClient = useQueryClient();

  return useMutation<AttendanceImportResponse, ApiError, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return fetchApi('/attendance/import', attendanceImportResponseSchema, {
        method: 'POST',
        body: formData,
      }) as Promise<AttendanceImportResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
