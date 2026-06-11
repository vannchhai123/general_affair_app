'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import type { DepartmentChartItem } from '@/lib/officers/page-utils';

type DonutChartSlice = {
  key: string;
  label: string;
  value: number;
  fill: string;
};

type OfficersAnalyticsCardProps = {
  departmentChartData: DepartmentChartItem[];
  permanentChartData: DonutChartSlice[];
  contractChartData: DonutChartSlice[];
  maleCount: number;
  femaleCount: number;
};

const donutChartConfig = {
  male: {
    label: 'ប្រុស',
    color: '#0052CC',
  },
  female: {
    label: 'ស្រី',
    color: '#A71930',
  },
} satisfies ChartConfig;

const departmentChartConfig = {
  officers: {
    label: 'មន្ត្រី',
    color: '#0052CC',
  },
} satisfies ChartConfig;

// Helper function to truncate long text
const truncateText = (text: string, maxLength: number = 18) => {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  }
  return text;
};

// Custom tooltip component for department chart
const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const { department, officers } = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-slate-300 rounded shadow-lg">
        <p className="text-sm font-semibold">{department}</p>
        <p className="text-sm font-semibold">មន្ត្រី: {officers}</p>
      </div>
    );
  }
  return null;
};

export function OfficersAnalyticsCard({
  departmentChartData,
  permanentChartData,
  contractChartData,
  maleCount,
  femaleCount,
}: OfficersAnalyticsCardProps) {
  const permanentTotal = useMemo(
    () => permanentChartData.reduce((sum, item) => sum + item.value, 0),
    [permanentChartData],
  );
  const contractTotal = useMemo(
    () => contractChartData.reduce((sum, item) => sum + item.value, 0),
    [contractChartData],
  );

  const combinedGenderTotal = maleCount + femaleCount;
  const malePercent = combinedGenderTotal ? Math.round((maleCount / combinedGenderTotal) * 100) : 0;
  const femalePercent = combinedGenderTotal ? 100 - malePercent : 0;

  const departmentTotal = departmentChartData.reduce((sum, entry) => sum + entry.officers, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Three cards layout: 2 on left, 1 on right */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left column: 2 stacked donut cards */}
        <div className="col-span-1 flex flex-col gap-4">
          <Card className="overflow-hidden rounded-2xl border-l-4 border-emerald-500 bg-white shadow-sm">
            <CardHeader className="flex items-center justify-between pb-3">
              <CardTitle className="font-khmer-moul-light text-sm text-foreground">
                មន្ត្រីក្របខណ្ឌ
              </CardTitle>
              <span className="text-sm font-semibold text-emerald-500">{permanentTotal} នាក់</span>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center gap-4">
                <div className="relative mx-auto h-[160px] w-full max-w-[200px]">
                  <ChartContainer config={donutChartConfig} className="h-full w-full">
                    <PieChart>
                      <ChartTooltip cursor={false} />
                      <Pie
                        data={permanentChartData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={54}
                        outerRadius={80}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {permanentChartData.map((entry) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-semibold text-foreground">{permanentTotal}</span>
                    <span className="text-xs font-semibold text-foreground">សរុប</span>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {permanentChartData.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-foreground">{item.label}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-l-4 border-orange-400 bg-white shadow-sm">
            <CardHeader className="flex items-center justify-between pb-3">
              <CardTitle className="font-khmer-moul-light text-sm text-foreground">
                មន្ត្រីកិច្ចសន្យា
              </CardTitle>
              <span className="text-sm font-semibold text-orange-500">{contractTotal} នាក់</span>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center gap-4">
                <div className="relative mx-auto h-[160px] w-full max-w-[200px]">
                  <ChartContainer config={donutChartConfig} className="h-full w-full">
                    <PieChart>
                      <ChartTooltip cursor={false} />
                      <Pie
                        data={contractChartData}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={54}
                        outerRadius={80}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {contractChartData.map((entry) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-semibold text-foreground">{contractTotal}</span>
                    <span className="text-xs font-semibold text-foreground">សរុប</span>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {contractChartData.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-foreground">{item.label}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Department distribution card */}
        <Card className="col-span-2 overflow-hidden rounded-2xl border-l-4 border-sky-500 bg-white shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="font-khmer-moul-light text-sm text-foreground">
              ការចែកចាយតាមការិយាល័យ
            </CardTitle>
            <span className="text-sm font-semibold text-sky-500">{departmentTotal} នាក់</span>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={departmentChartConfig} className="h-[320px] w-full">
              <BarChart
                data={departmentChartData}
                layout="vertical"
                margin={{ left: 90, right: 12, top: 10, bottom: 10 }}
                barCategoryGap="8%"
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 14, fontWeight: 'bold' }}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="department"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={115}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => truncateText(value, 18)}
                />
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Bar
                  dataKey="officers"
                  fill="#0052CC"
                  radius={[0, 6, 6, 0]}
                  label={{ position: 'right', fill: '#0052CC', fontSize: 12, fontWeight: 'bold' }}
                />
              </BarChart>
            </ChartContainer>

            <div className="mt-4 grid gap-2">
              {departmentChartData.slice(0, 6).map((item) => (
                <div
                  key={item.department}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <span className="text-foreground">{item.department}</span>
                  <span className="font-semibold text-foreground">{item.officers}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gender summary card - full width below */}
      <Card className="overflow-hidden rounded-2xl border-l-4 border-blue-500 bg-white shadow-sm w-full">
        <CardHeader className="flex items-center justify-between pb-3">
          <CardTitle className="font-khmer-moul-light text-sm text-foreground">
            សរុបភេទមន្ត្រី
          </CardTitle>
          <span className="text-sm font-semibold text-foreground">{combinedGenderTotal} នាក់</span>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-6 bg-muted rounded-full overflow-hidden flex mt-4">
            <div
              className="flex items-center justify-center text-xs font-semibold text-white"
              style={{ width: `${malePercent}%`, backgroundColor: '#0052CC' }}
            >
              {malePercent}%
            </div>
            <div
              className="flex items-center justify-center text-xs font-semibold text-white"
              style={{ width: `${femalePercent}%`, backgroundColor: '#A71930' }}
            >
              {femalePercent}%
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: '#0052CC' }}
              />
              <span className="text-sm text-foreground">ប្រុស: {maleCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: '#A71930' }}
              />
              <span className="text-sm text-foreground">ស្រី: {femaleCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
