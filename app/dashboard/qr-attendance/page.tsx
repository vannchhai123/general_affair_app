'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QrCode, Shield, UserCheck, UserX, Clock, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QRDisplay } from '@/components/qr/qr-display';
import { SessionControls } from '@/components/qr/session-controls';
import { CheckInList } from '@/components/qr/checkin-list';
import { SummaryCard } from '@/components/qr/summary-card';
import { useUpdateQrSession } from '@/hooks/qr-sessions/use-qr-session-mutations';
import { useCurrentQrSession } from '@/hooks/qr-sessions/use-qr-session';
import { useQrSessionCheckIns } from '@/hooks/qr-sessions/use-qr-checkins';
import { useQrScanDisplay } from '@/hooks/qr-sessions/use-qr-scan-display';
import { format } from 'date-fns';

// ─── Types ─────────────────────────────────────────────
export type SessionStatus = 'idle' | 'active' | 'expired' | 'error';

export interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
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
      toast.success('បានបង្កើត QR ឡើងវិញ');
    } catch (error) {
      setIsRefreshing(false);
      toast.error('មិនអាចបង្កើត QR ឡើងវិញបានទេ');
    }
  };

  const checkIns: CheckInRecord[] = useMemo(() => {
    return checkInsData.map((checkIn: any) => ({
      id: checkIn.id,
      employeeName: checkIn.officer_name ?? checkIn.employee_name ?? 'មន្ត្រីមិនស្គាល់',
      employeeCode: checkIn.officer_code ?? checkIn.employee_code ?? '--',
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

  const sessionStatus: SessionStatus = useMemo(() => {
    if (currentSessionError) return 'error';
    if (currentSession?.status === 'active') return 'active';
    if (currentSession?.status === 'expired') return 'expired';
    return 'idle';
  }, [currentSession?.status, currentSessionError]);

  const timeRange = useMemo(() => {
    if (!currentSession?.starts_at || !currentSession?.ends_at) return '';

    return `${format(new Date(currentSession.starts_at), 'h:mm a')} - ${format(
      new Date(currentSession.ends_at),
      'h:mm a',
    )}`;
  }, [currentSession?.ends_at, currentSession?.starts_at]);

  const sessionMessage =
    currentSession?.message || qrScanDisplay.sessionName || 'មិនមានសម័យ QR សកម្ម';

  const displayUrl = useMemo(() => {
    if (!origin) return '';
    return `${origin}/attendance/display`;
  }, [origin]);

  const copyDisplayUrl = useCallback(async () => {
    if (!displayUrl) return;

    try {
      await navigator.clipboard.writeText(displayUrl);
      toast.success('បានចម្លងតំណបង្ហាញ');
    } catch (error) {
      toast.error('មិនអាចចម្លងតំណបង្ហាញបានទេ');
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">សម័យវត្តមាន QR</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            បង្ហាញ QR សុវត្ថិភាពសម្រាប់ឆែកចូល និងឆែកចេញរបស់មន្ត្រី
          </p>
        </div>

        {/* Security Badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs">សុវត្ថិភាព • QR ផុតកំណត់ដោយស្វ័យប្រវត្តិ</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>QR នឹងធ្វើបច្ចុប្បន្នភាពតាមការកំណត់របស់សម័យសកម្ម</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Session Controls */}
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
                : 'មិនអាចផ្ទុកសម័យ QR បច្ចុប្បន្នបានទេ។'}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => void refetchCurrentSession()}
            >
              ព្យាយាមម្តងទៀត
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {sessionStatus === 'idle' ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <QrCode className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">មិនមានសម័យ QR សកម្ម</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            ភាពអាចប្រើបានរបស់ QR ត្រូវបានគ្រប់គ្រងដោយកាលវិភាគពី backend។
          </p>
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

            {/* Live Check-ins Section */}
            <div className="lg:col-span-1">
              {checkInsError && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription className="flex items-center justify-between gap-3">
                    <span>
                      {checkInsErrorData instanceof Error
                        ? checkInsErrorData.message
                        : 'មិនអាចផ្ទុកការឆែកចូលផ្ទាល់បានទេ។'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => {
                        void refetchCheckIns();
                      }}
                    >
                      ព្យាយាមម្តងទៀត
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
                <h3 className="text-base font-semibold text-foreground">តំណបង្ហាញ Kiosk</h3>
                <p className="text-sm text-muted-foreground">
                  បើកទំព័រសាធារណៈនេះលើថេប្លេត ទូរទស្សន៍ ឬអេក្រង់បន្ថែម សម្រាប់ស្កេនវត្តមាន។
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copyDisplayUrl} disabled={!displayUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  ចម្លងតំណ
                </Button>
                <Button onClick={openDisplayPage} disabled={!displayUrl}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  បើកផ្ទាំងបង្ហាញ
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-muted/60 px-4 py-3">
              <p className="break-all font-mono text-sm text-foreground">
                {displayUrl || 'មិនអាចបង្កើត URL សម្រាប់ផ្ទាំងបង្ហាញសាធារណៈបានទេ។'}
              </p>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              label="ស្កេនសរុប"
              value={stats.totalScans}
              icon={QrCode}
              color="text-slate-700"
              bg="bg-slate-50"
            />
            <SummaryCard
              label="បានឆែកចូល"
              value={stats.checkedIn}
              icon={UserCheck}
              color="text-emerald-700"
              bg="bg-emerald-50"
            />
            <SummaryCard
              label="បានឆែកចេញ"
              value={stats.checkedOut}
              icon={UserX}
              color="text-blue-700"
              bg="bg-blue-50"
            />
            <SummaryCard
              label="មកយឺត"
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
