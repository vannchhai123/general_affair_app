'use client';

import useSWR from 'swr';
import { format } from 'date-fns';
import { Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface AttendanceRecord {
  id: number;
  officer_id: number;
  date: string;
  total_work_minutes: number;
  total_late_minutes: number;
  status: string;
  first_name: string;
  last_name: string;
  department: string;
  sessions: Array<{
    id: number;
    shift_name: string;
    check_in: string;
    check_out: string;
    status: string;
  }> | null;
}

function statusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Approved</Badge>;
    case 'PENDING':
      return <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>;
    case 'ABSENT':
      return <Badge className="bg-red-100 text-red-700 border-0">Absent</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function sessionBadge(status: string) {
  switch (status) {
    case 'PRESENT':
      return (
        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
          Present
        </Badge>
      );
    case 'LATE':
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          Late
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function AttendancePage() {
  const { data: attendance, mutate } = useSWR<AttendanceRecord[]>('/api/attendance', fetcher);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error('Update failed');
      return;
    }
    toast.success(`Attendance ${status.toLowerCase()}`);
    mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">View and manage daily attendance records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
          <CardDescription>
            {attendance ? `${attendance.length} records` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Work Time</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.first_name} {record.last_name}
                    </TableCell>
                    <TableCell>
                      {record.date ? format(new Date(record.date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>{formatMinutes(record.total_work_minutes)}</TableCell>
                    <TableCell>
                      {record.total_late_minutes > 0 ? (
                        <span className="text-amber-600 font-medium">
                          {record.total_late_minutes}m
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0m</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {record.sessions?.map((s) => (
                          <div key={s.id} className="flex items-center gap-1">
                            {sessionBadge(s.status)}
                            <span className="text-xs text-muted-foreground">{s.shift_name}</span>
                          </div>
                        )) || <span className="text-xs text-muted-foreground">No sessions</span>}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.status === 'PENDING' && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => updateStatus(record.id, 'APPROVED')}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateStatus(record.id, 'ABSENT')}
                            title="Mark Absent"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {record.status !== 'PENDING' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => updateStatus(record.id, 'PENDING')}
                          title="Reset to Pending"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {attendance?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
