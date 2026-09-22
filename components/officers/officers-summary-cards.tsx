import { ArrowUpRight, Clock, UserCheck, UserMinus, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { Skeleton } from '@/components/ui/skeleton';
import type { OfficerStats } from '@/lib/officers/page-utils';

export type OfficerStatFilterKey = 'all' | 'active' | 'on_leave' | 'inactive';

type OfficersSummaryCardsProps = {
  stats?: OfficerStats;
  isLoading: boolean;
  onCardClick?: (filter: OfficerStatFilterKey) => void;
};

export function OfficersSummaryCards({ stats, isLoading, onCardClick }: OfficersSummaryCardsProps) {
  const totalOfficers = stats?.total ?? 0;
  const cards: Array<{
    key: OfficerStatFilterKey;
    label: string;
    value: number;
    progress: number;
    icon: React.ElementType;
    color: string;
    iconBg: string;
    bar: string;
    helper: string;
  }> = [
    {
      key: 'all',
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
      key: 'active',
      label: 'ដំណើរការ',
      value: stats?.active ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.active ?? 0) / totalOfficers) * 100) : 0,
      icon: UserCheck,
      color: 'text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-600',
      helper: 'ត្រៀមបំពេញភារកិច្ច',
    },
    {
      key: 'on_leave',
      label: 'សុំច្បាប់',
      value: stats?.onLeave ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.onLeave ?? 0) / totalOfficers) * 100) : 0,
      icon: Clock,
      color: 'text-amber-700',
      iconBg: 'bg-amber-50 text-amber-700',
      bar: 'bg-amber-500',
      helper: 'កំពុងសម្រាកច្បាប់',
    },
    {
      key: 'inactive',
      label: 'ផ្អាកបណ្តោះអាសន្ន',
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
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
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

  const isClickable = Boolean(onCardClick);

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onClick={() => onCardClick?.(card.key)}
          onKeyDown={(e) => {
            if (onCardClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onCardClick(card.key);
            }
          }}
          className={`group relative gap-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 ${
            isClickable
              ? 'cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99] select-none'
              : 'hover:shadow-md hover:border-slate-300'
          }`}
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-khmer-moul-light text-[11px] text-muted-foreground">
                  {card.label}
                </p>
                <CardNumber
                  value={card.value}
                  className={`mt-2 block text-2xl font-semibold tracking-tight ${card.color}`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {isClickable && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                  <card.icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>
            {card.helper && (
              <p className="mt-2 text-[11px] text-muted-foreground truncate font-medium">
                {card.helper}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
