'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Activity,
  Building2,
  Search,
  CalendarIcon,
  Download,
  Upload,
  Plus,
  Eye,
  Pencil,
  Users,
  UserCheck,
  UserX,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  RefreshCw,
  TimerReset,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAttendance } from '@/hooks/attendance/use-attendance';
import type { Attendance } from '@/lib/schemas';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────
interface AttendanceFormData {
  officerId: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
}

// ─── Utility Functions ─────────────────────────────────
function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDateOnly(date: string | null | undefined): string {
  if (!date) return '--';

  const normalizedDate = date.trim();
  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    return format(parsedDate, 'MMM d, yyyy');
  }

  return normalizedDate;
}

function formatTime(time: string | null | undefined): string {
  if (!time) return '--';

  const normalizedTime = time.trim();
  const parsedDate = new Date(normalizedTime);

  if (!Number.isNaN(parsedDate.getTime())) {
    return format(parsedDate, 'h:mm a');
  }

  return normalizedTime;
}

function calculateTotalHours(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
): string {
  if (!checkIn || !checkOut) return '--';

  const start = new Date(checkIn.trim());
  const end = new Date(checkOut.trim());

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '--';
  }

  const diffMs = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    return '--';
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatMinutes(totalMinutes: number | null | undefined): string {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes < 0) {
    return '--';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'present':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    case 'absent':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    case 'late':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
    case 'half-day':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }
}

function formatCompactDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return format(parsed, 'MMM d');
}

function formatHoursFromMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '--';
  return `${(totalMinutes / 60).toFixed(1)}h`;
}

const attendanceStatusChartConfig = {
  present: { label: 'Present', color: '#059669' },
  late: { label: 'Late', color: '#d97706' },
  absent: { label: 'Absent', color: '#dc2626' },
  halfDay: { label: 'Half-day', color: '#2563eb' },
} satisfies ChartConfig;

const attendanceTrendChartConfig = {
  present: { label: 'Present', color: '#10b981' },
  late: { label: 'Late', color: '#f59e0b' },
  absent: { label: 'Absent', color: '#ef4444' },
} satisfies ChartConfig;

const departmentAttendanceChartConfig = {
  present: { label: 'Present', color: '#059669' },
  late: { label: 'Late', color: '#d97706' },
  absent: { label: 'Absent', color: '#dc2626' },
} satisfies ChartConfig;

const shiftActivityChartConfig = {
  sessions: { label: 'Sessions', color: '#0f766e' },
} satisfies ChartConfig;

