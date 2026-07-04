import { z } from 'zod';

export const dashboardRecentAttendanceSchema = z.object({
  id: z.number(),
  date: z.string(),
  status: z.string(),
  total_work_minutes: z.number(),
  total_late_minutes: z.number(),
  officer: z.object({
    id: z.number(),
    first_name_kh: z.string(),
    last_name_kh: z.string(),
    first_name_en: z.string(),
    last_name_en: z.string(),
    position: z.string(),
    department: z.string(),
  }),
});

export const dashboardStatsSchema = z.object({
  officers: z.object({
    total: z.number(),
    active: z.number(),
    on_leave: z.number(),
    inactive: z.number(),
  }),
  attendance: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
    absent: z.number(),
  }),
  invitations: z.object({
    total: z.number(),
    active: z.number(),
    completed: z.number(),
  }),
  missions: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
  }),
  leave_requests: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
  }),
  qr_sessions: z.object({
    total: z.number(),
    active: z.number(),
  }),
  gender_breakdown: z.object({
    male_present: z.number(),
    female_present: z.number(),
    male_late: z.number(),
    female_late: z.number(),
  }),
  recent_attendance: z.array(dashboardRecentAttendanceSchema),
});

export type DashboardRecentAttendance = z.infer<typeof dashboardRecentAttendanceSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
