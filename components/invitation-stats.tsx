'use client';

import { CalendarRange, CircleCheckBig, CircleDashed, CircleX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Invitation } from '@/lib/schemas';

interface InvitationStatsProps {
  invitations: Invitation[];
  isLoading: boolean;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export function InvitationStats({
  invitations,
  isLoading,
  selectedStatus = 'all',
  onSelectStatus,
}: InvitationStatsProps) {
  const total = invitations.length;
  const pending = invitations.filter((inv) => inv.status === 'pending').length;
  const accepted = invitations.filter((inv) => inv.status === 'accepted').length;
  const rejected = invitations.filter((inv) => inv.status === 'rejected').length;

  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const acceptedPct = total > 0 ? Math.round((accepted / total) * 100) : 0;
  const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;

  const stats = [
    {
      key: 'all',
      label: 'លិខិតអញ្ជើញសរុប',
      count: total,
      pct: `${total} លិខិត`,
      icon: CalendarRange,
      iconBg: 'bg-indigo-50 text-indigo-600',
      activeClass: 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/20',
      pillBg: 'bg-slate-100 text-slate-600',
    },
    {
      key: 'pending',
      label: 'កំពុងរង់ចាំ',
      count: pending,
      pct: `${pendingPct}%`,
      icon: CircleDashed,
      iconBg: 'bg-amber-50 text-amber-600',
      activeClass: 'ring-2 ring-amber-500 border-amber-200 bg-amber-50/20',
      pillBg: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'accepted',
      label: 'បានទទួលយក',
      count: accepted,
      pct: `${acceptedPct}%`,
      icon: CircleCheckBig,
      iconBg: 'bg-emerald-50 text-emerald-600',
      activeClass: 'ring-2 ring-emerald-500 border-emerald-200 bg-emerald-50/20',
      pillBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'rejected',
      label: 'បានបដិសេធ',
      count: rejected,
      pct: `${rejectedPct}%`,
      icon: CircleX,
      iconBg: 'bg-rose-50 text-rose-600',
      activeClass: 'ring-2 ring-rose-500 border-rose-200 bg-rose-50/20',
      pillBg: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((item) => {
        const isSelected = selectedStatus === item.key;
        const Icon = item.icon;

        return (
          <Card
            key={item.key}
            onClick={() => onSelectStatus?.(item.key)}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-150 cursor-pointer shadow-xs hover:border-slate-300 hover:shadow-sm',
              isSelected ? item.activeClass : 'hover:bg-slate-50/50',
            )}
          >
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-slate-500 line-clamp-1">{item.label}</span>
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                    item.iconBg,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-2">
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <CardNumber
                    value={item.count}
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
                  />
                )}

                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.5 text-[11px] font-medium tracking-tight',
                    item.pillBg,
                  )}
                >
                  {item.pct}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
