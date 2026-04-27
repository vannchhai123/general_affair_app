'use client';

import { useMemo, useState, type ElementType } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleOff,
  Edit3,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
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
import { CardNumber } from '@/components/ui/card-number';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api/fetcher';
import { cn } from '@/lib/utils';
import {
  getDepartmentFieldErrors,
  getPositionFieldErrors,
  useCreateDepartment,
  useCreatePosition,
  useDeleteDepartment,
  useDeletePosition,
  useDepartments,
  useUpdateDepartment,
  useUpdatePosition,
  usePositions,
} from '@/hooks/organization';
import type {
  Department,
  DepartmentField,
  DepartmentFormValues,
  OrganizationStatus,
  Position,
  PositionField,
} from '@/lib/schemas';

type StatusFilter = OrganizationStatus | 'all';
type ManageMode = 'department' | 'position';
type TabValue = 'departments' | 'positions';

type DepartmentFormState = DepartmentFormValues;
type PositionFormState = {
  title: string;
  code: string;
  departmentId?: number;
  status: OrganizationStatus;
  description?: string;
};

const DEFAULT_PAGE_SIZE = 10;

const emptyDepartmentForm: DepartmentFormState = {
  name: '',
  code: '',
  manager: '',
  status: 'active',
  description: '',
};

const emptyPositionForm: PositionFormState = {
  title: '',
  code: '',
  departmentId: undefined,
  status: 'active',
  description: '',
};

