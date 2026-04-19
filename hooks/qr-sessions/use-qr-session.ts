import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { qrSessionSchema, type QrSession } from '@/lib/schemas';

export function useQrSession(id: string) {
  return useQuery({
    queryKey: queryKeys.qrSessions.detail(id),
    queryFn: () => fetchApi(`/qr-sessions/${id}`, qrSessionSchema),
    enabled: !!id,
  }) as {
    data: QrSession | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}
