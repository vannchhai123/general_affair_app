'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionStatus } from '@/app/dashboard/qr-attendance/page';
import { SessionStatusBadge } from './session-status-badge';

interface SessionControlsProps {
  sessionStatus: SessionStatus;
  message: string;
  timeRange: string;
  onRegenerateQR: () => void;
  disableRegenerate?: boolean;
}

export function SessionControls({
  sessionStatus,
  message,
  timeRange,
  onRegenerateQR,
  disableRegenerate = false,
}: SessionControlsProps) {
  const [currentDateLabel, setCurrentDateLabel] = useState('');

  useEffect(() => {
    setCurrentDateLabel(
      new Intl.DateTimeFormat('km-KH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    );
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentDateLabel || '--'}</span>
            </div>
            <SessionStatusBadge status={sessionStatus} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              {timeRange || 'ភាពអាចប្រើបានរបស់សម័យ QR ត្រូវបានគ្រប់គ្រងដោយ backend។'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={onRegenerateQR}
            disabled={disableRegenerate}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            ធ្វើបច្ចុប្បន្នភាព QR
          </Button>
        </div>
      </div>
    </div>
  );
}
