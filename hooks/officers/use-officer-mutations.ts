import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { apiFetch } from '@/lib/client';
import { officerSchema, successResponseSchema } from '@/lib/schemas';
import { type CreateOfficer, type UpdateOfficer } from '@/lib/schemas';

function sanitizeOfficerPayload(data: any) {
  const sanitized = { ...data };

  const optionalFields = [
    'email',
    'date_of_birth',
    'national_id',
    'nationality',
    'ethnicity',
    'education_level',
    'contract_type',
  ];
  for (const field of optionalFields) {
    if (sanitized[field] === '') {
      sanitized[field] = null;
    }
  }

  if (sanitized.office_id === 0 || !sanitized.office_id) {
    sanitized.office_id = null;
  }
  if (sanitized.position_id === 0 || !sanitized.position_id) {
    sanitized.position_id = null;
  }

  if (typeof sanitized.sex === 'string') {
    sanitized.sex = sanitized.sex.toUpperCase();
  }
  if (typeof sanitized.status === 'string') {
    sanitized.status = sanitized.status.toUpperCase();
  }

  return sanitized;
}

export function useCreateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfficer) =>
      fetchApi('/officer', officerSchema, {
        method: 'POST',
        body: JSON.stringify(sanitizeOfficerPayload(data)),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('បានបង្កើតមន្ត្រីដោយជោគជ័យ');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOfficer }) =>
      fetchApi(`/officer/${id}`, officerSchema, {
        method: 'PUT',
        body: JSON.stringify(sanitizeOfficerPayload(data)),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('បានកែប្រែព័ត៌មានមន្ត្រីដោយជោគជ័យ');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/officer/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('បានលុបមន្ត្រីដោយជោគជ័យ');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUploadOfficerImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch(`/officer/${id}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          (errorData as { error?: string; message?: string }).error ||
            (errorData as { error?: string; message?: string }).message ||
            `API request failed: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData,
        );
      }

      return response.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('បានបង្ហោះរូបភាពមន្ត្រីដោយជោគជ័យ');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
