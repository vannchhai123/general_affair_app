import { z } from 'zod';
import { paginationSchema } from '@/lib/schemas/common';

export const shiftStatusSchema = z.enum(['active', 'inactive']);
export const shiftAssignmentScopeSchema = z.enum(['department', 'position', 'employee']);
export const shiftConflictTypeSchema = z.enum([
  'overlap',
  'missing_shift',
  'inactive_shift',
  'range_conflict',
]);
export const shiftConflictSeveritySchema = z.enum(['warning', 'error']);
export const dayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Time must be in HH:mm or HH:mm:ss format');

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const trimmedString = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(maxLength, `${label} must be ${maxLength} characters or less`);

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const weeklyDaysSchema = z.object({
  mon: z.array(z.number()),
  tue: z.array(z.number()),
  wed: z.array(z.number()),
  thu: z.array(z.number()),
  fri: z.array(z.number()),
  sat: z.array(z.number()),
  sun: z.array(z.number()),
});

const normalizedShiftSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: shiftStatusSchema,
  isActive: z.boolean(),
  crossMidnight: z.boolean(),
  graceMinutes: z.number().int().nonnegative(),
  checkInOpenBeforeMinutes: z.number().int().nonnegative(),
  checkOutCloseAfterMinutes: z.number().int().nonnegative(),
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.nullable(),
  description: z.string(),
  assignedDepartmentsCount: z.number().int().nonnegative(),
  assignedPositionsCount: z.number().int().nonnegative(),
  assignedEmployeesCount: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const shiftApiSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    shift_name: z.string().optional(),
    code: z.string().nullable().optional(),
    shift_code: z.string().nullable().optional(),
    startTime: timeSchema.nullable().optional(),
    start_time: timeSchema.nullable().optional(),
    endTime: timeSchema.nullable().optional(),
    end_time: timeSchema.nullable().optional(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    status: z.string().nullable().optional(),
    crossMidnight: z.boolean().nullable().optional(),
    cross_midnight: z.boolean().nullable().optional(),
    graceMinutes: z.number().int().nonnegative().nullable().optional(),
    grace_minutes: z.number().int().nonnegative().nullable().optional(),
    checkInOpenBeforeMinutes: z.number().int().nonnegative().nullable().optional(),
    check_in_open_before_minutes: z.number().int().nonnegative().nullable().optional(),
    checkOutCloseAfterMinutes: z.number().int().nonnegative().nullable().optional(),
    check_out_close_after_minutes: z.number().int().nonnegative().nullable().optional(),
    effectiveFrom: dateSchema.nullable().optional(),
    effective_from: dateSchema.nullable().optional(),
    effectiveTo: dateSchema.nullable().optional(),
    effective_to: dateSchema.nullable().optional(),
    description: z.string().nullable().optional(),
    assignedDepartmentsCount: z.number().int().nonnegative().nullable().optional(),
    assigned_departments_count: z.number().int().nonnegative().nullable().optional(),
    assignedPositionsCount: z.number().int().nonnegative().nullable().optional(),
    assigned_positions_count: z.number().int().nonnegative().nullable().optional(),
    assignedEmployeesCount: z.number().int().nonnegative().nullable().optional(),
    assigned_employees_count: z.number().int().nonnegative().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .transform((shift) => {
    const startTime = shift.startTime ?? shift.start_time ?? '08:00';
    const endTime = shift.endTime ?? shift.end_time ?? '17:00';
    const effectiveFrom = shift.effectiveFrom ?? shift.effective_from ?? '2026-01-01';
    const effectiveTo = shift.effectiveTo ?? shift.effective_to ?? null;
    const isActive =
      shift.isActive ??
      shift.is_active ??
      (typeof shift.status === 'string' ? shift.status.toLowerCase() === 'active' : true);

    return {
      id: shift.id,
      name: shift.shift_name ?? shift.name,
      code: shift.shift_code ?? shift.code ?? `SHIFT-${shift.id}`,
      startTime: startTime.slice(0, 5),
      endTime: endTime.slice(0, 5),
      status: isActive ? 'active' : 'inactive',
      isActive,
      crossMidnight:
        shift.crossMidnight ?? shift.cross_midnight ?? endTime.slice(0, 5) < startTime.slice(0, 5),
      graceMinutes: shift.graceMinutes ?? shift.grace_minutes ?? 0,
      checkInOpenBeforeMinutes:
        shift.checkInOpenBeforeMinutes ?? shift.check_in_open_before_minutes ?? 15,
      checkOutCloseAfterMinutes:
        shift.checkOutCloseAfterMinutes ?? shift.check_out_close_after_minutes ?? 30,
      effectiveFrom,
      effectiveTo,
      description: shift.description ?? '',
      assignedDepartmentsCount:
        shift.assignedDepartmentsCount ?? shift.assigned_departments_count ?? 0,
      assignedPositionsCount: shift.assignedPositionsCount ?? shift.assigned_positions_count ?? 0,
      assignedEmployeesCount: shift.assignedEmployeesCount ?? shift.assigned_employees_count ?? 0,
      createdAt: shift.createdAt ?? shift.created_at ?? null,
      updatedAt: shift.updatedAt ?? shift.updated_at ?? null,
    };
  })
  .pipe(normalizedShiftSchema);

export const shiftSchema = shiftApiSchema;

export const shiftsResponseSchema = z.array(shiftSchema);

export const paginatedShiftResponseSchema = paginationSchema.extend({
  content: z.array(shiftSchema),
});

export const shiftListResponseSchema = z.union([
  paginatedShiftResponseSchema,
  shiftsResponseSchema.transform((content) => ({
    content,
    page: 0,
    size: content.length,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    last: true,
  })),
]);

export const shiftFormSchema = z
  .object({
    id: z.number().optional(),
    shift_name: trimmedString(50, 'Shift name'),
    shift_code: trimmedString(20, 'Shift code'),
    start_time: timeSchema,
    end_time: timeSchema,
    cross_midnight: z.boolean().default(false),
    grace_minutes: z.coerce.number().int().min(0, 'Grace period must be 0 or greater'),
    check_in_open_before_minutes: z.coerce
      .number()
      .int()
      .min(0, 'Check-in open window must be 0 or greater'),
    check_out_close_after_minutes: z.coerce
      .number()
      .int()
      .min(0, 'Check-out close window must be 0 or greater'),
    status: shiftStatusSchema,
    effective_from: dateSchema,
    effective_to: z.union([dateSchema, z.literal(''), z.null()]).optional(),
    description: optionalTrimmedString(300),
  })
  .superRefine((data, ctx) => {
    const start = data.start_time.slice(0, 5);
    const end = data.end_time.slice(0, 5);
    const inferredCrossMidnight = end < start;

    if (inferredCrossMidnight && !data.cross_midnight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cross_midnight'],
        message: 'Enable cross-midnight for shifts ending after midnight',
      });
    }

    if (!data.cross_midnight && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_time'],
        message: 'End time must be after start time unless cross-midnight is enabled',
      });
    }

    if (
      data.effective_to &&
      data.effective_to !== '' &&
      new Date(data.effective_to) < new Date(data.effective_from)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effective_to'],
        message: 'Effective end date must be on or after the start date',
      });
    }
  });

