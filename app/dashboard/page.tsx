'use client';

import { useTranslations } from 'next-intl';
import { RequireAccess } from '@/components/auth/require-access';
import { DashboardError, DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentAttendanceCard } from '@/components/dashboard/recent-attendance-card';
import { RecentInvitationsCard } from '@/components/dashboard/recent-invitations-card';
import { DashboardAnalyticsCards } from '@/components/dashboard/dashboard-analytics-cards';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import { useInvitations } from '@/hooks/invitations/use-invitations';
import { useOfficers } from '@/hooks/officers/use-officers';
import type { DashboardStats } from '@/lib/schemas';
import { ClipboardCheck, QrCode, UserCheck, UserMinus, Users } from 'lucide-react';

function getTodayAttendanceCount(data: DashboardStats) {
  const today = new Date();

  return data.recent_attendance.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate.toDateString() === today.toDateString();
  }).length;
}

function buildStatCards(
  data: DashboardStats,
  t: (key: string) => string,
): DashboardStatCardProps[] {
  return [
    {
      title: t('stats.totalOfficers'),
      value: data.officers?.total ?? 0,
      icon: Users,
      subtext: `${data.officers?.active ?? 0} មន្ត្រីសកម្ម`,
      tone: {
        chip: 'border-blue-100 bg-blue-50',
        icon: 'text-blue-600',
        value: 'text-slate-950',
      },
    },
    {
      title: t('stats.officersOnLeave'),
      value: data.officers?.on_leave ?? 0,
      icon: UserMinus,
      subtext: 'កំពុងឈប់សម្រាក',
      tone: {
        chip: 'border-violet-100 bg-violet-50',
        icon: 'text-violet-600',
        value: 'text-slate-950',
      },
    },
    {
      title: t('stats.attendanceToday'),
      value: getTodayAttendanceCount(data),
      icon: ClipboardCheck,
      subtext: 'បានឆែកវត្តមាន',
      tone: {
        chip: 'border-emerald-100 bg-emerald-50',
        icon: 'text-emerald-600',
        value: 'text-slate-950',
      },
    },
    {
      title: t('stats.qrSessions'),
      value: data.qr_sessions?.total ?? 0,
      icon: QrCode,
      subtext: 'សម័យស្កេន',
      tone: {
        chip: 'border-amber-100 bg-amber-50',
        icon: 'text-amber-600',
        value: 'text-slate-950',
      },
    },
  ];
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const { data: invitationsData, isLoading: isInvitationsLoading } = useInvitations();
  const { officers, isLoading: isOfficersLoading } = useOfficers({ pageSize: 150 });
  const t = useTranslations('dashboard');

  if (isLoading || isInvitationsLoading || isOfficersLoading) return <DashboardLoading />;

  if (isError || !data) {
    return (
      <RequireAccess permission="DASHBOARD_VIEW">
        <DashboardError
          title={t('errors.dashboardTitle')}
          description={t('errors.dashboardDescription')}
          message={error?.message}
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
      <div className="space-y-6 w-full">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-title mt-2 text-xl font-semibold tracking-tight text-slate-950">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {buildStatCards(data, t).map((stat) => (
            <DashboardStatCard key={stat.title} {...stat} />
          ))}
        </div>

        <DashboardAnalyticsCards
          stats={data}
          records={data.recent_attendance ?? []}
          officers={officers}
        />
        <RecentInvitationsCard
          invitations={invitationsData ?? []}
          labels={{
            title: t('recentInvitations.title'),
            subject: t('recentInvitations.subject'),
            organization: t('recentInvitations.organization'),
            dateTime: t('recentInvitations.dateTime'),
            status: t('recentInvitations.status'),
            emptyTitle: t('recentInvitations.emptyTitle'),
            emptyDescription: t('recentInvitations.emptyDescription'),
          }}
        />
      </div>
    </RequireAccess>
  );
}
