'use client';

import { Check, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type SummaryMetric = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: string;
};

type RecentRequestsCardProps = {
  title: string;
  pendingLabel: string;
  typeLabel: string;
  dateLabel: string;
  actionsLabel: string;
  approveLabel: string;
  rejectLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  summaryMetrics: SummaryMetric[];
};

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

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function RecentRequestsCard({
  title,
  pendingLabel,
  typeLabel,
  dateLabel,
  actionsLabel,
  approveLabel,
  rejectLabel,
  emptyTitle,
  emptyDescription,
  summaryMetrics,
}: RecentRequestsCardProps) {
  const { data } = useLeaveRequests();
  const updateLeaveRequest = useUpdateLeaveRequest();
  const leaves: LeaveRequest[] = data ?? [];

  const pendingLeaves = leaves.filter((leave) => leave.status === 'Pending').slice(0, 5);

  async function updateStatus(id: number, status: string) {
    await updateLeaveRequest.mutateAsync({ id, data: { status } });
  }

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/80 px-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="page-title text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {summaryMetrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-slate-50 p-3">
              <metric.icon className={`h-4 w-4 ${metric.tone}`} />
              <div className="mt-2 text-xl font-semibold text-slate-950">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
        {pendingLeaves.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-sm text-muted-foreground">
            <p className="font-medium text-slate-950">{emptyTitle}</p>
            <p>{emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>{title}</TableHead>
                  <TableHead>{typeLabel}</TableHead>
                  <TableHead>{dateLabel}</TableHead>
                  <TableHead>{actionsLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((leave: LeaveRequest) => (
                  <TableRow key={leave.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                            {leave.first_name.charAt(0)}
                            {leave.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-950">
                            {leave.first_name} {leave.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{leave.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{leave.leave_type}</TableCell>
                    <TableCell>{formatShortDate(leave.start_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusBadge(leave.status)}
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => void updateStatus(leave.id, 'Approved')}
                              title={approveLabel}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => void updateStatus(leave.id, 'Rejected')}
                              title={rejectLabel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
