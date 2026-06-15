'use client';

import { useTranslations } from 'next-intl';
import { RequireAccess } from '@/components/auth/require-access';
import { DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentAttendanceCard } from '@/components/dashboard/recent-attendance-card';
import { RecentRequestsCard } from '@/components/dashboard/recent-requests-card';
import { DashboardAnalyticsCards } from '@/components/dashboard/dashboard-analytics-cards';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import type { DashboardStats } from '@/lib/schemas';
import { CheckCircle2, ClipboardCheck, QrCode, UserCheck, UserX, Users } from 'lucide-react';

const mockDashboardData: DashboardStats = {
  officers: { total: 120, active: 98, on_leave: 12, inactive: 10 },
  attendance: { total: 102, approved: 95, pending: 5, absent: 3 },
  invitations: { total: 15, active: 8, completed: 7 },
  missions: { total: 9, approved: 5, pending: 4 },
  leave_requests: { total: 24, approved: 18, pending: 6 },
  recent_attendance: [
    {
      id: 1,
      officerId: 101,
      imageUrl: null,
      date: '09/06/2026',
      checkIn: '08:09',
      checkOut: '17:05',
      totalWorkMin: 536,
      totalLateMin: 9,
      status: 'មាន',
      firstName: 'សុខា',
      lastName: 'បុត្រា',
      department: 'ការិយាល័យគ្រប់គ្រង',
      officerCode: 'OF-101',
      sessions: [
        { id: 1001, shiftName: 'ព្រឹក', checkIn: '08:09', checkOut: '17:05', status: 'សម្រេច' },
      ],
    },
    {
      id: 2,
      officerId: 102,
      imageUrl: null,
      date: '09/06/2026',
      checkIn: '08:22',
      checkOut: '17:00',
      totalWorkMin: 518,
      totalLateMin: 22,
      status: 'មាន',
      firstName: 'តារា',
      lastName: 'ស្រី',
      department: 'ការិយាល័យធនធានមនុស្ស',
      officerCode: 'OF-102',
      sessions: [
        { id: 1002, shiftName: 'ព្រឹក', checkIn: '08:22', checkOut: '17:00', status: 'សម្រេច' },
      ],
    },
    {
      id: 3,
      officerId: 103,
      imageUrl: null,
      date: '09/06/2026',
      checkIn: null,
      checkOut: null,
      totalWorkMin: 0,
      totalLateMin: 0,
      status: 'អវត្តមាន',
      firstName: 'ព្រី',
      lastName: 'ទូច',
      department: 'សេវាកម្មពហុ',
      officerCode: 'OF-103',
      sessions: null,
    },
  ],
};

function buildStatCards(
  data: DashboardStats,
  t: (key: string) => string,
): DashboardStatCardProps[] {
  return [
    {
      title: t('stats.itemsTotal'),
      value:
        (data.leave_requests?.pending ?? 0) +
        (data.missions?.pending ?? 0) +
        (data.attendance?.pending ?? 0),
      icon: Users,
      tone: {
        chip: 'border-sky-100 bg-sky-50',
        icon: 'text-sky-700',
        value: 'text-slate-950',
      },
    },
    {
      title: t('stats.activeOfficers'),
      value: data.officers?.active ?? 0,
      icon: UserCheck,
      tone: {
        chip: 'border-emerald-100 bg-emerald-50',
        icon: 'text-emerald-700',
        value: 'text-slate-950',
      },
    },
    {
      title: t('stats.attendanceToday'),
      value: data.attendance?.total ?? 0,
      icon: ClipboardCheck,
      tone: {
        chip: 'border-blue-100 bg-blue-50',
        icon: 'text-blue-700',
        value: 'text-slate-950',
      },
    },
    {
      title: t('stats.qrSessions'),
      value: data.invitations?.total ?? 0,
      icon: QrCode,
      tone: {
        chip: 'border-amber-100 bg-amber-50',
        icon: 'text-amber-700',
        value: 'text-slate-950',
      },
    },
  ];
}

function buildAttentionMetrics(data: DashboardStats, t: (key: string) => string) {
  return [
    {
      label: t('attention.officerAvailability'),
      value: `${Math.round(((data.officers?.active ?? 0) / (data.officers?.total ?? 1)) * 100)}%`,
      icon: CheckCircle2,
      tone: 'text-emerald-700',
    },
    {
      label: t('attention.attendanceRate'),
      value: `${Math.round(((data.attendance?.approved ?? 0) / (data.attendance?.total ?? 1)) * 100)}%`,
      icon: CheckCircle2,
      tone: 'text-blue-700',
    },
    {
      label: t('attention.absentToday'),
      value: data.attendance?.absent ?? 0,
      icon: UserX,
      tone: 'text-red-700',
    },
  ];
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const t = useTranslations('dashboard');
  const usingMockData = isError || !data;
  const dataToShow = data ?? mockDashboardData;

  if (isLoading) return <DashboardLoading />;

  return (
    <RequireAccess permission="DASHBOARD_VIEW">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-title mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {t('pageSubtitle')}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {usingMockData ? (
                <span className="rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                  {t('mockDataBadge')}
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {t('metricsBadge')}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {buildStatCards(dataToShow, t).map((stat) => (
            <DashboardStatCard key={stat.title} {...stat} />
          ))}
        </div>

        <DashboardAnalyticsCards stats={dataToShow} records={dataToShow.recent_attendance ?? []} />
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="xl:col-span-2">
            <RecentRequestsCard
              title={t('attention.recentRequests')}
              pendingLabel={t('recentRequests.pendingLabel')}
              typeLabel={t('recentRequests.type')}
              dateLabel={t('recentRequests.date')}
              actionsLabel={t('recentRequests.actions')}
              approveLabel={t('recentRequests.approve')}
              rejectLabel={t('recentRequests.reject')}
              emptyTitle={t('recentRequests.emptyTitle')}
              emptyDescription={t('recentRequests.emptyDescription')}
              summaryMetrics={buildAttentionMetrics(dataToShow, t)}
            />
          </div>
        </div>
      </div>
    </RequireAccess>
  );
}
