import { Card } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';

export type DashboardStatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtext?: string;
  tone: {
    chip: string;
    icon: string;
    value?: string;
  };
};

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  tone,
  subtext,
}: DashboardStatCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-600 truncate leading-relaxed font-khmer-moul-light">
          {title}
        </span>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${tone.chip}`}
        >
          <Icon className={`h-4 w-4 ${tone.icon}`} />
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <CardNumber value={value} className="text-2xl font-bold tracking-tight text-slate-900" />
        {subtext && (
          <span className="text-[11px] text-muted-foreground truncate font-medium">{subtext}</span>
        )}
      </div>
    </Card>
  );
}
