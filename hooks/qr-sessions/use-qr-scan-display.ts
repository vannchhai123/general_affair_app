'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/fetcher';
import { qrScanResponseSchema, type QrScanResponse } from '@/lib/schemas';

export type QrScanSessionStatus = 'active' | 'inactive' | 'error' | 'loading';

type StatusDisplay = {
  label: string;
  color: string;
};

type UseQrScanDisplayResult = {
  countdown: number;
  errorMessage: string;
  lastUpdatedAt: number;
  qrAvailable: boolean;
  qrToken: string;
  refetchQr: () => void;
  sessionId: string;
  sessionName: string;
  sessionStatus: QrScanSessionStatus;
  shiftType: string;
  startsAt: string;
  endsAt: string;
  statusDisplay: StatusDisplay;
};

const FALLBACK_EXPIRES_IN = 3600;
const MIN_REFRESH_SECONDS = 1;
const MAX_REFRESH_SECONDS = 86400;
const HARD_RELOAD_MINUTES = 45;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

function clampRefreshSeconds(value?: number) {
  if (!value || Number.isNaN(value)) return FALLBACK_EXPIRES_IN;
  return Math.min(MAX_REFRESH_SECONDS, Math.max(MIN_REFRESH_SECONDS, Math.floor(value)));
}

function deriveRefreshSeconds(data: QrScanResponse) {
  if (typeof data.expiresIn === 'number') {
    return clampRefreshSeconds(data.expiresIn);
  }

  const expiresAtValue = data.expiresAt || data.expires_at;

  if (!expiresAtValue) {
    return FALLBACK_EXPIRES_IN;
  }

  const expiresAt = new Date(expiresAtValue).getTime();
  if (Number.isNaN(expiresAt)) {
    return FALLBACK_EXPIRES_IN;
  }

  const secondsRemaining = Math.ceil((expiresAt - Date.now()) / 1000);
  return clampRefreshSeconds(secondsRemaining);
}

function deriveToken(data: QrScanResponse) {
  return data.token?.trim() || data.qr_token?.trim() || '';
}

function deriveSessionId(data?: QrScanResponse) {
  return data?.sessionId?.trim() || data?.session_id?.trim() || '';
}

function deriveSessionName(data?: QrScanResponse) {
  return data?.message?.trim() || data?.sessionName?.trim() || data?.location?.trim() || '';
}

function deriveShiftType(data?: QrScanResponse) {
  return data?.shiftType?.trim() || data?.shift_type?.trim() || '';
}

function deriveStartsAt(data?: QrScanResponse) {
  return data?.startsAt?.trim() || data?.starts_at?.trim() || '';
}

function deriveEndsAt(data?: QrScanResponse) {
  return data?.endsAt?.trim() || data?.ends_at?.trim() || '';
}

async function fetchPublicQrResponse(): Promise<QrScanResponse> {
  const response = await fetch(`${API_BASE_URL}/session/current/qr`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
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

  const data = await response.json();
  const parsed = qrScanResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new ApiError(
      `Validation failed: ${parsed.error.errors.map((issue) => issue.message).join(', ')}`,
      500,
      'Validation Error',
      { zodErrors: parsed.error.errors },
    );
  }

  return parsed.data;
}

function getStatusDisplay(status: QrScanSessionStatus): StatusDisplay {
  if (status === 'active') return { label: 'សកម្ម', color: 'bg-emerald-500' };
  if (status === 'inactive') return { label: 'មិនសកម្ម', color: 'bg-rose-500' };
  if (status === 'error') return { label: 'មានបញ្ហា', color: 'bg-amber-500' };
  return { label: 'កំពុងផ្ទុក', color: 'bg-slate-500' };
}

export function useQrScanDisplay(_sessionId?: string): UseQrScanDisplayResult {
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(FALLBACK_EXPIRES_IN);
  const [sessionStatus, setSessionStatus] = useState<QrScanSessionStatus>('loading');
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardReloadRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  const clearRefreshTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const scheduleNextRefresh = useCallback(
    (seconds: number, fetchFn: () => Promise<void>) => {
      clearRefreshTimers();
      setCountdown(seconds);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      refreshTimeoutRef.current = setTimeout(() => {
        void fetchFn();
      }, seconds * 1000);
    },
    [clearRefreshTimers],
  );

  const resetToInactive = useCallback((data?: QrScanResponse) => {
    setSessionStatus('inactive');
    setQrToken('');
    setSessionId(deriveSessionId(data));
    setSessionName(deriveSessionName(data));
    setShiftType(deriveShiftType(data));
    setStartsAt(deriveStartsAt(data));
    setEndsAt(deriveEndsAt(data));
    setLastUpdatedAt(Date.now());
  }, []);

  const fetchQrToken = useCallback(async () => {
    try {
      setErrorMessage('');
      const data = await fetchPublicQrResponse();

      if (!isMountedRef.current) return;

      const nextRefreshIn = deriveRefreshSeconds(data);
      const token = deriveToken(data);
      const isActive = data.status?.toLowerCase() === 'active' && Boolean(token);

      if (!token || !isActive) {
        resetToInactive(data);
        scheduleNextRefresh(nextRefreshIn, fetchQrToken);
        return;
      }

      setQrToken(token);
      setSessionId(deriveSessionId(data));
      setSessionName(deriveSessionName(data) || 'សម័យវត្តមាន');
      setShiftType(deriveShiftType(data));
      setStartsAt(deriveStartsAt(data));
      setEndsAt(deriveEndsAt(data));
      setSessionStatus('active');
      setLastUpdatedAt(Date.now());
      scheduleNextRefresh(nextRefreshIn, fetchQrToken);
    } catch (error) {
      if (!isMountedRef.current) return;

      if (error instanceof ApiError && (error.status === 404 || error.status === 410)) {
        resetToInactive();
        clearRefreshTimers();
        return;
      }

      console.error('Unable to load QR', error);
      setSessionStatus('error');
      setQrToken('');
      setErrorMessage(
        error instanceof ApiError && (error.status === 401 || error.status === 403)
          ? 'ចំណុចផ្ទាំងបង្ហាញ QR ត្រូវការសិទ្ធិចូលប្រើ'
          : 'មិនអាចផ្ទុក QR បានទេ',
      );
      setSessionId('');
      setShiftType('');
      setStartsAt('');
      setEndsAt('');
      setLastUpdatedAt(Date.now());
      scheduleNextRefresh(FALLBACK_EXPIRES_IN, fetchQrToken);
    }
  }, [clearRefreshTimers, resetToInactive, scheduleNextRefresh]);
  useEffect(() => {
    isMountedRef.current = true;
    void fetchQrToken();

    hardReloadRef.current = setTimeout(
      () => {
        window.location.reload();
      },
      HARD_RELOAD_MINUTES * 60 * 1000,
    );

    return () => {
      isMountedRef.current = false;
      clearRefreshTimers();

      if (hardReloadRef.current) {
        clearTimeout(hardReloadRef.current);
        hardReloadRef.current = null;
      }
    };
  }, [clearRefreshTimers, fetchQrToken]);

  const statusDisplay = useMemo(() => getStatusDisplay(sessionStatus), [sessionStatus]);

  return {
    countdown,
    errorMessage,
    lastUpdatedAt,
    qrAvailable: Boolean(qrToken) && sessionStatus === 'active',
    qrToken,
    refetchQr: () => {
      void fetchQrToken();
    },
    sessionId,
    sessionName,
    sessionStatus,
    shiftType,
    startsAt,
    endsAt,
    statusDisplay,
  };
}
