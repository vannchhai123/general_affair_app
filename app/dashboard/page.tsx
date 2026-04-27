'use client';

import {
  CalendarOff,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Target,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';

import {
  AttentionListCard,
  AttentionSummaryCard,
  type AttentionItemData,
  type AttentionMetric,
} from '@/components/dashboard/attention-cards';
import { DashboardError, DashboardLoading } from '@/components/dashboard/dashboard-states';
import { RecentAttendanceCard } from '@/components/dashboard/recent-attendance-card';
import { DashboardStatCard, type DashboardStatCardProps } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import { percent } from '@/lib/dashboard/utils';
import type { DashboardStats } from '@/lib/schemas';

function buildStatCards(data: DashboardStats): DashboardStatCardProps[] {
  return [
    {
      title: 'មន្ត្រីសរុប',
      value: data.officers?.total ?? 0,
      icon: Users,
      tone: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'វត្តមានថ្ងៃនេះ',
      value: data.attendance?.total ?? 0,
      icon: ClipboardCheck,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'លិខិតអញ្ជើញសកម្ម',
      value: data.invitations?.active ?? 0,
      icon: Mail,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'បេសកកម្មកំពុងរង់ចាំ',
      value: data.missions?.pending ?? 0,
      icon: Target,
      tone: 'bg-amber-50 text-amber-700',
    },
  ];
}

function buildAttentionMetrics(data: DashboardStats): AttentionMetric[] {
  const activeOfficers = data.officers?.active ?? 0;
  const totalOfficers = data.officers?.total ?? 0;
  const attendanceTotal = data.attendance?.total ?? 0;
  const attendanceApproved = data.attendance?.approved ?? 0;

  return [
    {
      label: 'កម្លាំងសកម្ម',
      value: `${percent(activeOfficers, totalOfficers)}%`,
      icon: ShieldCheck,
      tone: 'text-emerald-700',
    },
    {
      label: 'វត្តមានត្រឹមត្រូវ',
      value: `${percent(attendanceApproved, attendanceTotal)}%`,
      icon: CheckCircle2,
      tone: 'text-blue-700',
    },
    {
      label: 'អវត្តមានថ្ងៃនេះ',
      value: data.attendance?.absent ?? 0,
      icon: UserX,
      tone: 'text-red-700',
    },
  ];
}

function buildAttentionItems(data: DashboardStats): AttentionItemData[] {
  return [
    {
      icon: CalendarOff,
      title: 'សំណើឈប់សម្រាកកំពុងរង់ចាំ',
      helper: 'ត្រូវការអនុម័ត',
      value: data.leave_requests?.pending ?? 0,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      icon: Target,
      title: 'បេសកកម្មកំពុងរង់ចាំ',
      helper: 'កំពុងរង់ចាំការបញ្ជាក់',
      value: data.missions?.pending ?? 0,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      icon: ClipboardCheck,
      title: 'វត្តមានកំពុងរង់ចាំ',
      helper: 'ត្រូវការពិនិត្យ',
      value: data.attendance?.pending ?? 0,
      tone: 'bg-red-50 text-red-700',
    },
    {
      icon: Clock,
      title: 'លិខិតអញ្ជើញសកម្ម',
      helper: 'ព្រឹត្តិការណ៍ខាងមុខ',
      value: data.invitations?.active ?? 0,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: UserCheck,
      title: 'មន្ត្រីកំពុងបំពេញការងារ',
      helper: 'កំពុងសកម្ម',
      value: data.officers?.active ?? 0,
      tone: 'bg-slate-100 text-slate-700',
    },
  ];
}

function getAttentionTotal(data: DashboardStats) {
  return (
    (data.leave_requests?.pending ?? 0) +
    (data.missions?.pending ?? 0) +
    (data.attendance?.absent ?? 0) +
    (data.attendance?.pending ?? 0)
  );
}

const recentAttendanceLabels = {
  title: 'វត្តមានថ្មីៗ',
  officer: 'មន្ត្រី',
  department: 'នាយកដ្ឋាន',
  workHours: 'ម៉ោងធ្វើការ',
  status: 'ស្ថានភាព',
  noCode: 'គ្មានកូដ',
  emptyTitle: 'មិនទាន់មានកំណត់ត្រាវត្តមាន',
  emptyDescription: 'ការឆែកចូលថ្មីៗនឹងបង្ហាញនៅទីនេះ នៅពេលមន្ត្រីចាប់ផ្តើមកត់ត្រាវត្តមាន។',
  present: 'មានវត្តមាន',
  absent: 'អវត្តមាន',
};

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError || !data) {
    return (
      <DashboardError
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        isFetching={isFetching}
        title="មិនអាចផ្ទុកទិន្នន័យផ្ទាំងគ្រប់គ្រងបានទេ"
        description={
          <>
            ផ្ទាំងគ្រប់គ្រងត្រូវការ endpoint <span className="font-mono">GET /dashboard</span>{' '}
            ដែលដំណើរការពី <span className="font-mono">NEXT_PUBLIC_API_URL</span>។
          </>
        }
        responseLabel="ទម្រង់ response ដែលត្រូវការ"
        retryLabel="ព្យាយាមម្តងទៀត"
      />
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title text-2xl tracking-tight">ផ្ទាំងគ្រប់គ្រង</h1>
        </div>

        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          ធ្វើបច្ចុប្បន្នភាព
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {buildStatCards(data).map((stat) => (
          <DashboardStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AttentionSummaryCard
          badge="ប្រតិបត្តិការ"
          prefix="មាន"
          total={getAttentionTotal(data)}
          suffix="ចំណុចត្រូវការការយកចិត្តទុកដាក់"
          metrics={buildAttentionMetrics(data)}
        />
        <AttentionListCard title="បញ្ជីការងារត្រូវដោះស្រាយ" items={buildAttentionItems(data)} />
      </div>

      <RecentAttendanceCard
        records={data.recent_attendance ?? []}
        labels={recentAttendanceLabels}
      />
    </div>
  );
}
