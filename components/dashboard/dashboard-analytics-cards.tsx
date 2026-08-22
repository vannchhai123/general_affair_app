'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CheckCircle2, Clock, FileText, TrendingUp, UserMinus, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardRecentAttendance, DashboardStats, Officer } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ATTENDANCE_COLORS = {
  present: '#10b981',
  late: '#f59e0b',
  absent: '#f43f5e',
};

const REQUEST_COLORS = {
  leave: '#3b82f6',
  mission: '#0d9488',
  attendance: '#8b5cf6',
};

function formatTrendDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return format(parsed, 'd MMM');
}

function buildTrendData(records: DashboardRecentAttendance[]) {
  const trendMap = new Map<
    string,
    { date: string; rawDate: string; present: number; late: number; absent: number }
  >();

  // Generate real consecutive 7 calendar days up to today
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const rawDate = format(d, 'yyyy-MM-dd');
    const label = format(d, 'd MMM');
    trendMap.set(rawDate, {
      date: label,
      rawDate,
      present: 0,
      late: 0,
      absent: 0,
    });
  }

  // Populate counts from real backend records
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

    const normalizedStatus = record.status?.toString().trim().toLowerCase() ?? '';
    if (['present', 'មាន', 'approved', 'ontime', 'on_time'].includes(normalizedStatus)) {
      existing.present += 1;
    } else if (['late', 'យឺត'].includes(normalizedStatus)) {
      existing.late += 1;
    } else if (['absent', 'អវត្តមាន', 'rejected'].includes(normalizedStatus)) {
      existing.absent += 1;
    }
  });

  return Array.from(trendMap.values())
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .slice(-7);
}

function buildGenderBreakdown(
  stats: DashboardStats,
  officers: Officer[] | undefined,
  t: (key: string) => string,
) {
  if (officers && officers.length > 0) {
    const maleOfficers = officers.filter((o) => (o.sex || '').toLowerCase() === 'male');
    const femaleOfficers = officers.filter((o) => (o.sex || '').toLowerCase() === 'female');
    const otherOfficers = officers.length - maleOfficers.length - femaleOfficers.length;

    const list = [
      {
        name: 'មន្ត្រីប្រុស',
        value: maleOfficers.length,
        fill: '#3b82f6',
        dotClass: 'bg-blue-500',
      },
      {
        name: 'មន្ត្រីស្រី',
        value: femaleOfficers.length,
        fill: '#10b981',
        dotClass: 'bg-emerald-500',
      },
    ];

    if (otherOfficers > 0) {
      list.push({
        name: 'ផ្សេងទៀត',
        value: otherOfficers,
        fill: '#94a3b8',
        dotClass: 'bg-slate-400',
      });
    }

    return list;
  }

  return [
    {
      name: t('analytics.genderMalePresent'),
      value: stats.gender_breakdown?.male_present ?? 0,
      fill: '#3b82f6',
      dotClass: 'bg-blue-500',
    },
    {
      name: t('analytics.genderFemalePresent'),
      value: stats.gender_breakdown?.female_present ?? 0,
      fill: '#10b981',
      dotClass: 'bg-emerald-500',
    },
    {
      name: t('analytics.genderMaleLate'),
      value: stats.gender_breakdown?.male_late ?? 0,
      fill: '#f59e0b',
      dotClass: 'bg-amber-500',
    },
    {
      name: t('analytics.genderFemaleLate'),
      value: stats.gender_breakdown?.female_late ?? 0,
      fill: '#f43f5e',
      dotClass: 'bg-rose-500',
    },
  ];
}

function buildRequestBreakdown(data: DashboardStats, t: (key: string) => string) {
  return [
    {
      name: t('analytics.leaveRequests'),
      value: data.leave_requests?.total ?? 0,
      fill: REQUEST_COLORS.leave,
      dotClass: 'bg-blue-500',
    },
    {
      name: t('analytics.missions'),
      value: data.missions?.total ?? 0,
      fill: REQUEST_COLORS.mission,
      dotClass: 'bg-teal-500',
    },
    {
      name: t('analytics.attendanceApprovals'),
      value: data.attendance?.pending ?? 0,
      fill: REQUEST_COLORS.attendance,
      dotClass: 'bg-purple-500',
    },
  ];
}

