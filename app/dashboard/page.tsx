'use client';

import { QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';
import {
  AttentionListCard,
  type AttentionItemData,
  type AttentionMetric,
} from '@/components/dashboard/attention-cards';
import { DashboardError, DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentAttendanceCard } from '@/components/dashboard/recent-attendance-card';
import { RecentRequestsCard } from '@/components/dashboard/recent-requests-card';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import { percent } from '@/lib/dashboard/utils';
import type { DashboardStats } from '@/lib/schemas';
import {
  CalendarOff,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ShieldCheck,
  Target,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';

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

function buildAttentionMetrics(
  data: DashboardStats,
  t: (key: string) => string,
): AttentionMetric[] {
  return [
    {
      label: t('attention.officerAvailability'),
      value: `${percent(data.officers?.active ?? 0, data.officers?.total ?? 0)}%`,
      icon: ShieldCheck,
      tone: 'text-emerald-700',
    },
    {
      label: t('attention.attendanceRate'),
      value: `${percent(data.attendance?.approved ?? 0, data.attendance?.total ?? 0)}%`,
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

function buildAttentionItems(
  data: DashboardStats,
  t: (key: string) => string,
): AttentionItemData[] {
  return [
    {
      icon: CalendarOff,
      title: t('attention.pendingLeaveRequests'),
      helper: t('attention.needsReview'),
      value: data.leave_requests?.pending ?? 0,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      icon: Target,
      title: t('attention.pendingMissions'),
      helper: t('attention.operationalFollowUp'),
      value: data.missions?.pending ?? 0,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      icon: ClipboardCheck,
      title: t('attention.pendingAttendanceApprovals'),
      helper: t('attention.awaitingConfirmation'),
      value: data.attendance?.pending ?? 0,
      tone: 'bg-red-50 text-red-700',
    },
    {
      icon: Clock,
      title: t('attention.activeSessions'),
      helper: t('attention.runningToday'),
      value: data.invitations?.active ?? 0,
      tone: 'bg-emerald-50 text-emerald-700',
    },
  ];
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const { hasPermission, isSuperAdmin } = useAuth();
  const t = useTranslations('dashboard');

  if (isLoading) return <DashboardLoading />;

  if (isError || !data) {
    return (
      <DashboardError
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        isFetching={isFetching}
        title="Unable to load dashboard data"
        description="The operational summary endpoint is unavailable."
        responseLabel="Expected response"
        retryLabel="Retry"
      />
    );
  }

  return (
    <RequireAccess permission="DASHBOARD_VIEW">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {buildStatCards(data, t).map((stat) => (
            <DashboardStatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
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
          <AttentionListCard
            title={t('attention.operationalQueue')}
            items={buildAttentionItems(data, t)}
          />
        </div>

        <RecentAttendanceCard
          records={data.recent_attendance ?? []}
          labels={{
            title: t('recentAttendance.title'),
            officer: t('recentAttendance.officer'),
            department: t('recentAttendance.department'),
            workHours: t('recentAttendance.workHours'),
            status: t('recentAttendance.status'),
            noCode: t('recentAttendance.noCode'),
            emptyTitle: t('recentAttendance.emptyTitle'),
            emptyDescription: t('recentAttendance.emptyDescription'),
            present: t('recentAttendance.present'),
            absent: t('recentAttendance.absent'),
          }}
        />
      </div>
    </RequireAccess>
  );
}
