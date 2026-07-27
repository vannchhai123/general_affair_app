'use client';

import { format } from 'date-fns';
import { Calendar, Check, Clock, User, Building, FileText, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LeaveRequest } from '@/lib/schemas';

interface LeaveRequestDetailsDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  isUpdating?: boolean;
}

function statusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-0 font-medium px-3 py-1">
          បានអនុម័ត (Approved)
        </Badge>
      );
    case 'Pending':
      return (
        <Badge className="bg-amber-100 text-amber-800 border-0 font-medium px-3 py-1">
          រង់ចាំ (Pending)
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge className="bg-red-100 text-red-800 border-0 font-medium px-3 py-1">
          បានបដិសេធ (Rejected)
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="px-3 py-1">
          {status}
        </Badge>
      );
  }
}

export function LeaveRequestDetailsDialog({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isUpdating = false,
}: LeaveRequestDetailsDialogProps) {
  if (!request) return null;

  const initials =
    `${request.first_name?.[0] || ''}${request.last_name?.[0] || ''}`.toUpperCase() || 'OFF';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 shadow-xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900">
              ព័ត៌មានលម្អិតសំណើ (Request Details)
            </DialogTitle>
            {statusBadge(request.status)}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Officer Info Header */}
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <Avatar className="h-12 w-12 border border-slate-200 shadow-sm">
              <AvatarFallback className="bg-blue-600 font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-base text-slate-950">
                {request.first_name} {request.last_name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                {request.department || 'General Department'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
              <p className="text-xs font-medium text-slate-400">ប្រភេទច្បាប់ (Leave Type)</p>
              <p className="font-semibold text-slate-800">{request.leave_type}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
              <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> ចំនួនថ្ងៃ (Duration)
              </p>
              <p className="font-semibold text-slate-800">
                {request.total_days} ថ្ងៃ ({request.total_days} Days)
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-slate-100 bg-white p-3 space-y-1">
              <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> កាលបរិច្ឆេទ (Leave Period)
              </p>
              <p className="font-semibold text-slate-800">
                {request.start_date ? format(new Date(request.start_date), 'dd MMM yyyy') : '?'} -{' '}
                {request.end_date ? format(new Date(request.end_date), 'dd MMM yyyy') : '?'}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-slate-100 bg-white p-3 space-y-1">
              <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> មូលហេតុ (Reason)
              </p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {request.reason || 'គ្មានព័ត៌មានបន្ថែម (No reason provided)'}
              </p>
            </div>

            {request.approver_name && (
              <div className="col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800">
                <span className="font-medium">អ្នកអនុម័ត (Approver):</span> {request.approver_name}
                {request.approved_at && (
                  <span className="ml-2 text-emerald-600">
                    ({format(new Date(request.approved_at), 'PPP')})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-slate-100 mt-2">
          {request.status === 'Pending' && onApprove && onReject ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => onReject(request.id)}
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" /> បដិសេធ (Reject)
                </Button>
                <Button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onApprove(request.id)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  <Check className="h-4 w-4 mr-1" /> អនុម័ត (Approve)
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-slate-500"
              >
                បិទ (Close)
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 w-full"
            >
              បិទ (Close)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
