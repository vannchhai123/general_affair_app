'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QrCode, Shield, UserCheck, UserX, Clock, Copy, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QRDisplay } from '@/components/qr/qr-display';
import { SessionControls } from '@/components/qr/session-controls';
import { CheckInList } from '@/components/qr/checkin-list';
import { SummaryCard } from '@/components/qr/summary-card';
import { RequireAccess } from '@/components/auth/require-access';
import { useUpdateQrSession } from '@/hooks/qr-sessions/use-qr-session-mutations';
import { useCurrentQrSession } from '@/hooks/qr-sessions/use-qr-session';
import { useQrSessionCheckIns } from '@/hooks/qr-sessions/use-qr-checkins';
import { useQrScanDisplay } from '@/hooks/qr-sessions/use-qr-scan-display';

export type SessionStatus = 'idle' | 'active' | 'expired' | 'error';

export interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
}

function formatScanTime(value?: string | null) {
  if (!value) return '--:--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';

  return format(date, 'p');
}

function normalizeCheckInStatus(checkIn: any): CheckInRecord['status'] {
  const action = String(checkIn.action ?? '').toUpperCase();
  const status = String(checkIn.status ?? '').toUpperCase();

  if (status === 'LATE') return 'late';
  if (action === 'CHECK_OUT' || status === 'CHECKED_OUT') return 'checked-out';
  return 'checked-in';
}

function getSessionStartsAt(session: { startsAt?: string | null; starts_at?: string | null }) {
  return session.startsAt || session.starts_at || '';
}

function getSessionEndsAt(session: { endsAt?: string | null; ends_at?: string | null }) {
  return session.endsAt || session.ends_at || '';
}

