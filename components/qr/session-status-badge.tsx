'use client';

import { Wifi, WifiOff, AlertTriangle, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SessionStatus } from '@/app/dashboard/qr-attendance/page';

interface SessionStatusBadgeProps {
  status: SessionStatus;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const config = {
    idle: { label: 'Inactive', color: 'bg-slate-100 text-slate-700', icon: WifiOff },
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: Wifi },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: Square },
    error: { label: 'Error', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <Badge className={`flex items-center gap-1.5 px-3 py-1.5 ${color} border-0`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
