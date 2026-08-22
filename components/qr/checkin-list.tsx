'use client';

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getOfficerImageUrl, getOfficerInitials } from '@/lib/image-utils';
import { useOfficers } from '@/hooks/officers/use-officers';
import type { Officer } from '@/lib/schemas';

interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
  imageUrl?: string;
  image_url?: string;
  avatar_url?: string;
  officer_id?: number;
  officerId?: number;
}

interface CheckInListProps {
  checkIns: CheckInRecord[];
  isLoading?: boolean;
}

function CheckInStatusBadge({ status }: { status: CheckInRecord['status'] }) {
  switch (status) {
    case 'checked-in':
      return (
        <Badge className="border-0 bg-emerald-100 font-medium text-emerald-800 hover:bg-emerald-200 text-xs">
          បានឆែកចូល
        </Badge>
      );
    case 'checked-out':
      return (
        <Badge className="border-0 bg-blue-100 font-medium text-blue-800 hover:bg-blue-200 text-xs">
          បានឆែកចេញ
        </Badge>
      );
    case 'late':
      return (
        <Badge className="border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-200 text-xs">
          មកយឺត
        </Badge>
      );
  }
}

export function CheckInList({ checkIns, isLoading = false }: CheckInListProps) {
  const { officers = [] } = useOfficers({ pageSize: 500 });

  const { officersByCode, officersById, officersByName } = useMemo(() => {
    const byCode = new Map<string, Officer>();
    const byId = new Map<number, Officer>();
    const byName = new Map<string, Officer>();

    officers.forEach((o: Officer) => {
      if (o.id) byId.set(o.id, o);
      if (o.officerCode) byCode.set(o.officerCode.trim().toLowerCase(), o);

      const enName = `${o.first_name || ''} ${o.last_name || ''}`.trim().toLowerCase();
      const khName = `${o.last_name_kh || ''} ${o.first_name_kh || ''}`.trim().toLowerCase();
      if (enName) byName.set(enName, o);
      if (khName) byName.set(khName, o);
    });

    return { officersByCode: byCode, officersById: byId, officersByName: byName };
  }, [officers]);

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b p-4 shrink-0 bg-slate-50/60">
        <h3 className="font-khmer-moul-light flex items-center gap-2 text-sm font-semibold leading-relaxed text-slate-800">
          <Users className="h-4 w-4 text-slate-500" />
          <span>ការឆែកចូលផ្ទាល់</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
          {checkIns.length} នាក់
        </span>
      </div>
      <ScrollArea className="flex-1 p-4 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : checkIns.length === 0 ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">មិនទាន់មានការស្កេន</p>
            <p className="text-xs text-muted-foreground leading-relaxed">កំពុងរង់ចាំមន្ត្រីស្កេន</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {checkIns.map((checkIn) => {
              const codeKey = (checkIn.employeeCode || '').trim().toLowerCase();
              const nameKey = (checkIn.employeeName || '').trim().toLowerCase();
              const officer =
                (checkIn.officer_id || checkIn.officerId
                  ? officersById.get(checkIn.officer_id || checkIn.officerId!)
                  : null) ||
                (codeKey ? officersByCode.get(codeKey) : null) ||
                (nameKey ? officersByName.get(nameKey) : null);

              const imageUrl = getOfficerImageUrl(officer) || getOfficerImageUrl(checkIn);
              const displayName = officer
                ? `${officer.last_name_kh || officer.last_name || ''} ${
                    officer.first_name_kh || officer.first_name || ''
                  }`.trim() || `${officer.first_name} ${officer.last_name}`
                : checkIn.employeeName;

              return (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 transition-colors hover:bg-slate-50/80 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-200">
                      <AvatarImage src={imageUrl} alt={displayName} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getOfficerInitials(officer || checkIn)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {officer?.officerCode || checkIn.employeeCode || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-xs font-medium text-slate-600">{checkIn.time}</p>
                    <CheckInStatusBadge status={checkIn.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
