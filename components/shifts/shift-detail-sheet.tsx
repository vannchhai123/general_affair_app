'use client';

import type { ComponentType } from 'react';
import { CalendarClock, Clock3, History, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Shift, ShiftAuditEvent } from '@/lib/schemas';
import {
  formatMinutesAsDuration,
  getCheckInWindowLabel,
  getCheckOutWindowLabel,
  getLateAfterTime,
  computeShiftDurationMinutes,
} from '@/lib/shifts/utils';

interface ShiftDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  audit: ShiftAuditEvent[];
}

export function ShiftDetailSheet({ open, onOpenChange, shift, audit }: ShiftDetailSheetProps) {
  const isMobile = useIsMobile();

  if (!shift) return null;

  const content = (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
      <div className="space-y-5">
        <div className="rounded-3xl border bg-slate-950 p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-white/70">{shift.code}</p>
              <h3 className="mt-1 text-2xl font-semibold">{shift.name}</h3>
              <p className="mt-2 text-sm text-white/75">
                {shift.startTime} - {shift.endTime}
              </p>
            </div>
            <Badge
              className={
                shift.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }
            >
              {getStatusLabel(shift.status)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetaCard
            icon={Clock3}
            label="រយៈពេលវេន"
            value={formatMinutesAsDuration(
              computeShiftDurationMinutes(shift.startTime, shift.endTime, shift.crossMidnight),
            )}
          />
          <MetaCard
            icon={CalendarClock}
            label="រយៈពេលមានប្រសិទ្ធភាព"
            value={`${shift.effectiveFrom} ${shift.effectiveTo ? `ដល់ ${shift.effectiveTo}` : 'តទៅ'}`}
          />
          <MetaCard
            icon={Users}
            label="ក្រុមដែលបានកំណត់"
            value={`${shift.assignedDepartmentsCount} ផ្នែក • ${shift.assignedPositionsCount} តួនាទី`}
          />
          <MetaCard
            icon={Users}
            label="បុគ្គលិកដែលបានកំណត់"
            value={`${shift.assignedEmployeesCount} នាក់`}
          />
        </div>

        <div className="rounded-2xl border p-5">
          <h4 className="text-sm font-semibold">មើលច្បាប់វត្តមានជាមុន</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PreviewCard label="ពេលវេលាឆែកចូលដែលរំពឹង" value={getCheckInWindowLabel(shift)} />
            <PreviewCard label="កម្រិតចាត់ទុកថាយឺត" value={getLateAfterTime(shift)} />
            <PreviewCard label="ពេលវេលាឆែកចេញ" value={getCheckOutWindowLabel(shift)} />
            <PreviewCard
              label="លក្ខណៈវេនឆ្លងថ្ងៃ"
              value={shift.crossMidnight ? 'បិទនៅថ្ងៃបន្ទាប់' : 'បិទនៅថ្ងៃដដែល'}
            />
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">ប្រវត្តិកំណត់ត្រា</h4>
          </div>
          <div className="mt-4 space-y-3">
            {audit.length === 0 ? (
              <p className="text-sm text-muted-foreground">មិនទាន់មានប្រវត្តិកំណត់ត្រានៅឡើយទេ។</p>
            ) : (
              audit.map((event) => (
                <div key={event.id} className="rounded-2xl border bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{getAuditActionLabel(event.action)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('km-KH')}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">ដោយ {event.actorName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[96dvh] max-h-[96dvh] overflow-hidden">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>{shift.name}</DrawerTitle>
            <DrawerDescription>ព័ត៌មានវេន ការកំណត់ប្រគល់ និងច្បាប់វត្តមាន</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="h-dvh w-full overflow-hidden sm:max-w-xl">
        <SheetHeader className="shrink-0">
          <SheetTitle>{shift.name}</SheetTitle>
          <SheetDescription>ព័ត៌មានវេន ការកំណត់ប្រគល់ និងច្បាប់វត្តមាន</SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}

function getStatusLabel(status: 'active' | 'inactive') {
  return status === 'active' ? 'សកម្ម' : 'មិនសកម្ម';
}

function getAuditActionLabel(action: ShiftAuditEvent['action']) {
  switch (action) {
    case 'created':
      return 'បានបង្កើត';
    case 'updated':
      return 'បានកែប្រែ';
    case 'activated':
      return 'បានបើកប្រើ';
    case 'deactivated':
      return 'បានបិទប្រើ';
    default:
      return action;
  }
}

function MetaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
