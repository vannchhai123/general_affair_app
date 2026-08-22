'use client';

import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getOfficerImageUrl } from '@/lib/image-utils';

interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
  imageUrl?: string;
  image_url?: string;
  avatar_url?: string;
}

interface CheckInListProps {
  checkIns: CheckInRecord[];
  isLoading?: boolean;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function CheckInStatusBadge({ status }: { status: CheckInRecord['status'] }) {
  switch (status) {
    case 'checked-in':
      return (
        <Badge className="bg-green-600 text-white font-khmer-moul-light text-[10px]">វត្តមាន</Badge>
      );
    case 'checked-out':
      return (
        <Badge variant="secondary" className="font-khmer-moul-light text-[10px]">
          ចេញ
        </Badge>
      );
    case 'late':
      return (
        <Badge variant="destructive" className="font-khmer-moul-light text-[10px]">
          មកយឺត
        </Badge>
      );
  }
}

export function CheckInList({ checkIns, isLoading = false }: CheckInListProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b p-4 shrink-0">
        <h3 className="font-khmer-moul-light flex items-center gap-2 text-sm font-semibold leading-relaxed">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>ការឆែកចូលផ្ទាល់</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {checkIns.length} នាក់
        </span>
      </div>
      <ScrollArea className="flex-1 p-4 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
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
            {checkIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage
                      src={getOfficerImageUrl(checkIn)}
                      alt={checkIn.employeeName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(
                        checkIn.employeeName.split(' ')[0],
                        checkIn.employeeName.split(' ')[1] || '',
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium leading-relaxed">{checkIn.employeeName}</p>
                    <p className="text-[11px] text-muted-foreground">{checkIn.employeeCode}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xs font-medium">{checkIn.time}</p>
                  <CheckInStatusBadge status={checkIn.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
