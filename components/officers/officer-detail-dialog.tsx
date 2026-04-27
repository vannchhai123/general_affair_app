'use client';

import type { ElementType } from 'react';
import { BriefcaseBusiness, Camera, Hash, Mail, Phone, UserRound, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardNumber } from '@/components/ui/card-number';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Officer } from '@/lib/schemas';

interface OfficerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer: Officer | null;
  onUploadImage?: (officer: Officer) => void;
}

function getStatusLabel(status: string) {
  switch (status) {
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
  switch (status) {
    case 'active':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'on_leave':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'inactive':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
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
    <div className={`rounded-lg border bg-white p-3 ${className ?? ''}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <CardNumber value={value || '-'} className="mt-2 block break-words text-sm font-medium" />
    </div>
  );
}

export function OfficerDetailDialog({
  open,
  onOpenChange,
  officer,
  onUploadImage,
}: OfficerDetailDialogProps) {
  if (!officer) return null;

  const fullName = `${officer.first_name} ${officer.last_name}`.trim();
  const imageUrl = getOfficerImageUrl(officer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] flex-col overflow-hidden sm:max-w-[760px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>ព័ត៌មានលម្អិតមន្ត្រី</DialogTitle>
          <DialogDescription>
            ពិនិត្យព័ត៌មានផ្ទាល់ខ្លួន តួនាទី និងរូបភាពប្រវត្តិរូប។
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <div className="overflow-hidden rounded-lg border bg-slate-50">
            <div className="bg-gradient-to-r from-emerald-50 via-cyan-50 to-sky-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-fit">
                  <Avatar className="h-28 w-28 rounded-lg border-4 border-white bg-white shadow-sm">
                    <AvatarImage
                      src={imageUrl}
                      alt={fullName || 'Officer'}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-md bg-emerald-100 text-3xl font-semibold text-emerald-800">
                      {getOfficerInitials(officer)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 rounded-full border bg-white p-2 shadow-sm">
                    <UserRound className="h-4 w-4 text-slate-600" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-xl font-semibold">{fullName || '-'}</h3>
                      <Badge className={`border ${getStatusStyle(officer.status)}`}>
                        {getStatusLabel(officer.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{officer.position || '-'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md border bg-white px-2 py-1">
                      {officer.officerCode || 'គ្មានកូដ'}
                    </span>
                    <span className="rounded-md border bg-white px-2 py-1">
                      {officer.department || 'គ្មាននាយកដ្ឋាន'}
                    </span>
                    <span className="rounded-md border bg-white px-2 py-1">
                      {getSexLabel(officer.sex)}
                    </span>
                  </div>
                </div>

                {onUploadImage ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white sm:w-auto"
                    onClick={() => onUploadImage(officer)}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    ប្តូររូបភាព
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">ស្ថានភាព</p>
                <p className="mt-1 text-sm font-medium">{getStatusLabel(officer.status)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">នាយកដ្ឋាន</p>
                <p className="mt-1 text-sm font-medium">{officer.department || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ឈ្មោះអ្នកប្រើ</p>
                <p className="mt-1 text-sm font-medium">{officer.username || '-'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm font-medium">រូបភាពប្រវត្តិរូប</p>
              <p className="mt-1 text-xs text-muted-foreground">
                បង្ហាញសម្រាប់សម្គាល់មន្ត្រីនៅក្នុងប្រព័ន្ធ។
              </p>
              <Separator className="my-4" />
              <div className="overflow-hidden rounded-lg border bg-slate-50">
                <Avatar className="h-56 w-full rounded-none">
                  <AvatarImage
                    src={imageUrl}
                    alt={fullName || 'Officer'}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-none bg-slate-100 text-4xl font-semibold text-slate-700">
                    {getOfficerInitials(officer)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={Hash} label="កូដមន្ត្រី" value={officer.officerCode} />
              <DetailItem icon={UserRound} label="នាមខ្លួន" value={officer.first_name} />
              <DetailItem icon={UserRound} label="នាមត្រកូល" value={officer.last_name} />
              <DetailItem icon={Users} label="ភេទ" value={getSexLabel(officer.sex)} />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
