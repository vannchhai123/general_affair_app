import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Users } from 'lucide-react';

import { AttendanceStatusBadge } from '@/components/attendance/attendance-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardNumber } from '@/components/ui/card-number';
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
} from '@/lib/attendance/utils';
import type { Attendance } from '@/lib/schemas';

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
}: {
  records: Attendance[];
  isLoading: boolean;
  selectedIds: number[];
  page: number;
  totalPages: number;
  onAdd: () => void;
  onDetails: (record: Attendance) => void;
  onEdit: (record: Attendance) => void;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
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
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === records.length && records.length > 0}
                    onCheckedChange={onToggleSelectAll}
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
              {records.map((record) => (
                <AttendanceTableRow
                  key={record.id}
                  record={record}
                  selected={selectedIds.includes(record.id)}
                  onDetails={onDetails}
                  onEdit={onEdit}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </TableBody>
          </Table>

          {totalPages > 0 && (
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                ទំព័រ {page + 1} នៃ {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                មុន
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
          )}
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
}: {
  record: Attendance;
  selected: boolean;
  onDetails: (record: Attendance) => void;
  onEdit: (record: Attendance) => void;
  onToggleSelect: (id: number) => void;
}) {
  const isLate = record.status === 'Late';

  return (
    <TableRow className={`transition-colors hover:bg-muted/50 ${isLate ? 'bg-amber-50/50' : ''}`}>
      <TableCell>
        <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(record.id)} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={record.imageUrl || undefined}
              alt={`${record.firstName} ${record.lastName}`}
            />
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {getAttendanceInitials(record.firstName, record.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-khmer-moul-light font-medium">
              {record.firstName} {record.lastName}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm text-muted-foreground">
        {record.officerCode || '—'}
      </TableCell>
      <TableCell className="text-sm">{record.department}</TableCell>
      <TableCell className="text-sm">{formatAttendanceDate(record.date)}</TableCell>
      <TableCell className="text-sm">{formatAttendanceTime(record.checkIn)}</TableCell>
      <TableCell className="text-sm">{formatAttendanceTime(record.checkOut)}</TableCell>
      <TableCell className="font-khmer-moul-light text-sm font-medium">
        <CardNumber value={calculateAttendanceHours(record.checkIn, record.checkOut)} />
      </TableCell>
      <TableCell>
        <AttendanceStatusBadge status={record.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="View Details / Khmer"
            aria-label="View Details / Khmer"
            onClick={() => onDetails(record)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit / Khmer"
            aria-label="Edit / Khmer"
            onClick={() => onEdit(record)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
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

function AttendanceTableEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-khmer-moul-light text-sm font-medium">រកមិនឃើញកំណត់ត្រាវត្តមាន</h3>
      <p className="mt-1 text-sm text-muted-foreground">សូមកែតម្រូវតម្រង ឬបន្ថែមវត្តមានថ្មី</p>
      <Button onClick={onAdd} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        កត់ត្រាវត្តមាន
      </Button>
    </div>
  );
}
