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
  sessionName: string;
  sessionStatus: QrScanSessionStatus;
  statusDisplay: StatusDisplay;
};

const FALLBACK_EXPIRES_IN = 3600;
const MIN_REFRESH_SECONDS = 1;
const MAX_REFRESH_SECONDS = 86400;
const HARD_RELOAD_MINUTES = 45;
const ACTIVE_WINDOW_START_HOUR = 6;
const ACTIVE_WINDOW_END_HOUR = 21;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

function clampRefreshSeconds(value?: number) {
  if (!value || Number.isNaN(value)) return FALLBACK_EXPIRES_IN;
  return Math.min(MAX_REFRESH_SECONDS, Math.max(MIN_REFRESH_SECONDS, Math.floor(value)));
}

function isWithinActiveWindow(now = new Date()) {
  const hour = now.getHours();
  return hour >= ACTIVE_WINDOW_START_HOUR && hour < ACTIVE_WINDOW_END_HOUR;
}

function getSecondsUntilNextActiveWindow(now = new Date()) {
  const next = new Date(now);

  if (now.getHours() < ACTIVE_WINDOW_START_HOUR) {
    next.setHours(ACTIVE_WINDOW_START_HOUR, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(ACTIVE_WINDOW_START_HOUR, 0, 0, 0);
  }

  const secondsRemaining = Math.ceil((next.getTime() - now.getTime()) / 1000);
  return clampRefreshSeconds(secondsRemaining);
}

function deriveRefreshSeconds(data: QrScanResponse) {
  if (typeof data.expiresIn === 'number') {
    return clampRefreshSeconds(data.expiresIn);
  }

  if (!data.expires_at) {
    return FALLBACK_EXPIRES_IN;
  }

  const expiresAt = new Date(data.expires_at).getTime();
  if (Number.isNaN(expiresAt)) {
    return FALLBACK_EXPIRES_IN;
  }

  const secondsRemaining = Math.ceil((expiresAt - Date.now()) / 1000);
  return clampRefreshSeconds(secondsRemaining);
}

function deriveToken(data: QrScanResponse) {
  return data.token?.trim() || data.qr_token?.trim() || '';
}

function deriveSessionName(data: QrScanResponse, sessionId: string) {
  return data.sessionName || data.location || (sessionId ? `Session ID: ${sessionId}` : '');
}

function deriveIsActive(data: QrScanResponse, token: string) {
  if (typeof data.active === 'boolean') {
    return data.active;
  }

  if (data.status) {
    return data.status.toLowerCase() === 'active';
  }

  return Boolean(token);
}

async function fetchPublicQrResponse(sessionId: string): Promise<QrScanResponse> {
  const endpoints = [`/session/${encodeURIComponent(sessionId)}/qr`];

  let lastError: ApiError | null = null;

  for (const endpoint of endpoints) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      lastError = new ApiError(
        (errorData as { error?: string; message?: string }).error ||
          (errorData as { error?: string; message?: string }).message ||
          `API request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData,
      );

      throw lastError;
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

  throw lastError || new ApiError('Unable to load QR', 500, 'Internal Error');
}

function getStatusDisplay(status: QrScanSessionStatus): StatusDisplay {
  if (status === 'active') return { label: 'ACTIVE', color: 'bg-emerald-500' };
  if (status === 'inactive') return { label: 'INACTIVE', color: 'bg-rose-500' };
  if (status === 'error') return { label: 'ERROR', color: 'bg-amber-500' };
  return { label: 'LOADING', color: 'bg-slate-500' };
}

export function useQrScanDisplay(sessionId: string): UseQrScanDisplayResult {
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(FALLBACK_EXPIRES_IN);
  const [sessionStatus, setSessionStatus] = useState<QrScanSessionStatus>('loading');
  const [sessionName, setSessionName] = useState('');
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

  const resetToInactive = useCallback((nextSessionName = '') => {
    setSessionStatus('inactive');
    setQrToken('');
    setSessionName(nextSessionName);
    setLastUpdatedAt(Date.now());
  }, []);

  const fetchQrToken = useCallback(async () => {
    try {
      setErrorMessage('');

      if (!sessionId) {
        resetToInactive('');
        clearRefreshTimers();
        return;
      }

      if (!isWithinActiveWindow()) {
        setErrorMessage('');
        resetToInactive('QR display runs daily from 6:00 AM to 9:00 PM');
        scheduleNextRefresh(getSecondsUntilNextActiveWindow(), fetchQrToken);
        return;
      }

      const data = await fetchPublicQrResponse(sessionId);

      if (!isMountedRef.current) return;

      const nextRefreshIn = deriveRefreshSeconds(data);
      const token = deriveToken(data);
      const isActive = deriveIsActive(data, token);

      if (!token || !isActive) {
        resetToInactive(deriveSessionName(data, sessionId));
        scheduleNextRefresh(nextRefreshIn, fetchQrToken);
        return;
      }

      setQrToken(token);
      setSessionName(deriveSessionName(data, sessionId) || 'Attendance Session');
      setSessionStatus('active');
      setLastUpdatedAt(Date.now());
      scheduleNextRefresh(nextRefreshIn, fetchQrToken);
    } catch (error) {
      if (!isMountedRef.current) return;

      if (error instanceof ApiError && (error.status === 404 || error.status === 410)) {
        resetToInactive('');
        clearRefreshTimers();
        return;
      }

      console.error('Unable to load QR', error);
      setSessionStatus('error');
      setQrToken('');
      setErrorMessage(
        error instanceof ApiError && (error.status === 401 || error.status === 403)
          ? 'QR display endpoint requires authorization'
          : 'Unable to load QR',
      );
      setLastUpdatedAt(Date.now());
      scheduleNextRefresh(FALLBACK_EXPIRES_IN, fetchQrToken);
    }
  }, [clearRefreshTimers, resetToInactive, scheduleNextRefresh, sessionId]);
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
    sessionName,
    sessionStatus,
    statusDisplay,
  };
}