function buildStatusCards(data: DashboardStats, t: (key: string) => string) {
  return [
    {
      label: t('analytics.approvedRequests'),
      value: data.leave_requests?.approved ?? 0,
      icon: CheckCircle2,
      tone: 'bg-emerald-50/80 border-emerald-100 text-emerald-700',
      iconTone: 'text-emerald-600 bg-emerald-100/60',
    },
    {
      label: t('analytics.pendingRequests'),
      value: data.leave_requests?.pending ?? 0,
      icon: Clock,
      tone: 'bg-amber-50/80 border-amber-100 text-amber-700',
      iconTone: 'text-amber-600 bg-amber-100/60',
    },
    {
      label: t('analytics.inactiveOfficers'),
      value: data.officers?.inactive ?? 0,
      icon: UserMinus,
      tone: 'bg-slate-50 border-slate-200 text-slate-700',
      iconTone: 'text-slate-600 bg-slate-200/60',
    },
  ];
}

export function DashboardAnalyticsCards({
  stats,
  records,
  officers,
}: {
  stats: DashboardStats;
  records: DashboardRecentAttendance[];
  officers?: Officer[];
}) {
  const t = useTranslations('dashboard');
  const trendData = useMemo(() => buildTrendData(records), [records]);
  const requestData = useMemo(() => buildRequestBreakdown(stats, t), [stats, t]);
  const statusCards = useMemo(() => buildStatusCards(stats, t), [stats, t]);

  const genderData = useMemo(() => buildGenderBreakdown(stats, officers, t), [stats, officers, t]);

  const totalGenderCount = genderData.reduce((sum, item) => sum + item.value, 0);
  const totalRequestCount = requestData.reduce((sum, item) => sum + item.value, 0);

  const genderPieData = useMemo(() => {
    return totalGenderCount > 0
      ? genderData
      : [{ name: 'គ្មានទិន្នន័យ', value: 1, fill: '#f1f5f9' }];
  }, [genderData, totalGenderCount]);

  const requestPieData = useMemo(() => {
    return totalRequestCount > 0
      ? requestData
      : [{ name: 'គ្មានទិន្នន័យ', value: 1, fill: '#f1f5f9' }];
  }, [requestData, totalRequestCount]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch w-full">
      {/* 1. Left Card: Attendance Trend & Workflow Metrics (2 of 3 cols) */}
      <div className="lg:col-span-2 flex flex-col w-full">
        <Card className="min-w-0 border-slate-200/90 shadow-2xs rounded-xl flex flex-col justify-between overflow-hidden h-full bg-white">
          <CardHeader className="py-2.5 px-4 shrink-0 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <CardTitle className="text-xs font-semibold text-slate-900 font-khmer-moul-light">
                  {t('analytics.attendanceTrend')}
                </CardTitle>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                ៧ ថ្ងៃចុងក្រោយ
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
            {/* Top 3 Metric Cards */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              {statusCards.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`rounded-lg border p-2.5 flex items-center justify-between gap-2 shadow-2xs ${item.tone}`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground truncate leading-relaxed">
                        {item.label}
                      </p>
                      <p className="text-lg font-bold tracking-tight text-slate-900 mt-0.5 leading-none">
                        {item.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${item.iconTone}`}
                    >
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact Trend Area Chart */}
            <div className="h-[155px] w-full pt-0.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardPresentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    dy={2}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-xl space-y-0.5">
                            <p className="font-semibold text-slate-200 text-[11px]">{label}</p>
                            <div className="flex items-center justify-between gap-3 text-emerald-400 text-[11px]">
                              <span>វត្តមាន:</span>
                              <span className="font-bold">{payload[0]?.value}</span>
                            </div>
                            {payload[1] && (
                              <div className="flex items-center justify-between gap-3 text-amber-400 text-[11px]">
                                <span>មកយឺត:</span>
                                <span className="font-bold">{payload[1]?.value}</span>
                              </div>
                            )}
                            {payload[2] && (
                              <div className="flex items-center justify-between gap-3 text-rose-400 text-[11px]">
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
                    name={t('analytics.present')}
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashboardPresentGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="late"
                    name={t('analytics.late')}
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name={t('analytics.absent')}
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Trend Legend */}
            <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {t('analytics.present')}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> {t('analytics.late')}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> {t('analytics.absent')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Right Side: 2 Compact Donut Cards (1 of 3 cols) */}
      <div className="lg:col-span-1 flex flex-col gap-3 justify-between w-full">
        {/* Top: Gender Attendance Card */}
        <Card className="min-w-0 border-slate-200/90 shadow-2xs rounded-xl overflow-hidden flex flex-col justify-between w-full bg-white">
          <CardHeader className="py-2 px-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <CardTitle className="text-xs font-semibold text-slate-900 font-khmer-moul-light">
                  {officers && officers.length > 0
                    ? 'សមាសភាពមន្ត្រីតាមភេទ'
                    : t('analytics.genderAttendance')}
                </CardTitle>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {totalGenderCount} សរុប
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-2.5 pt-2">
            <div className="flex items-center gap-3 w-full">
              {/* Compact Donut */}
              <div className="relative h-[95px] w-[95px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-md bg-slate-900 px-2 py-1 text-[11px] text-white shadow-md">
                              <p className="font-semibold">
                                {data.name}: {data.value} នាក់
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={genderPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={28}
                      outerRadius={44}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {genderPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-slate-900 leading-none">
                    {totalGenderCount}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-normal">មន្ត្រី</span>
                </div>
              </div>

              {/* Status Row List */}
              <div className="flex-1 w-full min-w-0 space-y-1">
                {genderData.map((item) => {
                  const percent =
                    totalGenderCount > 0 ? Math.round((item.value / totalGenderCount) * 100) : 0;
                  return (
                    <div
                      key={item.name}
                      className="w-full rounded-md bg-slate-50 border border-slate-200/60 p-1 px-2 space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.dotClass}`} />
                          <span className="truncate text-slate-700 text-[10.5px] font-medium leading-tight">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-[10.5px]">
                          <span className="font-bold text-slate-900">{item.value}</span>
                          <span className="text-muted-foreground text-[9.5px]">({percent}%)</span>
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom: Request Distribution Card */}
        <Card className="min-w-0 border-slate-200/90 shadow-2xs rounded-xl overflow-hidden flex flex-col justify-between w-full bg-white">
          <CardHeader className="py-2 px-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                <CardTitle className="text-xs font-semibold text-slate-900 font-khmer-moul-light">
                  {t('analytics.requestDistribution')}
                </CardTitle>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {totalRequestCount} សរុប
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-2.5 pt-2">
            <div className="flex items-center gap-3 w-full">
              {/* Compact Donut */}
              <div className="relative h-[95px] w-[95px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-md bg-slate-900 px-2 py-1 text-[11px] text-white shadow-md">
                              <p className="font-semibold">
                                {data.name}: {data.value} សំណើ
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={requestPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={28}
                      outerRadius={44}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {requestPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-slate-900 leading-none">
                    {totalRequestCount}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-normal">សំណើ</span>
                </div>
              </div>

              {/* Status Row List */}
              <div className="flex-1 w-full min-w-0 space-y-1">
                {requestData.map((item) => {
                  const percent =
                    totalRequestCount > 0 ? Math.round((item.value / totalRequestCount) * 100) : 0;
                  return (
                    <div
                      key={item.name}
                      className="w-full rounded-md bg-slate-50 border border-slate-200/60 p-1 px-2 space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.dotClass}`} />
                          <span className="truncate text-slate-700 text-[10.5px] font-medium leading-tight">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-[10.5px]">
                          <span className="font-bold text-slate-900">{item.value}</span>
                          <span className="text-muted-foreground text-[9.5px]">({percent}%)</span>
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
