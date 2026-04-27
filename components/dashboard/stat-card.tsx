import { Card, CardContent } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';

export type DashboardStatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  tone: string;
};

export function DashboardStatCard({ title, value, icon: Icon, tone }: DashboardStatCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-khmer-moul-light text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <CardNumber
              value={value}
              className="mt-2 block text-3xl font-semibold tracking-tight text-slate-950"
            />
          </div>
          <div className={`rounded-md p-2.5 ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
