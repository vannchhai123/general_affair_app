'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Shift } from '@/lib/schemas';
import { DAY_LABELS, DAY_LABELS_KM } from '@/lib/shifts/utils';

interface ShiftCalendarViewProps {
  shifts: Shift[];
  onSelectShift: (shift: Shift) => void;
  onQuickAdd: () => void;
}

const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export function ShiftCalendarView({ shifts, onSelectShift, onQuickAdd }: ShiftCalendarViewProps) {
  const [view, setView] = useState<'week' | 'month'>('week');

  const grouped = useMemo(() => {
    const slots = WEEK_DAYS.reduce<Record<(typeof WEEK_DAYS)[number], Shift[]>>(
      (accumulator, day) => ({ ...accumulator, [day]: [] }),
      { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    );

    shifts.forEach((shift, index) => {
      const bucket = WEEK_DAYS[index % WEEK_DAYS.length];
      slots[bucket] = [...slots[bucket], shift];
    });

    return slots;
  }, [shifts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(value) => setView(value as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">សប្ដាហ៍</TabsTrigger>
            <TabsTrigger value="month">ខែ</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={onQuickAdd} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          បន្ថែមរហ័ស
        </Button>
      </div>

      {view === 'week' ? (
        <div className="grid gap-4 lg:grid-cols-7">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="rounded-3xl border bg-white">
              <div className="border-b bg-slate-50/80 px-4 py-3">
                <p className="text-sm font-semibold">{DAY_LABELS[day]}</p>
                <p className="text-xs text-muted-foreground">{DAY_LABELS_KM[day]}</p>
              </div>
              <div className="space-y-3 p-4">
                {grouped[day].length === 0 ? (
                  <button
                    type="button"
                    onClick={onQuickAdd}
                    className="flex h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground"
                  >
                    <CalendarDays className="mb-2 h-4 w-4" />
                    បន្ថែមវេនរហ័ស
                  </button>
                ) : (
                  grouped[day].map((shift) => (
                    <button
                      key={`${day}-${shift.id}`}
                      type="button"
                      onClick={() => onSelectShift(shift)}
                      className="w-full rounded-2xl border px-3 py-3 text-left transition hover:border-slate-400 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{shift.name}</p>
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
                      <p className="mt-2 text-sm text-muted-foreground">
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => {
            const monthShifts = shifts.filter((_, shiftIndex) => shiftIndex % 4 === index % 4);

            return (
              <div key={index} className="rounded-3xl border bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">
                    {new Date(2026, index, 1).toLocaleString('km-KH', { month: 'long' })}
                  </p>
                  <Button size="sm" variant="ghost" onClick={onQuickAdd}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  {monthShifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">មិនទាន់មានវេនដែលបានកំណត់ទេ។</p>
                  ) : (
                    monthShifts.map((shift) => (
                      <button
                        type="button"
                        key={`${index}-${shift.id}`}
                        onClick={() => onSelectShift(shift)}
                        className="w-full rounded-2xl border bg-slate-50/80 px-3 py-2 text-left"
                      >
                        <p className="text-sm font-medium">{shift.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {shift.startTime} - {shift.endTime}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: 'active' | 'inactive') {
  return status === 'active' ? 'សកម្ម' : 'មិនសកម្ម';
}
