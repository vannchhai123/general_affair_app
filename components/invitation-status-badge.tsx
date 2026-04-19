'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Invitation } from '@/lib/schemas';

const statusStyles: Record<Invitation['status'], string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  completed: 'border-sky-200 bg-sky-50 text-sky-700',
};

export function InvitationStatusBadge({ status }: { status: Invitation['status'] }) {
  return (
    <Badge className={cn('rounded-full border px-2.5 py-1 capitalize', statusStyles[status])}>
      {status}
    </Badge>
  );
}
