'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Clock3,
  Eye,
  Filter,
  Pencil,
  Plus,
  Power,
  Search,
  Sparkles,
  TimerReset,
  Trash2,
  Workflow,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShiftAssignmentPlanner } from '@/components/shifts/shift-assignment-planner';
import { ShiftCalendarView } from '@/components/shifts/shift-calendar-view';
import { ShiftDetailSheet } from '@/components/shifts/shift-detail-sheet';
import { ShiftFormSheet } from '@/components/shifts/shift-form-sheet';
import {
  useCreateShift,
  useDeleteShift,
  useSaveShiftTemplate,
  useShiftAssignments,
  useShiftAudit,
  useShiftDetail,
  useShiftList,
  useShiftReferenceData,
  useToggleShiftStatus,
  useUpdateShift,
} from '@/hooks/shifts/use-shift-management';
import type { Shift, ShiftAssignmentScope, ShiftFormInput } from '@/lib/schemas';
import {
  computeShiftDurationMinutes,
  doDateRangesOverlap,
  doTimesOverlap,
  formatMinutesAsDuration,
  getCheckInWindowLabel,
  getCheckOutWindowLabel,
  getLateAfterTime,
} from '@/lib/shifts/utils';

type SessionResponse = {
  session: {
    role_name?: string;
  } | null;
};

type PendingAction = { type: 'delete'; shift: Shift } | { type: 'deactivate'; shift: Shift } | null;

function buildQueryString(
  searchParams: URLSearchParams | ReturnType<typeof useSearchParams>,
  updates: Record<string, string | undefined>,
) {
  const next = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  });
  return next.toString();
}

