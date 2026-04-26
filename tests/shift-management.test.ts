import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOptimisticStatusState,
  doTimesOverlap,
  validateShiftInput,
} from '../lib/shifts/utils';
import type { Shift, ShiftFormInput } from '../lib/schemas';

const baseShifts: Shift[] = [
  {
    id: 1,
    name: 'Morning Core',
    code: 'SHIFT-AM',
    startTime: '08:00',
    endTime: '12:00',
    status: 'active',
    isActive: true,
    crossMidnight: false,
    graceMinutes: 10,
    checkInOpenBeforeMinutes: 15,
    checkOutCloseAfterMinutes: 30,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    description: '',
    assignedDepartmentsCount: 1,
    assignedPositionsCount: 1,
    assignedEmployeesCount: 2,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 2,
    name: 'Afternoon Core',
    code: 'SHIFT-PM',
    startTime: '13:00',
    endTime: '17:00',
    status: 'active',
    isActive: true,
    crossMidnight: false,
    graceMinutes: 5,
    checkInOpenBeforeMinutes: 15,
    checkOutCloseAfterMinutes: 20,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    description: '',
    assignedDepartmentsCount: 1,
    assignedPositionsCount: 1,
    assignedEmployeesCount: 2,
    createdAt: null,
    updatedAt: null,
  },
];

const validInput: ShiftFormInput = {
  shift_name: 'Night Support',
  shift_code: 'SHIFT-NIGHT',
  start_time: '22:00',
  end_time: '06:00',
  cross_midnight: true,
  grace_minutes: 15,
  check_in_open_before_minutes: 30,
  check_out_close_after_minutes: 45,
  status: 'active',
  effective_from: '2026-01-01',
  effective_to: '',
  description: 'Overnight support',
};

test('validateShiftInput rejects duplicate shift codes already loaded in the UI', () => {
  const result = validateShiftInput(
    {
      ...validInput,
      shift_code: 'shift-am',
    },
    baseShifts,
  );

  assert.equal(result.success, false);
  if (result.success) return;
  assert.deepEqual(result.fieldErrors.shift_code, ['Shift code must be unique']);
});

test('validateShiftInput rejects overlapping active shifts in the same effective range', () => {
  const result = validateShiftInput(
    {
      ...validInput,
      shift_name: 'Late Morning',
      shift_code: 'SHIFT-LM',
      start_time: '11:00',
      end_time: '14:00',
      cross_midnight: false,
    },
    baseShifts,
  );

  assert.equal(result.success, false);
  if (result.success) return;
  assert.ok(result.conflicts.some((conflict) => conflict.type === 'overlap'));
  assert.deepEqual(result.fieldErrors.start_time, [
    'Overlaps an existing active shift in the selected date range',
  ]);
});

test('doTimesOverlap catches overnight conflicts against early-morning shifts', () => {
  const overlaps = doTimesOverlap(
    {
      shift_name: 'Night Response',
      shift_code: 'SHIFT-NIGHT',
      start_time: '22:00',
      end_time: '06:00',
      cross_midnight: true,
      grace_minutes: 15,
      check_in_open_before_minutes: 30,
      check_out_close_after_minutes: 45,
      status: 'active',
      effective_from: '2026-01-01',
      effective_to: null,
    },
    {
      shift_name: 'Early Ops',
      shift_code: 'SHIFT-EARLY',
      start_time: '05:30',
      end_time: '09:00',
      cross_midnight: false,
      grace_minutes: 5,
      check_in_open_before_minutes: 15,
      check_out_close_after_minutes: 20,
      status: 'active',
      effective_from: '2026-01-01',
      effective_to: null,
    },
  );

  assert.equal(overlaps, true);
});

test('createOptimisticStatusState applies and restores status changes predictably', () => {
  const deactivated = createOptimisticStatusState(baseShifts, 1, 'inactive');
  assert.equal(deactivated[0].status, 'inactive');
  assert.equal(deactivated[0].isActive, false);

  const rolledBack = createOptimisticStatusState(deactivated, 1, 'active');
  assert.equal(rolledBack[0].status, 'active');
  assert.equal(rolledBack[0].isActive, true);
});
