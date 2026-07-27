import { z } from 'zod';

const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((val) => val ?? '');

export const leaveRequestSchema = z.preprocess(
  (data: any) => {
    if (!data || typeof data !== 'object') return data;
    return {
      id: data.id ?? 0,
      officer_id: data.officer_id ?? data.officerId ?? 0,
      approved_by: data.approved_by ?? data.approvedBy ?? null,
      start_date: data.start_date ?? data.startDate ?? '',
      end_date: data.end_date ?? data.endDate ?? '',
      leave_type: data.leave_type ?? data.leaveType ?? 'Annual Leave',
      total_days: data.total_days ?? data.totalDays ?? 1,
      reason: data.reason ?? '',
      status: data.status ?? 'Pending',
      approved_at: data.approved_at ?? data.approvedAt ?? null,
      first_name: data.first_name ?? data.firstName ?? '',
      last_name: data.last_name ?? data.lastName ?? '',
      department: data.department ?? '',
      approver_name: data.approver_name ?? data.approverName ?? null,
    };
  },
  z.object({
    id: z.number(),
    officer_id: z.number(),
    approved_by: z.number().nullable().optional(),
    start_date: nullableString,
    end_date: nullableString,
    leave_type: nullableString,
    total_days: z.number(),
    reason: nullableString,
    status: nullableString,
    approved_at: z.string().nullable().optional(),
    first_name: nullableString,
    last_name: nullableString,
    department: nullableString,
    approver_name: z.string().nullable().optional(),
  }),
);

export const leaveRequestsResponseSchema = z.preprocess((data: any) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.content)) {
    return data.content;
  }
  return [];
}, z.array(leaveRequestSchema));

export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export type LeaveRequestsResponse = z.infer<typeof leaveRequestsResponseSchema>;