export const shiftRequestSchema = shiftFormSchema.transform((data) => ({
  name: data.shift_name,
  code: data.shift_code.toUpperCase(),
  startTime: data.start_time.slice(0, 5),
  endTime: data.end_time.slice(0, 5),
  crossMidnight: data.cross_midnight,
  graceMinutes: data.grace_minutes,
  checkInOpenBeforeMinutes: data.check_in_open_before_minutes,
  checkOutCloseAfterMinutes: data.check_out_close_after_minutes,
  status: data.status,
  isActive: data.status === 'active',
  effectiveFrom: data.effective_from,
  effectiveTo: data.effective_to && data.effective_to !== '' ? data.effective_to : null,
  description: data.description ?? '',
}));

export const shiftStatusPatchSchema = z.object({
  status: shiftStatusSchema,
});

export const shiftAssignmentSchema = z.object({
  id: z.number(),
  shiftId: z.number(),
  scope: shiftAssignmentScopeSchema,
  scopeId: z.number(),
  scopeName: z.string(),
  dayOfWeek: dayOfWeekSchema,
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.nullable().optional(),
});

export const weeklyTemplateSchema = z.object({
  id: z.number(),
  scope: shiftAssignmentScopeSchema,
  scopeId: z.number(),
  scopeName: z.string(),
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.nullable().optional(),
  days: weeklyDaysSchema,
});

export const shiftAssignmentListResponseSchema = z.array(shiftAssignmentSchema);
export const weeklyTemplateListResponseSchema = z.array(weeklyTemplateSchema);

export const shiftAuditEventSchema = z.object({
  id: z.number(),
  action: z.enum(['created', 'updated', 'activated', 'deactivated']),
  actorName: z.string(),
  timestamp: z.string(),
  note: z.string().optional(),
});

export const shiftConflictSchema = z.object({
  id: z.string(),
  type: shiftConflictTypeSchema,
  severity: shiftConflictSeveritySchema,
  title: z.string(),
  message: z.string(),
  shiftIds: z.array(z.number()).optional(),
  dayOfWeek: dayOfWeekSchema.optional(),
});

export type ShiftStatus = z.infer<typeof shiftStatusSchema>;
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type Shift = z.infer<typeof shiftSchema>;
export type ShiftFormInput = z.input<typeof shiftFormSchema>;
export type ShiftFormValues = z.output<typeof shiftFormSchema>;
export type ShiftRequest = z.infer<typeof shiftRequestSchema>;
export type ShiftListResponse = z.infer<typeof shiftListResponseSchema>;
export type ShiftsResponse = z.infer<typeof shiftsResponseSchema>;
export type ShiftStatusPatch = z.infer<typeof shiftStatusPatchSchema>;
export type ShiftAssignmentScope = z.infer<typeof shiftAssignmentScopeSchema>;
export type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;
export type WeeklyTemplate = z.infer<typeof weeklyTemplateSchema>;
export type ShiftAuditEvent = z.infer<typeof shiftAuditEventSchema>;
export type ShiftConflict = z.infer<typeof shiftConflictSchema>;