function StatusBadge({ status }: { status: OrganizationStatus }) {
  if (status === 'active') {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <CheckCircle2 className="h-3 w-3" />
        សកម្ម
      </Badge>
    );
  }

  return (
    <Badge className="border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-50">
      <CircleOff className="h-3 w-3" />
      មិនសកម្ម
    </Badge>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: ElementType;
}) {
  return (
    <Card className="gap-0 rounded-lg shadow-none">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <CardNumber value={value} className="mt-2 block text-2xl font-semibold" />
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2.5 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="p-10 text-center text-sm text-muted-foreground">{message}</div>;
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        ព្យាយាមម្តងទៀត
      </Button>
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  totalElements,
  onPrevious,
  onNext,
  disabled,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        ទំព័រ {page + 1} នៃ {totalPages} - សរុប {totalElements}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={disabled || page === 0}>
          មុន
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={disabled || page + 1 >= totalPages}
        >
          បន្ទាប់
        </Button>
      </div>
    </div>
  );
}

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('departments');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [departmentPage, setDepartmentPage] = useState(0);
  const [positionPage, setPositionPage] = useState(0);
  const [dialogMode, setDialogMode] = useState<ManageMode>('department');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormState>(emptyDepartmentForm);
  const [positionForm, setPositionForm] = useState<PositionFormState>(emptyPositionForm);
  const [departmentErrors, setDepartmentErrors] = useState<
    Partial<Record<DepartmentField, string>>
  >({});
  const [positionErrors, setPositionErrors] = useState<Partial<Record<PositionField, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    mode: ManageMode;
    id: number;
    name: string;
  } | null>(null);

  const normalizedStatus = status === 'all' ? undefined : status;

  const departmentQuery = useDepartments({
    search,
    status: normalizedStatus,
    page: departmentPage,
    size: DEFAULT_PAGE_SIZE,
  });

  const positionQuery = usePositions({
    search,
    status: normalizedStatus,
    page: positionPage,
    size: DEFAULT_PAGE_SIZE,
  });

  const departmentOptionsQuery = useDepartments({
    page: 0,
    size: 100,
  });

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();

  const departments: Department[] = departmentQuery.departments;
  const positions: Position[] = positionQuery.positions;
  const departmentOptions: Department[] = departmentOptionsQuery.departments;

  const activeDepartmentCount = useMemo(
    () => departments.filter((department: Department) => department.status === 'active').length,
    [departments],
  );
  const activePositionCount = useMemo(
    () => positions.filter((position: Position) => position.status === 'active').length,
    [positions],
  );
  const visibleOfficerCount = useMemo(
    () =>
      departments.reduce((sum: number, department: Department) => sum + department.officerCount, 0),
    [departments],
  );

  const isDepartmentSaving = createDepartment.isPending || updateDepartment.isPending;
  const isPositionSaving = createPosition.isPending || updatePosition.isPending;
  const isDeleting = deleteDepartment.isPending || deletePosition.isPending;

  function resetDepartmentDialogState() {
    setEditingDepartment(null);
    setDepartmentForm(emptyDepartmentForm);
    setDepartmentErrors({});
  }

  function resetPositionDialogState() {
    setEditingPosition(null);
    setPositionForm({
      ...emptyPositionForm,
      departmentId: departmentOptions[0]?.id,
    });
    setPositionErrors({});
  }

  function openCreateDialog(mode: ManageMode) {
    setDialogMode(mode);

    if (mode === 'department') {
      resetDepartmentDialogState();
    } else {
      resetPositionDialogState();
    }

    setDialogOpen(true);
  }

  function openEditDepartment(department: Department) {
    setDialogMode('department');
    setEditingDepartment(department);
    setDepartmentErrors({});
    setDepartmentForm({
      name: department.name,
      code: department.code,
      manager: department.manager ?? '',
      status: department.status,
      description: department.description ?? '',
    });
    setDialogOpen(true);
  }

  function openEditPosition(position: Position) {
    setDialogMode('position');
    setEditingPosition(position);
    setPositionErrors({});
    setPositionForm({
      title: position.title,
      code: position.code,
      departmentId: position.departmentId,
      status: position.status,
      description: position.description ?? '',
    });
    setDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      resetDepartmentDialogState();
      resetPositionDialogState();
    }
  }

  async function saveDepartment() {
    setDepartmentErrors({});

    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          values: departmentForm,
        });
      } else {
        await createDepartment.mutateAsync(departmentForm);
      }

      setDialogOpen(false);
      resetDepartmentDialogState();
    } catch (error) {
      setDepartmentErrors(getDepartmentFieldErrors(error));
    }
  }

  async function savePosition() {
    setPositionErrors({});

    try {
      const payload = {
        title: positionForm.title,
        code: positionForm.code,
        departmentId: positionForm.departmentId ?? 0,
        status: positionForm.status,
        description: positionForm.description,
      };

      if (editingPosition) {
        await updatePosition.mutateAsync({
          id: editingPosition.id,
          values: payload,
        });
      } else {
        await createPosition.mutateAsync(payload);
      }

      setDialogOpen(false);
      resetPositionDialogState();
    } catch (error) {
      setPositionErrors(getPositionFieldErrors(error));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.mode === 'department') {
      await deleteDepartment.mutateAsync(deleteTarget.id);
    } else {
      await deletePosition.mutateAsync(deleteTarget.id);
    }

    setDeleteTarget(null);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setDepartmentPage(0);
    setPositionPage(0);
  }

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setDepartmentPage(0);
    setPositionPage(0);
  }

  const departmentQueryError =
    departmentQuery.error instanceof ApiError
      ? departmentQuery.error.message
      : 'មិនអាចផ្ទុកនាយកដ្ឋានបានទេ។';
  const positionQueryError =
    positionQuery.error instanceof ApiError
      ? positionQuery.error.message
      : 'មិនអាចផ្ទុកតួនាទីបានទេ។';

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          {/* <Badge variant="outline" className="rounded-md bg-background">
            ការរៀបចំរចនាសម្ព័ន្ធអង្គភាព
          </Badge> */}
          <div>
            <h1 className="page-title text-2xl tracking-tight">នាយកដ្ឋាន និងតួនាទីការងារ</h1>
            {/* <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              គ្រប់គ្រងរចនាសម្ព័ន្ធអង្គភាព ធ្វើឱ្យតួនាទីការងារស្របតាមនាយកដ្ឋាន
              និងរក្សាទិន្នន័យឱ្យសមកាលកម្មជាមួយ API ខាងក្រោយ។
            </p> */}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => openCreateDialog('position')}>
            <BriefcaseBusiness className="mr-2 h-4 w-4" />
            បន្ថែមតួនាទី
          </Button>
          <Button onClick={() => openCreateDialog('department')}>
            <Plus className="mr-2 h-4 w-4" />
            បន្ថែមនាយកដ្ឋាន
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          title="នាយកដ្ឋានសកម្មដែលកំពុងបង្ហាញ"
          value={activeDepartmentCount}
          description={`សរុប ${departmentQuery.total} នាយកដ្ឋានពី API`}
          icon={Building2}
        />
        <MetricCard
          title="តួនាទីសកម្មដែលកំពុងបង្ហាញ"
          value={activePositionCount}
          description={`សរុប ${positionQuery.total} តួនាទីពី API`}
          icon={BriefcaseBusiness}
        />
        <MetricCard
          title="មន្ត្រីដែលបានចាត់តាំង"
          value={visibleOfficerCount}
          description="គណនាពីលទ្ធផលនាយកដ្ឋានបច្ចុប្បន្ន"
          icon={Users}
        />
      </div>

      <Card className="gap-0 overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">បញ្ជីរចនាសម្ព័ន្ធអង្គភាព</CardTitle>
              <CardDescription>
                ស្វែងរក ត្រង បង្កើត កែប្រែ និងលុបនាយកដ្ឋាន ឬតួនាទីការងារ។
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ កូដ ឬអ្នកគ្រប់គ្រង"
                  className="pl-9"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => handleStatusChange(value as StatusFilter)}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="ស្ថានភាព" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                  <SelectItem value="active">សកម្ម</SelectItem>
                  <SelectItem value="inactive">មិនសកម្ម</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabValue)}
            className="w-full"
          >
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="grid w-full grid-cols-2 sm:w-fit">
                <TabsTrigger value="departments">នាយកដ្ឋាន</TabsTrigger>
                <TabsTrigger value="positions">តួនាទី</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openCreateDialog('position')}>
                  <BriefcaseBusiness className="mr-2 h-4 w-4" />
                  តួនាទី
                </Button>
                <Button size="sm" onClick={() => openCreateDialog('department')}>
                  <Plus className="mr-2 h-4 w-4" />
                  នាយកដ្ឋាន
                </Button>
              </div>
            </div>

            <TabsContent value="departments" className="m-0">
              {departmentQuery.isLoading ? <LoadingState label="កំពុងផ្ទុកនាយកដ្ឋាន..." /> : null}

              {!departmentQuery.isLoading && departmentQuery.isError ? (
                <ErrorState
                  message={departmentQueryError}
                  onRetry={() => void departmentQuery.mutate()}
                />
              ) : null}

              {!departmentQuery.isLoading && !departmentQuery.isError ? (
                <>
                  <div className="divide-y">
                    {departments.map((department: Department) => (
                      <div
                        key={department.id}
                        className="grid gap-4 p-4 transition hover:bg-muted/20 lg:grid-cols-[minmax(0,1fr)_180px_140px_44px] lg:items-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-md bg-slate-100 p-2 text-slate-700">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{department.name}</p>
                              <p className="text-xs text-muted-foreground">{department.code}</p>
                            </div>
                            <StatusBadge status={department.status} />
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {department.description || 'មិនមានការពិពណ៌នានាយកដ្ឋានទេ។'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">អ្នកគ្រប់គ្រង</p>
                          <p className="mt-1 text-sm font-medium">{department.manager || '-'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">ចំនួនមន្ត្រី</p>
                          <CardNumber
                            value={department.officerCount}
                            className="mt-1 block text-sm font-medium"
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">បើកម៉ឺនុយ</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDepartment(department)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              កែប្រែ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  mode: 'department',
                                  id: department.id,
                                  name: department.name,
                                })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              លុប
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}

                    {departments.length === 0 ? (
                      <EmptyState message="មិនមាននាយកដ្ឋានត្រូវនឹងលក្ខខណ្ឌតម្រងបច្ចុប្បន្នទេ។" />
                    ) : null}
                  </div>

                  <PaginationControls
                    page={departmentQuery.pagination.page}
                    totalPages={departmentQuery.pagination.totalPages}
                    totalElements={departmentQuery.pagination.totalElements}
                    onPrevious={() => setDepartmentPage((current) => Math.max(0, current - 1))}
                    onNext={() => setDepartmentPage((current) => current + 1)}
                    disabled={departmentQuery.isFetching}
                  />
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="positions" className="m-0">
              {positionQuery.isLoading ? <LoadingState label="កំពុងផ្ទុកតួនាទី..." /> : null}

              {!positionQuery.isLoading && positionQuery.isError ? (
                <ErrorState
                  message={positionQueryError}
                  onRetry={() => void positionQuery.mutate()}
                />
              ) : null}

              {!positionQuery.isLoading && !positionQuery.isError ? (
                <>
                  <div className="divide-y">
                    {positions.map((position: Position) => (
                      <div
                        key={position.id}
                        className="grid gap-4 p-4 transition hover:bg-muted/20 lg:grid-cols-[minmax(0,1fr)_180px_140px_44px] lg:items-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-md bg-slate-100 p-2 text-slate-700">
                              <BriefcaseBusiness className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{position.title}</p>
                              <p className="text-xs text-muted-foreground">{position.code}</p>
                            </div>
                            <StatusBadge status={position.status} />
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {position.description || 'មិនមានការពិពណ៌នាតួនាទីទេ។'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">នាយកដ្ឋាន</p>
                          <p className="mt-1 text-sm font-medium">
                            {position.departmentName || '-'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">ចំនួនមន្ត្រី</p>
                          <CardNumber
                            value={position.officerCount}
                            className="mt-1 block text-sm font-medium"
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">បើកម៉ឺនុយ</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditPosition(position)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              កែប្រែ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  mode: 'position',
                                  id: position.id,
                                  name: position.title,
                                })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              លុប
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}

                    {positions.length === 0 ? (
                      <EmptyState message="មិនមានតួនាទីត្រូវនឹងលក្ខខណ្ឌតម្រងបច្ចុប្បន្នទេ។" />
                    ) : null}
                  </div>

                  <PaginationControls
                    page={positionQuery.pagination.page}
                    totalPages={positionQuery.pagination.totalPages}
                    totalElements={positionQuery.pagination.totalElements}
                    onPrevious={() => setPositionPage((current) => Math.max(0, current - 1))}
                    onNext={() => setPositionPage((current) => current + 1)}
                    disabled={positionQuery.isFetching}
                  />
                </>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {dialogMode === 'department'
                ? editingDepartment
                  ? 'កែប្រែនាយកដ្ឋាន'
                  : 'បង្កើតនាយកដ្ឋាន'
                : editingPosition
                  ? 'កែប្រែតួនាទី'
                  : 'បង្កើតតួនាទី'}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {dialogMode === 'department' ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department-name">ឈ្មោះនាយកដ្ឋាន</Label>
                    <Input
                      id="department-name"
                      value={departmentForm.name}
                      onChange={(event) => {
                        const name = event.target.value;
                        setDepartmentForm((form) => ({ ...form, name }));
                        setDepartmentErrors((errors) => ({ ...errors, name: undefined }));
                      }}
                      placeholder="រដ្ឋបាល"
                      className={cn(departmentErrors.name && 'border-destructive')}
                    />
                    <FieldError message={departmentErrors.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department-code">កូដ</Label>
                    <Input
                      id="department-code"
                      value={departmentForm.code}
                      onChange={(event) => {
                        const code = event.target.value;
                        setDepartmentForm((form) => ({ ...form, code }));
                        setDepartmentErrors((errors) => ({ ...errors, code: undefined }));
                      }}
                      placeholder="ADM"
                      className={cn(departmentErrors.code && 'border-destructive')}
                    />
                    <FieldError message={departmentErrors.code} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department-manager">អ្នកគ្រប់គ្រង</Label>
                    <Input
                      id="department-manager"
                      value={departmentForm.manager ?? ''}
                      onChange={(event) => {
                        const manager = event.target.value;
                        setDepartmentForm((form) => ({ ...form, manager }));
                        setDepartmentErrors((errors) => ({ ...errors, manager: undefined }));
                      }}
                      placeholder="ជម្រើសបន្ថែម"
                      className={cn(departmentErrors.manager && 'border-destructive')}
                    />
                    <FieldError message={departmentErrors.manager} />
                  </div>

                  <div className="space-y-2">
                    <Label>ស្ថានភាព</Label>
                    <Select
                      value={departmentForm.status}
                      onValueChange={(value: OrganizationStatus) => {
                        setDepartmentForm((form) => ({ ...form, status: value }));
                        setDepartmentErrors((errors) => ({ ...errors, status: undefined }));
                      }}
                    >
                      <SelectTrigger
                        className={cn(departmentErrors.status && 'border-destructive')}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">សកម្ម</SelectItem>
                        <SelectItem value="inactive">មិនសកម្ម</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={departmentErrors.status} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department-description">ការពិពណ៌នា</Label>
                  <Textarea
                    id="department-description"
                    value={departmentForm.description ?? ''}
                    onChange={(event) => {
                      const description = event.target.value;
                      setDepartmentForm((form) => ({ ...form, description }));
                      setDepartmentErrors((errors) => ({ ...errors, description: undefined }));
                    }}
                    className={cn(departmentErrors.description && 'border-destructive')}
                  />
                  <FieldError message={departmentErrors.description} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="position-title">ឈ្មោះតួនាទី</Label>
                    <Input
                      id="position-title"
                      value={positionForm.title}
                      onChange={(event) => {
                        const title = event.target.value;
                        setPositionForm((form) => ({ ...form, title }));
                        setPositionErrors((errors) => ({ ...errors, title: undefined }));
                      }}
                      placeholder="ប្រធាននាយកដ្ឋាន"
                      className={cn(positionErrors.title && 'border-destructive')}
                    />
                    <FieldError message={positionErrors.title} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position-code">កូដ</Label>
                    <Input
                      id="position-code"
                      value={positionForm.code}
                      onChange={(event) => {
                        const code = event.target.value;
                        setPositionForm((form) => ({ ...form, code }));
                        setPositionErrors((errors) => ({ ...errors, code: undefined }));
                      }}
                      placeholder="HOD"
                      className={cn(positionErrors.code && 'border-destructive')}
                    />
                    <FieldError message={positionErrors.code} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>នាយកដ្ឋាន</Label>
                    <Select
                      value={
                        positionForm.departmentId ? String(positionForm.departmentId) : undefined
                      }
                      onValueChange={(value) => {
                        setPositionForm((form) => ({ ...form, departmentId: Number(value) }));
                        setPositionErrors((errors) => ({ ...errors, departmentId: undefined }));
                      }}
                    >
                      <SelectTrigger
                        className={cn(positionErrors.departmentId && 'border-destructive')}
                      >
                        <SelectValue placeholder="ជ្រើសរើសនាយកដ្ឋាន" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((department: Department) => (
                          <SelectItem key={department.id} value={String(department.id)}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={positionErrors.departmentId} />
                  </div>

                  <div className="space-y-2">
                    <Label>ស្ថានភាព</Label>
                    <Select
                      value={positionForm.status}
                      onValueChange={(value: OrganizationStatus) => {
                        setPositionForm((form) => ({ ...form, status: value }));
                        setPositionErrors((errors) => ({ ...errors, status: undefined }));
                      }}
                    >
                      <SelectTrigger className={cn(positionErrors.status && 'border-destructive')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">សកម្ម</SelectItem>
                        <SelectItem value="inactive">មិនសកម្ម</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={positionErrors.status} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position-description">ការពិពណ៌នា</Label>
                  <Textarea
                    id="position-description"
                    value={positionForm.description ?? ''}
                    onChange={(event) => {
                      const description = event.target.value;
                      setPositionForm((form) => ({ ...form, description }));
                      setPositionErrors((errors) => ({ ...errors, description: undefined }));
                    }}
                    placeholder="ការពិពណ៌នាជាជម្រើស បញ្ចូលបានរហូតដល់ 500 តួអក្សរ"
                    className={cn(positionErrors.description && 'border-destructive')}
                  />
                  <FieldError message={positionErrors.description} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              បោះបង់
            </Button>
            <Button
              onClick={() => void (dialogMode === 'department' ? saveDepartment() : savePosition())}
              disabled={dialogMode === 'department' ? isDepartmentSaving : isPositionSaving}
            >
              {dialogMode === 'department' && isDepartmentSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : null}
              {dialogMode === 'position' && isPositionSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : null}
              {!isDepartmentSaving && dialogMode === 'department' ? 'រក្សាទុកនាយកដ្ឋាន' : null}
              {!isPositionSaving && dialogMode === 'position' ? 'រក្សាទុកតួនាទី' : null}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>លុបទិន្នន័យ</AlertDialogTitle>
            <AlertDialogDescription>
              ការលុបនេះនឹងដកចេញជាអចិន្ត្រៃយ៍នូវ <strong>{deleteTarget?.name}</strong>។
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>បោះបង់</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  កំពុងលុប...
                </>
              ) : (
                'លុប'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
