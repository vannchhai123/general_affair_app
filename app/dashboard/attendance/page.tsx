'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CalendarIcon, Download, Plus, RefreshCw, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';

import {
  AttendanceFormDialog,
  AttendanceDetailsDialog,
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
  { value: 'all', label: 'នាយកដ្ឋានទាំងអស់' },
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Marketing', label: 'Marketing' },
];

const statusOptions = [
  { value: 'all', label: 'ស្ថានភាពទាំងអស់' },
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
  const {
    data: attendanceData,
    isLoading,
    error,
    refetch,
  } = useAttendance({
    page,
    size: 10,
    ...normalizedFilters,
  });
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const exportAttendance = useExportAttendance();
  const importAttendance = useImportAttendance();
  const records = attendanceData?.content ?? [];
  const totalPages = attendanceData?.totalPages || 0;

  const filteredRecords = useMemo<Attendance[]>(() => records, [records]);

  function resetPage() {
    setPage(0);
    setSelectedIds([]);
  }

  function openDetails(record: Attendance) {
    setSelectedAttendance(record);
    setDetailOpen(true);
  }

  function openCreateDialog() {
    setEditingAttendance(null);
    setModalOpen(true);
  }

  function openEditDialog(record: Attendance) {
    setEditingAttendance(record);
    setModalOpen(true);
  }

  function toggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.length === filteredRecords.length ? [] : filteredRecords.map((record) => record.id),
    );
  }

  async function handleSubmitAttendance(data: AttendanceFormData) {
    if (editingAttendance) {
      await updateAttendance.mutateAsync({ id: editingAttendance.id, data });
      setEditingAttendance(null);
    } else {
      await createAttendance.mutateAsync(data);
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

    toast.success('បាននាំចេញរបាយការណ៍វត្តមាន');
  }

  function handleBulkUpload() {
    importInputRef.current?.click();
  }

  async function handleImportFile(file: File) {
    const result = await importAttendance.mutateAsync(file);
    const summary = `បានបង្កើត ${result.created}, បានកែសម្រួល ${result.updated}, បរាជ័យ ${result.failed}`;

    if (result.failed > 0) {
      toast.warning(summary);
      result.errors.slice(0, 3).forEach((item) => {
        toast.error(`ជួរ ${item.row}: ${item.message}`);
      });
    } else {
      toast.success(summary);
    }

    await refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <AttendancePageHeader />

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

      {error && <AttendanceErrorAlert onRetry={() => refetch()} />}

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
        onAdd={openCreateDialog}
        onExport={handleExport}
        onBulkUpload={handleBulkUpload}
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
        onAdd={openCreateDialog}
        onDetails={openDetails}
        onEdit={openEditDialog}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
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
  );
}

function AttendancePageHeader() {
  return (
    <div className="sticky top-0 z-20 border-b bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <h1 className="page-title text-2xl tracking-tight">ការគ្រប់គ្រងវត្តមាន</h1>
    </div>
  );
}

function AttendanceErrorAlert({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>មិនអាចទាញយកទិន្នន័យវត្តមានបានទេ</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-auto">
          <RefreshCw className="mr-2 h-3 w-3" />
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
  onAdd: () => void;
  onExport: () => void;
  onBulkUpload: () => void;
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
              placeholder="ស្វែងរកមន្ត្រីតាមឈ្មោះ ឬលេខសម្គាល់"
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
              <SelectValue placeholder="នាយកដ្ឋាន" />
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
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            កត់ត្រាវត្តមាន
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            នាំចេញរបាយការណ៍
          </Button>
          <Button variant="outline" onClick={onBulkUpload}>
            <Upload className="mr-2 h-4 w-4" />
            បញ្ចូលជាក្រុម
          </Button>
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

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{selectedCount} បានជ្រើសរើស</span>
          <Button variant="outline" size="sm">
            សកម្មភាពជាក្រុម
          </Button>
        </div>
      )}
    </div>
  );
}
