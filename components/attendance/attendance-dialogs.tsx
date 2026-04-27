import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
} from '@/lib/attendance/utils';
import type { Attendance } from '@/lib/schemas';

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

  useEffect(() => {
    if (!open) return;

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
          <DialogDescription>កត់ត្រាវត្តមានសម្រាប់មន្ត្រី</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="employee">មន្ត្រី</Label>
              <Select
                value={String(form.officerId)}
                onValueChange={(value) => setForm({ ...form, officerId: Number(value) })}
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
                    alt={`${attendance.firstName} ${attendance.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                    <span className="font-khmer-moul-light text-3xl font-semibold text-slate-700">
                      {getAttendanceInitials(attendance.firstName, attendance.lastName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t bg-background/95 px-3 py-2">
                <p className="font-khmer-moul-light text-sm font-semibold">
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
                <AttendanceStatusBadge status={attendance.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailMetric label="ម៉ោងចូល" value={formatAttendanceTime(attendance.checkIn)} />
                <DetailMetric label="ម៉ោងចេញ" value={formatAttendanceTime(attendance.checkOut)} />
                <DetailMetric
                  label="ម៉ោងធ្វើការសរុប"
                  value={formatAttendanceMinutes(attendance.totalWorkMin)}
                />
                <DetailMetric
                  label="ម៉ោងយឺត"
                  value={formatAttendanceMinutes(attendance.totalLateMin)}
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

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <CardNumber value={value} className="mt-1 block text-sm font-semibold" />
    </div>
  );
}
