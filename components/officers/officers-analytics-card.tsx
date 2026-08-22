'use client';

import { useMemo } from 'react';
import { Building2, Users } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

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
    color: '#2563EB',
  },
  female: {
    label: 'ស្រី',
    color: '#DB2777',
  },
} satisfies ChartConfig;

const DONUT_COLORS: Record<string, string> = {
  male: '#2563EB',
  female: '#DB2777',
};

function MiniDonutCard({
  title,
  total,
  badgeColor,
  data,
}: {
  title: string;
  total: number;
  badgeColor: string;
  data: DonutChartSlice[];
}) {
  return (
    <div className="flex flex-col items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex w-full items-center justify-between mb-1 min-h-[24px]">
        <span className="text-xs font-medium text-slate-700 leading-relaxed">{title}</span>
        <span className={`text-xs font-bold ${badgeColor} shrink-0`}>{total} នាក់</span>
      </div>

      <div className="relative my-1 h-[105px] w-[105px]">
        <ChartContainer config={donutChartConfig} className="h-full w-full">
          <PieChart>
            <ChartTooltip cursor={false} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={34}
              outerRadius={48}
              paddingAngle={4}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={DONUT_COLORS[entry.key] || entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-base font-bold text-slate-800 leading-none">{total}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">សរុប</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-2 pt-1.5 flex-wrap">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs border border-slate-100 leading-relaxed"
          >
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: DONUT_COLORS[item.key] || item.fill }}
            />
            <span className="leading-relaxed">{item.label}:</span>
            <strong className="text-slate-900">{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const sortedDepartments = useMemo(
    () => [...departmentChartData].sort((a, b) => b.officers - a.officers),
    [departmentChartData],
  );
  const maxDeptCount = sortedDepartments[0]?.officers || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      {/* Left Column: Officer Types & Gender Breakdown */}
      <Card className="lg:col-span-5 rounded-2xl border bg-card shadow-xs flex flex-col justify-between overflow-hidden">
        <CardHeader className="border-b border-slate-100/80 py-3 px-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-khmer-moul-light text-xs text-foreground flex items-center gap-2 leading-relaxed py-0.5">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>សមាសភាពមន្ត្រី និងភេទ</span>
            </CardTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0 leading-relaxed">
              សរុប {combinedGenderTotal} នាក់
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3.5">
          {/* Side-by-side Mini Donut Cards */}
          <div className="grid grid-cols-2 gap-3">
            <MiniDonutCard
              title="មន្ត្រីក្របខណ្ឌ"
              total={permanentTotal}
              badgeColor="text-emerald-600"
              data={permanentChartData}
            />
            <MiniDonutCard
              title="មន្ត្រីកិច្ចសន្យា"
              total={contractTotal}
              badgeColor="text-amber-600"
              data={contractChartData}
            />
          </div>

          {/* Gender Ratio Progress Bar */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs min-h-[22px]">
              <span className="font-medium text-slate-700 leading-relaxed">សមាមាត្រយេនឌ័រ</span>
              <span className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                ប្រុស {malePercent}% · ស្រី {femalePercent}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${malePercent}%` }}
                className="bg-blue-600 transition-all duration-500"
              />
              <div
                style={{ width: `${femalePercent}%` }}
                className="bg-pink-500 transition-all duration-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 leading-relaxed">
                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-600">
                  ប្រុស: <strong className="text-slate-900">{maleCount} នាក់</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 leading-relaxed">
                <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0" />
                <span className="text-slate-600">
                  ស្រី: <strong className="text-slate-900">{femaleCount} នាក់</strong>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Department Distribution */}
      <Card className="lg:col-span-7 rounded-2xl border bg-card shadow-xs flex flex-col overflow-hidden">
        <CardHeader className="border-b border-slate-100/80 py-3 px-4 flex flex-row items-center justify-between gap-2">
          <CardTitle className="font-khmer-moul-light text-xs text-foreground flex items-center gap-2 leading-relaxed py-0.5">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span>ការចែកចាយតាមការិយាល័យ</span>
          </CardTitle>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0 leading-relaxed">
            {departmentTotal} នាក់
          </span>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-start">
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {sortedDepartments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 leading-relaxed">
                គ្មានទិន្នន័យ
              </p>
            ) : (
              sortedDepartments.map((dept, index) => {
                const percent = maxDeptCount > 0 ? (dept.officers / maxDeptCount) * 100 : 0;
                return (
                  <div
                    key={dept.department}
                    className="group rounded-lg px-2.5 py-2 hover:bg-slate-50/90 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs mb-1.5 min-h-[24px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {index + 1}
                        </span>
                        <span
                          className="font-medium text-slate-800 leading-relaxed text-xs sm:text-[13px]"
                          title={dept.department}
                        >
                          {dept.department}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0 text-xs leading-relaxed">
                        {dept.officers} នាក់
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
