import { ClipboardCheck, TrendingUp } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDashboardMinutes, formatKhmerNumerals, getInitials } from '@/lib/dashboard/utils';
import type { Attendance } from '@/lib/schemas';

type RecentAttendanceLabels = {
  title: string;
  officer: string;
  department: string;
  workHours: string;
  status: string;
  noCode: string;
  emptyTitle: string;
  emptyDescription: string;
  present: string;
  absent: string;
};

export function RecentAttendanceCard({
  records,
  labels,
}: {
  records: Attendance[];
  labels: RecentAttendanceLabels;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/80">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{labels.title}</CardTitle>
          <div className="rounded-md bg-white p-2 text-slate-600 shadow-sm">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <RecentAttendanceTable records={records} labels={labels} />
      </CardContent>
    </Card>
  );
}

function RecentAttendanceTable({
  records,
  labels,
}: {
  records: Attendance[];
  labels: RecentAttendanceLabels;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>{labels.officer}</TableHead>
            <TableHead>{labels.department}</TableHead>
            <TableHead>{labels.workHours}</TableHead>
            <TableHead>{labels.status}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className="hover:bg-slate-50/70">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(record.firstName, record.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {record.firstName} {record.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.officerCode ? formatKhmerNumerals(record.officerCode) : labels.noCode}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.department}</TableCell>
              <TableCell className="text-sm font-medium">
                {formatDashboardMinutes(record.totalWorkMin)}
              </TableCell>
              <TableCell>{statusBadge(record.status, labels)}</TableCell>
            </TableRow>
          ))}
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <div className="rounded-md bg-slate-100 p-3 text-slate-500">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-950">{labels.emptyTitle}</p>
                  <p className="text-sm text-muted-foreground">{labels.emptyDescription}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function statusBadge(status: string, labels: RecentAttendanceLabels) {
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case 'APPROVED':
    case 'PRESENT':
      return <Badge className="border-0 bg-emerald-100 text-emerald-700">{labels.present}</Badge>;
    case 'PENDING':
    case 'LATE':
      return (
        <Badge className="border-0 bg-amber-100 text-amber-700">
          {formatKhmerNumerals(status)}
        </Badge>
      );
    case 'ABSENT':
      return <Badge className="border-0 bg-red-100 text-red-700">{labels.absent}</Badge>;
    default:
      return <Badge variant="secondary">{formatKhmerNumerals(status)}</Badge>;
  }
}
