'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Calendar, ChevronRight, Mail, MapPin } from 'lucide-react';
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
  const router = useRouter();

  function handleRowClick(invitation: Invitation) {
    router.push(`/dashboard/invitations?id=${invitation.id}`);
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="border-b bg-slate-50/80 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Mail className="h-4 w-4" />
            </div>
            <CardTitle className="page-title text-base font-semibold text-slate-900">
              {labels.title}
            </CardTitle>
          </div>

          <Link
            href="/dashboard/invitations"
            className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
          >
            <span>មើលទាំងអស់</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {invitations.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-muted-foreground bg-white sm:px-4">
            <p className="font-medium text-slate-950">{labels.emptyTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">{labels.emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white px-2 sm:px-3 py-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 border-none hover:bg-slate-50/60">
                  <TableHead className="w-[38%] px-3 sm:px-4 text-xs font-semibold text-slate-700">
                    {labels.subject}
                  </TableHead>
                  <TableHead className="w-[28%] px-3 sm:px-4 text-xs font-semibold text-slate-700">
                    {labels.organization}
                  </TableHead>
                  <TableHead className="w-[20%] px-3 sm:px-4 text-xs font-semibold text-slate-700">
                    {labels.dateTime}
                  </TableHead>
                  <TableHead className="w-[14%] px-3 text-right sm:px-4 text-xs font-semibold text-slate-700">
                    {labels.status}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.slice(0, 5).map((invitation) => (
                  <TableRow
                    key={invitation.id}
                    className="group cursor-pointer hover:bg-blue-50/40 transition-colors rounded-xl border-b border-slate-100 last:border-0"
                    onClick={() => handleRowClick(invitation)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRowClick(invitation);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <TableCell className="align-middle px-3 sm:px-4 py-3">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                        {invitation.subject}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{invitation.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle px-3 sm:px-4 py-3">
                      <div className="text-xs font-medium text-slate-700 line-clamp-1">
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
                    <TableCell className="align-middle px-3 text-xs text-slate-600 sm:px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{formatKhmerNumerals(invitation.date)}</span>
                      </div>
                      {invitation.time && (
                        <div className="ml-5 text-[11px] text-muted-foreground mt-0.5">
                          {formatKhmerNumerals(invitation.time)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-middle px-3 text-right sm:px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <InvitationStatusBadge status={invitation.status} />
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
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
