'use client';

import { Download, Plus, QrCode, RefreshCw, Workflow } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';
import {
  AttentionListCard,
  AttentionSummaryCard,
  type AttentionItemData,
  type AttentionMetric,
} from '@/components/dashboard/attention-cards';
import { DashboardError, DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentAttendanceCard } from '@/components/dashboard/recent-attendance-card';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import { PageHeader } from '@/components/app-shell/page-header';
import { Button } from '@/components/ui/button';
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
      title: t('stats.totalOfficers'),
      value: data.officers?.total ?? 0,
      icon: Users,
      tone: 'bg-slate-100 text-slate-700',
    },
    {
      title: t('stats.activeOfficers'),
      value: data.officers?.active ?? 0,
      icon: UserCheck,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: t('stats.attendanceToday'),
      value: data.attendance?.total ?? 0,
      icon: ClipboardCheck,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      title: t('stats.qrSessions'),
      value: data.invitations?.total ?? 0,
      icon: QrCode,
      tone: 'bg-amber-50 text-amber-700',
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
      label: 'Approved attendance',
      value: `${percent(data.attendance?.approved ?? 0, data.attendance?.total ?? 0)}%`,
      icon: CheckCircle2,
      tone: 'text-blue-700',
    },
    {
      label: 'Absent today',
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
          <AttentionSummaryCard
            badge="Operations"
            prefix="There are"
            total={
              (data.leave_requests?.pending ?? 0) +
              (data.missions?.pending ?? 0) +
              (data.attendance?.absent ?? 0) +
              (data.attendance?.pending ?? 0)
            }
            suffix="items requiring attention"
            metrics={buildAttentionMetrics(data, t)}
          />
          <AttentionListCard title="Operational Queue" items={buildAttentionItems(data, t)} />
        </div>

        <RecentAttendanceCard
          records={data.recent_attendance ?? []}
          labels={{
            title: 'Recent Attendance',
            officer: 'Officer',
            department: 'Department',
            workHours: 'Work Hours',
            status: 'Status',
            noCode: 'No Code',
            emptyTitle: 'No recent attendance',
            emptyDescription:
              'New attendance activity will appear here once officers start checking in.',
            present: 'Present',
            absent: 'Absent',
          }}
        />
      </div>
    </RequireAccess>
  );
}
