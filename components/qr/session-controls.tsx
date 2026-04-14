'use client';

import { Play, Pause, Square, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import type { SessionStatus } from '@/app/dashboard/qr-attendance/page';
import { SessionStatusBadge } from './session-status-badge';

interface SessionControlsProps {
  sessionStatus: SessionStatus;
  onStartSession: () => void;
  onPauseSession: () => void;
  onStopSession: () => void;
  onRegenerateQR: () => void;
}

export function SessionControls({
  sessionStatus,
  onStartSession,
  onPauseSession,
  onStopSession,
  onRegenerateQR,
}: SessionControlsProps) {
  return (
    <>
      {/* Error Alert */}
      {sessionStatus === 'stopped' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Session expired. Please regenerate QR.</span>
            <Button variant="outline" size="sm" onClick={onRegenerateQR} className="ml-auto">
              <RefreshCw className="mr-2 h-3 w-3" />
              Regenerate
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Top Control Section */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Date & Status */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <SessionStatusBadge status={sessionStatus} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onStartSession}
              disabled={sessionStatus === 'active'}
              className="flex-1 sm:flex-none"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Session
            </Button>
            <Button
              variant="outline"
              onClick={onPauseSession}
              disabled={sessionStatus !== 'active'}
              className="flex-1 sm:flex-none"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button
              variant="outline"
              onClick={onStopSession}
              disabled={sessionStatus === 'idle' || sessionStatus === 'stopped'}
              className="flex-1 sm:flex-none"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <Button
              variant="outline"
              onClick={onRegenerateQR}
              disabled={sessionStatus === 'idle'}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate QR
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
