import { z } from 'zod';

export const leaveRequestSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  approved_by: z.number().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  leave_type: z.string(),
  total_days: z.number(),
  reason: z.string(),
  status: z.string(),
  approved_at: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  department: z.string(),
  approver_name: z.string().nullable(),
});

export const leaveRequestsResponseSchema = z.array(leaveRequestSchema);

export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export type LeaveRequestsResponse = z.infer<typeof leaveRequestsResponseSchema>;
