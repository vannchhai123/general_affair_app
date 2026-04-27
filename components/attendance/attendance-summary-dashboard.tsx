'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Activity, Clock, TimerReset, UserCheck, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import type { Attendance } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const attendanceStatusChartConfig = {
  present: { label: 'វត្តមាន', color: '#059669' },
  late: { label: 'យឺត', color: '#d97706' },
  absent: { label: 'អវត្តមាន', color: '#dc2626' },
  halfDay: { label: 'ពាក់កណ្តាលថ្ងៃ', color: '#2563eb' },
} satisfies ChartConfig;

const attendanceTrendChartConfig = {
  present: { label: 'វត្តមាន', color: '#10b981' },
  late: { label: 'យឺត', color: '#f59e0b' },
  absent: { label: 'អវត្តមាន', color: '#ef4444' },
} satisfies ChartConfig;

const departmentAttendanceChartConfig = {
  present: { label: 'វត្តមាន', color: '#059669' },
  late: { label: 'យឺត', color: '#d97706' },
  absent: { label: 'អវត្តមាន', color: '#dc2626' },
} satisfies ChartConfig;

const shiftActivityChartConfig = {
  sessions: { label: 'ចំនួនសម័យ', color: '#0f766e' },
} satisfies ChartConfig;

function formatCompactDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return format(parsed, 'MMM d');
}

function formatMinutes(totalMinutes: number | null | undefined): string {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes < 0) {
    return '--';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatHoursFromMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '--';
  return `${(totalMinutes / 60).toFixed(1)}h`;
}

