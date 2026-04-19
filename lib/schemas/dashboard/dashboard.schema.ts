import { z } from 'zod';
import { attendanceSchema } from '../attendance';

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
  recent_attendance: z.array(attendanceSchema),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
