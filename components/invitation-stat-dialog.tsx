'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  CalendarRange,
  CircleCheckBig,
  CircleDashed,
  CircleX,
  Search,
  X,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OfficerAvatarGroup } from '@/components/officer-avatar-group';
import type { Invitation } from '@/lib/schemas';

interface InvitationStatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitations: Invitation[];
  initialStatusFilter?: string;
  onViewInvitation?: (invitation: Invitation) => void;
}

export function InvitationStatDialog({
  open,
  onOpenChange,
  invitations = [],
  initialStatusFilter = 'all',
  onViewInvitation,
}: InvitationStatDialogProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  useEffect(() => {
    if (open) {
      setStatusFilter(initialStatusFilter || 'all');
      setSearch('');
    }
  }, [open, initialStatusFilter]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch('');
      setStatusFilter(initialStatusFilter || 'all');
    }
    onOpenChange(isOpen);
  };

  const total = invitations.length;
  const pendingCount = useMemo(
    () => invitations.filter((inv) => inv.status === 'pending').length,
    [invitations],
  );
  const acceptedCount = useMemo(
    () => invitations.filter((inv) => inv.status === 'accepted').length,
    [invitations],
  );
  const rejectedCount = useMemo(
    () => invitations.filter((inv) => inv.status === 'rejected').length,
    [invitations],
  );

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invitations.filter((invitation) => {
      const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;

      if (!matchesStatus) return false;
      if (!query) return true;

      const officerMatch = (invitation.assigned_officers || []).some((officer) =>
        `${officer.first_name || ''} ${officer.last_name || ''}`.toLowerCase().includes(query),
      );

      const textMatch =
        (invitation.subject || '').toLowerCase().includes(query) ||
        (invitation.organization || '').toLowerCase().includes(query) ||
        (invitation.location || '').toLowerCase().includes(query) ||
        officerMatch;

      return textMatch;
    });
  }, [invitations, search, statusFilter]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                <CalendarRange className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 font-khmer-moul-light">
                    បញ្ជីលិខិតអញ្ជើញ
                  </DialogTitle>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {filteredInvitations.length} លិខិត
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {`${pendingCount} កំពុងរង់ចាំ · ${acceptedCount} បានទទួលយក · ${rejectedCount} បានបដិសេធ`}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ទាំងអស់ ({total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                កំពុងរង់ចាំ ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('accepted')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'accepted'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                បានទទួលយក ({acceptedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                បានបដិសេធ ({rejectedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ស្វែងរកកម្មវត្ថុ ឬស្ថាប័ន..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 rounded-xl border-slate-200 bg-slate-50/50 pl-8.5 text-xs focus-visible:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List Content */}
        <ScrollArea className="max-h-[65vh] min-h-[300px] overflow-y-auto">
          <div className="divide-y divide-slate-100 p-2 sm:p-4">
            {filteredInvitations.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 font-medium">
                មិនមានទិន្នន័យលិខិតអញ្ជើញស្របតាមការស្វែងរកទេ
              </div>
            ) : (
              filteredInvitations.map((invitation) => {
                const isPending = invitation.status === 'pending';
                const isAccepted = invitation.status === 'accepted';
                const isRejected = invitation.status === 'rejected';

                return (
                  <div
                    key={invitation.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {invitation.subject}
                        </span>
                        {invitation.type && (
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                              invitation.type === 'incoming'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}
                          >
                            {invitation.type === 'incoming' ? 'ចូល' : 'ចេញ'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        {invitation.organization && (
                          <div className="flex items-center gap-1 text-slate-600 font-medium">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{invitation.organization}</span>
                          </div>
                        )}
                        {invitation.date && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{format(new Date(invitation.date), 'dd/MM/yyyy')}</span>
                            {invitation.time && <span>• {invitation.time}</span>}
                          </div>
                        )}
                        {invitation.location && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate max-w-[180px]">{invitation.location}</span>
                          </div>
                        )}
                      </div>

                      {invitation.assigned_officers && invitation.assigned_officers.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[11px] text-slate-400">មន្ត្រីចាត់តាំង៖</span>
                          <OfficerAvatarGroup officers={invitation.assigned_officers} limit={4} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-0 sm:pl-3">
                      {isAccepted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          បានទទួលយក
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          កំពុងរង់ចាំ
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          បានបដិសេធ
                        </span>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {invitation.status}
                        </Badge>
                      )}

                      {onViewInvitation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-2 rounded-lg"
                          onClick={() => {
                            onOpenChange(false);
                            onViewInvitation(invitation);
                          }}
                        >
                          មើលលម្អិត
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