export default function QRAttendancePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [origin, setOrigin] = useState('');

  const {
    data: currentSession,
    isLoading: currentSessionLoading,
    isError: currentSessionError,
    error: currentSessionErrorData,
    refetch: refetchCurrentSession,
  } = useCurrentQrSession();
  const t = useTranslations('qrAttendance');
  const qrScanDisplay = useQrScanDisplay();
  const sessionId = currentSession?.id || qrScanDisplay.sessionId;

  const {
    data: checkInsData = [],
    isLoading: checkInsLoading,
    isError: checkInsError,
    error: checkInsErrorData,
    refetch: refetchCheckIns,
  } = useQrSessionCheckIns(sessionId);

  const updateQrSession = useUpdateQrSession();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const regenerateQR = async () => {
    if (!sessionId) return;

    setIsRefreshing(true);
    try {
      await updateQrSession.mutateAsync({
        id: sessionId,
        data: { action: 'regenerate' },
      });

      qrScanDisplay.refetchQr();
      void refetchCurrentSession();
      setIsRefreshing(false);
      toast.success(t('qrRegeneratedSuccess'));
    } catch {
      setIsRefreshing(false);
      toast.error(t('unableToRegenerateQr'));
    }
  };

  const checkIns: CheckInRecord[] = useMemo(
    () =>
      checkInsData.map((checkIn: any) => ({
        id: checkIn.id,
        employeeName:
          checkIn.officerName ??
          checkIn.officer_name ??
          checkIn.employeeName ??
          checkIn.employee_name ??
          t('unknownOfficer'),
        employeeCode:
          checkIn.officerCode ??
          checkIn.officer_code ??
          checkIn.employeeCode ??
          checkIn.employee_code ??
          '--',
        time: formatScanTime(checkIn.scannedAt ?? checkIn.scanned_at ?? checkIn.timestamp),
        status: normalizeCheckInStatus(checkIn),
      })),
    [checkInsData],
  );

  const stats = useMemo(() => {
    return {
      totalScans: checkIns.length,
      checkedIn: checkIns.filter((c) => c.status === 'checked-in').length,
      checkedOut: checkIns.filter((c) => c.status === 'checked-out').length,
      late: checkIns.filter((c) => c.status === 'late').length,
    };
  }, [checkIns]);

  const sessionStatus: SessionStatus = useMemo(() => {
    if (currentSessionError) return 'error';
    if (currentSession?.status === 'active') return 'active';
    if (currentSession?.status === 'expired') return 'expired';
    return 'idle';
  }, [currentSession?.status, currentSessionError]);

  const timeRange = useMemo(() => {
    if (!currentSession) return '';

    const startsAt = getSessionStartsAt(currentSession);
    const endsAt = getSessionEndsAt(currentSession);

    if (!startsAt || !endsAt) return '';

    return `${format(new Date(startsAt), 'h:mm a')} - ${format(new Date(endsAt), 'h:mm a')}`;
  }, [currentSession]);

  const sessionMessage =
    currentSession?.message || qrScanDisplay.sessionName || 'No active QR session';

  const displayUrl = useMemo(() => {
    if (!origin) return '';
    return `${origin}/attendance/display`;
  }, [origin]);

  const copyDisplayUrl = useCallback(async () => {
    if (!displayUrl) return;

    try {
      await navigator.clipboard.writeText(displayUrl);
      toast.success(t('displayUrlCopied'));
    } catch {
      toast.error(t('unableToCopyDisplayUrl'));
    }
  }, [displayUrl, t]);

  const openDisplayPage = useCallback(() => {
    if (!displayUrl) return;
    window.open(displayUrl, '_blank', 'noopener,noreferrer');
  }, [displayUrl]);

  return (
    <RequireAccess
      permission="QR_SESSION_VIEW"
      roles={['ROLE_SUPER_ADMIN']}
      title={t('restrictedTitle')}
      description={t('restrictedDescription')}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title text-2xl tracking-tight">{t('pageTitle')}</h1>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipContent>
                <p>{t('secureBadgeTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <SessionControls
          sessionStatus={sessionStatus}
          message={sessionMessage}
          timeRange={timeRange}
          onRegenerateQR={regenerateQR}
          disableRegenerate={!sessionId || sessionStatus !== 'active' || updateQrSession.isPending}
        />

        {currentSessionError && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>
                {currentSessionErrorData instanceof Error
                  ? currentSessionErrorData.message
                  : t('unableToLoadCurrentSession')}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => void refetchCurrentSession()}
              >
                {t('retryLabel')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {sessionStatus === 'idle' ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <QrCode className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{t('sessionIdleTitle')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('sessionIdleDescription')}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <QRDisplay
                  errorMessage={qrScanDisplay.errorMessage}
                  lastUpdatedAt={qrScanDisplay.lastUpdatedAt}
                  qrAvailable={qrScanDisplay.qrAvailable}
                  qrToken={qrScanDisplay.qrToken}
                  sessionId={sessionId}
                  sessionMessage={sessionMessage}
                  timeRange={timeRange}
                  isRefreshing={isRefreshing}
                  isLoading={
                    currentSessionLoading ||
                    updateQrSession.isPending ||
                    qrScanDisplay.sessionStatus === 'loading'
                  }
                />
              </div>

              <div className="lg:col-span-1">
                {checkInsError && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertDescription className="flex items-center justify-between gap-3">
                      <span>
                        {checkInsErrorData instanceof Error
                          ? checkInsErrorData.message
                          : t('unableToLoadCheckIns')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() => {
                          void refetchCheckIns();
                        }}
                      >
                        {t('retryLabel')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <CheckInList checkIns={checkIns} isLoading={checkInsLoading} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SummaryCard
                label={t('totalScans')}
                value={stats.totalScans}
                icon={QrCode}
                color="text-slate-700"
                bg="bg-slate-50"
              />
              <SummaryCard
                label={t('checkedIn')}
                value={stats.checkedIn}
                icon={UserCheck}
                color="text-emerald-700"
                bg="bg-emerald-50"
              />
              <SummaryCard
                label={t('checkedOut')}
                value={stats.checkedOut}
                icon={UserX}
                color="text-blue-700"
                bg="bg-blue-50"
              />
              <SummaryCard
                label={t('late')}
                value={stats.late}
                icon={Clock}
                color="text-amber-700"
                bg="bg-amber-50"
              />
            </div>

            <div className="rounded-lg border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h3 className="font-khmer-moul-light text-base font-semibold text-foreground">
                    {t('kioskDisplayTitle')}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={copyDisplayUrl} disabled={!displayUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('copyUrl')}
                  </Button>
                  <Button onClick={openDisplayPage} disabled={!displayUrl}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('openDisplay')}
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-muted/60 px-4 py-3">
                <p className="break-all font-mono text-sm text-foreground">
                  {displayUrl || t('displayUrlFallback')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </RequireAccess>
  );
}
