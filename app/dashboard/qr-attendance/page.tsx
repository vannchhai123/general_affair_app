'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { QrCode, Shield, UserCheck, UserX, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QRDisplay } from '@/components/qr/qr-display';
import { SessionControls } from '@/components/qr/session-controls';
import { CheckInList } from '@/components/qr/checkin-list';
import { SummaryCard } from '@/components/qr/summary-card';

// ─── Types ─────────────────────────────────────────────
export type SessionStatus = 'idle' | 'active' | 'paused' | 'stopped';

export interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
}

// ─── Mock Data Generator ───────────────────────────────
const MOCK_EMPLOYEES = [
  { name: 'John Doe', code: 'EMP-001' },
  { name: 'Jane Smith', code: 'EMP-002' },
  { name: 'Mike Johnson', code: 'EMP-003' },
  { name: 'Sarah Williams', code: 'EMP-004' },
  { name: 'David Brown', code: 'EMP-005' },
  { name: 'Emma Davis', code: 'EMP-006' },
  { name: 'Chris Wilson', code: 'EMP-007' },
  { name: 'Lisa Taylor', code: 'EMP-008' },
];

function generateCheckIn(): CheckInRecord {
  const emp = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)];
  const statuses: Array<'checked-in' | 'checked-out' | 'late'> = [
    'checked-in',
    'checked-out',
    'late',
  ];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const now = new Date();
  const time = format(now, 'hh:mm a');

  return {
    id: Date.now(),
    employeeName: emp.name,
    employeeCode: emp.code,
    time,
    status,
  };
}

// ─── Main Page Component ───────────────────────────────
const QR_REFRESH_INTERVAL = 60; // seconds

export default function QRAttendancePage() {
  // Session state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [sessionId, setSessionId] = useState('');
  const [countdown, setCountdown] = useState(QR_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isExpired = countdown <= 0;

  // Check-ins state
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate QR refresh
  const refreshQR = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSessionId(`QR-${Date.now().toString(36).toUpperCase()}`);
      setCountdown(QR_REFRESH_INTERVAL);
      setIsRefreshing(false);
    }, 500);
  }, []);

  // Start session
  const startSession = () => {
    setSessionStatus('active');
    refreshQR();
    toast.success('Session started');

    // Simulate incoming check-ins
    const interval = setInterval(() => {
      if (sessionStatus === 'active') {
        setCheckIns((prev) => [generateCheckIn(), ...prev].slice(0, 50));
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  // Pause session
  const pauseSession = () => {
    setSessionStatus('paused');
    toast.info('Session paused');
  };

  // Stop session
  const stopSession = () => {
    setSessionStatus('stopped');
    setCountdown(0);
    toast.warning('Session stopped');
  };

  // Regenerate QR
  const regenerateQR = () => {
    refreshQR();
    toast.success('QR code regenerated');
  };

  // Countdown timer
  useEffect(() => {
    if (sessionStatus !== 'active' || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshQR();
          return QR_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStatus, countdown, refreshQR]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalScans: checkIns.length,
      checkedIn: checkIns.filter((c) => c.status === 'checked-in').length,
      checkedOut: checkIns.filter((c) => c.status === 'checked-out').length,
      late: checkIns.filter((c) => c.status === 'late').length,
    };
  }, [checkIns]);

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
              <p>QR refreshes every 60 seconds to prevent misuse</p>
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
          <Button onClick={startSession} className="mt-6">
            <Play className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        </div>
      ) : (
        <>
          {/* QR Display + Live Check-ins */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* QR Code Section */}
            <div className="lg:col-span-2">
              <QRDisplay
                sessionId={sessionId}
                countdown={countdown}
                isRefreshing={isRefreshing}
                isLoading={isLoading}
              />
            </div>

            {/* Live Check-ins Section */}
            <div className="lg:col-span-1">
              <CheckInList checkIns={checkIns} />
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
