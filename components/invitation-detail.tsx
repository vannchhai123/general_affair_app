'use client';

import { format } from 'date-fns';
import { Building2, CalendarDays, Clock3, FileText, MapPin, UserRoundCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardNumber } from '@/components/ui/card-number';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { InvitationStatusBadge } from '@/components/invitation-status-badge';
import { OfficerAvatarGroup } from '@/components/officer-avatar-group';
import type { Invitation } from '@/lib/schemas';

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
      <div className="rounded-lg bg-background p-2 shadow-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <CardNumber value={value} className="mt-1 block text-sm font-medium text-foreground" />
      </div>
    </div>
  );
}

export function InvitationDetail({
  invitation,
  open,
  onOpenChange,
  onEdit,
  onChangeStatus,
}: {
  invitation: Invitation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (invitation: Invitation) => void;
  onChangeStatus: (invitation: Invitation) => void;
}) {
  if (!invitation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="h-dvh w-full gap-0 overflow-hidden sm:max-w-xl">
          <SheetHeader className="shrink-0 border-b pb-5">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div>
                <SheetTitle className="text-xl font-semibold font-khmer-moul-light text-slate-900">
                  {invitation.subject}
                </SheetTitle>
                <SheetDescription className="mt-1">
                  លិខិតអញ្ជើញលេខ #{invitation.id} របស់ {invitation.organization}
                </SheetDescription>
              </div>
              <InvitationStatusBadge status={invitation.status} />
            </div>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Building2}
                label="អង្គភាព / ស្ថាប័ន"
                value={invitation.organization}
              />
              <DetailItem
                icon={CalendarDays}
                label="កាលបរិច្ឆេទ"
                value={format(new Date(invitation.date), 'dd/MM/yyyy')}
              />
              <DetailItem icon={Clock3} label="ម៉ោង" value={invitation.time || 'មិនទាន់កំណត់'} />
              <DetailItem icon={MapPin} label="ទីតាំង" value={invitation.location} />
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-khmer-moul-light text-slate-800 text-xs">
                    បញ្ជីមន្ត្រីចាត់តាំង
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    មានមន្ត្រីចំនួន {invitation.assigned_officers.length} រូប ទទួលបន្ទុកលិខិតនេះ
                  </p>
                </div>
                <OfficerAvatarGroup officers={invitation.assigned_officers} />
              </div>

              {invitation.assigned_officers.length > 0 ? (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    {invitation.assigned_officers.map((officer) => {
                      const fullNameKh =
                        `${officer.first_name_kh || ''} ${officer.last_name_kh || ''}`.trim();
                      const fullNameEn = `${officer.first_name} ${officer.last_name}`.trim();
                      const displayName = fullNameKh ? `${fullNameKh} (${fullNameEn})` : fullNameEn;

                      return (
                        <div
                          key={officer.id}
                          className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium">{displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {officer.position} · {officer.department}
                            </p>
                          </div>
                          <UserRoundCog className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            <div className="rounded-xl border p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold font-khmer-moul-light text-slate-800 text-xs">
                <FileText className="h-4 w-4 text-muted-foreground" />
                ខ្លឹមសារ / ពិពណ៌នាបន្ថែម
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {invitation.description || 'គ្មានការពិពណ៌នាលម្អិតសម្រាប់លិខិតអញ្ជើញនេះឡើយ។'}
              </p>
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t bg-background/95 px-4 py-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onChangeStatus(invitation)}
              >
                ប្តូរស្ថានភាព
              </Button>
              <Button className="flex-1" onClick={() => onEdit(invitation)}>
                កែសម្រួលលិខិត
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
