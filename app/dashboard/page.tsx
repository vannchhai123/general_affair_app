'use client';

import { useTranslations } from 'next-intl';
import { RequireAccess } from '@/components/auth/require-access';
import { DashboardError, DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentAttendanceCard } from '@/components/dashboard/recent-attendance-card';
import { RecentRequestsCard } from '@/components/dashboard/recent-requests-card';
import { DashboardAnalyticsCards } from '@/components/dashboard/dashboard-analytics-cards';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import type { DashboardStats } from '@/lib/schemas';
import { CheckCircle2, ClipboardCheck, QrCode, UserCheck, UserX, Users } from 'lucide-react';

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

  if (isLoading) return <DashboardLoading />;

  if (isError || !data) {
    return (
      <RequireAccess permission="DASHBOARD_VIEW">
        <DashboardError
          title={t('errors.dashboardTitle')}
          description={t('errors.dashboardDescription')}
          message={isError?.message}
          responseLabel={t('errors.dashboardResponseLabel')}
          retryLabel={t('errors.retryLabel')}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      </RequireAccess>
    );
  }

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
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {t('metricsBadge')}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {buildStatCards(data, t).map((stat) => (
            <DashboardStatCard key={stat.title} {...stat} />
          ))}
        </div>

        <DashboardAnalyticsCards stats={data} records={data.recent_attendance ?? []} />
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
              summaryMetrics={buildAttentionMetrics(data, t)}
            />
          </div>
        </div>
      </div>
    </RequireAccess>
  );
}
