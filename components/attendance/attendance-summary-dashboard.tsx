'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  Activity,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Sunrise,
  Sunset,
  TimerReset,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Attendance } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { Skeleton } from '@/components/ui/skeleton';

function formatCompactDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return format(parsed, 'd MMM');
}

function formatMinutes(totalMinutes: number | null | undefined): string {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes < 0) {
    return '--';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0 && minutes === 0) return '0 នាទី';
  if (hours === 0) return `${minutes} នាទី`;
  if (minutes === 0) return `${hours} ម៉ោង`;
  return `${hours}h ${minutes}m`;
}

function formatHoursFromMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '--';
  return `${(totalMinutes / 60).toFixed(1)} ម៉ោង`;
}

function getStatusCategory(
  statusStr: string | null | undefined,
): 'present' | 'approved' | 'late' | 'absent' | 'halfDay' | 'leave' {
  const s = (statusStr || '').trim().toLowerCase();
  if (s === 'present' || s === 'មាន' || s === 'ontime' || s === 'on_time') return 'present';
  if (s === 'approved' || s === 'បានអនុម័ត') return 'approved';
  if (s === 'late' || s === 'យឺត') return 'late';
  if (s === 'absent' || s === 'អវត្តមាន' || s === 'rejected' || s === 'បានបដិសេធ') return 'absent';
  if (s.includes('half') || s.includes('ពាក់កណ្តាល')) return 'halfDay';
  if (s === 'leave' || s === 'ច្បាប់' || s === 'ច្បាប់ឈប់សម្រាក' || s === 'mission') return 'leave';
  return 'present';
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
    let present = 0;
    let approved = 0;
    let late = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;

    records.forEach((r) => {
      const cat = getStatusCategory(r.status);
      if (cat === 'present') present += 1;
      else if (cat === 'approved') approved += 1;
      else if (cat === 'late') late += 1;
      else if (cat === 'absent') absent += 1;
      else if (cat === 'halfDay') halfDay += 1;
      else if (cat === 'leave') leave += 1;
    });

    const activeAttendance = present + approved + late + halfDay;
    const attendanceRate = total > 0 ? Math.round((activeAttendance / total) * 100) : 0;
    const punctualityRate =
      activeAttendance > 0 ? Math.round(((present + approved) / activeAttendance) * 100) : 0;

    const workedRecords = records.filter((r) => (r.totalWorkMin || 0) > 0);
    const lateRecords = records.filter((r) => (r.totalLateMin || 0) > 0);

    const averageWorkMinutes = workedRecords.length
      ? Math.round(
          workedRecords.reduce((sum, r) => sum + (r.totalWorkMin || 0), 0) / workedRecords.length,
        )
      : 0;
    const averageLateMinutes = lateRecords.length
      ? Math.round(
          lateRecords.reduce((sum, r) => sum + (r.totalLateMin || 0), 0) / lateRecords.length,
        )
      : 0;

    const statusBreakdown = [
      {
        key: 'present',
        label: 'វត្តមាន',
        value: present,
        fill: '#10b981',
        dotClass: 'bg-emerald-500',
      },
      {
        key: 'approved',
        label: 'បានអនុម័ត',
        value: approved,
        fill: '#0d9488',
        dotClass: 'bg-teal-500',
      },
      { key: 'late', label: 'មកយឺត', value: late, fill: '#f59e0b', dotClass: 'bg-amber-500' },
      { key: 'absent', label: 'អវត្តមាន', value: absent, fill: '#f43f5e', dotClass: 'bg-rose-500' },
      {
        key: 'halfDay',
        label: 'ពាក់កណ្តាលថ្ងៃ',
        value: halfDay,
        fill: '#3b82f6',
        dotClass: 'bg-blue-500',
      },
      {
        key: 'leave',
        label: 'ច្បាប់ឈប់សម្រាក',
        value: leave,
        fill: '#8b5cf6',
        dotClass: 'bg-purple-500',
      },
    ].filter((item) => item.value > 0 || item.key === 'present' || item.key === 'absent');

    // Real consecutive 7-day trend calculation
    const trendMap = new Map<
      string,
      { date: string; rawDate: string; present: number; late: number; absent: number }
    >();

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const rawDate = format(d, 'yyyy-MM-dd');
      trendMap.set(rawDate, {
        date: format(d, 'd MMM'),
        rawDate,
        present: 0,
        late: 0,
        absent: 0,
      });
    }

    records.forEach((record) => {
      if (!record.date) return;
      const parsed = new Date(record.date);
      if (Number.isNaN(parsed.getTime())) return;
      const rawDate = format(parsed, 'yyyy-MM-dd');

      let existing = trendMap.get(rawDate);
      if (!existing) {
        existing = {
          date: format(parsed, 'd MMM'),
          rawDate,
          present: 0,
          late: 0,
          absent: 0,
        };
        trendMap.set(rawDate, existing);
      }

      const cat = getStatusCategory(record.status);
      if (cat === 'present' || cat === 'approved') existing.present += 1;
      else if (cat === 'late') existing.late += 1;
      else if (cat === 'absent') existing.absent += 1;
    });

    const trendData = Array.from(trendMap.values())
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .slice(-7);

    // Department grouping
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
      const cat = getStatusCategory(record.status);
      if (cat === 'present' || cat === 'approved') {
        existing.present += 1;
      } else if (cat === 'late') {
        existing.late += 1;
      } else if (cat === 'absent') {
        existing.absent += 1;
      }
      departmentMap.set(departmentName, existing);
    });
    const departmentData = Array.from(departmentMap.values())
      .map((department) => ({
        ...department,
        total: department.present + department.late + department.absent,
      }))
      .sort((left, right) => right.total - left.total);

    // Shift detailed data
    const shiftStatsMap = new Map<
      string,
      { shiftName: string; total: number; present: number; late: number }
    >();

    records.forEach((record) => {
      const sessions = record.sessions && record.sessions.length > 0 ? record.sessions : null;
      if (sessions) {
        sessions.forEach((session) => {
          const shiftName = session.shiftName?.trim() || 'វេនទូទៅ';
          const existing = shiftStatsMap.get(shiftName) ?? {
            shiftName,
            total: 0,
            present: 0,
            late: 0,
          };
          existing.total += 1;
          const status = (session.status || record.status || '').toLowerCase();
          if (status.includes('late') || status.includes('យឺត')) {
            existing.late += 1;
          } else {
            existing.present += 1;
          }
          shiftStatsMap.set(shiftName, existing);
        });
      } else {
        const shiftName = 'វេនទូទៅ';
        const existing = shiftStatsMap.get(shiftName) ?? {
          shiftName,
          total: 0,
          present: 0,
          late: 0,
        };
        existing.total += 1;
        const cat = getStatusCategory(record.status);
        if (cat === 'late') {
          existing.late += 1;
        } else {
          existing.present += 1;
        }
        shiftStatsMap.set(shiftName, existing);
      }
    });

    const shiftData = Array.from(shiftStatsMap.values()).sort((a, b) => b.total - a.total);

    // Hourly check-in timeline (7 AM - 6 PM)
    const hourMap = new Map<number, number>();
    for (let h = 7; h <= 18; h++) {
      hourMap.set(h, 0);
    }
    records.forEach((record) => {
      const checkInTimes: string[] = [];
      if (record.checkIn) checkInTimes.push(record.checkIn);
      (record.sessions ?? []).forEach((s) => {
        if (s.checkIn) checkInTimes.push(s.checkIn);
      });

      checkInTimes.forEach((timeStr) => {
        const parts = timeStr.split(':');
        if (parts.length >= 1) {
          const hour = parseInt(parts[0], 10);
          if (!isNaN(hour) && hour >= 7 && hour <= 18) {
            hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
          }
        }
      });
    });

    const hourlyData = Array.from(hourMap.entries()).map(([hour, scans]) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      return {
        hour: `${displayHour}${period}`,
        timeLabel: `${String(hour).padStart(2, '0')}:00`,
        scans,
      };
    });

    const totalScans = hourlyData.reduce((sum, item) => sum + item.scans, 0);

    return {
      total,
      present,
      approved,
      late,
      absent,
      halfDay,
      leave,
      attendanceRate,
      punctualityRate,
      averageWorkMinutes,
      averageLateMinutes,
      statusBreakdown,
      trendData,
      departmentData,
      shiftData,
      hourlyData,
      totalScans,
    };
  }, [records]);

  if (isLoading || error) {
    return (
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-slate-200 shadow-sm p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-7 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      {/* Mini KPI summary cards */}
      <div className="grid min-w-0 gap-3 grid-cols-2 lg:grid-cols-4">
        <CompactKpiCard
          icon={UserCheck}
          title="អត្រាវត្តមាន"
          value={`${insights.attendanceRate}%`}
          subtext={`${insights.present + insights.approved} នាក់បានចូល`}
          tone="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <CompactKpiCard
          icon={Clock}
          title="អត្រាទាន់ពេល"
          value={`${insights.punctualityRate}%`}
          subtext="វត្តមានមិនយឺត"
          tone="bg-sky-50 text-sky-600 border-sky-100"
        />
        <CompactKpiCard
          icon={TimerReset}
          title="មធ្យមពេលយឺត"
          value={formatMinutes(insights.averageLateMinutes)}
          subtext={`${insights.late} នាក់មកយឺត`}
          tone="bg-amber-50 text-amber-600 border-amber-100"
        />
        <CompactKpiCard
          icon={Activity}
          title="មធ្យមម៉ោងធ្វើការ"
          value={formatHoursFromMinutes(insights.averageWorkMinutes)}
          subtext={`${insights.total} កំណត់ត្រាសរុប`}
          tone="bg-indigo-50 text-indigo-600 border-indigo-100"
        />
      </div>

      {/* 2x2 Clean Compact Chart Grid */}
      <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2">
        {/* 1. Status Distribution (Donut + Segmented Bar + Row Bars + Bottom Metrics) */}
        <Card className="min-w-0 border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3 pt-4 px-5 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 font-khmer-moul-light">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>ការបែងចែកស្ថានភាព</span>
              </CardTitle>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {insights.total} កំណត់ត្រាសរុប
              </span>
            </div>

            {/* Continuous Segmented Status Ratio Bar */}
            {insights.total > 0 && (
              <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                {insights.statusBreakdown.map((item) => {
                  const percent = (item.value / insights.total) * 100;
                  if (percent <= 0) return null;
                  return (
                    <div
                      key={item.key}
                      style={{ width: `${percent}%`, backgroundColor: item.fill }}
                      className="h-full transition-all"
                      title={`${item.label}: ${item.value} (${Math.round(percent)}%)`}
                    />
                  );
                })}
              </div>
            )}
          </CardHeader>

          <CardContent className="px-5 pb-4 pt-0 flex-1 flex flex-col justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Donut container */}
              <div className="relative h-[155px] w-[155px] shrink-0 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                              <p className="font-semibold">
                                {data.label}: {data.value} នាក់
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={insights.statusBreakdown}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={46}
                      outerRadius={70}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {insights.statusBreakdown.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stat Counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900">
                    {insights.attendanceRate}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    អត្រាវត្តមាន
                  </span>
                </div>
              </div>

              {/* Status Row List with mini progress indicators */}
              <div className="flex-1 w-full space-y-1.5">
                {insights.statusBreakdown.map((item) => {
                  const percent =
                    insights.total > 0 ? Math.round((item.value / insights.total) * 100) : 0;
                  return (
                    <div
                      key={item.key}
                      className="relative overflow-hidden flex flex-col justify-center p-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs gap-1"
                    >
                      <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
                          <span className="font-medium text-slate-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{item.value}</span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            ({percent}%)
                          </span>
                        </div>
                      </div>
                      {/* Mini inner bar */}
                      <div className="h-1 w-full rounded-full bg-slate-200/60 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percent}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom 2-Column Summary Pill Box */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-emerald-700 font-medium leading-none">
                    បានចូលវត្តមាន
                  </p>
                  <p className="text-xs font-bold text-emerald-900 mt-0.5">
                    {insights.present + insights.approved} នាក់
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-amber-700 font-medium leading-none">
                    យឺត និង អវត្តមាន
                  </p>
                  <p className="text-xs font-bold text-amber-900 mt-0.5">
                    {insights.late + insights.absent} នាក់
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Attendance Trend (Smooth Area Chart) */}
        <Card className="min-w-0 border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 pt-4 px-5 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 font-khmer-moul-light">
                <TrendingUp className="h-4 w-4 text-sky-600" />
                <span>និន្នាការវត្តមាន (៧ ថ្ងៃចុងក្រោយ)</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-1 flex-1 flex flex-col justify-end">
            {insights.trendData.length > 0 ? (
              <div className="h-[170px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={insights.trendData}
                    margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      dy={4}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-xl space-y-1">
                              <p className="font-semibold text-slate-200">{label}</p>
                              <div className="flex items-center justify-between gap-3 text-emerald-400">
                                <span>វត្តមាន:</span>
                                <span className="font-bold">{payload[0]?.value}</span>
                              </div>
                              {payload[1] && (
                                <div className="flex items-center justify-between gap-3 text-amber-400">
                                  <span>មកយឺត:</span>
                                  <span className="font-bold">{payload[1]?.value}</span>
                                </div>
                              )}
                              {payload[2] && (
                                <div className="flex items-center justify-between gap-3 text-rose-400">
                                  <span>អវត្តមាន:</span>
                                  <span className="font-bold">{payload[2]?.value}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="present"
                      name="វត្តមាន"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#presentGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="late"
                      name="មកយឺត"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="absent"
                      name="អវត្តមាន"
                      stroke="#f43f5e"
                      strokeWidth={1.5}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChartState message="មិនទាន់មានទិន្នន័យសម្រាប់បង្កើតក្រាហ្វនិន្នាការនៅឡើយទេ។" />
            )}
            {/* Trend Legend */}
            <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> វត្តមាន
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> មកយឺត
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> អវត្តមាន
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Department Breakdown (Horizontal Segmented Progress Bars - Scrollable List) */}
        <Card className="min-w-0 border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 pt-4 px-5 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 font-khmer-moul-light">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>សមាសភាពវត្តមានតាមការិយាល័យ</span>
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {insights.departmentData.length} ការិយាល័យ
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-1 flex-1 flex flex-col justify-center">
            {insights.departmentData.length > 0 ? (
              <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3">
                {insights.departmentData.map((dept, idx) => {
                  const maxTotal = insights.departmentData[0]?.total || 1;
                  const barWidthPercent = Math.max(12, Math.round((dept.total / maxTotal) * 100));
                  const presentPercent = dept.total > 0 ? (dept.present / dept.total) * 100 : 0;
                  const latePercent = dept.total > 0 ? (dept.late / dept.total) * 100 : 0;
                  const absentPercent = dept.total > 0 ? (dept.absent / dept.total) * 100 : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="font-medium text-slate-800 truncate max-w-[200px] sm:max-w-[280px] leading-relaxed"
                          title={dept.department}
                        >
                          {dept.department}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                          <span className="text-emerald-600 font-semibold">{dept.present}</span>
                          {dept.late > 0 && (
                            <span className="text-amber-600 font-semibold">· {dept.late}យឺត</span>
                          )}
                          {dept.absent > 0 && (
                            <span className="text-rose-600 font-semibold">· {dept.absent}អវ</span>
                          )}
                          <span className="text-slate-400">({dept.total})</span>
                        </div>
                      </div>

                      {/* Segmented ratio bar */}
                      <div
                        className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex"
                        style={{ width: `${barWidthPercent}%` }}
                      >
                        <div
                          style={{ width: `${presentPercent}%` }}
                          className="h-full bg-emerald-500"
                          title={`វត្តមាន: ${dept.present}`}
                        />
                        <div
                          style={{ width: `${latePercent}%` }}
                          className="h-full bg-amber-500"
                          title={`មកយឺត: ${dept.late}`}
                        />
                        <div
                          style={{ width: `${absentPercent}%` }}
                          className="h-full bg-rose-500"
                          title={`អវត្តមាន: ${dept.absent}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyChartState message="មិនទាន់មានទិន្នន័យវត្តមានកម្រិតការិយាល័យនៅឡើយទេ។" />
            )}
          </CardContent>
        </Card>

        {/* 4. Shift Activity & Hourly Scan Distribution */}
        <Card className="min-w-0 border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 pt-4 px-5 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 font-khmer-moul-light">
                <Briefcase className="h-4 w-4 text-teal-600" />
                <span>សកម្មភាពវេន & ពេលវេលាស្កេន</span>
              </CardTitle>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {insights.shiftData.length} វេនការងារ
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-1 flex-1 flex flex-col justify-between gap-3">
            {/* Top: Shift Overview Cards */}
            {insights.shiftData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {insights.shiftData.slice(0, 2).map((shift, idx) => {
                  const isMorning =
                    shift.shiftName.toLowerCase().includes('morning') ||
                    shift.shiftName.toLowerCase().includes('ព្រឹក');
                  const IconComponent = isMorning ? Sunrise : Sunset;
                  const iconTone = isMorning
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100';
                  const onTimeRate =
                    shift.total > 0 ? Math.round((shift.present / shift.total) * 100) : 0;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${iconTone}`}
                          >
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {shift.shiftName}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{shift.total}</span>
                      </div>

                      {/* On time vs late mini bar */}
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="text-emerald-600 font-medium">
                            ទាន់ពេល {onTimeRate}%
                          </span>
                          {shift.late > 0 && (
                            <span className="text-amber-600 font-medium">យឺត {shift.late}</span>
                          )}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden flex">
                          <div
                            style={{ width: `${onTimeRate}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                          <div
                            style={{ width: `${100 - onTimeRate}%` }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Bottom: Hourly Scan Distribution Bar Chart */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                <span className="font-medium text-slate-700">
                  ពេលវេលាស្កេនច្រើនបំផុត (៧ ព្រឹក - ៦ ល្ងាច)
                </span>
                <span>{insights.totalScans} លើក</span>
              </div>

              <div className="h-[105px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insights.hourlyData}
                    margin={{ left: -25, right: 5, top: 5, bottom: -5 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 9, fill: '#94a3b8' }}
                      interval={0}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 9, fill: '#94a3b8' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                              <p className="font-semibold">{data.timeLabel}</p>
                              <p className="text-teal-400 font-bold mt-0.5">
                                {data.scans} ការស្កេន
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="scans" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CompactKpiCard({
  icon: Icon,
  title,
  value,
  subtext,
  tone,
}: {
  icon: typeof Users;
  title: string;
  value: string;
  subtext: string;
  tone: string;
}) {
  return (
    <Card className="min-w-0 border-slate-200 shadow-sm p-3.5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground truncate leading-relaxed">
          {title}
        </span>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${tone}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <CardNumber value={value} className="text-xl font-bold tracking-tight text-slate-900" />
        <span className="text-[11px] text-muted-foreground truncate">{subtext}</span>
      </div>
    </Card>
  );
}

function EmptyChartState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-dashed bg-slate-50/70 text-xs text-muted-foreground text-center ${
        compact ? 'p-3' : 'p-6'
      }`}
    >
      {message}
    </div>
  );
}
