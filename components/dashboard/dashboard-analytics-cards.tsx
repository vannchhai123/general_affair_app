'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Attendance, DashboardStats } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ATTENDANCE_COLORS = {
  present: '#059669',
  late: '#d97706',
  absent: '#dc2626',
};

const REQUEST_COLORS = {
  leave: '#2563eb',
  mission: '#0f766e',
  attendance: '#8b5cf6',
};

function formatTrendDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return format(parsed, 'MMM d');
}

function buildTrendData(records: Attendance[]) {
  const trendMap = new Map<
    string,
    { date: string; present: number; late: number; absent: number }
  >();

  records.forEach((record) => {
    const date = formatTrendDate(record.date);
    const existing = trendMap.get(date) ?? { date, present: 0, late: 0, absent: 0 };
    const normalizedStatus = record.status?.toString().trim().toLowerCase() ?? '';

    if (['present', 'មាន'].includes(normalizedStatus)) existing.present += 1;
    if (['late', 'យឺត'].includes(normalizedStatus)) existing.late += 1;
    if (['absent', 'អវត្តមាន'].includes(normalizedStatus)) existing.absent += 1;

    trendMap.set(date, existing);
  });

  const result = Array.from(trendMap.values()).slice(-7);

  if (result.length === 0) {
    return [
      { date: 'Jun 3', present: 18, late: 2, absent: 1 },
      { date: 'Jun 4', present: 22, late: 1, absent: 2 },
      { date: 'Jun 5', present: 20, late: 3, absent: 0 },
      { date: 'Jun 6', present: 24, late: 0, absent: 1 },
      { date: 'Jun 7', present: 21, late: 2, absent: 1 },
      { date: 'Jun 8', present: 23, late: 1, absent: 1 },
      { date: 'Jun 9', present: 19, late: 3, absent: 0 },
    ];
  }

  return result;
}

function buildGenderBreakdown(t: (key: string) => string) {
  return [
    { name: t('analytics.genderMalePresent'), value: 18, fill: '#2563eb' },
    { name: t('analytics.genderFemalePresent'), value: 14, fill: '#059669' },
    { name: t('analytics.genderMaleLate'), value: 4, fill: '#d97706' },
    { name: t('analytics.genderFemaleLate'), value: 2, fill: '#dc2626' },
  ];
}

function buildRequestBreakdown(data: DashboardStats, t: (key: string) => string) {
  return [
    {
      name: t('analytics.leaveRequests'),
      value: data.leave_requests?.total ?? 0,
      fill: REQUEST_COLORS.leave,
    },
    {
      name: t('analytics.missions'),
      value: data.missions?.total ?? 0,
      fill: REQUEST_COLORS.mission,
    },
    {
      name: t('analytics.attendanceApprovals'),
      value: data.attendance?.pending ?? 0,
      fill: REQUEST_COLORS.attendance,
    },
  ];
}

function buildStatusCards(data: DashboardStats, t: (key: string) => string) {
  return [
    {
      label: t('analytics.approvedRequests'),
      value: data.leave_requests?.approved ?? 0,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: t('analytics.pendingRequests'),
      value: data.leave_requests?.pending ?? 0,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: t('analytics.inactiveOfficers'),
      value: data.officers?.inactive ?? 0,
      tone: 'bg-slate-100 text-slate-800',
    },
  ];
}

export function DashboardAnalyticsCards({
  stats,
  records,
}: {
  stats: DashboardStats;
  records: Attendance[];
}) {
  const t = useTranslations('dashboard');
  const trendData = useMemo(() => buildTrendData(records), [records]);
  const requestData = useMemo(() => buildRequestBreakdown(stats, t), [stats, t]);
  const statusCards = useMemo(() => buildStatusCards(stats, t), [stats, t]);

  const genderData = useMemo(() => buildGenderBreakdown(t), [t]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.8fr_1fr] items-start">
      <Card className="min-w-0 border-slate-200 shadow-sm h-[520px] flex flex-col">
        <CardHeader>
          <CardTitle>{t('analytics.attendanceTrend')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-hidden">
          <div className="grid gap-3 sm:grid-cols-3">
            {statusCards.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium ${item.tone}`}
              >
                <p className="truncate">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip />
                <Legend verticalAlign="top" height={24} />
                <Bar
                  dataKey="present"
                  stackId="a"
                  fill={ATTENDANCE_COLORS.present}
                  name={t('analytics.present')}
                />
                <Bar
                  dataKey="late"
                  stackId="a"
                  fill={ATTENDANCE_COLORS.late}
                  name={t('analytics.late')}
                />
                <Bar
                  dataKey="absent"
                  stackId="a"
                  fill={ATTENDANCE_COLORS.absent}
                  name={t('analytics.absent')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>{t('analytics.genderAttendance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-3">
            <div className="flex items-center gap-4">
              <div className="w-1/2 h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={56}
                      paddingAngle={4}
                      stroke="transparent"
                    >
                      {genderData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 max-h-32 overflow-auto pr-2">
                <div className="space-y-1 text-xs text-slate-700">
                  {genderData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1"
                    >
                      <span
                        className="inline-flex h-2 w-2 rounded-full"
                        style={{ background: item.fill }}
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>{t('analytics.requestDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-3">
            <div className="flex items-center gap-4">
              <div className="w-1/2 h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={requestData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={56}
                      paddingAngle={4}
                      stroke="transparent"
                    >
                      {requestData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-1/2 max-h-32 overflow-auto pr-2">
                <div className="space-y-1 text-xs text-slate-700">
                  {requestData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1"
                    >
                      <span
                        className="inline-flex h-2 w-2 rounded-full"
                        style={{ background: item.fill }}
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
