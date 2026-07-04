'use client';

import { CalendarRange, CircleCheckBig, CircleDashed, CircleX, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { Skeleton } from '@/components/ui/skeleton';
import type { Invitation } from '@/lib/schemas';

const statsConfig = [
  {
    key: 'total',
    label: 'លិខិតអញ្ជើញសរុប',
    icon: CalendarRange,
    accent: 'bg-slate-500',
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-100',
  },
  {
    key: 'pending',
    label: 'កំពុងរង់ចាំ',
    icon: CircleDashed,
    accent: 'bg-amber-500',
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
  },
  {
    key: 'accepted',
    label: 'បានទទួលយក',
    icon: CircleCheckBig,
    accent: 'bg-emerald-500',
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
  },
  {
    key: 'rejected',
    label: 'បានបដិសេធ',
    icon: CircleX,
    accent: 'bg-rose-500',
    iconColor: 'text-rose-700',
    iconBg: 'bg-rose-100',
  },
  {
    key: 'completed',
    label: 'បានបញ្ចប់',
    icon: CheckSquare,
    accent: 'bg-sky-500',
    iconColor: 'text-sky-700',
    iconBg: 'bg-sky-100',
  },
] as const;

export function InvitationStats({
  invitations,
  isLoading,
}: {
  invitations: Invitation[];
  isLoading: boolean;
}) {
  const counts = {
    total: invitations.length,
    pending: invitations.filter((invitation) => invitation.status === 'pending').length,
    accepted: invitations.filter((invitation) => invitation.status === 'accepted').length,
    rejected: invitations.filter((invitation) => invitation.status === 'rejected').length,
    completed: invitations.filter((invitation) => invitation.status === 'completed').length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statsConfig.map((item) => (
        <Card key={item.key} className="overflow-hidden rounded-xl border shadow-sm">
          <CardContent className="relative p-0">
            <div className={`h-1 w-full ${item.accent}`} />
            <div className="flex items-start justify-between px-5 py-5">
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="mb-3 h-8 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </>
                ) : (
                  <>
                    <CardNumber
                      value={counts[item.key]}
                      className="block text-3xl font-semibold tracking-tight"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </>
                )}
              </div>
              <div className={`rounded-xl p-3 ${item.iconBg}`}>
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
