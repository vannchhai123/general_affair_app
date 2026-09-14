'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequireAccess } from '@/components/auth/require-access';
import { DashboardError, DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentInvitationsCard } from '@/components/dashboard/recent-invitations-card';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import {
  StatCardDetailDialog,
  type StatModalType,
} from '@/components/dashboard/stat-card-detail-dialog';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import { useInvitations } from '@/hooks/invitations/use-invitations';
import { useOfficers } from '@/hooks/officers/use-officers';
import {
  useAttendance,
  useTodayPresentAttendance,
  useTodayAbsentAttendance,
} from '@/hooks/attendance/use-attendance';
import { useLeaveRequests } from '@/hooks/leave-requests/use-leave-requests';
import type { DashboardStats, LeaveRequest } from '@/lib/schemas';
import { ClipboardCheck, UserMinus, Users, UserX } from 'lucide-react';

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayAttendanceCount(
  data: DashboardStats,
  todayAttendanceData?: { totalElements?: number; content?: any[] },
) {
  // 1. If today's attendance API returned a count
  if (todayAttendanceData) {
    if (typeof todayAttendanceData.totalElements === 'number') {
      return todayAttendanceData.totalElements;
    }
    if (Array.isArray(todayAttendanceData.content)) {
      return todayAttendanceData.content.length;
    }
  }

  // 2. Count from recent_attendance strictly for today's date
  const today = new Date();
  const todayDateString = today.toDateString();
  const todayYMD = today.toISOString().slice(0, 10);
  const localTodayYMD = getTodayDateString();

  const matchedRecent = (data.recent_attendance ?? []).filter((record) => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    if (!isNaN(recordDate.getTime()) && recordDate.toDateString() === todayDateString) {
      return true;
    }
    const cleanDate = record.date.slice(0, 10);
    return cleanDate === todayYMD || cleanDate === localTodayYMD;
  }).length;

  return matchedRecent;
}

function calculateOnLeaveCount(
  data: DashboardStats,
  leaveRequests: LeaveRequest[],
  officersList?: any[],
): number {
  // 1. Calculate from actual leave requests data
  if (leaveRequests && leaveRequests.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTodayLeaves = leaveRequests.filter((leave) => {
      const status = (leave.status || '').trim().toLowerCase();
      if (status === 'rejected') return false;

      if (leave.start_date && leave.end_date) {
        const start = new Date(leave.start_date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(leave.end_date);
        end.setHours(23, 59, 59, 999);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          return today >= start && today <= end;
        }
      }
      return status === 'approved';
    });

    if (activeTodayLeaves.length > 0) {
      return activeTodayLeaves.length;
    }

    const approvedCount = leaveRequests.filter(
      (l) => (l.status || '').trim().toLowerCase() === 'approved',
    ).length;
    if (approvedCount > 0) {
      return approvedCount;
    }

    const pendingOrAllCount = leaveRequests.filter(
      (l) => (l.status || '').trim().toLowerCase() !== 'rejected',
    ).length;
    if (pendingOrAllCount > 0) {
      return pendingOrAllCount;
    }

    return leaveRequests.length;
  }

  // 2. Count from officers list where status is on_leave
  if (officersList && officersList.length > 0) {
    const onLeaveOfficers = officersList.filter((o) => {
      const s = (o.status || '').toLowerCase().trim();
      return s === 'on_leave' || s === 'onleave' || s === 'leave';
    });
    if (onLeaveOfficers.length > 0) {
      return onLeaveOfficers.length;
    }
  }

  // 3. Fallback to dashboard API data
  return (
    data.officers?.on_leave || data.leave_requests?.approved || data.leave_requests?.total || 0
  );
}

