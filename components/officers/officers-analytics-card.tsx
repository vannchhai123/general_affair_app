import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { DepartmentChartItem, OfficerStatusChartItem } from '@/lib/officers/page-utils';

const officerStatusChartConfig = {
  active: {
    label: 'សកម្ម',
    color: '#059669',
  },
  onLeave: {
    label: 'ច្បាប់ឈប់សម្រាក',
    color: '#d97706',
  },
  inactive: {
    label: 'មិនសកម្ម',
    color: '#64748b',
  },
} satisfies ChartConfig;

const departmentChartConfig = {
  officers: {
    label: 'ចំនួនមន្ត្រី',
    color: '#0f766e',
  },
} satisfies ChartConfig;

type OfficersAnalyticsCardProps = {
  statusChartData: OfficerStatusChartItem[];
  departmentChartData: DepartmentChartItem[];
};

export function OfficersAnalyticsCard({
  statusChartData,
  departmentChartData,
}: OfficersAnalyticsCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/80">
        <CardTitle className="text-base">ផ្ទាំងវិភាគមន្ត្រី</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 xl:grid-cols-2">
        <div className="rounded-3xl border bg-white p-4">
          <p className="text-sm font-medium text-slate-900">ស្ថានភាពមន្ត្រី</p>
          <ChartContainer
            config={officerStatusChartConfig}
            className="mx-auto mt-4 h-[300px] w-full max-w-[340px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="key" />}
              />
              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="key"
                innerRadius={70}
                outerRadius={106}
                paddingAngle={4}
                strokeWidth={0}
              >
                {statusChartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="key" className="flex-wrap gap-3" />}
              />
            </PieChart>
          </ChartContainer>
        </div>

        <div className="rounded-3xl border bg-white p-4">
          <p className="text-sm font-medium text-slate-900">ការចែកចាយតាមនាយកដ្ឋាន</p>
          {departmentChartData.length > 0 ? (
            <ChartContainer config={departmentChartConfig} className="mt-4 h-[320px] w-full">
              <BarChart
                accessibilityLayer
                data={departmentChartData}
                margin={{ left: 10, right: 10, top: 10 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="department"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  interval={0}
                  angle={departmentChartData.length > 3 ? -12 : 0}
                  textAnchor={departmentChartData.length > 3 ? 'end' : 'middle'}
                  height={60}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="officers" fill="var(--color-officers)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed bg-slate-50/70 p-5 text-sm text-muted-foreground">
              មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់គូសក្រាហ្វតាមនាយកដ្ឋានទេ។
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
