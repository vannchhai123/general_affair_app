'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Search,
  CalendarIcon,
  Filter,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAttendance } from '@/hooks/attendance/use-attendance';
import type { Attendance } from '@/lib/schemas';

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

  // Fetch data from API
  const { data: attendanceData, isLoading, error, refetch } = useAttendance({ page, size: 10 });

  console.log('Attendance List: ', { data: attendanceData });

  // Records from API response
  const records = attendanceData?.content || [];

  // Client-side filtered records (for display within current page)
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
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
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  }

  async function handleSubmitAttendance(data: AttendanceFormData) {
    // Replace with actual API call
    console.log('Submitting attendance:', data);
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
      <div>
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

      {/* Summary Cards */}
      <SummaryCards
        data={
          attendanceData
            ? { content: records, totalElements: attendanceData.totalElements }
            : undefined
        }
        isLoading={isLoading}
        error={error}
      />

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
                {filteredRecords.map((record) => {
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="មើល">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="កែប្រែ">
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
    </div>
  );
}
