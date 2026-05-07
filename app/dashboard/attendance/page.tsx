'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CalendarIcon, Download, Plus, RefreshCw, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';
import {
  AttendanceDetailsDialog,
  AttendanceFormDialog,
} from '@/components/attendance/attendance-dialogs';
import { AttendanceTable } from '@/components/attendance/attendance-table';
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
import {
  useCreateAttendance,
  useExportAttendance,
  useImportAttendance,
  useUpdateAttendance,
} from '@/hooks/attendance/use-attendance-mutations';
import type { AttendanceStatus, AttendanceViewMode } from '@/hooks/attendance/use-attendance';
import type { AttendanceFormData } from '@/lib/attendance/types';
import type { Attendance } from '@/lib/schemas';

function getDateInputToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Marketing', label: 'Marketing' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Late', label: 'Late' },
  { value: 'Half-day', label: 'Half-day' },
];

const viewModes = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
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
  const importInputRef = useRef<HTMLInputElement>(null);

  const canCreate = hasPermission('ATTENDANCE_CREATE');
  const canEdit = hasPermission('ATTENDANCE_UPDATE');
  const canExport = hasPermission('ATTENDANCE_EXPORT');
  const canImport = hasPermission('ATTENDANCE_IMPORT');

  useEffect(() => {
    setDate((current) => current || getDateInputToday());
  }, []);

  const normalizedFilters = {
    search: search.trim() || undefined,
    date: date || undefined,
    department: department === 'all' ? undefined : department,
    status: status === 'all' ? undefined : (status as AttendanceStatus),
    viewMode,
  };

  const { data, isLoading, error, refetch } = useAttendance({
    page,
    size: 10,
    ...normalizedFilters,
  });
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const exportAttendance = useExportAttendance();
  const importAttendance = useImportAttendance();

  const records = data?.content ?? [];
  const totalPages = data?.totalPages || 0;
  const filteredRecords = useMemo<Attendance[]>(() => records, [records]);

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
    toast.success('Attendance export generated.');
  }

  async function handleImportFile(file: File) {
    const result = await importAttendance.mutateAsync(file);
    const summary = `Created ${result.created}, updated ${result.updated}, failed ${result.failed}`;

    if (result.failed > 0) {
      toast.warning(summary);
      result.errors.slice(0, 3).forEach((item) => {
        toast.error(`Row ${item.row}: ${item.message}`);
      });
    } else {
      toast.success(summary);
    }

    await refetch();
  }

  return (
    <RequireAccess permission="ATTENDANCE_VIEW">
      <div className="flex flex-col gap-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Attendance Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Filter daily records, import spreadsheets, and correct attendance entries.
          </p>
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

        {error ? <AttendanceErrorAlert onRetry={() => void refetch()} /> : null}

        <AttendanceFilters
          search={search}
          date={date}
          department={department}
          status={status}
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
        <span>Unable to load attendance records.</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-auto">
          <RefreshCw className="mr-2 h-3 w-3" />
          Retry
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
              placeholder="Search by officer name or code"
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Department" />
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
              <SelectValue placeholder="Status" />
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
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Create Attendance
            </Button>
          ) : null}
          {onExport ? (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export XLSX
            </Button>
          ) : null}
          {onBulkUpload ? (
            <Button variant="outline" onClick={onBulkUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Import XLSX
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
        <div className="text-sm text-muted-foreground">{selectedCount} selected</div>
      ) : null}
    </div>
  );
}
