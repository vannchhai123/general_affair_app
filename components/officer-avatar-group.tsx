'use client';

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getOfficerImageUrl, getOfficerInitials } from '@/lib/image-utils';
import { useOfficers } from '@/hooks/officers/use-officers';
import type { Invitation, Officer } from '@/lib/schemas';

export function OfficerAvatarGroup({
  officers,
  limit = 3,
  compact = false,
}: {
  officers: Invitation['assigned_officers'];
  limit?: number;
  compact?: boolean;
}) {
  const { officers: allOfficers = [] } = useOfficers({ pageSize: 500 });
  const officersMap = useMemo(
    () => new Map<number, Officer>(allOfficers.map((o: Officer) => [o.id, o])),
    [allOfficers],
  );

  if (!officers || !officers.length) {
    return <span className="text-xs text-muted-foreground">មិនទាន់ចាត់តាំង</span>;
  }

  const visibleOfficers = officers.slice(0, limit);
  const remaining = officers.length - visibleOfficers.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleOfficers.map((officer) => {
          const fullOfficer = officersMap.get(officer.id) || officer;
          const imageUrl = getOfficerImageUrl(fullOfficer) || getOfficerImageUrl(officer);
          const fullName =
            `${officer.first_name_kh || officer.first_name || ''} ${
              officer.last_name_kh || officer.last_name || ''
            }`.trim() || `${officer.first_name} ${officer.last_name}`;

          return (
            <Avatar
              key={officer.id}
              className={cn(
                'border-2 border-background bg-slate-100 text-slate-700 ring-1 ring-slate-200/60 shadow-2xs',
                compact ? 'size-7' : 'size-8',
              )}
            >
              <AvatarImage src={imageUrl} alt={fullName} className="object-cover" />
              <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-700">
                {getOfficerInitials(fullOfficer || officer)}
              </AvatarFallback>
            </Avatar>
          );
        })}
      </div>
      {remaining > 0 ? (
        <span className="ml-2 text-xs font-semibold text-slate-600">+{remaining} នាក់</span>
      ) : null}
    </div>
  );
}
