import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { qrSessionSchema, qrTodaySessionsSchema, type QrSession } from '@/lib/schemas';

export function useQrSession(id: string) {
  return useQuery<QrSession, ApiError>({
    queryKey: queryKeys.qrSessions.detail(id),
    queryFn: () => fetchApi(`/qr-sessions/${id}`, qrSessionSchema),
    enabled: !!id,
  });
}

export function useCurrentQrSession() {
  return useQuery<QrSession, ApiError>({
    queryKey: queryKeys.qrSessions.current(),
    queryFn: () => fetchApi('/qr-sessions/current', qrSessionSchema),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}

export function useTodayQrSessions() {
  return useQuery<QrSession[], ApiError>({
    queryKey: queryKeys.qrSessions.today(),
    queryFn: () => fetchApi('/qr-sessions/today', qrTodaySessionsSchema),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}
