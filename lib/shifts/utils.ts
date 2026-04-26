import {
  shiftFormSchema,
  type DayOfWeek,
  type Shift,
  type ShiftConflict,
  type ShiftFormInput,
} from '@/lib/schemas';

export const DAY_ORDER: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export const DAY_LABELS_KM: Record<DayOfWeek, string> = {
  mon: 'ចន្ទ',
  tue: 'អង្គារ',
  wed: 'ពុធ',
  thu: 'ព្រហស្បតិ៍',
  fri: 'សុក្រ',
  sat: 'សៅរ៍',
  sun: 'អាទិត្យ',
};

export function normalizeTime(value: string) {
  return value.slice(0, 5);
}

export function timeToMinutes(value: string) {
  const [hours = '0', minutes = '0'] = normalizeTime(value).split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function formatMinutesAsDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function inferCrossMidnight(startTime: string, endTime: string) {
  return timeToMinutes(endTime) <= timeToMinutes(startTime);
}

export function computeShiftDurationMinutes(
  startTime: string,
  endTime: string,
  crossMidnight?: boolean,
) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const overnight = crossMidnight ?? inferCrossMidnight(startTime, endTime);
  return overnight ? 24 * 60 - start + end : end - start;
}

export function addMinutesToTime(time: string, minutesToAdd: number) {
  const total = (timeToMinutes(time) + minutesToAdd + 24 * 60) % (24 * 60);
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getLateAfterTime(shift: Pick<Shift, 'startTime' | 'graceMinutes'>) {
  return addMinutesToTime(shift.startTime, shift.graceMinutes);
}

export function getCheckInWindowLabel(
  shift: Pick<Shift, 'startTime' | 'checkInOpenBeforeMinutes'>,
) {
  return `${addMinutesToTime(shift.startTime, -shift.checkInOpenBeforeMinutes)} - ${shift.startTime}`;
}

export function getCheckOutWindowLabel(
  shift: Pick<Shift, 'endTime' | 'checkOutCloseAfterMinutes'>,
) {
  return `${shift.endTime} - ${addMinutesToTime(shift.endTime, shift.checkOutCloseAfterMinutes)}`;
}

function expandRange(start: number, end: number, crossMidnight: boolean) {
  const base = { start, end: crossMidnight ? end + 24 * 60 : end };
  return crossMidnight ? [base] : [base, { start: start + 24 * 60, end: end + 24 * 60 }];
}

export function doTimesOverlap(a: ShiftLike, b: ShiftLike) {
  const aRanges = expandRange(
    timeToMinutes(a.start_time),
    timeToMinutes(a.end_time),
    a.cross_midnight,
  );
  const bRanges = expandRange(
    timeToMinutes(b.start_time),
    timeToMinutes(b.end_time),
    b.cross_midnight,
  );

  return aRanges.some((left) =>
    bRanges.some((right) => left.start < right.end && right.start < left.end),
  );
}

export function doDateRangesOverlap(
  effectiveFromA: string,
  effectiveToA: string | null | undefined,
  effectiveFromB: string,
  effectiveToB: string | null | undefined,
) {
  const startA = new Date(effectiveFromA).getTime();
  const endA = effectiveToA ? new Date(effectiveToA).getTime() : Number.POSITIVE_INFINITY;
  const startB = new Date(effectiveFromB).getTime();
  const endB = effectiveToB ? new Date(effectiveToB).getTime() : Number.POSITIVE_INFINITY;

  return startA <= endB && startB <= endA;
}

export type ShiftLike = {
  id?: number;
  shift_name: string;
  shift_code: string;
  start_time: string;
  end_time: string;
  cross_midnight: boolean;
  grace_minutes: number;
  check_in_open_before_minutes: number;
  check_out_close_after_minutes: number;
  status: 'active' | 'inactive';
  effective_from: string;
  effective_to?: string | null;
};

export function mapShiftToFormValues(shift: Shift): ShiftFormInput {
  return {
    id: shift.id,
    shift_name: shift.name,
    shift_code: shift.code,
    start_time: shift.startTime,
    end_time: shift.endTime,
    cross_midnight: shift.crossMidnight,
    grace_minutes: shift.graceMinutes,
    check_in_open_before_minutes: shift.checkInOpenBeforeMinutes,
    check_out_close_after_minutes: shift.checkOutCloseAfterMinutes,
    status: shift.status,
    effective_from: shift.effectiveFrom,
    effective_to: shift.effectiveTo ?? '',
    description: shift.description,
  };
}

export function validateShiftInput(
  values: ShiftFormInput,
  shifts: Shift[],
  currentShiftId?: number,
) {
  const result = shiftFormSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false as const,
      fieldErrors: result.error.flatten().fieldErrors,
      conflicts: [] as ShiftConflict[],
    };
  }

  const parsed = result.data;
  const normalizedCode = parsed.shift_code.trim().toUpperCase();

  const fieldErrors: Record<string, string[]> = {};

  const duplicateCode = shifts.find(
    (shift) => shift.id !== currentShiftId && shift.code.toUpperCase() === normalizedCode,
  );

  if (duplicateCode) {
    fieldErrors.shift_code = ['Shift code must be unique'];
  }

  const conflicts = detectShiftConflicts(parsed, shifts, currentShiftId);

  if (conflicts.some((conflict) => conflict.type === 'overlap')) {
    fieldErrors.start_time = ['Overlaps an existing active shift in the selected date range'];
    fieldErrors.end_time = ['Overlaps an existing active shift in the selected date range'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false as const,
      fieldErrors,
      conflicts,
    };
  }

  return {
    success: true as const,
    data: parsed,
    conflicts,
  };
}

