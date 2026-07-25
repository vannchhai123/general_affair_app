import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Users } from 'lucide-react';
import type { Attendance, Officer } from '@/lib/schemas';
import { AttendanceStatusBadge } from '@/components/attendance/attendance-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  calculateAttendanceHours,
  formatAttendanceDate,
  formatAttendanceTime,
  getAttendanceInitials,
  getAttendanceOfficerName,
} from '@/lib/attendance/utils';

export function AttendanceTable({
  records,
  isLoading,
  selectedIds,
  page,
  totalPages,
  onAdd,
  onDetails,
  onEdit,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
  officersMap,
}: {
  records: Attendance[];
  isLoading: boolean;
  selectedIds: number[];
  page: number;
  totalPages: number;
  onAdd?: () => void;
  onDetails: (record: Attendance) => void;
  onEdit?: (record: Attendance) => void;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
  officersMap?: Map<number, Officer>;
}) {
  return (
    <div className="rounded-lg border bg-card">
      {isLoading ? (
        <AttendanceTableSkeleton />
      ) : records.length === 0 ? (
        <AttendanceTableEmpty onAdd={onAdd} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="font-khmer-moul-light">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === records.length && records.length > 0}
                    onCheckedChange={onToggleSelectAll}
                  />
                </TableHead>
                <TableHead className="px-4 py-3">មន្ត្រី</TableHead>
                <TableHead className="px-4 py-3">ការិយាល័យ</TableHead>
                <TableHead className="px-4 py-3">កាលបរិច្ឆេទ</TableHead>
                <TableHead className="px-4 py-3">ម៉ោងចូល</TableHead>
                <TableHead className="px-4 py-3">ម៉ោងចេញ</TableHead>
                <TableHead className="px-4 py-3">ម៉ោងធ្វើការសរុប</TableHead>
                <TableHead className="px-4 py-3">ស្ថានភាព</TableHead>
                <TableHead className="w-[100px] px-4 py-3 text-right">សកម្មភាព</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <AttendanceTableRow
                  key={record.id}
                  record={record}
                  selected={selectedIds.includes(record.id)}
                  onDetails={onDetails}
                  onEdit={onEdit}
                  onToggleSelect={onToggleSelect}
                  officersMap={officersMap}
                />
              ))}
            </TableBody>
          </Table>

          {totalPages > 0 ? (
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                ទំព័រទី {page + 1} នៃ {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                ថយក្រោយ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                បន្ទាប់
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function AttendanceTableRow({
  record,
  selected,
  onDetails,
  onEdit,
  onToggleSelect,
  officersMap,
}: {
  record: Attendance;
  selected: boolean;
  onDetails: (record: Attendance) => void;
  onEdit?: (record: Attendance) => void;
  onToggleSelect: (id: number) => void;
  officersMap?: Map<number, Officer>;
}) {
  const officerNameKh = getAttendanceOfficerName(record, officersMap);
  const initials = getAttendanceInitials(record.firstName, record.lastName, officerNameKh);

  return (
    <TableRow
      className={`transition-colors hover:bg-muted/50 ${record.status === 'Late' ? 'bg-amber-50/50' : ''}`}
    >
      <TableCell className="px-4 py-3.5 align-middle">
        <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(record.id)} />
      </TableCell>
      <TableCell className="px-4 py-3.5 align-middle">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={record.imageUrl || undefined} alt={officerNameKh} />
            <AvatarFallback className="bg-indigo-50 text-xs font-semibold text-indigo-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900 leading-relaxed text-sm">{officerNameKh}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3.5 align-middle text-sm font-medium leading-relaxed">
        {record.department || '-'}
      </TableCell>
      <TableCell className="text-sm">{formatAttendanceDate(record.date)}</TableCell>
      <TableCell className="text-sm">{formatAttendanceTime(record.checkIn)}</TableCell>
      <TableCell className="text-sm">{formatAttendanceTime(record.checkOut)}</TableCell>
      <TableCell className="text-sm font-medium">
        {calculateAttendanceHours(record.checkIn, record.checkOut)}
      </TableCell>
      <TableCell>
        <AttendanceStatusBadge status={record.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDetails(record)}>
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(record)}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

function AttendanceTableSkeleton() {
  return (
    <div className="p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-b py-4">
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
  );
}

function AttendanceTableEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">រកមិនឃើញកំណត់ត្រាវត្តមានទេ</h3>
      <p className="mt-1 text-sm text-muted-foreground">សូមកែតម្រូវការត្រង ឬកត់ត្រាវត្តមានថ្មី។</p>
      {onAdd ? (
        <Button onClick={onAdd} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          កត់ត្រាវត្តមាន
        </Button>
      ) : null}
    </div>
  );
}