function buildStatCards(
  data: DashboardStats,
  t: (key: string) => string,
  leaveCount: number,
  todayAttendanceCount: number,
  absentTodayCount: number,
  onCardClick: (type: StatModalType) => void,
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
      onClick: () => onCardClick('officers'),
    },
    {
      title: t('stats.officersOnLeave'),
      value: leaveCount,
      icon: UserMinus,
      subtext: 'កំពុងឈប់សម្រាក',
      tone: {
        chip: 'border-violet-100 bg-violet-50',
        icon: 'text-violet-600',
        value: 'text-slate-950',
      },
      onClick: () => onCardClick('leaves'),
    },
    {
      title: 'វត្តមានថ្ងៃនេះ',
      value: todayAttendanceCount,
      icon: ClipboardCheck,
      subtext: 'បានឆែកវត្តមាន',
      tone: {
        chip: 'border-emerald-100 bg-emerald-50',
        icon: 'text-emerald-600',
        value: 'text-slate-950',
      },
      onClick: () => onCardClick('present'),
    },
    {
      title: 'អវត្តមានថ្ងៃនេះ',
      value: absentTodayCount,
      icon: UserX,
      subtext: 'មិនទាន់ឆែកវត្តមាន',
      tone: {
        chip: 'border-rose-100 bg-rose-50',
        icon: 'text-rose-600',
        value: 'text-slate-950',
      },
      onClick: () => onCardClick('absent'),
    },
  ];
}

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<StatModalType>(null);
  const todayStr = getTodayDateString();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const { data: invitationsData, isLoading: isInvitationsLoading } = useInvitations();
  const { data: leaveRequestsData = [] } = useLeaveRequests();
  const { data: todayAttendanceData } = useAttendance({ date: todayStr, size: 1000 });
  const { data: todayPresentData } = useTodayPresentAttendance({ date: todayStr, size: 1000 });
  const { data: todayAbsentData } = useTodayAbsentAttendance({ date: todayStr, size: 1000 });
  const { officers = [], isLoading: isOfficersLoading } = useOfficers({ page: 1, pageSize: 1000 });
  const t = useTranslations('dashboard');

  const activeOfficersCount =
    data?.officers?.active ||
    officers.filter((o) => (o.status || '').toLowerCase() === 'active').length ||
    officers.length;

  const onLeaveCount = calculateOnLeaveCount(
    data ?? ({} as DashboardStats),
    leaveRequestsData,
    officers,
  );

  // Present count: Prefer dedicated endpoint totalElements, fallback to attendance query
  const todayAttendanceCount =
    typeof todayPresentData?.totalElements === 'number'
      ? todayPresentData.totalElements
      : getTodayAttendanceCount(data ?? ({} as DashboardStats), todayAttendanceData);

  // Calculate on-leave officer IDs to reliably exclude them from absent list/count
  const onLeaveOfficerIds = new Set<number>();
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  leaveRequestsData.forEach((leave) => {
    const status = (leave.status || '').trim().toLowerCase();
    if (status !== 'rejected') {
      if (leave.start_date && leave.end_date) {
        const start = new Date(leave.start_date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(leave.end_date);
        end.setHours(23, 59, 59, 999);
        if (
          !isNaN(start.getTime()) &&
          !isNaN(end.getTime()) &&
          todayObj >= start &&
          todayObj <= end
        ) {
          onLeaveOfficerIds.add(leave.officer_id);
        }
      } else if (status === 'approved') {
        onLeaveOfficerIds.add(leave.officer_id);
      }
    }
  });

  officers.forEach((o) => {
    const s = (o.status || '').toLowerCase().trim();
    if (['on_leave', 'onleave', 'leave', 'សុំច្បាប់'].includes(s)) {
      onLeaveOfficerIds.add(o.id);
    }
  });

  // Filter backend absent data to strictly exclude officers on leave
  const filteredTodayAbsentRecords = todayAbsentData?.content
    ? todayAbsentData.content.filter((officer: any) => {
        const s = (officer.status || '').toLowerCase().trim();
        if (
          ['on_leave', 'onleave', 'leave', 'សុំច្បាប់', 'inactive', 'deleted', 'អសកម្ម'].includes(s)
        ) {
          return false;
        }
        if (onLeaveOfficerIds.has(officer.id)) {
          return false;
        }
        return true;
      })
    : undefined;

  // Absent count: Must exclude present and on-leave officers
  const absentTodayCount =
    filteredTodayAbsentRecords !== undefined
      ? filteredTodayAbsentRecords.length
      : Math.max(0, activeOfficersCount - todayAttendanceCount - onLeaveCount);

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
              <h1 className="page-title mt-2 text-md font-semibold tracking-tight text-slate-950">
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
          {buildStatCards(
            data,
            t,
            onLeaveCount,
            todayAttendanceCount,
            absentTodayCount,
            setActiveModal,
          ).map((stat) => (
            <DashboardStatCard key={stat.title} {...stat} />
          ))}
        </div>

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

        {/* Modal Dialog for Card Details */}
        <StatCardDetailDialog
          type={activeModal}
          open={Boolean(activeModal)}
          onOpenChange={(open) => {
            if (!open) setActiveModal(null);
          }}
          dashboardData={data}
          officers={officers}
          leaveRequests={leaveRequestsData}
          attendanceRecords={todayAttendanceData?.content ?? []}
          todayPresentRecords={todayPresentData?.content}
          todayAbsentOfficers={filteredTodayAbsentRecords}
        />
      </div>
    </RequireAccess>
  );
}
