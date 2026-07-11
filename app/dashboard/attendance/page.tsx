'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CalendarIcon,
  Download,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';
import {
  AttendanceDetailsDialog,
  AttendanceFormDialog,
} from '@/components/attendance/attendance-dialogs';
import { AttendanceTable } from '@/components/attendance/attendance-table';
import { AttendanceSummaryDashboard } from '@/components/attendance/attendance-summary-dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendance } from '@/hooks/attendance/use-attendance';
import { useOffices } from '@/hooks/organization/use-offices';
import {
  useCreateAttendance,
  useExportAttendance,
  useImportAttendance,
  useUpdateAttendance,
} from '@/hooks/attendance/use-attendance-mutations';
import type { AttendanceStatus, AttendanceViewMode } from '@/hooks/attendance/use-attendance';
import type { AttendanceFormData } from '@/lib/attendance/types';
import type { Attendance, Office } from '@/lib/schemas';

function getDateInputToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const statusOptions = [
  { value: 'all', label: 'ស្ថានភាព' },
  { value: 'Present', label: 'វត្តមាន' },
  { value: 'Absent', label: 'អវត្តមាន' },
  { value: 'Late', label: 'មកយឺត' },
  { value: 'Half-day', label: 'ពាក់កណ្តាលថ្ងៃ' },
];

const viewModes = [
  { value: 'daily', label: 'ប្រចាំថ្ងៃ' },
  { value: 'monthly', label: 'ប្រចាំខែ' },
];

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState<AttendanceViewMode>('daily');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [showStats, setShowStats] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const canCreate = hasPermission('ATTENDANCE_CREATE');
  const canEdit = hasPermission('ATTENDANCE_UPDATE');
  const canExport = hasPermission('ATTENDANCE_EXPORT');
  const canImport = hasPermission('ATTENDANCE_IMPORT');

  useEffect(() => {
    setDate((current) => current || getDateInputToday());
  }, []);

  const normalizedFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      date: date || undefined,
      department: department === 'all' ? undefined : department,
      status: status === 'all' ? undefined : (status as AttendanceStatus),
      viewMode,
    }),
    [search, date, department, status, viewMode],
  );

  // Main paginated query for the table
  const { data, isLoading, error, refetch } = useAttendance({
    page,
    size: 10,
    ...normalizedFilters,
  });

  // Secondary query to fetch larger set of records for charts (filtered but up to 1000 items)
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAttendance({
    page: 0,
    size: 1000,
    ...normalizedFilters,
  });

  // Dynamic offices/departments from API
  const { offices = [] } = useOffices({ page: 0, size: 100, status: 'active' });

  const departmentOptions = useMemo(() => {
    return [
      { value: 'all', label: 'ការិយាល័យ' },
      ...offices.map((office: Office) => ({
        value: office.name,
        label: office.name,
      })),
    ];
  }, [offices]);

  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const exportAttendance = useExportAttendance();
  const importAttendance = useImportAttendance();

  const records = data?.content ?? [];
  const totalPages = data?.totalPages || 0;
  const filteredRecords = useMemo<Attendance[]>(() => records, [records]);
  const summaryRecords = summaryData?.content ?? [];

  function resetPage() {
    setPage(0);
    setSelectedIds([]);
  }

  async function handleSubmitAttendance(values: AttendanceFormData) {
    if (editingAttendance) {
      await updateAttendance.mutateAsync({ id: editingAttendance.id, data: values });
      setEditingAttendance(null);
    } else {
      await createAttendance.mutateAsync(values);
    }

    await refetch();
    await refetchSummary();
  }

  async function handleExport() {
    const { blob, filename } = await exportAttendance.mutateAsync(normalizedFilters);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('បាននាំចេញកំណត់ត្រាវត្តមានដោយជោគជ័យ។');
  }

  async function handleImportFile(file: File) {
    const result = await importAttendance.mutateAsync(file);
    const summary = `បាននាំចូល៖ បង្កើត ${result.created}, កែប្រែ ${result.updated}, បរាជ័យ ${result.failed}`;

    if (result.failed > 0) {
      toast.warning(summary);
      result.errors.slice(0, 3).forEach((item) => {
        toast.error(`ជួរដេកទី ${item.row}៖ ${item.message}`);
      });
    } else {
      toast.success(summary);
    }

    await refetch();
    await refetchSummary();
  }

  return (
    <RequireAccess permission="ATTENDANCE_VIEW">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title text-2xl font-semibold tracking-tight text-slate-950">
              ការគ្រប់គ្រងវត្តមាន
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="self-start sm:self-auto gap-2 border-slate-200"
          >
            <BarChart3 className="h-4 w-4 text-slate-500" />
            {showStats ? 'លាក់ស្ថិតិ' : 'បង្ហាញស្ថិតិ'}
          </Button>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void handleImportFile(file);
          }}
        />

        {showStats && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <AttendanceSummaryDashboard
              records={summaryRecords}
              isLoading={isSummaryLoading}
              error={summaryError}
            />
          </div>
        )}

        {error ? <AttendanceErrorAlert onRetry={() => void refetch()} /> : null}

        <AttendanceFilters
          search={search}
          date={date}
          department={department}
          status={status}
          departmentOptions={departmentOptions}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          onDateChange={(value) => {
            setDate(value);
            resetPage();
          }}
          onDepartmentChange={(value) => {
            setDepartment(value);
            resetPage();
          }}
          onStatusChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          onAdd={canCreate ? () => setModalOpen(true) : undefined}
          onExport={canExport ? () => void handleExport() : undefined}
          onBulkUpload={canImport ? () => importInputRef.current?.click() : undefined}
        />

        <AttendanceViewControls
          viewMode={viewMode}
          selectedCount={selectedIds.length}
          onViewModeChange={setViewMode}
        />

        <AttendanceTable
          records={filteredRecords}
          isLoading={isLoading}
          selectedIds={selectedIds}
          page={page}
          totalPages={totalPages}
          onAdd={canCreate ? () => setModalOpen(true) : undefined}
          onDetails={(record) => {
            setSelectedAttendance(record);
            setDetailOpen(true);
          }}
          onEdit={
            canEdit
              ? (record) => {
                  setEditingAttendance(record);
                  setModalOpen(true);
                }
              : undefined
          }
          onToggleSelect={(id) =>
            setSelectedIds((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            )
          }
          onToggleSelectAll={() =>
            setSelectedIds((current) =>
              current.length === filteredRecords.length
                ? []
                : filteredRecords.map((item) => item.id),
            )
          }
          onPageChange={setPage}
        />

        <AttendanceFormDialog
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setEditingAttendance(null);
          }}
          attendance={editingAttendance}
          onSubmit={handleSubmitAttendance}
        />

        <AttendanceDetailsDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          attendance={selectedAttendance}
        />
      </div>
    </RequireAccess>
  );
}

