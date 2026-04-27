import { format } from 'date-fns';

export function getAttendanceInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatAttendanceDate(date: string | null | undefined): string {
  if (!date) return '--';

  const normalizedDate = date.trim();
  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    return format(parsedDate, 'MMM d, yyyy');
  }

  return normalizedDate;
}

export function formatAttendanceTime(time: string | null | undefined): string {
  if (!time) return '--';

  const normalizedTime = time.trim();
  const parsedDate = new Date(normalizedTime);

  if (!Number.isNaN(parsedDate.getTime())) {
    return format(parsedDate, 'h:mm a');
  }

  return normalizedTime;
}

export function formatAttendanceMinutes(totalMinutes: number | null | undefined): string {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes < 0) {
    return '--';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
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

export function getAttendanceStatusColor(status: string): string {
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
