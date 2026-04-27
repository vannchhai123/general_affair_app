import { AlertCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';

export type AttentionMetric = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: string;
};

export type AttentionItemData = {
  title: string;
  helper: string;
  value: number;
  icon: React.ElementType;
  tone: string;
};

export function AttentionSummaryCard({
  badge,
  prefix,
  total,
  suffix,
  metrics,
}: {
  badge: string;
  prefix?: string;
  total: number;
  suffix: string;
  metrics: AttentionMetric[];
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* <Badge className="border-0 bg-slate-900 text-white hover:bg-slate-900">{badge}</Badge>   */}
            <h2 className="page-title mt-4 text-xl tracking-tight">
              {prefix ? `${prefix} ` : ''}
              <CardNumber value={total} /> {suffix}
            </h2>
          </div>
          <div className="rounded-md bg-amber-50 p-3 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-slate-50 p-3">
              <metric.icon className={`h-4 w-4 ${metric.tone}`} />
              <CardNumber
                value={metric.value}
                className="mt-2 block text-xl font-semibold text-slate-950"
              />
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AttentionListCard({ title, items }: { title: string; items: AttentionItemData[] }) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/80">
        <CardTitle className="page-title text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4">
        {items.map((item) => (
          <AttentionItem key={item.title} {...item} />
        ))}
      </CardContent>
    </Card>
  );
}

function AttentionItem({ icon: Icon, title, helper, value, tone }: AttentionItemData) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-md p-2.5 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-khmer-moul-light truncate text-sm font-medium text-slate-950">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
      <CardNumber value={value} className="text-xl font-semibold tracking-tight text-purple-950" />
    </div>
  );
}
