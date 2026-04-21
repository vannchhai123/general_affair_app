'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QrCode, Shield, UserCheck, UserX, Clock, Play, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QRDisplay } from '@/components/qr/qr-display';
import { SessionControls } from '@/components/qr/session-controls';
import { CheckInList } from '@/components/qr/checkin-list';
import { SummaryCard } from '@/components/qr/summary-card';
import {
  useCreateQrSession,
  useUpdateQrSession,
} from '@/hooks/qr-sessions/use-qr-session-mutations';
import { useQrSession } from '@/hooks/qr-sessions/use-qr-session';
import { useQrSessionCheckIns } from '@/hooks/qr-sessions/use-qr-checkins';
import { useQrScanDisplay } from '@/hooks/qr-sessions/use-qr-scan-display';

// ─── Types ─────────────────────────────────────────────
export type SessionStatus = 'idle' | 'active' | 'paused' | 'stopped';

export interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
}

const QR_REFRESH_INTERVAL = 3600;

export default function QRAttendancePage() {
  // Session state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [sessionId, setSessionId] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [origin, setOrigin] = useState('');

  // Check-ins state - now fetched from API
  const { data: checkInsData = [], isLoading: checkInsLoading } = useQrSessionCheckIns(sessionId);

  // API hooks
  const createQrSession = useCreateQrSession();
  const updateQrSession = useUpdateQrSession();
  const { data: qrSessionData } = useQrSession(sessionId || '');
  const qrScanDisplay = useQrScanDisplay(sessionId);

  // Map API status to local status
  const mapApiStatus = (apiStatus?: string): SessionStatus => {
    switch (apiStatus) {
      case 'active':
        return 'active';
      case 'paused':
        return 'paused';
      case 'stopped':
        return 'stopped';
      default:
        return 'idle';
    }
  };

  // Update local status when API data changes
  useEffect(() => {
    if (qrSessionData?.status) {
      setSessionStatus(mapApiStatus(qrSessionData.status));
    }
  }, [qrSessionData?.status]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Start session - call API to create QR session
  const startSession = async () => {
    try {
      const response = await createQrSession.mutateAsync({
        createdBy: 1, // TODO: Get from auth context
        durationSeconds: QR_REFRESH_INTERVAL,
        location: 'Main Office',
      });

      setSessionId(response.id);
      setSessionStatus('active');
      toast.success('Session started');
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  // Pause session - call API to update status
  const pauseSession = async () => {
    if (!sessionId) return;

    try {
      await updateQrSession.mutateAsync({
        id: sessionId,
        data: { action: 'pause' },
      });
      setSessionStatus('paused');
      toast.info('Session paused');
    } catch (error) {
      toast.error('Failed to pause session');
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;

    try {
      await updateQrSession.mutateAsync({
        id: sessionId,
        data: { action: 'stop' },
      });
      setSessionStatus('stopped');
      toast.warning('Session stopped');
    } catch (error) {
      toast.error('Failed to stop session');
    }
  };

  const regenerateQR = async () => {
    if (!sessionId) return;

    setIsRefreshing(true);
    try {
      const response = await updateQrSession.mutateAsync({
        id: sessionId,
        data: { action: 'regenerate' },
      });

      setSessionId(response.id);
      qrScanDisplay.refetchQr();
      setIsRefreshing(false);
      toast.success('QR code regenerated');
    } catch (error) {
      setIsRefreshing(false);
      toast.error('Failed to regenerate QR');
    }
  };

  const checkIns: CheckInRecord[] = useMemo(() => {
    return checkInsData.map((checkIn: any) => ({
      id: checkIn.id,
      employeeName: checkIn.employee_name,
      employeeCode: checkIn.employee_code,
      time: new Date(checkIn.scanned_at).toLocaleTimeString(),
      status: checkIn.status as 'checked-in' | 'checked-out' | 'late',
    }));
  }, [checkInsData]);

  const stats = useMemo(() => {
    return {
      totalScans: checkIns.length,
      checkedIn: checkIns.filter((c) => c.status === 'checked-in').length,
      checkedOut: checkIns.filter((c) => c.status === 'checked-out').length,
      late: checkIns.filter((c) => c.status === 'late').length,
    };
  }, [checkIns]);

  const displayUrl = useMemo(() => {
    if (!sessionId || !origin) return '';
    return `${origin}/attendance/display?sessionId=${encodeURIComponent(sessionId)}`;
  }, [origin, sessionId]);

  const copyDisplayUrl = useCallback(async () => {
    if (!displayUrl) return;

    try {
      await navigator.clipboard.writeText(displayUrl);
      toast.success('Display link copied');
    } catch (error) {
      toast.error('Failed to copy display link');
    }
  }, [displayUrl]);

  const openDisplayPage = useCallback(() => {
    if (!displayUrl) return;
    window.open(displayUrl, '_blank', 'noopener,noreferrer');
  }, [displayUrl]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            QR Attendance Session
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a secure QR code for employee check-in and check-out
          </p>
        </div>

        {/* Security Badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs">Secure • Auto-expiring QR</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>QR refreshes every hour based on the active session configuration</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Session Controls */}
      <SessionControls
        sessionStatus={sessionStatus}
        onStartSession={startSession}
        onPauseSession={pauseSession}
        onStopSession={stopSession}
        onRegenerateQR={regenerateQR}
      />

      {sessionStatus === 'idle' ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <QrCode className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No active QR session</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a session to generate a QR code for attendance
          </p>
          <Button onClick={startSession} className="mt-6" disabled={createQrSession.isPending}>
            <Play className="mr-2 h-4 w-4" />
            {createQrSession.isPending ? 'Starting...' : 'Start Session'}
          </Button>
        </div>
      ) : (
        <>
          {/* QR Display + Live Check-ins */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* QR Code Section */}
            <div className="lg:col-span-2">
              <QRDisplay
                errorMessage={qrScanDisplay.errorMessage}
                lastUpdatedAt={qrScanDisplay.lastUpdatedAt}
                qrAvailable={qrScanDisplay.qrAvailable}
                qrToken={qrScanDisplay.qrToken}
                sessionId={sessionId}
                isRefreshing={isRefreshing}
                isLoading={
                  createQrSession.isPending ||
                  updateQrSession.isPending ||
                  (Boolean(sessionId) && qrScanDisplay.sessionStatus === 'loading')
                }
              />
            </div>

            {/* Live Check-ins Section */}
            <div className="lg:col-span-1">
              <CheckInList checkIns={checkIns} isLoading={checkInsLoading} />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Kiosk Display Link</h3>
                <p className="text-sm text-muted-foreground">
                  Open this public page on a tablet, TV, or secondary screen for attendance
                  scanning.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copyDisplayUrl} disabled={!displayUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button onClick={openDisplayPage} disabled={!displayUrl}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Display
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-muted/60 px-4 py-3">
              <p className="break-all font-mono text-sm text-foreground">
                {displayUrl || 'Start a session to generate the public display URL.'}
              </p>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              label="Total Scans"
              value={stats.totalScans}
              icon={QrCode}
              color="text-slate-700"
              bg="bg-slate-50"
            />
            <SummaryCard
              label="Checked-in"
              value={stats.checkedIn}
              icon={UserCheck}
              color="text-emerald-700"
              bg="bg-emerald-50"
            />
            <SummaryCard
              label="Checked-out"
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
  );
}
