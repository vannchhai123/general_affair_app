import { Clock, UserCheck, UserMinus, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { Skeleton } from '@/components/ui/skeleton';
import type { OfficerStats } from '@/lib/officers/page-utils';

type OfficersSummaryCardsProps = {
  stats?: OfficerStats;
  isLoading: boolean;
};

export function OfficersSummaryCards({ stats, isLoading }: OfficersSummaryCardsProps) {
  const totalOfficers = stats?.total ?? 0;
  const cards = [
    {
      label: 'សរុប',
      value: stats?.total ?? 0,
      progress: totalOfficers > 0 ? 100 : 0,
      icon: Users,
      color: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
      bar: 'bg-slate-700',
      helper: 'មន្ត្រីដែលបានចុះបញ្ជីទាំងអស់',
    },
    {
      label: 'សកម្ម',
      value: stats?.active ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.active ?? 0) / totalOfficers) * 100) : 0,
      icon: UserCheck,
      color: 'text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-600',
      helper: 'ត្រៀមបំពេញភារកិច្ច',
    },
    {
      label: 'ច្បាប់ឈប់សម្រាក',
      value: stats?.onLeave ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.onLeave ?? 0) / totalOfficers) * 100) : 0,
      icon: Clock,
      color: 'text-amber-700',
      iconBg: 'bg-amber-50 text-amber-700',
      bar: 'bg-amber-500',
      helper: 'កំពុងសម្រាកច្បាប់',
    },
    {
      label: 'មិនសកម្ម',
      value: stats?.inactive ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.inactive ?? 0) / totalOfficers) * 100) : 0,
      icon: UserMinus,
      color: 'text-red-700',
      iconBg: 'bg-red-50 text-red-700',
      bar: 'bg-red-500',
      helper: 'កំណត់ត្រាមិនសកម្ម',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="gap-4 overflow-hidden rounded-lg">
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

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="gap-0 overflow-hidden rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <CardNumber
                  value={card.value}
                  className={`mt-2 block text-3xl font-semibold tracking-tight ${card.color}`}
                />
                <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
              </div>
              <div className={`rounded-md p-2.5 ${card.iconBg}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${card.bar}`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
