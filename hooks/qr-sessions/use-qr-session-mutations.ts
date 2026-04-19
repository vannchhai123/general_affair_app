import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import {
  qrSessionSchema,
  updateQrSessionResponseSchema,
  successResponseSchema,
  type QrSession,
  type CreateQrSession,
  type UpdateQrSession,
  type UpdateQrSessionResponse,
} from '@/lib/schemas';

export function useCreateQrSession() {
  const queryClient = useQueryClient();

  return useMutation<QrSession, ApiError, CreateQrSession>({
    mutationFn: (data: CreateQrSession) =>
      fetchApi('/qr-sessions', qrSessionSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qrSessions.all });
      toast.success('QR session created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateQrSession() {
  const queryClient = useQueryClient();

  return useMutation<UpdateQrSessionResponse, ApiError, { id: string; data: UpdateQrSession }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateQrSession }) =>
      fetchApi(`/qr-sessions/${id}`, updateQrSessionResponseSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      // Update the cache with the new status
      queryClient.setQueryData(['qr-sessions', data.id], (oldData: QrSession | undefined) => {
        if (oldData) {
          return { ...oldData, status: data.status };
        }
        return oldData;
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.qrSessions.all });
      toast.success('QR session updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteQrSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/qr-sessions/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qrSessions.all });
      toast.success('QR session deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
