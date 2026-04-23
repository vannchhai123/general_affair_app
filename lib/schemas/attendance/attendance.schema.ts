import { z } from 'zod';
import { paginationSchema } from '../common';

export const attendanceSessionSchema = z.object({
  id: z.number(),
  shiftName: z.string(),
  checkIn: z.string(),
  checkOut: z.string().nullable(),
  status: z.string(),
});

export const attendanceSchema = z.object({
  id: z.number(),
  officerId: z.number(),
  imageUrl: z.string().nullable().optional(),
  date: z.string(),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  totalWorkMin: z.number(),
  totalLateMin: z.number(),
  status: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  department: z.string(),
  officerCode: z.string(),
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
