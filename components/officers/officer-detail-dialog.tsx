'use client';

import type { ElementType } from 'react';
import { BriefcaseBusiness, Hash, Mail, Phone, UserRound, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { normalizeOfficerStatus } from '@/lib/officers/page-utils';
import type { Officer } from '@/lib/schemas';

interface OfficerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer: Officer | null;
  onUploadImage?: (officer: Officer) => void;
}

function getStatusLabel(status: string) {
  switch (normalizeOfficerStatus(status)) {
    case 'active':
      return 'សកម្ម';
    case 'on_leave':
      return 'ច្បាប់ឈប់សម្រាក';
    case 'inactive':
      return 'មិនសកម្ម';
    default:
      return status || '-';
  }
}

function getStatusStyle(status: string) {
  switch (normalizeOfficerStatus(status)) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'on_leave':
      return 'bg-amber-100 text-amber-700';
    case 'inactive':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function getSexLabel(sex?: string) {
  switch (sex) {
    case 'male':
      return 'ប្រុស';
    case 'female':
      return 'ស្រី';
    default:
      return '-';
  }
}

function getOfficerImageUrl(officer: Officer) {
  return (
    officer.image_url ||
    officer.imageUrl ||
    officer.avatar_url ||
    officer.profileImage ||
    officer.profile_image ||
    officer.photoUrl ||
    officer.photo_url ||
    undefined
  );
}

function getOfficerInitials(officer: Officer) {
  const initials = [officer.first_name, officer.last_name]
    .filter(Boolean)
    .map((name) => name[0])
    .join('');

  return initials || 'ម';
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: ElementType;
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-slate-50/70 p-4 ${className ?? ''}`}>
      <div className="font-khmer-moul-light flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <span className="mt-2 block break-words text-sm font-medium text-foreground">
        {value || '-'}
      </span>
    </div>
  );
}

export function OfficerDetailDialog({ open, onOpenChange, officer }: OfficerDetailDialogProps) {
  if (!officer) return null;

  const fullName = `${officer.first_name} ${officer.last_name}`.trim();
  const imageUrl = getOfficerImageUrl(officer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[100dvh] flex-col overflow-hidden p-5 sm:max-w-[580px]">
        <DialogHeader className="page-title shrink-0">
          <DialogTitle className="font-khmer-moul-light">ព័ត៌មានលម្អិតមន្រ្តី</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <div className="rounded-3xl border bg-slate-50/60 p-4">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <Avatar className="h-20 w-20 rounded-3xl border bg-white shadow-sm">
                <AvatarImage src={imageUrl} alt={fullName || 'Officer'} className="object-cover" />
                <AvatarFallback className="rounded-3xl bg-slate-100 text-xl font-semibold text-slate-700">
                  {getOfficerInitials(officer)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-foreground">{fullName || '-'}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {officer.position || 'មិនទាន់កំណត់តួនាទី'}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge className={getStatusStyle(officer.status)}>
                    {getStatusLabel(officer.status)}
                  </Badge>
                  <Badge variant="outline">{officer.department || 'មិនទាន់កំណត់នាយកដ្ឋាន'}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <DetailItem icon={Hash} label="កូដមន្រ្តី" value={officer.officerCode} />
            <DetailItem icon={Users} label="ភេទ" value={getSexLabel(officer.sex)} />
            <DetailItem icon={UserRound} label="នាមខ្លួន" value={officer.first_name} />
            <DetailItem icon={UserRound} label="នាមត្រកូល" value={officer.last_name} />
            <DetailItem icon={BriefcaseBusiness} label="តួនាទី" value={officer.position} />
            <DetailItem icon={BriefcaseBusiness} label="នាយកដ្ឋាន" value={officer.department} />
            <DetailItem
              icon={Mail}
              label="អ៊ីមែល"
              value={officer.email}
              className="sm:col-span-2"
            />
            <DetailItem
              icon={Phone}
              label="ទូរស័ព្ទ"
              value={officer.phone}
              className="sm:col-span-2"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
