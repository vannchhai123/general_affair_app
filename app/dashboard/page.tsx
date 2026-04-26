'use client';

import {
  AlertCircle,
  CalendarOff,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboard } from '@/hooks/dashboard/use-dashboard';
import type { Attendance } from '@/lib/schemas';

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  progress: number;
  icon: React.ElementType;
  tone: string;
  barTone: string;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function percent(part: number, total: number) {
  return total > 0 ? clampPercent((part / total) * 100) : 0;
}

function formatMinutes(totalMinutes: number | null | undefined) {
  if (typeof totalMinutes !== 'number' || totalMinutes <= 0) return '--';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function StatCard({
  title,
  value,
  description,
  progress,
  icon: Icon,
  tone,
  barTone,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
          <div className={`rounded-md p-2.5 ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <Progress
          className="mt-4 h-1.5 bg-slate-100"
          value={progress}
          indicatorClassName={barTone}
        />
      </CardContent>
    </Card>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="rounded-lg border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <StatsLoading />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-[380px] rounded-lg" />
        <Skeleton className="h-[380px] rounded-lg" />
      </div>
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
  isFetching,
}: {
  message?: string;
  onRetry: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <Card className="border-red-200 bg-red-50/60 shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-red-100 p-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-red-950">
                មិនអាចផ្ទុកទិន្នន័យផ្ទាំងគ្រប់គ្រងបានទេ
              </CardTitle>
              <CardDescription className="mt-1 text-red-800">
                ផ្ទាំងគ្រប់គ្រងត្រូវការ endpoint <span className="font-mono">GET /dashboard</span>{' '}
                ដែលដំណើរការពី <span className="font-mono">NEXT_PUBLIC_API_URL</span>។
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div className="rounded-md border border-red-200 bg-white p-3 text-sm text-red-900">
              {message}
            </div>
          ) : null}

          <div className="rounded-md border bg-white p-4">
            <p className="text-sm font-medium text-slate-950">ទម្រង់ response ដែលត្រូវការ</p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50">
              {`{
  "officers": { "total": 0, "active": 0, "on_leave": 0, "inactive": 0 },
  "attendance": { "total": 0, "approved": 0, "pending": 0, "absent": 0 },
  "invitations": { "total": 0, "active": 0, "completed": 0 },
  "missions": { "total": 0, "approved": 0, "pending": 0 },
  "leave_requests": { "total": 0, "approved": 0, "pending": 0 },
  "recent_attendance": []
}`}
            </pre>
          </div>

          <Button variant="outline" onClick={onRetry} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            ព្យាយាមម្តងទៀត
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function statusBadge(status: string) {
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case 'APPROVED':
    case 'PRESENT':
      return <Badge className="border-0 bg-emerald-100 text-emerald-700">មានវត្តមាន</Badge>;
    case 'PENDING':
    case 'LATE':
      return <Badge className="border-0 bg-amber-100 text-amber-700">{status}</Badge>;
    case 'ABSENT':
      return <Badge className="border-0 bg-red-100 text-red-700">អវត្តមាន</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function AttentionItem({
  icon: Icon,
  title,
  helper,
  value,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  helper: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-md p-2.5 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950">{title}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
      <span className="text-2xl font-semibold tracking-tight text-slate-950">{value}</span>
    </div>
  );
}

function RecentAttendanceTable({ records }: { records: Attendance[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>មន្ត្រី</TableHead>
            <TableHead>នាយកដ្ឋាន</TableHead>
            <TableHead>ម៉ោងធ្វើការ</TableHead>
            <TableHead>ស្ថានភាព</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className="hover:bg-slate-50/70">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {initials(record.firstName, record.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {record.firstName} {record.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.officerCode || 'គ្មានកូដ'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.department}</TableCell>
              <TableCell className="text-sm font-medium">
                {formatMinutes(record.totalWorkMin)}
              </TableCell>
              <TableCell>{statusBadge(record.status)}</TableCell>
            </TableRow>
          ))}
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <div className="rounded-md bg-slate-100 p-3 text-slate-500">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-950">មិនទាន់មានកំណត់ត្រាវត្តមាន</p>
                  <p className="text-sm text-muted-foreground">
                    ការឆែកចូលថ្មីៗនឹងបង្ហាញនៅទីនេះ នៅពេលមន្ត្រីចាប់ផ្តើមកត់ត្រាវត្តមាន។
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

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
      />
    );
  }

  const activeOfficers = data.officers?.active ?? 0;
  const totalOfficers = data.officers?.total ?? 0;
  const attendanceTotal = data.attendance?.total ?? 0;
  const attendanceApproved = data.attendance?.approved ?? 0;
  const invitationsTotal = data.invitations?.total ?? 0;
  const activeInvitations = data.invitations?.active ?? 0;
  const missionsTotal = data.missions?.total ?? 0;
  const pendingMissions = data.missions?.pending ?? 0;
  const pendingLeaveRequests = data.leave_requests?.pending ?? 0;
  const absentToday = data.attendance?.absent ?? 0;
  const pendingAttendance = data.attendance?.pending ?? 0;
  const completedInvitations = data.invitations?.completed ?? 0;
  const attentionTotal = pendingLeaveRequests + pendingMissions + absentToday + pendingAttendance;

  const stats = [
    {
      title: 'មន្ត្រីសរុប',
      value: totalOfficers,
      description: `${activeOfficers} សកម្ម, ${data.officers?.on_leave ?? 0} កំពុងឈប់សម្រាក`,
      progress: percent(activeOfficers, totalOfficers),
      icon: Users,
      tone: 'bg-slate-100 text-slate-700',
      barTone: 'bg-slate-700',
    },
    {
      title: 'វត្តមានថ្ងៃនេះ',
      value: attendanceTotal,
      description: `${attendanceApproved} បានអនុម័ត, ${pendingAttendance} កំពុងរង់ចាំ`,
      progress: percent(attendanceApproved, attendanceTotal),
      icon: ClipboardCheck,
      tone: 'bg-emerald-50 text-emerald-700',
      barTone: 'bg-emerald-600',
    },
    {
      title: 'លិខិតអញ្ជើញសកម្ម',
      value: activeInvitations,
      description: `${completedInvitations} បានបញ្ចប់ ពីសរុប ${invitationsTotal}`,
      progress: percent(activeInvitations, invitationsTotal),
      icon: Mail,
      tone: 'bg-blue-50 text-blue-700',
      barTone: 'bg-blue-600',
    },
    {
      title: 'បេសកកម្មកំពុងរង់ចាំ',
      value: pendingMissions,
      description: `${data.missions?.approved ?? 0} បានអនុម័ត ពីសរុប ${missionsTotal}`,
      progress: percent(missionsTotal - pendingMissions, missionsTotal),
      icon: Target,
      tone: 'bg-amber-50 text-amber-700',
      barTone: 'bg-amber-500',
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-md bg-background">
            មជ្ឈមណ្ឌលបញ្ជាការ
          </Badge>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              ផ្ទាំងគ្រប់គ្រង
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              តាមដានមន្ត្រី វត្តមាន លិខិតអញ្ជើញ បេសកកម្ម និងការអនុម័ត ពីកន្លែងការងារតែមួយ។
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          ធ្វើបច្ចុប្បន្នភាព
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">វត្តមានថ្មីៗ</CardTitle>
                <CardDescription>
                  កំណត់ត្រាវត្តមាន និងម៉ោងធ្វើការចុងក្រោយរបស់មន្ត្រី។
                </CardDescription>
              </div>
              <div className="rounded-md bg-white p-2 text-slate-600 shadow-sm">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <RecentAttendanceTable records={data.recent_attendance ?? []} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="border-0 bg-slate-900 text-white hover:bg-slate-900">
                    ប្រតិបត្តិការ
                  </Badge>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                    មាន {attentionTotal} ចំណុចត្រូវការការយកចិត្តទុកដាក់
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    ផ្តល់អាទិភាពលើការអនុម័តកំពុងរង់ចាំ ករណីវត្តមានខុសប្រក្រតី និងការបញ្ជាក់បេសកកម្ម។
                  </p>
                </div>
                <div className="rounded-md bg-amber-50 p-3 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-lg border bg-slate-50 p-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {percent(activeOfficers, totalOfficers)}%
                  </p>
                  <p className="text-xs text-muted-foreground">កម្លាំងសកម្ម</p>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-700" />
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {percent(attendanceApproved, attendanceTotal)}%
                  </p>
                  <p className="text-xs text-muted-foreground">វត្តមានត្រឹមត្រូវ</p>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <UserX className="h-4 w-4 text-red-700" />
                  <p className="mt-2 text-xl font-semibold text-slate-950">{absentToday}</p>
                  <p className="text-xs text-muted-foreground">អវត្តមានថ្ងៃនេះ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/80">
              <CardTitle className="text-base">បញ្ជីការងារត្រូវដោះស្រាយ</CardTitle>
              <CardDescription>ការងារកំពុងរង់ចាំដែលបានបែងចែកតាមផ្នែកប្រតិបត្តិការ។</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              <AttentionItem
                icon={CalendarOff}
                title="សំណើឈប់សម្រាកកំពុងរង់ចាំ"
                helper="ត្រូវការអនុម័ត"
                value={pendingLeaveRequests}
                tone="bg-amber-50 text-amber-700"
              />
              <AttentionItem
                icon={Target}
                title="បេសកកម្មកំពុងរង់ចាំ"
                helper="កំពុងរង់ចាំការបញ្ជាក់"
                value={pendingMissions}
                tone="bg-blue-50 text-blue-700"
              />
              <AttentionItem
                icon={ClipboardCheck}
                title="វត្តមានកំពុងរង់ចាំ"
                helper="ត្រូវការពិនិត្យ"
                value={pendingAttendance}
                tone="bg-red-50 text-red-700"
              />
              <AttentionItem
                icon={Clock}
                title="លិខិតអញ្ជើញសកម្ម"
                helper="ព្រឹត្តិការណ៍ខាងមុខ"
                value={activeInvitations}
                tone="bg-emerald-50 text-emerald-700"
              />
              <AttentionItem
                icon={UserCheck}
                title="មន្ត្រីកំពុងបំពេញការងារ"
                helper="កំពុងសកម្ម"
                value={activeOfficers}
                tone="bg-slate-100 text-slate-700"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