// ─── Summary Cards Component ───────────────────────────
function SummaryCards({
  data,
  isLoading,
  error,
}: {
  data?: { content: Attendance[]; totalElements: number };
  isLoading: boolean;
  error?: Error | null;
}) {
  const stats = useMemo(() => {
    if (!data?.content) return { total: 0, present: 0, absent: 0, late: 0 };
    return {
      total: data.totalElements || data.content.length,
      present: data.content.filter((r) => r.status === 'Present').length,
      absent: data.content.filter((r) => r.status === 'Absent').length,
      late: data.content.filter((r) => r.status === 'Late').length,
    };
  }, [data]);

  const cards = [
    {
      label: 'ចំនួនមន្ត្រីសរុប',
      value: stats.total,
      icon: Users,
      color: 'text-slate-700',
      bg: 'bg-slate-50',
      trend: '+2%',
      trendColor: 'text-emerald-600',
    },
    {
      label: 'វត្តមានថ្ងៃនេះ',
      value: stats.present,
      icon: UserCheck,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      trend: '+5%',
      trendColor: 'text-emerald-600',
    },
    {
      label: 'អវត្តមានថ្ងៃនេះ',
      value: stats.absent,
      icon: UserX,
      color: 'text-red-700',
      bg: 'bg-red-50',
      trend: '-3%',
      trendColor: 'text-red-600',
    },
    {
      label: 'មកយឺតថ្ងៃនេះ',
      value: stats.late,
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      trend: '+1%',
      trendColor: 'text-amber-600',
    },
  ];

  if (isLoading || error) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-lg border p-5 ${card.bg} shadow-sm`}>
            <Skeleton className="mb-3 h-6 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border p-5 ${card.bg} shadow-sm transition-shadow hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <card.icon className={`h-6 w-6 ${card.color}`} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{card.label}</p>
          <p className={`mt-1 text-xs font-medium ${card.trendColor}`}>{card.trend} ពីម្សិលមិញ</p>
        </div>
      ))}
    </div>
  );
}

// ─── Attendance Modal Component ────────────────────────
function AttendanceSummaryDashboard({
  records,
  isLoading,
  error,
}: {
  records: Attendance[];
  isLoading: boolean;
  error?: Error | null;
}) {
  const insights = useMemo(() => {
    const total = records.length;
    const present = records.filter((record) => record.status === 'Present').length;
    const late = records.filter((record) => record.status === 'Late').length;
    const absent = records.filter((record) => record.status === 'Absent').length;
    const halfDay = records.filter((record) => record.status === 'Half-day').length;
    const activeAttendance = present + late + halfDay;
    const attendanceRate = total > 0 ? Math.round((activeAttendance / total) * 100) : 0;
    const punctualityRate =
      activeAttendance > 0 ? Math.round((present / activeAttendance) * 100) : 0;

    const workedRecords = records.filter((record) => record.totalWorkMin > 0);
    const lateRecords = records.filter((record) => record.totalLateMin > 0);

    const averageWorkMinutes = workedRecords.length
      ? Math.round(
          workedRecords.reduce((sum, record) => sum + record.totalWorkMin, 0) /
            workedRecords.length,
        )
      : 0;
    const averageLateMinutes = lateRecords.length
      ? Math.round(
          lateRecords.reduce((sum, record) => sum + record.totalLateMin, 0) / lateRecords.length,
        )
      : 0;

    const statusBreakdown = [
      { key: 'present', label: 'Present', value: present, fill: 'var(--color-present)' },
      { key: 'late', label: 'Late', value: late, fill: 'var(--color-late)' },
      { key: 'absent', label: 'Absent', value: absent, fill: 'var(--color-absent)' },
      { key: 'halfDay', label: 'Half-day', value: halfDay, fill: 'var(--color-halfDay)' },
    ];

    const trendMap = new Map<
      string,
      { date: string; present: number; late: number; absent: number }
    >();
    records.forEach((record) => {
      const key = formatCompactDate(record.date);
      const existing = trendMap.get(key) ?? { date: key, present: 0, late: 0, absent: 0 };
      if (record.status === 'Present') existing.present += 1;
      if (record.status === 'Late') existing.late += 1;
      if (record.status === 'Absent') existing.absent += 1;
      trendMap.set(key, existing);
    });
    const trendData = Array.from(trendMap.values()).slice(-7);

    const departmentMap = new Map<
      string,
      { department: string; present: number; late: number; absent: number }
    >();
    records.forEach((record) => {
      const departmentName = record.department?.trim() || 'Unassigned';
      const existing = departmentMap.get(departmentName) ?? {
        department: departmentName,
        present: 0,
        late: 0,
        absent: 0,
      };
      if (record.status === 'Present') existing.present += 1;
      if (record.status === 'Late') existing.late += 1;
      if (record.status === 'Absent') existing.absent += 1;
      departmentMap.set(departmentName, existing);
    });
    const departmentData = Array.from(departmentMap.values())
      .sort(
        (left, right) =>
          right.present + right.late + right.absent - (left.present + left.late + left.absent),
      )
      .slice(0, 6);

    const shiftMap = new Map<string, number>();
    records.forEach((record) => {
      (record.sessions ?? []).forEach((session) => {
        const shiftName = session.shiftName?.trim() || 'Unknown shift';
        shiftMap.set(shiftName, (shiftMap.get(shiftName) ?? 0) + 1);
      });
    });
    const shiftData = Array.from(shiftMap.entries())
      .map(([shift, sessions]) => ({ shift, sessions }))
      .sort((left, right) => right.sessions - left.sessions)
      .slice(0, 5);

    const riskiestDepartment =
      departmentData.length > 0
        ? [...departmentData].sort((left, right) => right.late - left.late)[0]
        : null;

    return {
      total,
      attendanceRate,
      punctualityRate,
      averageWorkMinutes,
      averageLateMinutes,
      statusBreakdown,
      trendData,
      departmentData,
      shiftData,
      riskiestDepartment,
    };
  }, [records]);

  if (isLoading || error) {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-4 h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(3,0.8fr)]">
        <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_35%),linear-gradient(135deg,#0f172a_0%,#111827_50%,#0f3d3e_100%)] text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="border-0 bg-white/12 text-white hover:bg-white/12">
                  Attendance Summary
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  Attendance health at a glance
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                  This dashboard highlights attendance coverage, punctuality, working-hour patterns,
                  department pressure, and shift activity so admins can spot issues quickly.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-3">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroMetric label="Records in view" value={insights.total} />
              <HeroMetric label="Attendance rate" value={`${insights.attendanceRate}%`} />
              <HeroMetric label="Punctuality" value={`${insights.punctualityRate}%`} />
            </div>
          </CardContent>
        </Card>

        <SummaryKpiCard
          icon={UserCheck}
          title="Attendance Rate"
          value={`${insights.attendanceRate}%`}
          helper="Present, late, and half-day combined"
          tone="bg-emerald-50 text-emerald-700"
        />
        <SummaryKpiCard
          icon={TimerReset}
          title="Average Late Time"
          value={formatMinutes(insights.averageLateMinutes)}
          helper="Average delay among late records"
          tone="bg-amber-50 text-amber-700"
        />
        <SummaryKpiCard
          icon={Activity}
          title="Average Work Time"
          value={formatHoursFromMinutes(insights.averageWorkMinutes)}
          helper="Average worked duration per record"
          tone="bg-cyan-50 text-cyan-700"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.25fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              See the current mix of present, late, absent, and half-day records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={attendanceStatusChartConfig}
              className="mx-auto h-[320px] w-full max-w-[340px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="key" />}
                />
                <Pie
                  data={insights.statusBreakdown}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={78}
                  outerRadius={118}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {insights.statusBreakdown.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="key" className="flex-wrap gap-3" />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              Track how presence, lateness, and absence move across recent attendance dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights.trendData.length > 0 ? (
              <ChartContainer config={attendanceTrendChartConfig} className="h-[320px] w-full">
                <AreaChart data={insights.trendData} margin={{ left: 12, right: 12, top: 10 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stackId="attendance"
                    fill="var(--color-present)"
                    fillOpacity={0.25}
                    stroke="var(--color-present)"
                  />
                  <Area
                    type="monotone"
                    dataKey="late"
                    stackId="attendance"
                    fill="var(--color-late)"
                    fillOpacity={0.25}
                    stroke="var(--color-late)"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    stackId="attendance"
                    fill="var(--color-absent)"
                    fillOpacity={0.18}
                    stroke="var(--color-absent)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <EmptyChartState message="Not enough attendance dates are available to build a trend chart yet." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Department Attendance Mix</CardTitle>
            <CardDescription>
              Identify which departments carry the heaviest attendance load and late pressure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights.departmentData.length > 0 ? (
              <ChartContainer config={departmentAttendanceChartConfig} className="h-[340px] w-full">
                <BarChart
                  accessibilityLayer
                  data={insights.departmentData}
                  margin={{ left: 0, right: 12, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="department"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    angle={insights.departmentData.length > 3 ? -10 : 0}
                    textAnchor={insights.departmentData.length > 3 ? 'end' : 'middle'}
                    height={56}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Bar
                    dataKey="present"
                    stackId="dept"
                    fill="var(--color-present)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar dataKey="late" stackId="dept" fill="var(--color-late)" />
                  <Bar dataKey="absent" stackId="dept" fill="var(--color-absent)" />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChartState message="Department-level attendance data is not available yet." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Top Shift Activity</CardTitle>
              <CardDescription>
                See which shifts are generating the most attendance sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.shiftData.length > 0 ? (
                <ChartContainer config={shiftActivityChartConfig} className="h-[260px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={insights.shiftData}
                    layout="vertical"
                    margin={{ left: 12, right: 10 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      type="category"
                      dataKey="shift"
                      tickLine={false}
                      axisLine={false}
                      width={110}
                    />
                    <XAxis type="number" hide />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <EmptyChartState message="Shift session activity is not available yet." compact />
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Admin Focus</CardTitle>
              <CardDescription>Quick context on what may need attention right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InsightRow
                icon={Building2}
                title="Highest late volume"
                value={
                  insights.riskiestDepartment
                    ? `${insights.riskiestDepartment.department} (${insights.riskiestDepartment.late})`
                    : 'No late records'
                }
              />
              <InsightRow
                icon={Clock}
                title="Average late time"
                value={formatMinutes(insights.averageLateMinutes)}
              />
              <InsightRow
                icon={Users}
                title="Records analyzed"
                value={`${insights.total} attendance entries`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AttendanceModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<AttendanceFormData>({
    officerId: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'Present',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
      toast.success('បានកត់ត្រាវត្តមានដោយជោគជ័យ');
    } catch {
      toast.error('មិនអាចរក្សាទុកវត្តមានបានទេ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>កត់ត្រាវត្តមាន</DialogTitle>
          <DialogDescription>កត់ត្រាវត្តមានសម្រាប់មន្ត្រី</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="employee">មន្ត្រី</Label>
            <Select
              value={String(form.officerId)}
              onValueChange={(v) => setForm({ ...form, officerId: Number(v) })}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="ជ្រើសរើសមន្ត្រី" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">John Doe (OFF-001)</SelectItem>
                <SelectItem value="2">Jane Smith (OFF-002)</SelectItem>
                <SelectItem value="3">Mike Johnson (OFF-003)</SelectItem>
                <SelectItem value="4">Sarah Williams (OFF-004)</SelectItem>
                <SelectItem value="5">David Brown (OFF-005)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">កាលបរិច្ឆេទ</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="check-in">ម៉ោងចូល</Label>
              <Input
                id="check-in"
                type="time"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="check-out">ម៉ោងចេញ</Label>
              <Input
                id="check-out"
                type="time"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">ស្ថានភាព</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger id="status">
                <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Present">វត្តមាន</SelectItem>
                <SelectItem value="Absent">អវត្តមាន</SelectItem>
                <SelectItem value="Late">មកយឺត</SelectItem>
                <SelectItem value="Half-day">ពាក់កណ្តាលថ្ងៃ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">កំណត់ចំណាំ (ជម្រើស)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="បន្ថែមកំណត់ចំណាំ..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              បោះបង់
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page Component ───────────────────────────────

function AttendanceDetailsDialog({
  open,
  onOpenChange,
  attendance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: Attendance | null;
}) {
  if (!attendance) return null;

  const sessions = attendance.sessions ?? [];
  const officerPhoto = attendance.imageUrl?.trim() || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>ព័ត៌មានលម្អិតវត្តមាន</DialogTitle>
          <DialogDescription>{formatDateOnly(attendance.date)}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border bg-muted/20">
            <div className="aspect-[4/5] w-full">
              {officerPhoto ? (
                <img
                  src={officerPhoto}
                  alt={`${attendance.firstName} ${attendance.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <span className="text-3xl font-semibold text-slate-700">
                    {getInitials(attendance.firstName, attendance.lastName)}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t bg-background/95 px-3 py-2">
              <p className="text-sm font-semibold">
                {attendance.firstName} {attendance.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{attendance.officerCode || '--'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
              <div>
                <p className="text-xs text-muted-foreground">នាយកដ្ឋាន</p>
                <p className="text-sm font-medium">{attendance.department || '--'}</p>
              </div>
              <Badge variant="secondary" className={getStatusColor(attendance.status)}>
                {attendance.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">ម៉ោងចូល</p>
                <p className="mt-1 text-sm font-semibold">{formatTime(attendance.checkIn)}</p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">ម៉ោងចេញ</p>
                <p className="mt-1 text-sm font-semibold">{formatTime(attendance.checkOut)}</p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">ម៉ោងធ្វើការសរុប</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatMinutes(attendance.totalWorkMin)}
                </p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">ម៉ោងយឺត</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatMinutes(attendance.totalLateMin)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
            <p className="text-sm font-semibold">វេនការងារ</p>
            <p className="text-xs text-muted-foreground">{sessions.length} វេន</p>
          </div>

          {sessions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              មិនមានព័ត៌មានលម្អិតវេន
            </div>
          ) : (
            <div className="divide-y">
              <div className="hidden grid-cols-[1.3fr_1fr_1fr_auto] gap-2 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
                <p>ឈ្មោះវេន</p>
                <p>ម៉ោងចូល</p>
                <p>ម៉ោងចេញ</p>
                <p className="text-right">ស្ថានភាព</p>
              </div>
              {sessions.map((session) => (
                <div
                  key={`${attendance.id}-${session.id}`}
                  className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-xs text-muted-foreground sm:hidden">ឈ្មោះវេន</p>
                    <p className="text-sm font-medium">{session.shiftName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground sm:hidden">ម៉ោងចូល</p>
                    <p className="text-sm">{formatTime(session.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground sm:hidden">ម៉ោងចេញ</p>
                    <p className="text-sm">{formatTime(session.checkOut)}</p>
                  </div>
                  <div className="sm:justify-self-end sm:text-right">
                    <Badge variant="secondary" className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeroMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-white/65">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SummaryKpiCard({
  icon: Icon,
  title,
  value,
  helper,
  tone,
}: {
  icon: typeof Users;
  title: string;
  value: string;
  helper: string;
  tone: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
          </div>
          <div className={`rounded-2xl p-2.5 ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightRow({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Users;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-slate-50/80 p-4">
      <div className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function EmptyChartState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-dashed bg-slate-50/70 text-sm text-muted-foreground ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {message}
    </div>
  );
}

export default function AttendancePage() {
  // State
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState('daily');
  const [page, setPage] = useState(0); // API uses 0-indexed page
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  // Fetch data from API
  const { data: attendanceData, isLoading, error, refetch } = useAttendance({ page, size: 10 });

  // Records from API response
  const records: Attendance[] = attendanceData?.content ?? [];

  // Client-side filtered records (for display within current page)
  const filteredRecords = useMemo(() => {
    return records.filter((r: Attendance) => {
      const matchSearch =
        !search ||
        r.firstName.toLowerCase().includes(search.toLowerCase()) ||
        r.lastName.toLowerCase().includes(search.toLowerCase()) ||
        r.officerCode?.toLowerCase().includes(search.toLowerCase());
      const matchDepartment = department === 'all' || r.department === department;
      const matchStatus = status === 'all' || r.status === status;
      return matchSearch && matchDepartment && matchStatus;
    });
  }, [records, search, department, status]);

  const totalPages = attendanceData?.totalPages || 0;

  function openDetails(record: Attendance) {
    setSelectedAttendance(record);
    setDetailOpen(true);
  }

  // Handlers
  function resetPage() {
    setPage(0);
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r: Attendance) => r.id));
    }
  }

  async function handleSubmitAttendance(data: AttendanceFormData) {
    await refetch();
  }

  function handleExport() {
    toast.success('បានចាប់ផ្តើមនាំចេញរបាយការណ៍');
  }

  function handleBulkUpload() {
    toast.info('មុខងារបញ្ចូលជាក្រុមនឹងមកដល់ឆាប់ៗ');
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="sticky top-0 z-20 border-b bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          ការគ្រប់គ្រងវត្តមាន
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">គ្រប់គ្រង និងតាមដានវត្តមានមន្ត្រី</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>មិនអាចទាញយកទិន្នន័យវត្តមានបានទេ</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">
              <RefreshCw className="mr-2 h-3 w-3" />
              ព្យាយាមម្តងទៀត
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters & Actions */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                placeholder="ស្វែងរកមន្ត្រីតាមឈ្មោះ ឬលេខសម្គាល់"
                className="pl-9"
              />
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-[180px]"
              />
            </div>

            {/* Department Filter */}
            <Select
              value={department}
              onValueChange={(v) => {
                setDepartment(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="នាយកដ្ឋាន" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">នាយកដ្ឋានទាំងអស់</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="ស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                <SelectItem value="Present">វត្តមាន</SelectItem>
                <SelectItem value="Absent">អវត្តមាន</SelectItem>
                <SelectItem value="Late">មកយឺត</SelectItem>
                <SelectItem value="Half-day">ពាក់កណ្តាលថ្ងៃ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              កត់ត្រាវត្តមាន
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              នាំចេញរបាយការណ៍
            </Button>
            <Button variant="outline" onClick={handleBulkUpload}>
              <Upload className="mr-2 h-4 w-4" />
              បញ្ចូលជាក្រុម
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="daily">ប្រចាំថ្ងៃ</TabsTrigger>
            <TabsTrigger value="weekly">ប្រចាំសប្ដាហ៍</TabsTrigger>
            <TabsTrigger value="monthly">ប្រចាំខែ</TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.length} បានជ្រើសរើស</span>
            <Button variant="outline" size="sm">
              សកម្មភាពជាក្រុម
            </Button>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">រកមិនឃើញកំណត់ត្រាវត្តមាន</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              សូមកែតម្រូវតម្រង ឬបន្ថែមវត្តមានថ្មី
            </p>
            <Button onClick={() => setModalOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              កត់ត្រាវត្តមាន
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredRecords.length && filteredRecords.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>មន្ត្រី</TableHead>
                  <TableHead>លេខសម្គាល់មន្ត្រី</TableHead>
                  <TableHead>នាយកដ្ឋាន</TableHead>
                  <TableHead>កាលបរិច្ឆេទ</TableHead>
                  <TableHead>ម៉ោងចូល</TableHead>
                  <TableHead>ម៉ោងចេញ</TableHead>
                  <TableHead>ម៉ោងសរុប</TableHead>
                  <TableHead>ស្ថានភាព</TableHead>
                  <TableHead className="w-[100px]">សកម្មភាព</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record: Attendance) => {
                  const isLate = record.status === 'Late';
                  return (
                    <TableRow
                      key={record.id}
                      className={`transition-colors hover:bg-muted/50 ${
                        isLate ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(record.id)}
                          onCheckedChange={() => toggleSelect(record.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={record.imageUrl || undefined}
                              alt={`${record.firstName} ${record.lastName}`}
                            />
                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                              {getInitials(record.firstName, record.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {record.firstName} {record.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {record.officerCode || '—'}
                      </TableCell>
                      <TableCell className="text-sm">{record.department}</TableCell>
                      <TableCell className="text-sm">{formatDateOnly(record.date)}</TableCell>
                      <TableCell className="text-sm">{formatTime(record.checkIn)}</TableCell>
                      <TableCell className="text-sm">{formatTime(record.checkOut)}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {calculateTotalHours(record.checkIn, record.checkOut)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View Details / Khmer"
                            aria-label="View Details / Khmer"
                            onClick={() => openDetails(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit / Khmer"
                            aria-label="Edit / Khmer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-end items-center gap-2 border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  ទំព័រ {page + 1} នៃ {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  មុន
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  បន្ទាប់
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Attendance Modal */}
      <AttendanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmitAttendance}
      />

      <AttendanceDetailsDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        attendance={selectedAttendance}
      />
    </div>
  );
}
