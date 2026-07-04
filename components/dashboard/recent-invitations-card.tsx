'use client';

import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InvitationStatusBadge } from '@/components/invitation-status-badge';
import { OfficerAvatarGroup } from '@/components/officer-avatar-group';
import type { Invitation } from '@/lib/schemas';
import { formatKhmerNumerals } from '@/lib/dashboard/utils';

type RecentInvitationsLabels = {
  title: string;
  subject: string;
  organization: string;
  dateTime: string;
  status: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function RecentInvitationsCard({
  invitations,
  labels,
}: {
  invitations: Invitation[];
  labels: RecentInvitationsLabels;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/80 px-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="page-title text-base">{labels.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {invitations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground bg-white">
            <p className="font-medium text-slate-950">{labels.emptyTitle}</p>
            <p>{labels.emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[40%]">{labels.subject}</TableHead>
                  <TableHead className="w-[30%]">{labels.organization}</TableHead>
                  <TableHead className="w-[20%]">{labels.dateTime}</TableHead>
                  <TableHead className="w-[10%] text-right">{labels.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.slice(0, 5).map((invitation) => (
                  <TableRow key={invitation.id} className="hover:bg-slate-50/70">
                    <TableCell className="align-middle">
                      <div className="font-medium text-slate-950 line-clamp-1">
                        {invitation.subject}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{invitation.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="text-sm font-medium text-slate-700 line-clamp-1">
                        {invitation.organization}
                      </div>
                      <div className="mt-1">
                        <OfficerAvatarGroup
                          officers={invitation.assigned_officers}
                          limit={2}
                          compact
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{formatKhmerNumerals(invitation.date)}</span>
                      </div>
                      {invitation.time && (
                        <div className="ml-5 text-xs text-muted-foreground">
                          {formatKhmerNumerals(invitation.time)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <InvitationStatusBadge status={invitation.status} />
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
