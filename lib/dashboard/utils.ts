import { formatKhmerNumerals } from '@/lib/utils';

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function percent(part: number, total: number) {
  return total > 0 ? clampPercent((part / total) * 100) : 0;
}

export { formatKhmerNumerals };

export function formatDashboardMinutes(totalMinutes: number | null | undefined) {
  if (typeof totalMinutes !== 'number' || totalMinutes <= 0) return '--';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return formatKhmerNumerals(`${minutes}m`);
  if (minutes === 0) return formatKhmerNumerals(`${hours}h`);

  return formatKhmerNumerals(`${hours}h ${minutes}m`);
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