function AttendanceErrorAlert({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>មិនអាចផ្ទុកកំណត់ត្រាវត្តមានបានទេ។</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="ml-auto bg-transparent hover:bg-destructive/10"
        >
          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
          ព្យាយាមម្តងទៀត
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function AttendanceFilters({
  search,
  date,
  department,
  status,
  departmentOptions,
  onSearchChange,
  onDateChange,
  onDepartmentChange,
  onStatusChange,
  onAdd,
  onExport,
  onBulkUpload,
}: {
  search: string;
  date: string;
  department: string;
  status: string;
  departmentOptions: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAdd?: () => void;
  onExport?: () => void;
  onBulkUpload?: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខកូដមន្ត្រី"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="w-[180px]"
            />
          </div>

          <Select value={department} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ការិយាល័យ" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="ស្ថានភាព" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          {onAdd ? (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              កត់ត្រាវត្តមាន
            </Button>
          ) : null}
          {onExport ? (
            <Button variant="outline" onClick={onExport} className="gap-2 border-slate-200">
              <Download className="h-4 w-4" />
              នាំចេញជា XLSX
            </Button>
          ) : null}
          {onBulkUpload ? (
            <Button variant="outline" onClick={onBulkUpload} className="gap-2 border-slate-200">
              <Upload className="h-4 w-4" />
              នាំចូលពី XLSX
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AttendanceViewControls({
  viewMode,
  selectedCount,
  onViewModeChange,
}: {
  viewMode: AttendanceViewMode;
  selectedCount: number;
  onViewModeChange: (value: AttendanceViewMode) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Tabs
        value={viewMode}
        onValueChange={(value) => onViewModeChange(value as AttendanceViewMode)}
      >
        <TabsList>
          {viewModes.map((mode) => (
            <TabsTrigger key={mode.value} value={mode.value}>
              {mode.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {selectedCount > 0 ? (
        <div className="text-sm text-muted-foreground">{selectedCount} បានជ្រើសរើស</div>
      ) : null}
    </div>
  );
}
