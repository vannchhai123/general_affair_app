import { z } from 'zod';

export const reportDataSchema = z.object({
  attendance_by_department: z.array(
    z.object({
      department: z.string(),
      total: z.number(),
      avg_work_minutes: z.number(),
      avg_late_minutes: z.number(),
    }),
  ),
  officers_by_department: z.array(
    z.object({
      department: z.string(),
      total: z.number(),
      active: z.number(),
    }),
  ),
  invitation_response_rates: z.array(
    z.object({
      title: z.string(),
      accepted: z.number(),
      pending: z.number(),
      declined: z.number(),
    }),
  ),
  leave_summary: z.array(
    z.object({
      leave_type: z.string(),
      total: z.number(),
      approved: z.number(),
      pending: z.number(),
    }),
  ),
  mission_summary: z.array(
    z.object({
      status: z.string(),
      total: z.number(),
    }),
  ),
  audit_log: z.array(
    z.object({
      id: z.number(),
      user_id: z.number(),
      action: z.string(),
      table_name: z.string(),
      record_id: z.number(),
      file_path: z.string().nullable(),
      timestamp: z.string(),
      full_name: z.string(),
    }),
  ),
});

export type ReportData = z.infer<typeof reportDataSchema>;