export function AttendanceSummaryDashboard({
  records,
  isLoading,
  error,
}: {
  records: Attendance[];
  isLoading: boolean;
  error?: Error | null;
}) {
  const insights = useMemo(() => {
    const total = records.length;
    const present = records.filter((record) => record.status === 'Present').length;
    const late = records.filter((record) => record.status === 'Late').length;
    const absent = records.filter((record) => record.status === 'Absent').length;
    const halfDay = records.filter((record) => record.status === 'Half-day').length;
    const activeAttendance = present + late + halfDay;
    const attendanceRate = total > 0 ? Math.round((activeAttendance / total) * 100) : 0;
    const punctualityRate =
      activeAttendance > 0 ? Math.round((present / activeAttendance) * 100) : 0;

    const workedRecords = records.filter((record) => record.totalWorkMin > 0);
    const lateRecords = records.filter((record) => record.totalLateMin > 0);

    const averageWorkMinutes = workedRecords.length
      ? Math.round(
          workedRecords.reduce((sum, record) => sum + record.totalWorkMin, 0) /
            workedRecords.length,
        )
      : 0;
    const averageLateMinutes = lateRecords.length
      ? Math.round(
          lateRecords.reduce((sum, record) => sum + record.totalLateMin, 0) / lateRecords.length,
        )
      : 0;

    const statusBreakdown = [
      { key: 'present', label: 'វត្តមាន', value: present, fill: 'var(--color-present)' },
      { key: 'late', label: 'យឺត', value: late, fill: 'var(--color-late)' },
      { key: 'absent', label: 'អវត្តមាន', value: absent, fill: 'var(--color-absent)' },
      { key: 'halfDay', label: 'ពាក់កណ្តាលថ្ងៃ', value: halfDay, fill: 'var(--color-halfDay)' },
    ];

    const trendMap = new Map<
      string,
      { date: string; present: number; late: number; absent: number }
    >();
    records.forEach((record) => {
      const key = formatCompactDate(record.date);
      const existing = trendMap.get(key) ?? { date: key, present: 0, late: 0, absent: 0 };
      if (record.status === 'Present') existing.present += 1;
      if (record.status === 'Late') existing.late += 1;
      if (record.status === 'Absent') existing.absent += 1;
      trendMap.set(key, existing);
    });
    const trendData = Array.from(trendMap.values()).slice(-7);

    const departmentMap = new Map<
      string,
      { department: string; present: number; late: number; absent: number }
    >();
    records.forEach((record) => {
      const departmentName = record.department?.trim() || 'មិនទាន់កំណត់';
      const existing = departmentMap.get(departmentName) ?? {
        department: departmentName,
        present: 0,
        late: 0,
        absent: 0,
      };
      if (record.status === 'Present') existing.present += 1;
      if (record.status === 'Late') existing.late += 1;
      if (record.status === 'Absent') existing.absent += 1;
      departmentMap.set(departmentName, existing);
    });
    const departmentData = Array.from(departmentMap.values())
      .map((department) => ({
        ...department,
        total: department.present + department.late + department.absent,
      }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 6);

    const shiftMap = new Map<string, number>();
    records.forEach((record) => {
      (record.sessions ?? []).forEach((session) => {
        const shiftName = session.shiftName?.trim() || 'វេនមិនស្គាល់';
        shiftMap.set(shiftName, (shiftMap.get(shiftName) ?? 0) + 1);
      });
    });
    const shiftData = Array.from(shiftMap.entries())
      .map(([shift, sessions]) => ({ shift, sessions }))
      .sort((left, right) => right.sessions - left.sessions)
      .slice(0, 5);

    return {
      total,
      attendanceRate,
      punctualityRate,
      averageWorkMinutes,
      averageLateMinutes,
      statusBreakdown,
      trendData,
      departmentData,
      shiftData,
    };
  }, [records]);

  if (isLoading || error) {
    return (
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-4 h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryKpiCard
          icon={UserCheck}
          title="អត្រាវត្តមាន"
          value={`${insights.attendanceRate}%`}
          helper="បូករួមវត្តមាន យឺត និងពាក់កណ្តាលថ្ងៃ"
          tone="bg-emerald-50 text-emerald-700"
        />
        <SummaryKpiCard
          icon={Clock}
          title="អត្រាមកទាន់ពេល"
          value={`${insights.punctualityRate}%`}
          helper="ប្រៀបធៀបវត្តមានទាន់ពេលជាមួយទិន្នន័យបានចូលធ្វើការ"
          tone="bg-blue-50 text-blue-700"
        />
        <SummaryKpiCard
          icon={TimerReset}
          title="មធ្យមពេលយឺត"
          value={formatMinutes(insights.averageLateMinutes)}
          helper="មធ្យមការយឺតរបស់កំណត់ត្រាដែលមកយឺត"
          tone="bg-amber-50 text-amber-700"
        />
        <SummaryKpiCard
          icon={Activity}
          title="មធ្យមម៉ោងធ្វើការ"
          value={formatHoursFromMinutes(insights.averageWorkMinutes)}
          helper="មធ្យមរយៈពេលធ្វើការក្នុងមួយកំណត់ត្រា"
          tone="bg-cyan-50 text-cyan-700"
        />
      </div>

      <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-2">
        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>ការបែងចែកស្ថានភាព</CardTitle>
            {/* <CardDescription>
              មើលសមាសភាពបច្ចុប្បន្ននៃវត្តមាន យឺត អវត្តមាន និងពាក់កណ្តាលថ្ងៃ។
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={attendanceStatusChartConfig}
              className="mx-auto h-[240px] min-w-0 w-full max-w-[280px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="key" />}
                />
                <Pie
                  data={insights.statusBreakdown}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {insights.statusBreakdown.map((entry) => (
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

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>និន្នាការវត្តមាន</CardTitle>
            {/* <CardDescription>
              តាមដានការប្រែប្រួលនៃវត្តមាន ការយឺត និងអវត្តមានក្នុងថ្ងៃថ្មីៗ។
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            {insights.trendData.length > 0 ? (
              <ChartContainer
                config={attendanceTrendChartConfig}
                className="h-[240px] min-w-0 w-full"
              >
                <LineChart data={insights.trendData} margin={{ left: 12, right: 12, top: 10 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent className="flex-wrap gap-3" />} />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="var(--color-present)"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="late"
                    stroke="var(--color-late)"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="var(--color-absent)"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <EmptyChartState message="មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់បង្កើតក្រាហ្វនិន្នាការនៅឡើយទេ។" />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>សមាសភាពវត្តមានតាមនាយកដ្ឋាន</CardTitle>
            {/* <CardDescription>
              កំណត់ថានាយកដ្ឋានណាដែលមានបន្ទុកវត្តមាន និងសម្ពាធការយឺតខ្ពស់ជាងគេ។
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            {insights.departmentData.length > 0 ? (
              <ChartContainer
                config={departmentAttendanceChartConfig}
                className="h-[280px] min-w-0 w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={insights.departmentData}
                  margin={{ left: 4, right: 12, top: 12, bottom: 8 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="department"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    minTickGap={6}
                    tickFormatter={(value: string) =>
                      value.length > 12 ? `${value.slice(0, 12)}...` : value
                    }
                  />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent className="flex-wrap gap-3" />} />
                  <Bar
                    dataKey="present"
                    fill="var(--color-present)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="late"
                    fill="var(--color-late)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="absent"
                    fill="var(--color-absent)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChartState message="មិនទាន់មានទិន្នន័យវត្តមានកម្រិតនាយកដ្ឋាននៅឡើយទេ។" />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>សកម្មភាពវេនខ្ពស់បំផុត</CardTitle>
            {/* <CardDescription>មើលថាវេនណាដែលបង្កើតសម័យវត្តមានច្រើនជាងគេ។</CardDescription> */}
          </CardHeader>
          <CardContent>
            {insights.shiftData.length > 0 ? (
              <ChartContainer
                config={shiftActivityChartConfig}
                className="h-[240px] min-w-0 w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={insights.shiftData}
                  layout="vertical"
                  margin={{ left: 12, right: 10 }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    type="category"
                    dataKey="shift"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChartState message="មិនទាន់មានទិន្នន័យសកម្មភាពសម័យវេននៅឡើយទេ។" compact />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryKpiCard({
  icon: Icon,
  title,
  value,
  helper,
  tone,
}: {
  icon: typeof Users;
  title: string;
  value: string;
  helper: string;
  tone: string;
}) {
  return (
    <Card className="min-w-0 border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-khmer-moul-light text-sm text-muted-foreground">{title}</p>
            <CardNumber
              value={value}
              className="mt-2 block text-3xl font-semibold tracking-tight text-slate-950"
            />
            {/* <p className="mt-2 text-xs text-muted-foreground">{helper}</p> */}
          </div>
          <div className={`rounded-2xl p-2.5 ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChartState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-dashed bg-slate-50/70 text-sm text-muted-foreground ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {message}
    </div>
  );
}
