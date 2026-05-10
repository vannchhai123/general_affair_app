import { Card, CardContent } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';

export type DashboardStatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  tone: {
    chip: string;
    icon: string;
    value: string;
  };
};

export function DashboardStatCard({ title, value, icon: Icon, tone }: DashboardStatCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-khmer-moul-light text-sm font-medium text-slate-600">{title}</p>
            <CardNumber
              value={value}
              className={`page-title mt-2 block text-2xl font-semibold tracking-tight ${tone.value}`}
            />
          </div>
          <div className={`rounded-xl border p-2.5 shadow-sm ${tone.chip}`}>
            <Icon className={`h-5 w-5 ${tone.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
