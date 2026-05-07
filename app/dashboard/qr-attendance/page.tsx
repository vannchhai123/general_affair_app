'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QrCode, Shield, UserCheck, UserX, Clock, Copy, ExternalLink } from 'lucide-react';
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
      toast.success('QR regenerated successfully');
    } catch {
      setIsRefreshing(false);
      toast.error('Unable to regenerate QR');
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
          'Unknown officer',
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
      toast.success('Display URL copied');
    } catch {
      toast.error('Unable to copy display URL');
    }
  }, [displayUrl]);

  const openDisplayPage = useCallback(() => {
    if (!displayUrl) return;
    window.open(displayUrl, '_blank', 'noopener,noreferrer');
  }, [displayUrl]);

  return (
    <RequireAccess
      permission="QR_SESSION_VIEW"
      roles={['ROLE_SUPER_ADMIN']}
      title="QR attendance is restricted"
      description="Only super-admins can access QR attendance tools."
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title text-2xl tracking-tight">QR Attendance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the live QR session for officer check-in and check-out.
            </p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs">Secure rotating QR</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>QR availability and timing are now driven by the active backend shift.</p>
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
                  : 'Unable to load the current QR session.'}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => void refetchCurrentSession()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {sessionStatus === 'idle' ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <QrCode className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No active QR session</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Session availability now follows the backend&apos;s dynamic shift schedule.
            </p>
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
                          : 'Unable to load live check-ins.'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() => {
                          void refetchCheckIns();
                        }}
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <CheckInList checkIns={checkIns} isLoading={checkInsLoading} />
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Kiosk Display</h3>
                  <p className="text-sm text-muted-foreground">
                    Open the public display on a kiosk or secondary screen for QR attendance.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={copyDisplayUrl} disabled={!displayUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button onClick={openDisplayPage} disabled={!displayUrl}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Display
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-muted/60 px-4 py-3">
                <p className="break-all font-mono text-sm text-foreground">
                  {displayUrl || 'Unable to generate the display URL.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SummaryCard
                label="Total scans"
                value={stats.totalScans}
                icon={QrCode}
                color="text-slate-700"
                bg="bg-slate-50"
              />
              <SummaryCard
                label="Checked in"
                value={stats.checkedIn}
                icon={UserCheck}
                color="text-emerald-700"
                bg="bg-emerald-50"
              />
              <SummaryCard
                label="Checked out"
                value={stats.checkedOut}
                icon={UserX}
                color="text-blue-700"
                bg="bg-blue-50"
              />
              <SummaryCard
                label="Late"
                value={stats.late}
                icon={Clock}
                color="text-amber-700"
                bg="bg-amber-50"
              />
            </div>
          </>
        )}
      </div>
    </RequireAccess>
  );
}
