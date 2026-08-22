import { Badge } from '@/components/ui/badge';
import { getAttendanceStatusColor } from '@/lib/attendance/utils';

const statusTranslations: Record<string, string> = {
  present: 'វត្តមាន',
  absent: 'អវត្តមាន',
  late: 'មកយឺត',
  'half-day': 'ពាក់កណ្តាលថ្ងៃ',
  half_day: 'ពាក់កណ្តាលថ្ងៃ',
  approved: 'បានអនុម័ត',
  rejected: 'បានបដិសេធ',
  pending: 'រង់ចាំ',
  leave: 'ច្បាប់ឈប់សម្រាក',
  on_leave: 'ច្បាប់ឈប់សម្រាក',
  'on leave': 'ច្បាប់ឈប់សម្រាក',
  mission: 'បេសកកម្ម',
  permission: 'សុំច្បាប់',
};

export function AttendanceStatusBadge({ status }: { status?: string | null }) {
  if (!status) {
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0">
        --
      </Badge>
    );
  }

  const normalized = status.trim().toLowerCase();
  const displayStatus = statusTranslations[normalized] || status;

  return (
    <Badge
      variant="secondary"
      className={`border-0 font-medium ${getAttendanceStatusColor(status)}`}
    >
      {displayStatus}
    </Badge>
  );
}
