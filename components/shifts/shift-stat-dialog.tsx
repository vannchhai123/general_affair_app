'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Workflow,
  Search,
  X,
  Clock,
  Sparkles,
  Power,
  Calendar,
  TimerReset,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  computeShiftDurationMinutes,
  formatMinutesAsDuration,
  getLateAfterTime,
} from '@/lib/shifts/utils';
import type { Shift } from '@/lib/schemas/shift/shift.schema';

interface ShiftStatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shifts: Shift[];
  initialStatusFilter?: string;
  onViewShift?: (shift: Shift) => void;
}

export function ShiftStatDialog({
  open,
  onOpenChange,
  shifts = [],
  initialStatusFilter = 'all',
  onViewShift,
}: ShiftStatDialogProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  useEffect(() => {
    if (open) {
      setStatusFilter(initialStatusFilter || 'all');
      setSearch('');
    }
  }, [open, initialStatusFilter]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch('');
      setStatusFilter(initialStatusFilter || 'all');
    }
    onOpenChange(isOpen);
  };

  const total = shifts.length;
  const activeCount = useMemo(() => shifts.filter((s) => s.status === 'active').length, [shifts]);
  const inactiveCount = useMemo(
    () => shifts.filter((s) => s.status === 'inactive').length,
    [shifts],
  );

  const filteredShifts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shifts.filter((shift) => {
      const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;

      if (!matchesStatus) return false;
      if (!query) return true;

      const searchableText = [
        shift.name,
        shift.code,
        shift.startTime,
        shift.endTime,
        shift.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [shifts, search, statusFilter]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                <Workflow className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 font-khmer-moul-light">
                    បញ្ជីវេនការងារ
                  </DialogTitle>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {filteredShifts.length} វេន
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {`${activeCount} វេនសកម្ម · ${inactiveCount} វេនមិនសកម្ម`}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ទាំងអស់ ({total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                សកម្ម ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                មិនសកម្ម ({inactiveCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះវេន ឬកូដ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 rounded-xl border-slate-200 bg-slate-50/50 pl-8.5 text-xs focus-visible:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List Content */}
        <ScrollArea className="max-h-[65vh] min-h-[300px] overflow-y-auto">
          <div className="divide-y divide-slate-100 p-2 sm:p-4">
            {filteredShifts.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 font-medium">
                មិនមានទិន្នន័យវេនត្រូវនឹងការស្វែងរកទេ
              </div>
            ) : (
              filteredShifts.map((shift) => {
                const isActive = shift.status === 'active';

                return (
                  <div
                    key={shift.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900">{shift.name}</span>
                        {shift.code && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                            {shift.code}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span className="text-slate-400 font-normal">
                            (
                            {formatMinutesAsDuration(
                              computeShiftDurationMinutes(
                                shift.startTime,
                                shift.endTime,
                                shift.crossMidnight,
                              ),
                            )}
                            )
                          </span>
                        </div>

                        {typeof shift.graceMinutes === 'number' && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <TimerReset className="h-3.5 w-3.5 text-slate-400" />
                            <span>យឺតក្រោយ៖ {shift.graceMinutes} នាទី</span>
                          </div>
                        )}

                        {shift.effectiveFrom && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              មានប្រសិទ្ធភាព៖ {shift.effectiveFrom}
                              {shift.effectiveTo ? ` ដល់ ${shift.effectiveTo}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {shift.description && (
                        <p className="text-xs text-slate-400 italic line-clamp-1">
                          {shift.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-0 sm:pl-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          សកម្ម
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          មិនសកម្ម
                        </span>
                      )}

                      {onViewShift && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-2 rounded-lg"
                          onClick={() => {
                            onOpenChange(false);
                            onViewShift(shift);
                          }}
                        >
                          មើលលម្អិត
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
