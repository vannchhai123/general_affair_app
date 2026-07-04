import { Badge } from '@/components/ui/badge';
import { getAttendanceStatusColor } from '@/lib/attendance/utils';

const statusTranslations: Record<string, string> = {
  present: 'វត្តមាន',
  absent: 'អវត្តមាន',
  late: 'មកយឺត',
  'half-day': 'ពាក់កណ្តាលថ្ងៃ',
};

export function AttendanceStatusBadge({ status }: { status: string }) {
  const displayStatus = statusTranslations[status.toLowerCase()] || status;
  return (
    <Badge variant="secondary" className={getAttendanceStatusColor(status)}>
      {displayStatus}
    </Badge>
  );
}
