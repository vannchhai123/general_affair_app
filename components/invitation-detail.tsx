'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Image as ImageIcon,
  MapPin,
  UserRoundCog,
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InvitationStatusBadge } from '@/components/invitation-status-badge';
import { OfficerAvatarGroup } from '@/components/officer-avatar-group';
import { getOfficerImageUrl, getOfficerInitials, resolveImageUrl } from '@/lib/image-utils';
import { useOfficers } from '@/hooks/officers/use-officers';
import { cn } from '@/lib/utils';
import type { Invitation, Officer } from '@/lib/schemas';

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-slate-200/80 bg-muted/20 p-3.5 min-w-0',
        className,
      )}
    >
      <div className="rounded-lg bg-background p-2 shadow-sm shrink-0 mt-0.5 border border-slate-200/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p
          className="mt-1 text-sm font-medium text-foreground break-words leading-relaxed"
          title={value}
        >
          {value}
        </p>
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
  const { officers = [] } = useOfficers({ pageSize: 500 });
  const officersMap = useMemo(
    () => new Map<number, Officer>(officers.map((o: Officer) => [o.id, o])),
    [officers],
  );

  if (!invitation) {
    return null;
  }

  const typeTitle =
    invitation.category === 'internal'
      ? 'លិខិតអញ្ជើញគណៈអភិបាល'
      : invitation.category === 'external'
        ? 'លិខិតអញ្ជើញផ្ទៃក្នុង'
        : invitation.type === 'outgoing'
          ? 'លិខិតអញ្ជើញផ្ទៃក្នុង'
          : 'លិខិតអញ្ជើញគណៈអភិបាល';

  return (
    <div className="space-y-6">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="h-dvh w-full gap-0 overflow-hidden sm:max-w-xl flex flex-col">
          <SheetHeader className="shrink-0 border-b pb-4 px-5">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {typeTitle}
                </SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium font-mono">
                    INV-{String(invitation.id).padStart(3, '0')}
                  </span>
                  {invitation.type && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200/60">
                      {invitation.type === 'outgoing' ? '📤 លិខិតចេញ' : '📥 លិខិតចូល'}
                    </span>
                  )}
                </SheetDescription>
              </div>
              <InvitationStatusBadge status={invitation.status} />
            </div>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {/* Subject Card (កម្មវត្ថុ) */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                កម្មវត្ថុ
              </p>
              <p className="text-sm font-medium text-slate-900 leading-relaxed break-words">
                {invitation.subject}
              </p>
            </div>

            {/* Metadata Info Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Presided By / Organization - Full Width to handle long titles */}
              <DetailItem
                icon={Building2}
                label="ក្រោមអធិបតីភាព"
                value={invitation.organization}
                className="sm:col-span-2"
              />

              {/* Date & Time */}
              <DetailItem
                icon={CalendarDays}
                label="កាលបរិច្ឆេទ"
                value={format(new Date(invitation.date), 'dd/MM/yyyy')}
              />
              <DetailItem icon={Clock3} label="ម៉ោង" value={invitation.time || 'មិនទាន់កំណត់'} />

              {/* Location - Full Width */}
              <DetailItem
                icon={MapPin}
                label="ទីតាំង"
                value={invitation.location}
                className="sm:col-span-2"
              />
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
                      const fullOfficer = officersMap.get(officer.id) || officer;
                      const imageUrl =
                        getOfficerImageUrl(fullOfficer) || getOfficerImageUrl(officer);
                      const initials = getOfficerInitials(fullOfficer || officer);

                      const fullNameKh =
                        `${fullOfficer.last_name_kh || officer.last_name_kh || ''} ${
                          fullOfficer.first_name_kh || officer.first_name_kh || ''
                        }`.trim();
                      const fullNameEn = `${fullOfficer.first_name || officer.first_name || ''} ${
                        fullOfficer.last_name || officer.last_name || ''
                      }`.trim();
                      const displayName = fullNameKh ? `${fullNameKh} (${fullNameEn})` : fullNameEn;

                      return (
                        <div
                          key={officer.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 px-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-slate-200">
                              <AvatarImage
                                src={imageUrl}
                                alt={displayName}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{displayName}</p>
                              <p className="text-xs text-muted-foreground">
                                {fullOfficer.position || officer.position} ·{' '}
                                {fullOfficer.department || officer.department}
                              </p>
                            </div>
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

            {invitation.imageUrls && invitation.imageUrls.length > 0 && (
              <div className="rounded-xl border p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold font-khmer-moul-light text-slate-800 text-xs">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  រូបភាពលិខិតអញ្ជើញ ({invitation.imageUrls.length})
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {invitation.imageUrls.map((rawUrl, index) => {
                    const resolvedUrl = resolveImageUrl(rawUrl) || rawUrl;
                    return (
                      <a
                        key={rawUrl + index}
                        href={resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-lg border overflow-hidden bg-slate-50 flex justify-center items-center p-2 h-[180px] hover:border-primary transition"
                      >
                        <img
                          src={resolvedUrl}
                          alt={`Invitation Document ${index + 1}`}
                          className="h-full object-contain rounded group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
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
