'use client';

import { format } from 'date-fns';
import { Check, X, Calendar, Clock } from 'lucide-react';
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
import { useLeaveRequests } from '@/hooks/leave-requests/use-leave-requests';
import { useUpdateLeaveRequest } from '@/hooks/leave-requests/use-leave-request-mutations';
import type { LeaveRequest } from '@/lib/schemas';

function statusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Approved</Badge>;
    case 'Pending':
      return <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>;
    case 'Rejected':
      return <Badge className="bg-red-100 text-red-700 border-0">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case 'Annual Leave':
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-600">
          Annual
        </Badge>
      );
    case 'Sick Leave':
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-600">
          Sick
        </Badge>
      );
    case 'Personal Leave':
      return (
        <Badge variant="outline" className="border-indigo-300 text-indigo-600">
          Personal
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export default function LeaveRequestsPage() {
  const { data: leaves = [] } = useLeaveRequests();
  const updateLeaveRequest = useUpdateLeaveRequest();

  async function updateStatus(id: number, status: string) {
    await updateLeaveRequest.mutateAsync({
      id,
      data: { status },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-muted-foreground">Review and approve officer leave requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Leave Requests</CardTitle>
          <CardDescription>{`${leaves.length} requests`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave: LeaveRequest) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {leave.first_name} {leave.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{leave.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>{typeBadge(leave.leave_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {leave.start_date
                          ? format(new Date(leave.start_date), 'MMM d')
                          : '?'} -{' '}
                        {leave.end_date ? format(new Date(leave.end_date), 'MMM d') : '?'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {leave.total_days}d
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>{statusBadge(leave.status)}</TableCell>
                    <TableCell>
                      {leave.status === 'Pending' ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => updateStatus(leave.id, 'Approved')}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateStatus(leave.id, 'Rejected')}
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {leave.approver_name ? `By ${leave.approver_name}` : '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {leaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No leave requests found
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
