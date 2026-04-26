'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  OfficerDetailDialog,
  OfficerDialog,
  OfficerFilters,
  OfficersTable,
  type OfficerFormData,
} from '@/components/officers';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateOfficer,
  useDeleteOfficer,
  useUpdateOfficer,
  useUploadOfficerImage,
} from '@/hooks/officers/use-officer-mutations';
import { useOfficerStats } from '@/hooks/officers/use-officer-stats';
import { useOfficers } from '@/hooks/officers/use-officers';
import type { Officer } from '@/lib/schemas';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts';
import { toast } from 'sonner';

const PAGE_SIZE = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type DepartmentChartItem = {
  department: string;
  officers: number;
};

const officerStatusChartConfig = {
  active: {
    label: 'សកម្ម',
    color: '#059669',
  },
  onLeave: {
    label: 'ច្បាប់ឈប់សម្រាក',
    color: '#d97706',
  },
  inactive: {
    label: 'មិនសកម្ម',
    color: '#64748b',
  },
} satisfies ChartConfig;

const departmentChartConfig = {
  officers: {
    label: 'ចំនួនមន្ត្រី',
    color: '#0f766e',
  },
} satisfies ChartConfig;

function SummaryCards({
  stats,
  isLoading,
}: {
  stats?: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
  };
  isLoading: boolean;
}) {
  const totalOfficers = stats?.total ?? 0;
  const cards = [
    {
      label: 'សរុប',
      value: stats?.total ?? 0,
      progress: totalOfficers > 0 ? 100 : 0,
      icon: Users,
      color: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
      bar: 'bg-slate-700',
      helper: 'មន្ត្រីដែលបានចុះបញ្ជីទាំងអស់',
    },
    {
      label: 'សកម្ម',
      value: stats?.active ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.active ?? 0) / totalOfficers) * 100) : 0,
      icon: UserCheck,
      color: 'text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-600',
      helper: 'ត្រៀមបំពេញភារកិច្ច',
    },
    {
      label: 'ច្បាប់ឈប់សម្រាក',
      value: stats?.onLeave ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.onLeave ?? 0) / totalOfficers) * 100) : 0,
      icon: Clock,
      color: 'text-amber-700',
      iconBg: 'bg-amber-50 text-amber-700',
      bar: 'bg-amber-500',
      helper: 'កំពុងសម្រាកច្បាប់',
    },
    {
      label: 'មិនសកម្ម',
      value: stats?.inactive ?? 0,
      progress: totalOfficers > 0 ? Math.round(((stats?.inactive ?? 0) / totalOfficers) * 100) : 0,
      icon: UserMinus,
      color: 'text-red-700',
      iconBg: 'bg-red-50 text-red-700',
      bar: 'bg-red-500',
      helper: 'កំណត់ត្រាមិនសកម្ម',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="gap-4 overflow-hidden rounded-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="gap-0 overflow-hidden rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${card.color}`}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
              </div>
              <div className={`rounded-md p-2.5 ${card.iconBg}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${card.bar}`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function OfficersPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<
    (OfficerFormData & { id: number }) | undefined
  >();
  const [viewingOfficer, setViewingOfficer] = useState<Officer | null>(null);
  const [deleteOfficerData, setDeleteOfficerData] = useState<Officer | null>(null);

  const { data: stats, isLoading: statsLoading } = useOfficerStats();
  const {
    officers = [],
    total = 0,
    mutate,
    isLoading,
    isError,
    error,
  } = useOfficers({
    search,
    department: department === 'all' ? undefined : department,
    status: status === 'all' ? undefined : status,
    page,
    pageSize: PAGE_SIZE,
  });

  const createOfficer = useCreateOfficer();
  const updateOfficer = useUpdateOfficer();
  const deleteOfficer = useDeleteOfficer();
  const uploadOfficerImage = useUploadOfficerImage();

  function resetPage() {
    setPage(1);
  }

  function resetFilters() {
    setSearch('');
    setDepartment('all');
    setStatus('all');
    resetPage();
  }

  function handleAdd() {
    setEditingOfficer(undefined);
    setDialogOpen(true);
  }

  function handleEdit(officer: Officer) {
    setEditingOfficer({
      id: officer.id,
      first_name: officer.first_name,
      last_name: officer.last_name,
      sex: officer.sex || 'male',
      email: officer.email || '',
      position: officer.position,
      department: officer.department,
      phone: officer.phone || '',
      status: officer.status,
      officerCode: officer.officerCode || '',
    });
    setDialogOpen(true);
  }

  function handleView(officer: Officer) {
    setViewingOfficer(officer);
  }

  function handleDelete(officer: Officer) {
    setDeleteOfficerData(officer);
  }

  async function confirmDelete() {
    if (!deleteOfficerData) return;

    await deleteOfficer.mutateAsync(deleteOfficerData.id);
    mutate();
    setDeleteOfficerData(null);
  }

  async function handleSubmit(data: OfficerFormData) {
    if (editingOfficer) {
      await updateOfficer.mutateAsync({ id: editingOfficer.id, data });
    } else {
      await createOfficer.mutateAsync(data);
    }

    mutate();
  }

  function handleUploadImage(officer: Officer) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('សូមជ្រើសរើសរូបភាពប្រភេទ JPG, PNG ឬ WEBP');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error('ទំហំរូបភាពត្រូវតែ 5MB ឬតូចជាងនេះ');
        return;
      }

      try {
        await uploadOfficerImage.mutateAsync({ id: officer.id, file });
        mutate();
      } catch {
        // Mutation hook already displays the failure toast.
      }
    };

    input.click();
  }

  const isSummaryLoading = statsLoading || !stats;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = total === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, total);
  const activeFilterCount = [search.length > 0, department !== 'all', status !== 'all'].filter(
    Boolean,
  ).length;

  const totalOfficers = stats?.total ?? 0;
  const active = stats?.active ?? 0;
  const inactive = stats?.inactive ?? 0;
  const onLeave = stats?.onLeave ?? 0;
  const statusChartData = useMemo(
    () => [
      {
        key: 'active',
        label: 'សកម្ម',
        value: active,
        fill: 'var(--color-active)',
      },
      {
        key: 'onLeave',
        label: 'ច្បាប់ឈប់សម្រាក',
        value: onLeave,
        fill: 'var(--color-onLeave)',
      },
      {
        key: 'inactive',
        label: 'មិនសកម្ម',
        value: inactive,
        fill: 'var(--color-inactive)',
      },
    ],
    [active, inactive, onLeave],
  );

  const departmentChartData = useMemo(() => {
    const distribution: Record<string, number> = {};

    for (const officer of officers) {
      const departmentName = officer.department?.trim() || 'មិនទាន់កំណត់';
      distribution[departmentName] = (distribution[departmentName] ?? 0) + 1;
    }

    return Object.entries(distribution)
      .map(([name, count]) => ({
        department: name,
        officers: count,
      }))
      .sort((left, right) => right.officers - left.officers)
      .slice(0, 6);
  }, [officers]);

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2 text-destructive">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">
                មិនអាចទាញយកទិន្នន័យមន្ត្រី
              </CardTitle>
              <CardDescription className="text-destructive/80">{error?.message}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-md bg-background">
            ការគ្រប់គ្រងមន្ត្រី
          </Badge>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">មន្ត្រី</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              គ្រប់គ្រងបញ្ជីមន្ត្រី រូបភាពប្រវត្តិរូប តួនាទី និងស្ថានភាពការងារនៅកន្លែងតែមួយ។
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            ផ្ទុកឡើងវិញ
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            បន្ថែមមន្ត្រី
          </Button>
        </div>
      </div>

      <SummaryCards stats={stats} isLoading={isSummaryLoading} />

      <div className="flex flex-col gap-5">
        <Card className="gap-0 overflow-hidden rounded-lg shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">បញ្ជីមន្ត្រី</CardTitle>
                <CardDescription>
                  ពិនិត្យ កែប្រែ បង្ហោះរូបភាព និងបើកមើលព័ត៌មានលម្អិតរបស់មន្ត្រី។
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  បង្ហាញ {startItem}-{endItem}
                </Badge>
                <Badge variant="outline" className="bg-background">
                  សរុប {total}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="border-b p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  តម្រង និងស្វែងរក
                </div>
                {activeFilterCount > 0 ? (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="mr-2 h-4 w-4" />
                    សម្អាត
                  </Button>
                ) : null}
              </div>

              <OfficerFilters
                search={search}
                setSearch={(value) => {
                  setSearch(value);
                  resetPage();
                }}
                department={department}
                setDepartment={(value) => {
                  setDepartment(value);
                  resetPage();
                }}
                status={status}
                setStatus={(value) => {
                  setStatus(value);
                  resetPage();
                }}
              />

              <div className="flex min-h-6 flex-wrap gap-2">
                {search ? <Badge variant="secondary">ស្វែងរក៖ {search}</Badge> : null}
                {department !== 'all' ? (
                  <Badge variant="secondary">នាយកដ្ឋាន៖ {department}</Badge>
                ) : null}
                {status !== 'all' ? <Badge variant="secondary">ស្ថានភាព៖ {status}</Badge> : null}
                {activeFilterCount === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    មិនមានតម្រងសកម្ម។ កំពុងបង្ហាញបញ្ជីមន្ត្រីទាំងអស់។
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>

          <CardContent className="p-0">
            <OfficersTable
              officers={officers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUploadImage={handleUploadImage}
              isLoading={isLoading}
              totalOfficer={total}
            />
          </CardContent>

          {total > 0 && (
            <CardContent className="flex flex-col gap-4 border-t bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                កំពុងមើលកំណត់ត្រា {startItem}-{endItem} ក្នុងចំណោម {total}
              </p>
              <div className="flex items-center justify-end gap-2">
                <p className="text-sm text-muted-foreground">
                  ទំព័រ {currentPage} នៃ {totalPages}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  មុន
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage >= totalPages}
                >
                  បន្ទាប់
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/80">
            <CardTitle className="text-base">ផ្ទាំងវិភាគមន្ត្រី</CardTitle>
            <CardDescription>
              មើលស្ថានភាពមន្ត្រី និងការចែកចាយតាមនាយកដ្ឋានក្នុងទម្រង់ visual។
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 xl:grid-cols-2">
            <div className="rounded-3xl border bg-white p-4">
              <p className="text-sm font-medium text-slate-900">ស្ថានភាពមន្ត្រី</p>
              <ChartContainer
                config={officerStatusChartConfig}
                className="mx-auto mt-4 h-[300px] w-full max-w-[340px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="key" />}
                  />
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={70}
                    outerRadius={106}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="key" className="flex-wrap gap-3" />}
                  />
                </PieChart>
              </ChartContainer>
            </div>

            <div className="rounded-3xl border bg-white p-4">
              <p className="text-sm font-medium text-slate-900">ការចែកចាយតាមនាយកដ្ឋាន</p>
              {departmentChartData.length > 0 ? (
                <ChartContainer config={departmentChartConfig} className="mt-4 h-[320px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={departmentChartData}
                    margin={{ left: 10, right: 10, top: 10 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="department"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      interval={0}
                      angle={departmentChartData.length > 3 ? -12 : 0}
                      textAnchor={departmentChartData.length > 3 ? 'end' : 'middle'}
                      height={60}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar dataKey="officers" fill="var(--color-officers)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed bg-slate-50/70 p-5 text-sm text-muted-foreground">
                  មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់គូសក្រាហ្វតាមនាយកដ្ឋានទេ។
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <OfficerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        officer={editingOfficer}
        onSubmit={handleSubmit}
      />

      <OfficerDetailDialog
        open={!!viewingOfficer}
        onOpenChange={(open) => {
          if (!open) setViewingOfficer(null);
        }}
        officer={viewingOfficer}
        onUploadImage={handleUploadImage}
      />

      <AlertDialog
        open={!!deleteOfficerData}
        onOpenChange={(open) => !open && setDeleteOfficerData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>លុបមន្ត្រី</AlertDialogTitle>
            <AlertDialogDescription>
              តើអ្នកពិតជាចង់លុប{' '}
              <strong>
                {deleteOfficerData?.first_name} {deleteOfficerData?.last_name}
              </strong>
              មែនទេ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>បោះបង់</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>លុប</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
