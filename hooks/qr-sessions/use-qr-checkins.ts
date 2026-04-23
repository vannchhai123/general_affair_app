import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import {
  qrSessionCheckInSchema,
  createQrSessionCheckInResponseSchema,
  type QrSessionCheckIn,
  type CreateQrSessionCheckIn,
  type CreateQrSessionCheckInResponse,
} from '@/lib/schemas';

export function useQrSessionCheckIns(sessionId: string) {
  return useQuery<QrSessionCheckIn[]>({
    queryKey: queryKeys.qrSessions.checkins(sessionId),
    queryFn: () => fetchApi(`/qr-sessions/${sessionId}/checkins`, z.array(qrSessionCheckInSchema)),
    enabled: !!sessionId,
    refetchInterval: sessionId ? 5000 : false,
    refetchIntervalInBackground: true,
  });
}

export function useCreateQrSessionCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateQrSessionCheckInResponse,
    ApiError,
    { sessionId: string; data: CreateQrSessionCheckIn }
  >({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: CreateQrSessionCheckIn }) =>
      fetchApi(`/qr-sessions/${sessionId}/checkins`, createQrSessionCheckInResponseSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.qrSessions.checkins(variables.sessionId),
      });
      toast.success(data.message || 'Check-in recorded successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
