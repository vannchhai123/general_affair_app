import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { qrSessionSchema, qrTodaySessionsSchema, type QrSession } from '@/lib/schemas';

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

export function useCurrentQrSession() {
  return useQuery({
    queryKey: queryKeys.qrSessions.current(),
    queryFn: () => fetchApi('/qr-sessions/current', qrSessionSchema),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  }) as {
    data: QrSession | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

export function useTodayQrSessions() {
  return useQuery({
    queryKey: queryKeys.qrSessions.today(),
    queryFn: () => fetchApi('/qr-sessions/today', qrTodaySessionsSchema),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  }) as {
    data: QrSession[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}