export function detectShiftConflicts(values: ShiftLike, shifts: Shift[], currentShiftId?: number) {
  if (values.status !== 'active') {
    return [] satisfies ShiftConflict[];
  }

  const candidate = {
    ...values,
    shift_code: values.shift_code.trim().toUpperCase(),
  };

  return shifts
    .filter((shift) => shift.id !== currentShiftId && shift.status === 'active')
    .filter((shift) =>
      doDateRangesOverlap(
        candidate.effective_from,
        candidate.effective_to ?? null,
        shift.effectiveFrom,
        shift.effectiveTo,
      ),
    )
    .filter((shift) =>
      doTimesOverlap(candidate, {
        shift_name: shift.name,
        shift_code: shift.code,
        start_time: shift.startTime,
        end_time: shift.endTime,
        cross_midnight: shift.crossMidnight,
        grace_minutes: shift.graceMinutes,
        check_in_open_before_minutes: shift.checkInOpenBeforeMinutes,
        check_out_close_after_minutes: shift.checkOutCloseAfterMinutes,
        status: shift.status,
        effective_from: shift.effectiveFrom,
        effective_to: shift.effectiveTo,
      }),
    )
    .map((shift) => ({
      id: `overlap-${shift.id}`,
      type: 'overlap' as const,
      severity: 'error' as const,
      title: 'Overlapping active shift',
      message: `${candidate.shift_name} overlaps with ${shift.name} during an active date range.`,
      shiftIds: [shift.id],
    }));
}

export function buildAssignmentConflicts(args: {
  day: DayOfWeek;
  shiftIds: number[];
  workingDay: boolean;
  shifts: Shift[];
}) {
  const conflicts: ShiftConflict[] = [];
  const selectedShifts = args.shifts.filter((shift) => args.shiftIds.includes(shift.id));

  if (args.workingDay && selectedShifts.length === 0) {
    conflicts.push({
      id: `missing-${args.day}`,
      type: 'missing_shift',
      severity: 'warning',
      title: 'No shift assigned',
      message: `${DAY_LABELS[args.day]} is marked as a working day but has no assigned shift.`,
      dayOfWeek: args.day,
    });
  }

  selectedShifts.forEach((shift) => {
    if (shift.status === 'inactive') {
      conflicts.push({
        id: `inactive-${args.day}-${shift.id}`,
        type: 'inactive_shift',
        severity: 'warning',
        title: 'Inactive shift assigned',
        message: `${shift.name} is inactive but still assigned on ${DAY_LABELS[args.day]}.`,
        shiftIds: [shift.id],
        dayOfWeek: args.day,
      });
    }
  });

  for (let index = 0; index < selectedShifts.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < selectedShifts.length; compareIndex += 1) {
      const current = selectedShifts[index];
      const next = selectedShifts[compareIndex];

      if (
        doTimesOverlap(
          {
            shift_name: current.name,
            shift_code: current.code,
            start_time: current.startTime,
            end_time: current.endTime,
            cross_midnight: current.crossMidnight,
            grace_minutes: current.graceMinutes,
            check_in_open_before_minutes: current.checkInOpenBeforeMinutes,
            check_out_close_after_minutes: current.checkOutCloseAfterMinutes,
            status: current.status,
            effective_from: current.effectiveFrom,
            effective_to: current.effectiveTo,
          },
          {
            shift_name: next.name,
            shift_code: next.code,
            start_time: next.startTime,
            end_time: next.endTime,
            cross_midnight: next.crossMidnight,
            grace_minutes: next.graceMinutes,
            check_in_open_before_minutes: next.checkInOpenBeforeMinutes,
            check_out_close_after_minutes: next.checkOutCloseAfterMinutes,
            status: next.status,
            effective_from: next.effectiveFrom,
            effective_to: next.effectiveTo,
          },
        )
      ) {
        conflicts.push({
          id: `assignment-overlap-${args.day}-${current.id}-${next.id}`,
          type: 'overlap',
          severity: 'error',
          title: 'Overlapping daily assignment',
          message: `${current.name} overlaps with ${next.name} on ${DAY_LABELS[args.day]}.`,
          shiftIds: [current.id, next.id],
          dayOfWeek: args.day,
        });
      }
    }
  }

  return conflicts;
}

export function createOptimisticStatusState(
  shifts: Shift[],
  shiftId: number,
  nextStatus: Shift['status'],
) {
  return shifts.map((shift) =>
    shift.id === shiftId
      ? {
          ...shift,
          status: nextStatus,
          isActive: nextStatus === 'active',
        }
      : shift,
  );
}
