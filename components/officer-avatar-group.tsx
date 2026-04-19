'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Invitation } from '@/lib/schemas';

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function OfficerAvatarGroup({
  officers,
  limit = 3,
  compact = false,
}: {
  officers: Invitation['assigned_officers'];
  limit?: number;
  compact?: boolean;
}) {
  if (!officers.length) {
    return <span className="text-sm text-muted-foreground">Unassigned</span>;
  }

  const visibleOfficers = officers.slice(0, limit);
  const remaining = officers.length - visibleOfficers.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleOfficers.map((officer) => (
          <Avatar
            key={officer.id}
            className={cn(
              'border-2 border-background bg-slate-100 text-slate-700',
              compact ? 'size-8' : 'size-9',
            )}
          >
            <AvatarFallback className="bg-slate-100 text-[11px] font-semibold text-slate-700">
              {getInitials(officer.first_name, officer.last_name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remaining > 0 ? (
        <span className="ml-3 text-xs font-medium text-muted-foreground">+{remaining} more</span>
      ) : null}
    </div>
  );
}
