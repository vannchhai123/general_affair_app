'use client';

import { ArrowUpRight, CalendarRange, CircleCheckBig, CircleDashed, CircleX } from 'lucide-react';
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
  onCardClick?: (status: string) => void;
}

export function InvitationStats({
  invitations,
  isLoading,
  selectedStatus = 'all',
  onSelectStatus,
  onCardClick,
}: InvitationStatsProps) {
  const total = invitations.length;
  const pending = invitations.filter((inv) => inv.status === 'pending').length;
  const accepted = invitations.filter((inv) => inv.status === 'accepted').length;
  const rejected = invitations.filter((inv) => inv.status === 'rejected').length;

  const stats = [
    {
      key: 'all',
      label: 'លិខិតសរុប',
      count: total,
      helper: 'លិខិតអញ្ជើញទាំងអស់',
      icon: CalendarRange,
      color: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
      activeBorder: 'ring-2 ring-indigo-500 border-indigo-200',
    },
    {
      key: 'pending',
      label: 'កំពុងរង់ចាំ',
      count: pending,
      helper: 'រង់ចាំការឆ្លើយតប',
      icon: CircleDashed,
      color: 'text-amber-700',
      iconBg: 'bg-amber-50 text-amber-700',
      activeBorder: 'ring-2 ring-amber-500 border-amber-200',
    },
    {
      key: 'accepted',
      label: 'បានទទួលយក',
      count: accepted,
      helper: 'បានយល់ព្រមចូលរួម',
      icon: CircleCheckBig,
      color: 'text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-700',
      activeBorder: 'ring-2 ring-emerald-500 border-emerald-200',
    },
    {
      key: 'rejected',
      label: 'បានបដិសេធ',
      count: rejected,
      helper: 'មិនអាចចូលរួមបាន',
      icon: CircleX,
      color: 'text-red-700',
      iconBg: 'bg-red-50 text-red-700',
      activeBorder: 'ring-2 ring-rose-500 border-rose-200',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.key}
            className="gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isClickable = Boolean(onCardClick || onSelectStatus);

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((item) => {
        const isSelected = selectedStatus === item.key;
        const Icon = item.icon;

        const handleClick = () => {
          onSelectStatus?.(item.key);
          onCardClick?.(item.key);
        };

        return (
          <Card
            key={item.key}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={handleClick}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleClick();
              }
            }}
            className={cn(
              'group relative gap-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200',
              isClickable
                ? 'cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99] select-none'
                : 'hover:shadow-md hover:border-slate-300',
              isSelected && item.activeBorder,
            )}
          >
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-khmer-moul-light text-[11px] text-muted-foreground">
                    {item.label}
                  </p>
                  <CardNumber
                    value={item.count}
                    className={`mt-2 block text-2xl font-semibold tracking-tight ${item.color}`}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {isClickable && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className={`rounded-xl p-2.5 ${item.iconBg}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>
              {item.helper && (
                <p className="mt-2 text-[11px] text-muted-foreground truncate font-medium">
                  {item.helper}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
