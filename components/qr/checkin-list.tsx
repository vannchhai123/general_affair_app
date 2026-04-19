'use client';

import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface CheckInRecord {
  id: number;
  employeeName: string;
  employeeCode: string;
  time: string;
  status: 'checked-in' | 'checked-out' | 'late';
}

interface CheckInListProps {
  checkIns: CheckInRecord[];
  isLoading?: boolean;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function CheckInStatusBadge({ status }: { status: CheckInRecord['status'] }) {
  const config = {
    'checked-in': { label: 'Checked-in', color: 'bg-emerald-100 text-emerald-700' },
    'checked-out': { label: 'Checked-out', color: 'bg-blue-100 text-blue-700' },
    late: { label: 'Late', color: 'bg-amber-100 text-amber-700' },
  };

  const { label, color } = config[status];

  return <Badge className={`px-2 py-0.5 ${color} border-0 text-xs`}>{label}</Badge>;
}

export function CheckInList({ checkIns, isLoading = false }: CheckInListProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          Live Check-ins
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Real-time attendance scans</p>
      </div>
      <ScrollArea className="h-[400px] p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No scans yet</p>
            <p className="text-xs text-muted-foreground">Waiting for employees to scan</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {checkIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(
                        checkIn.employeeName.split(' ')[0],
                        checkIn.employeeName.split(' ')[1] || '',
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{checkIn.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{checkIn.employeeCode}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-medium">{checkIn.time}</p>
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
