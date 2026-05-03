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
    label: 'ចំនួនមន្រ្តី',
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
    <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="font-khmer-moul-light text-sm text-foreground">
            ស្ថានភាពមន្រ្តី
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <ChartContainer
            config={officerStatusChartConfig}
            className="mx-auto h-[250px] w-full max-w-[300px]"
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
                innerRadius={58}
                outerRadius={92}
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
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="font-khmer-moul-light text-sm text-foreground">
            ការចែកចាយតាមនាយកដ្ឋាន
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {departmentChartData.length > 0 ? (
            <ChartContainer config={departmentChartConfig} className="h-[250px] w-full">
              <BarChart
                accessibilityLayer
                data={departmentChartData}
                margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="department"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  interval={0}
                  angle={departmentChartData.length > 3 ? -10 : 0}
                  textAnchor={departmentChartData.length > 3 ? 'end' : 'middle'}
                  height={56}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="officers" fill="var(--color-officers)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50/70 p-5 text-sm text-muted-foreground">
              មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់បង្ហាញតាមនាយកដ្ឋាន។
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
