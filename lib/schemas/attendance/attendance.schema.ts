import { z } from 'zod';
import { paginationSchema } from '../common';

const nullableDisplayString = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value ?? '');

export const attendanceSessionSchema = z.object({
  id: z.number(),
  shiftName: nullableDisplayString,
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
  status: nullableDisplayString,
});

export const attendanceSchema = z.object({
  id: z.number(),
  officerId: z.number(),
  imageUrl: z.string().nullable().optional(),
  date: nullableDisplayString,
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
  totalWorkMin: z.number(),
  totalLateMin: z.number(),
  status: nullableDisplayString,
  firstName: nullableDisplayString,
  lastName: nullableDisplayString,
  department: nullableDisplayString,
  officerCode: nullableDisplayString,
  sessions: z.array(attendanceSessionSchema).nullable(),
});

export const attendanceResponseSchema = z.object({
  content: z.array(attendanceSchema),
  ...paginationSchema.shape,
});

export const attendanceListResponseSchema = z.array(attendanceSchema);

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type AttendanceResponse = z.infer<typeof attendanceResponseSchema>;
export type AttendanceListResponse = z.infer<typeof attendanceListResponseSchema>;