export default function ShiftsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const status = (searchParams.get('status') as 'all' | 'active' | 'inactive' | null) ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const [activeTab, setActiveTab] = useState<'list' | 'assignments' | 'calendar'>('list');
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<number | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [selectedScope, setSelectedScope] = useState<ShiftAssignmentScope>('department');
  const [selectedScopeId, setSelectedScopeId] = useState<number | undefined>();

  const { data: sessionData } = useQuery<SessionResponse>({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/session');
      return response.json();
    },
  });

  const canManage = sessionData?.session !== null;

  const listQuery = useShiftList({
    search,
    status,
    page: Math.max(page - 1, 0),
    size: 10,
  });
  const referenceQuery = useShiftReferenceData();

  const shifts: Shift[] = listQuery.data?.content ?? [];
  const selectedShift = shifts.find((shift) => shift.id === selectedShiftId) ?? null;

  const detailQuery = useShiftDetail(selectedShiftId);
  const auditQuery = useShiftAudit(selectedShiftId);
  const assignmentsQuery = useShiftAssignments(selectedScope, selectedScopeId);

  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const toggleShiftStatus = useToggleShiftStatus();
  const deleteShift = useDeleteShift();
  const saveTemplate = useSaveShiftTemplate();

  useEffect(() => {
    if (!selectedShiftId && shifts[0]) {
      setSelectedShiftId(shifts[0].id);
    }
  }, [selectedShiftId, shifts]);

  useEffect(() => {
    if (!selectedScopeId) {
      const firstDepartment = referenceQuery.data?.departments[0];
      if (firstDepartment) {
        setSelectedScopeId(firstDepartment.id);
      }
    }
  }, [referenceQuery.data?.departments, selectedScopeId]);

  const selectedShiftDetails = detailQuery.data ?? selectedShift;
  const totalPages = listQuery.data?.totalPages ?? 0;

  const summary = useMemo(() => {
    const active = shifts.filter((shift) => shift.status === 'active').length;
    const inactive = shifts.filter((shift) => shift.status === 'inactive').length;
    const grace = shifts.length
      ? Math.round(shifts.reduce((total, shift) => total + shift.graceMinutes, 0) / shifts.length)
      : 0;

    return {
      total: listQuery.data?.totalElements ?? shifts.length,
      active,
      inactive,
      averageGrace: `${grace} នាទី`,
    };
  }, [listQuery.data?.totalElements, shifts]);

  const globalConflicts = useMemo(() => {
    const conflicts: Array<{ id: string; title: string; message: string }> = [];

    for (let index = 0; index < shifts.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < shifts.length; compareIndex += 1) {
        const current = shifts[index];
        const next = shifts[compareIndex];

        if (current.status !== 'active' || next.status !== 'active') continue;

        const overlaps =
          doDateRangesOverlap(
            current.effectiveFrom,
            current.effectiveTo,
            next.effectiveFrom,
            next.effectiveTo,
          ) &&
          doTimesOverlap(
            {
              shift_name: current.name,
              shift_code: current.code,
              start_time: current.startTime,
              end_time: current.endTime,
              cross_midnight: current.crossMidnight,
              grace_minutes: current.graceMinutes,
              check_in_open_before_minutes: current.checkInOpenBeforeMinutes,
              check_out_close_after_minutes: current.checkOutCloseAfterMinutes,
              status: current.status,
              effective_from: current.effectiveFrom,
              effective_to: current.effectiveTo,
            },
            {
              shift_name: next.name,
              shift_code: next.code,
              start_time: next.startTime,
              end_time: next.endTime,
              cross_midnight: next.crossMidnight,
              grace_minutes: next.graceMinutes,
              check_in_open_before_minutes: next.checkInOpenBeforeMinutes,
              check_out_close_after_minutes: next.checkOutCloseAfterMinutes,
              status: next.status,
              effective_from: next.effectiveFrom,
              effective_to: next.effectiveTo,
            },
          );

        if (overlaps) {
          conflicts.push({
            id: `${current.id}-${next.id}`,
            title: 'វេនសកម្មជាន់គ្នា',
            message: `${current.name} ទាស់គ្នាជាមួយ ${next.name} នៅក្នុងកាលវិភាគសកម្ម។`,
          });
        }
      }
    }

    return conflicts;
  }, [shifts]);

  function updateFilters(updates: Record<string, string | undefined>) {
    const query = buildQueryString(searchParams, updates);
    router.replace(`/dashboard/shifts${query ? `?${query}` : ''}`);
  }

  function openCreate() {
    setEditingShift(null);
    setEditorOpen(true);
  }

  function openEdit(shift: Shift) {
    setEditingShift(shift);
    setEditorOpen(true);
  }

  async function handleSaveShift(values: ShiftFormInput) {
    if (editingShift) {
      await updateShift.mutateAsync({ id: editingShift.id, input: values });
    } else {
      await createShift.mutateAsync(values);
    }

    setEditorOpen(false);
    setEditingShift(null);
  }

  async function confirmAction() {
    if (!pendingAction) return;

    if (pendingAction.type === 'delete') {
      await deleteShift.mutateAsync(pendingAction.shift.id);
    }

    if (pendingAction.type === 'deactivate') {
      await toggleShiftStatus.mutateAsync({
        id: pendingAction.shift.id,
        status: 'inactive',
      });
    }

    setPendingAction(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="វេនសរុប"
          value={summary.total}
          helper="វេនដែលបានកំណត់ក្នុងប្រព័ន្ធ"
          icon={Workflow}
          tone="from-slate-600 to-slate-900"
        />
        <SummaryCard
          title="វេនសកម្ម"
          value={summary.active}
          helper="អាចប្រើសម្រាប់វត្តមាន"
          icon={Sparkles}
          tone="from-emerald-500 to-teal-600"
        />
        <SummaryCard
          title="វេនមិនសកម្ម"
          value={summary.inactive}
          helper="ផ្អាកប្រើដោយមិនលុបប្រវត្តិ"
          icon={Power}
          tone="from-amber-400 to-orange-500"
        />
        <SummaryCard
          title="ពេលអនុគ្រោះមធ្យម"
          value={summary.averageGrace}
          helper="រយៈពេលអត់ទោសយឺត"
          icon={TimerReset}
          tone="from-cyan-500 to-blue-600"
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="gap-4 border-b bg-slate-50/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">ផ្ទាំងគ្រប់គ្រងវេន</CardTitle>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) =>
                        updateFilters({ search: event.target.value || undefined, page: '1' })
                      }
                      className="pl-9"
                      placeholder="ស្វែងរកតាមឈ្មោះវេន ឬកូដ"
                    />
                  </div>

                  <Select
                    value={status}
                    onValueChange={(value) => updateFilters({ status: value, page: '1' })}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                      <SelectItem value="active">សកម្ម</SelectItem>
                      <SelectItem value="inactive">មិនសកម្ម</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateFilters({ search: undefined, status: 'all', page: '1' })}
                  >
                    សម្អាតតម្រង
                  </Button>
                  <Button onClick={openCreate} disabled={!canManage}>
                    <Plus className="mr-2 h-4 w-4" />
                    វេនថ្មី
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as typeof activeTab)}
              >
                <TabsList>
                  <TabsTrigger value="list">បញ្ជីវេន</TabsTrigger>
                  <TabsTrigger value="assignments">ការចាត់តាំង</TabsTrigger>
                  <TabsTrigger value="calendar">ប្រតិទិន</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-5">
                  {listQuery.isLoading ? (
                    <ShiftTableSkeleton />
                  ) : listQuery.error ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {(listQuery.error as Error).message || 'Failed to load shifts.'}
                      </AlertDescription>
                    </Alert>
                  ) : shifts.length === 0 ? (
                    <Empty className="rounded-3xl border">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Clock3 />
                        </EmptyMedia>
                        <EmptyTitle>មិនមានវេនត្រូវនឹងលក្ខខណ្ឌ</EmptyTitle>
                        <EmptyDescription>
                          បង្កើតវេន dynamic ដំបូង ដើម្បីគ្រប់គ្រងវត្តមានឱ្យលើសពីវេនព្រឹក
                          និងរសៀលដែលកំណត់ថេរ។
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button onClick={openCreate} disabled={!canManage}>
                          <Plus className="mr-2 h-4 w-4" />
                          បង្កើតវេនថ្មី
                        </Button>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <>
                      <div className="hidden lg:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ឈ្មោះវេន</TableHead>
                              <TableHead>ចាប់ផ្តើម</TableHead>
                              <TableHead>បញ្ចប់</TableHead>
                              <TableHead>រយៈពេល</TableHead>
                              <TableHead>ពេលអនុគ្រោះ</TableHead>
                              <TableHead>យឺតក្រោយ</TableHead>
                              <TableHead>ស្ថានភាព</TableHead>
                              <TableHead>កាលបរិច្ឆេទមានប្រសិទ្ធភាព</TableHead>
                              <TableHead>នាយកដ្ឋាន</TableHead>
                              <TableHead className="text-right">សកម្មភាព</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shifts.map((shift) => (
                              <TableRow key={shift.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{shift.name}</p>
                                    <p className="text-xs text-muted-foreground">{shift.code}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{shift.startTime}</TableCell>
                                <TableCell>{shift.endTime}</TableCell>
                                <TableCell>
                                  {formatMinutesAsDuration(
                                    computeShiftDurationMinutes(
                                      shift.startTime,
                                      shift.endTime,
                                      shift.crossMidnight,
                                    ),
                                  )}
                                </TableCell>
                                <TableCell>{shift.graceMinutes} នាទី</TableCell>
                                <TableCell>{getLateAfterTime(shift)}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      shift.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }
                                  >
                                    {getStatusLabel(shift.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {shift.effectiveFrom}
                                  <br />
                                  <span className="text-xs text-muted-foreground">
                                    {shift.effectiveTo ?? 'មិនកំណត់ថ្ងៃបញ្ចប់'}
                                  </span>
                                </TableCell>
                                <TableCell>{shift.assignedDepartmentsCount}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <ActionButton
                                      label="មើល"
                                      onClick={() => {
                                        setSelectedShiftId(shift.id);
                                        setDetailsOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </ActionButton>
                                    <ActionButton
                                      label="កែសម្រួល"
                                      onClick={() => openEdit(shift)}
                                      disabled={!canManage}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </ActionButton>
                                    <ActionButton
                                      label={
                                        shift.status === 'active' ? 'បិទការប្រើ' : 'បើកការប្រើ'
                                      }
                                      onClick={() =>
                                        shift.status === 'active'
                                          ? setPendingAction({ type: 'deactivate', shift })
                                          : toggleShiftStatus.mutate({
                                              id: shift.id,
                                              status: 'active',
                                            })
                                      }
                                      disabled={!canManage}
                                    >
                                      <Power className="h-4 w-4" />
                                    </ActionButton>
                                    <ActionButton
                                      label="លុប"
                                      onClick={() => setPendingAction({ type: 'delete', shift })}
                                      disabled={!canManage}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </ActionButton>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="grid gap-4 lg:hidden">
                        {shifts.map((shift) => (
                          <Card key={shift.id} className="border-slate-200">
                            <CardContent className="space-y-4 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{shift.name}</p>
                                  <p className="text-sm text-muted-foreground">{shift.code}</p>
                                </div>
                                <Badge
                                  className={
                                    shift.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }
                                >
                                  {getStatusLabel(shift.status)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <Info label="ចាប់ផ្តើម" value={shift.startTime} />
                                <Info label="បញ្ចប់" value={shift.endTime} />
                                <Info label="ពេលអនុគ្រោះ" value={`${shift.graceMinutes} នាទី`} />
                                <Info label="យឺតក្រោយ" value={getLateAfterTime(shift)} />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedShiftId(shift.id);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  មើល
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(shift)}
                                  disabled={!canManage}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  កែសម្រួល
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {totalPages > 1 ? (
                        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                          <p className="text-muted-foreground">
                            ទំព័រ {page} នៃ {Math.max(totalPages, 1)}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page <= 1}
                              onClick={() => updateFilters({ page: String(page - 1) })}
                            >
                              មុន
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page >= totalPages}
                              onClick={() => updateFilters({ page: String(page + 1) })}
                            >
                              បន្ទាប់
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="assignments" className="mt-5">
                  <ShiftAssignmentPlanner
                    shifts={shifts}
                    references={{
                      departments: referenceQuery.data?.departments ?? [],
                      positions: referenceQuery.data?.positions ?? [],
                      employees: referenceQuery.data?.employees ?? [],
                    }}
                    template={assignmentsQuery.data?.[0] ?? null}
                    loading={saveTemplate.isPending}
                    readOnly={!canManage}
                    selectedScope={selectedScope}
                    selectedScopeId={selectedScopeId}
                    onScopeChange={(scope, id) => {
                      setSelectedScope(scope);
                      setSelectedScopeId(id);
                    }}
                    onSave={async (template) => {
                      await saveTemplate.mutateAsync(template);
                    }}
                  />
                </TabsContent>

                <TabsContent value="calendar" className="mt-5">
                  <ShiftCalendarView
                    shifts={shifts}
                    onQuickAdd={openCreate}
                    onSelectShift={(shift) => {
                      setSelectedShiftId(shift.id);
                      setDetailsOpen(true);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/80">
              <CardTitle className="text-base">មើលច្បាប់ជាមុន</CardTitle>
              <CardDescription>
                មើលសង្ខេបលទ្ធផលវត្តមាន និងពេលវេលាដែលបានអនុវត្តសម្រាប់វេនដែលជ្រើស។
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {selectedShiftDetails ? (
                <>
                  <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#111827_50%,#0b3b2e_100%)] p-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white/70">{selectedShiftDetails.code}</p>
                        <p className="mt-1 text-xl font-semibold">{selectedShiftDetails.name}</p>
                        <p className="mt-3 text-sm text-white/75">
                          {selectedShiftDetails.startTime} - {selectedShiftDetails.endTime}
                        </p>
                      </div>
                      <Badge
                        className={
                          selectedShiftDetails.status === 'active'
                            ? 'border-0 bg-emerald-100 text-emerald-700'
                            : 'border-0 bg-slate-100 text-slate-700'
                        }
                      >
                        {getStatusLabel(selectedShiftDetails.status)}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs text-white/60">មានប្រសិទ្ធភាព</p>
                        <p className="mt-1 text-sm font-medium">
                          {selectedShiftDetails.effectiveFrom}
                          {selectedShiftDetails.effectiveTo
                            ? ` ដល់ ${selectedShiftDetails.effectiveTo}`
                            : ' តទៅ'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs text-white/60">នាយកដ្ឋាន</p>
                        <p className="mt-1 text-sm font-medium">
                          {selectedShiftDetails.assignedDepartmentsCount} កន្លែង
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs text-white/60">បុគ្គលិក</p>
                        <p className="mt-1 text-sm font-medium">
                          {selectedShiftDetails.assignedEmployeesCount} នាក់
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <PreviewMetric
                      label="ចន្លោះពេលឆែកចូល"
                      value={getCheckInWindowLabel(selectedShiftDetails)}
                    />
                    <PreviewMetric
                      label="កម្រិតយឺត"
                      value={getLateAfterTime(selectedShiftDetails)}
                    />
                    <PreviewMetric
                      label="ចន្លោះពេលឆែកចេញ"
                      value={getCheckOutWindowLabel(selectedShiftDetails)}
                    />
                    <PreviewMetric
                      label="ការឆ្លងថ្ងៃ"
                      value={
                        selectedShiftDetails.crossMidnight
                          ? 'បន្តទៅថ្ងៃបន្ទាប់'
                          : 'បញ្ចប់ក្នុងថ្ងៃដដែល'
                      }
                    />
                  </div>

                  <div className="grid gap-3 rounded-3xl border bg-slate-50/80 p-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-sm font-medium text-slate-900">សង្ខេបវេនដែលបានជ្រើស</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        វេននេះគាំទ្រការចូលវត្តមានតាមម៉ោងដែលបានកំណត់
                        និងអាចប្រើជាគោលការណ៍សម្រាប់ការចាត់តាំងប្រចាំថ្ងៃ។
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-sm font-medium text-slate-900">ផលប៉ះពាល់បច្ចុប្បន្ន</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        បច្ចុប្បន្នកំពុងភ្ជាប់ទៅនឹង {selectedShiftDetails.assignedDepartmentsCount}{' '}
                        នាយកដ្ឋាន និង {selectedShiftDetails.assignedEmployeesCount} បុគ្គលិក។
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed bg-slate-50/70 p-6 text-sm text-muted-foreground">
                  សូមជ្រើសវេនពីបញ្ជី ឬប្រតិទិន ដើម្បីមើលសេចក្តីសង្ខេបច្បាប់វត្តមាន
                  និងផលប៉ះពាល់របស់វេននោះ។
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ShiftFormSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        shift={editingShift}
        shifts={shifts}
        readOnly={!canManage}
        onSubmit={handleSaveShift}
      />

      <ShiftDetailSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        shift={selectedShiftDetails ?? null}
        audit={auditQuery.data ?? []}
      />

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'delete' ? 'លុបវេនមែនទេ?' : 'បិទវេនមែនទេ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'delete'
                ? `វានឹងលុប ${pendingAction.shift.name} ចេញពីម៉ូឌុលគ្រប់គ្រង។`
                : `វានឹងបញ្ឈប់ការប្រើ ${pendingAction?.shift.name} សម្រាប់កាលវិភាគវត្តមានសកម្ម។`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>បោះបង់</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>យល់ព្រម</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: typeof Workflow;
  tone: string;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className={`h-1 w-full bg-gradient-to-r ${tone}`} />
        <div className="flex items-start justify-between gap-3 p-5">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
          </div>
          <div className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-sm ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusLabel(status: 'active' | 'inactive') {
  return status === 'active' ? 'សកម្ម' : 'មិនសកម្ម';
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50/80 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50/80 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button aria-label={label} disabled={disabled} onClick={onClick} size="icon" variant="ghost">
      {children}
    </Button>
  );
}

function ShiftTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
