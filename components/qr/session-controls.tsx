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

const KHMER_DAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

const KHMER_MONTHS = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
];

export function SessionControls({
  sessionStatus,
  message,
  timeRange,
  onRegenerateQR,
  disableRegenerate = false,
}: SessionControlsProps) {
  const [currentDateLabel, setCurrentDateLabel] = useState('');

  useEffect(() => {
    const now = new Date();
    const dayName = KHMER_DAYS[now.getDay()];
    const monthName = KHMER_MONTHS[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();

    setCurrentDateLabel(`${dayName}, ${monthName} ${day}, ${year}`);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-md font-medium">{currentDateLabel || '--'}</span>
            </div>
            <SessionStatusBadge status={sessionStatus} />
          </div>
          <div className="space-y-1"></div>
        </div>
      </div>
    </div>
  );
}
