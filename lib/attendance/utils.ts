import { format } from 'date-fns';
import type { Officer } from '@/lib/schemas';

export function getAttendanceOfficerName(
  record: {
    firstName?: string | null;
    lastName?: string | null;
    firstNameKh?: string | null;
    lastNameKh?: string | null;
    first_name_kh?: string | null;
    last_name_kh?: string | null;
    nameKh?: string | null;
    name_kh?: string | null;
    officerId?: number;
  },
  officersMap?: Map<number, Officer>,
): string {
  const rec = record as any;
  const directKhmer =
    rec.nameKh ||
    rec.name_kh ||
    `${rec.lastNameKh || rec.last_name_kh || ''} ${rec.firstNameKh || rec.first_name_kh || ''}`.trim();

  if (directKhmer) return directKhmer;

  if (officersMap && record.officerId) {
    const matched = officersMap.get(record.officerId);
    if (matched) {
      const officerKh = `${matched.last_name_kh || ''} ${matched.first_name_kh || ''}`.trim();
      if (officerKh) return officerKh;
    }
  }

  const enName = `${record.lastName || ''} ${record.firstName || ''}`.trim();
  return enName || 'មន្ត្រី';
}

export function getAttendanceInitials(firstName: string, lastName: string, nameKh?: string) {
  if (nameKh && nameKh.trim().length > 0) {
    return nameKh.trim().charAt(0);
  }
  return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'ម';
}

export function formatAttendanceDate(date: string | null | undefined): string {
  if (!date) return '--';

  const normalizedDate = date.trim();
  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    try {
      return parsedDate.toLocaleDateString('km-KH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return format(parsedDate, 'dd-MM-yyyy');
    }
  }

  return normalizedDate;
}

export function formatAttendanceTime(time: string | null | undefined): string {
  if (!time) return '--';

  const normalizedTime = time.trim();
  const parsedDate = new Date(normalizedTime);

  if (!Number.isNaN(parsedDate.getTime())) {
    try {
      return parsedDate.toLocaleTimeString('km-KH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return format(parsedDate, 'hh:mm a');
    }
  }

  return normalizedTime;
}

export function formatAttendanceMinutes(totalMinutes: number | null | undefined): string {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes < 0) {
    return '--';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0 && minutes === 0) return '0 នាទី';
  if (hours === 0) return `${minutes} នាទី`;
  if (minutes === 0) return `${hours} ម៉ោង`;

  return `${hours} ម៉ោង ${minutes} នាទី`;
}

export function calculateAttendanceHours(
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

  return formatAttendanceMinutes(Math.floor(diffMs / (1000 * 60)));
}

export function getAttendanceStatusColor(status?: string | null): string {
  if (!status) return 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-0';

  switch (status.trim().toLowerCase()) {
    case 'present':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0';
    case 'approved':
      return 'bg-teal-100 text-teal-800 hover:bg-teal-100 border-0';
    case 'absent':
      return 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0';
    case 'late':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0';
    case 'half-day':
    case 'half_day':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-0';
    case 'rejected':
      return 'bg-red-100 text-red-700 hover:bg-red-100 border-0';
    case 'pending':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0';
    case 'leave':
    case 'on_leave':
    case 'on leave':
      return 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-0';
    case 'mission':
      return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-0';
  }
}
