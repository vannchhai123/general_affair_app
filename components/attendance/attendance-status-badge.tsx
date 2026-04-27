import { Badge } from '@/components/ui/badge';
import { getAttendanceStatusColor } from '@/lib/attendance/utils';

export function AttendanceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={getAttendanceStatusColor(status)}>
      {status}
    </Badge>
  );
}
