import { useEffect, useMemo, useState } from 'react';
import { toast } from '@/lib/toast';
import { Check, ChevronsUpDown, Search, User, X } from 'lucide-react';

import { AttendanceStatusBadge } from '@/components/attendance/attendance-status-badge';
import { Button } from '@/components/ui/button';
import { CardNumber } from '@/components/ui/card-number';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AttendanceFormData } from '@/lib/attendance/types';
import {
  formatAttendanceDate,
  formatAttendanceMinutes,
  formatAttendanceTime,
  getAttendanceInitials,
  getAttendanceOfficerName,
} from '@/lib/attendance/utils';
import type { Attendance, Officer } from '@/lib/schemas';
import { useOfficers } from '@/hooks/officers/use-officers';

function getDateInputToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function AttendanceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  attendance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
  attendance?: Attendance | null;
}) {
  const emptyForm: AttendanceFormData = {
    officerId: 0,
    date: '',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'Present',
    notes: '',
  };
  const [form, setForm] = useState<AttendanceFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(attendance);

  const [officerPopoverOpen, setOfficerPopoverOpen] = useState(false);
  const [officerSearch, setOfficerSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const { officers = [], isLoading: isLoadingOfficers } = useOfficers({
    page: 1,
    pageSize: 1000,
    status: 'ACTIVE',
  });

  const departmentList = useMemo(() => {
    const set = new Set<string>();
    officers.forEach((o: Officer) => {
      if (o.department?.trim()) set.add(o.department.trim());
    });
    return Array.from(set);
  }, [officers]);

  const filteredOfficers = useMemo(() => {
    const query = officerSearch.trim().toLowerCase();
    return officers.filter((officer: Officer) => {
      if (
        selectedDepartment !== 'all' &&
        (officer.department || '').trim() !== selectedDepartment
      ) {
        return false;
      }
      if (!query) return true;

      const khName = `${officer.last_name_kh || ''} ${officer.first_name_kh || ''}`.toLowerCase();
      const enName =
        `${officer.first_name_en || officer.first_name || ''} ${officer.last_name_en || officer.last_name || ''}`.toLowerCase();
      const pos = (officer.position || '').toLowerCase();
      const dept = (officer.department || '').toLowerCase();
      const code = (officer.officerCode || (officer as any).officer_code || '').toLowerCase();

      return (
        khName.includes(query) ||
        enName.includes(query) ||
        pos.includes(query) ||
        dept.includes(query) ||
        code.includes(query)
      );
    });
  }, [officers, officerSearch, selectedDepartment]);

  const selectedOfficer = useMemo(
    () => officers.find((o: Officer) => o.id === form.officerId),
    [officers, form.officerId],
  );

  useEffect(() => {
    if (!open) return;

    setOfficerSearch('');
    setSelectedDepartment('all');

    if (!attendance) {
      setForm({ ...emptyForm, date: getDateInputToday() });
      return;
    }

    setForm({
      officerId: attendance.officerId,
      date: toDateInputValue(attendance.date),
      checkIn: toTimeInputValue(attendance.checkIn),
      checkOut: toTimeInputValue(attendance.checkOut),
      status: attendance.status || 'Present',
      notes: '',
    });
  }, [attendance, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.officerId === 0) {
      toast.error('សូមជ្រើសរើសមន្ត្រី');
      return;
    }
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
      <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden sm:max-w-[500px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEditing ? 'កែសម្រួលវត្តមាន' : 'កត់ត្រាវត្តមាន'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="employee" className="text-xs font-semibold text-slate-700">
                មន្ត្រី*
              </Label>
              <Popover open={officerPopoverOpen} onOpenChange={setOfficerPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="employee"
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={isEditing}
                    aria-expanded={officerPopoverOpen}
                    className="w-full justify-between h-11 px-3.5 text-left font-normal border-slate-200 rounded-xl bg-white"
                  >
                    {selectedOfficer ? (
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-xs">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-900 truncate leading-relaxed">
                          {selectedOfficer.last_name_kh || selectedOfficer.last_name}{' '}
                          {selectedOfficer.first_name_kh || selectedOfficer.first_name}
                        </span>
                      </div>
                    ) : isEditing && attendance ? (
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-900 truncate leading-relaxed">
                          {attendance.lastName} {attendance.firstName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        ជ្រើសរើសមន្ត្រី...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[340px] sm:w-[440px] p-0 rounded-2xl shadow-xl border-slate-200"
                  align="start"
                >
                  <div className="p-3 border-b space-y-2 bg-slate-50/70 rounded-t-2xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, តួនាទី..."
                        value={officerSearch}
                        onChange={(e) => setOfficerSearch(e.target.value)}
                        className="pl-9 h-9 text-xs rounded-xl bg-white border-slate-200"
                      />
                      {officerSearch && (
                        <button
                          type="button"
                          onClick={() => setOfficerSearch('')}
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {departmentList.length > 0 && (
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="h-8 text-xs bg-white rounded-xl border-slate-200 leading-relaxed">
                          <SelectValue placeholder="គ្រប់ការិយាល័យ / អង្គភាព" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[220px] rounded-xl">
                          <SelectItem value="all" className="text-xs">
                            គ្រប់ការិយាល័យ / អង្គភាព ({officers.length})
                          </SelectItem>
                          {departmentList.map((dept) => {
                            const count = officers.filter(
                              (o: Officer) => (o.department || '').trim() === dept,
                            ).length;
                            return (
                              <SelectItem key={dept} value={dept} className="text-xs">
                                {dept} ({count})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="max-h-[240px] overflow-y-auto p-1">
                    {isLoadingOfficers ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        កំពុងទាញយកទិន្នន័យមន្ត្រី...
                      </div>
                    ) : filteredOfficers.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        រកមិនឃើញមន្ត្រីដែលត្រូវនឹងការស្វែងរកទេ
                      </div>
                    ) : (
                      filteredOfficers.map((officer: Officer) => {
                        const isSelected = officer.id === form.officerId;
                        const khmerName =
                          `${officer.last_name_kh || ''} ${officer.first_name_kh || ''}`.trim();
                        const englishName = `${officer.last_name} ${officer.first_name}`.trim();
                        const displayName = khmerName || englishName;

                        return (
                          <div
                            key={officer.id}
                            onClick={() => {
                              setForm({ ...form, officerId: officer.id });
                              setOfficerPopoverOpen(false);
                            }}
                            className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900 font-medium'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900">{displayName}</span>
                                {officer.position && (
                                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                                    {officer.position}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {officer.department}{' '}
                                {officer.officerCode ? `· ID: ${officer.officerCode}` : ''}
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">កាលបរិច្ឆេទ</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
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
                  onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="check-out">ម៉ោងចេញ</Label>
                <Input
                  id="check-out"
                  type="time"
                  value={form.checkOut}
                  onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">ស្ថានភាព</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">វត្តមាន</SelectItem>
                  <SelectItem value="Approved">បានអនុម័ត</SelectItem>
                  <SelectItem value="Late">មកយឺត</SelectItem>
                  <SelectItem value="Absent">អវត្តមាន</SelectItem>
                  <SelectItem value="Half-day">ពាក់កណ្តាលថ្ងៃ</SelectItem>
                  <SelectItem value="Rejected">បានបដិសេធ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">កំណត់ចំណាំ (ជម្រើស)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="បន្ថែមកំណត់ចំណាំ..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              បោះបង់
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'កំពុងរក្សាទុក...' : isEditing ? 'កែសម្រួល' : 'រក្សាទុក'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return getDateInputToday();

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function toTimeInputValue(value: string | null | undefined) {
  if (!value) return '';

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const hours = String(parsed.getHours()).padStart(2, '0');
    const minutes = String(parsed.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  return value.slice(0, 5);
}

export function AttendanceDetailsDialog({
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
  const officerNameKh = getAttendanceOfficerName(attendance);
  const initials = getAttendanceInitials(attendance.firstName, attendance.lastName, officerNameKh);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] flex-col overflow-hidden sm:max-w-[860px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>ព័ត៌មានលម្អិតវត្តមាន</DialogTitle>
          <DialogDescription>{formatAttendanceDate(attendance.date)}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-lg border bg-muted/20">
              <div className="aspect-[4/5] w-full">
                {officerPhoto ? (
                  <img
                    src={officerPhoto}
                    alt={officerNameKh}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
                    <span className="font-khmer-moul-light text-3xl font-semibold text-indigo-700">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t bg-background/95 px-3.5 py-3 text-center">
                <p className="font-bold text-slate-900 leading-relaxed text-base">
                  {officerNameKh}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">ការិយាល័យ</p>
                  <p className="text-sm font-medium">{attendance.department || '--'}</p>
                </div>
                <AttendanceStatusBadge status={attendance.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailMetric
                  label="ម៉ោងចូល"
                  value={formatAttendanceTime(attendance.checkIn)}
                  useNormalNumbers
                />
                <DetailMetric
                  label="ម៉ោងចេញ"
                  value={formatAttendanceTime(attendance.checkOut)}
                  useNormalNumbers
                />
                <DetailMetric
                  label="ម៉ោងធ្វើការសរុប"
                  value={formatAttendanceMinutes(attendance.totalWorkMin)}
                  useNormalNumbers
                />
                <DetailMetric
                  label="ម៉ោងយឺត"
                  value={formatAttendanceMinutes(attendance.totalLateMin)}
                  useNormalNumbers
                />
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
                      <p className="text-sm">{formatAttendanceTime(session.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden">ម៉ោងចេញ</p>
                      <p className="text-sm">{formatAttendanceTime(session.checkOut)}</p>
                    </div>
                    <div className="sm:justify-self-end sm:text-right">
                      <AttendanceStatusBadge status={session.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailMetric({
  label,
  value,
  useNormalNumbers,
}: {
  label: string;
  value: string;
  useNormalNumbers?: boolean;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      {useNormalNumbers ? (
        <span className="mt-1 block text-sm font-semibold text-slate-950">{value}</span>
      ) : (
        <CardNumber value={value} className="mt-1 block text-sm font-semibold" />
      )}
    </div>
  );
}
