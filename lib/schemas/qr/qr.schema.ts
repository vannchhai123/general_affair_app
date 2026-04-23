import { z } from 'zod';

export const qrSessionSchema = z.object({
  id: z.string().nullable(),
  status: z.string(),
  qr_token: z.string().nullable().optional(),
  qrToken: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  qr_code_url: z.string().nullable().optional(),
  qrCodeUrl: z.string().nullable().optional(),
  location: z.string().optional().nullable(),
  created_by: z.number().nullable().optional(),
  createdBy: z.number().nullable().optional(),
  scan_count: z.number().optional(),
  session_date: z.string().nullable().optional(),
  shift_type: z.string().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  system_generated: z.boolean().nullable().optional(),
  message: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const createQrSessionSchema = z.object({
  created_by: z.number().optional(),
  createdBy: z.number().optional(),
  duration_seconds: z.number().optional(),
  durationSeconds: z.number().optional(),
  location: z.string(),
});

export const updateQrSessionSchema = z.object({
  action: z.string(),
});

export const updateQrSessionResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  updated_at: z.string(),
});

export const qrTodaySessionsSchema = z.array(qrSessionSchema);

export const qrSessionCheckInSchema = z.object({
  id: z.number(),
  officer_name: z.string().optional(),
  officer_code: z.string().optional(),
  employee_name: z.string().optional(),
  employee_code: z.string().optional(),
  department: z.string(),
  status: z.string(),
  scanned_at: z.string(),
  message: z.string().nullable().optional(),
});

export const createQrSessionCheckInSchema = z.object({
  employee_id: z.number(),
  action: z.string(),
  timestamp: z.string(),
});

export const createQrSessionCheckInResponseSchema = z.object({
  id: z.number(),
  officer_name: z.string().optional(),
  officer_code: z.string().optional(),
  employee_name: z.string().optional(),
  employee_code: z.string().optional(),
  department: z.string(),
  status: z.string(),
  scanned_at: z.string(),
  message: z.string().nullable().optional(),
});

export type QrSession = z.infer<typeof qrSessionSchema>;
export type CreateQrSession = z.infer<typeof createQrSessionSchema>;
export type UpdateQrSession = z.infer<typeof updateQrSessionSchema>;
export type UpdateQrSessionResponse = z.infer<typeof updateQrSessionResponseSchema>;
export type QrSessionCheckIn = z.infer<typeof qrSessionCheckInSchema>;
export type CreateQrSessionCheckIn = z.infer<typeof createQrSessionCheckInSchema>;
export type CreateQrSessionCheckInResponse = z.infer<typeof createQrSessionCheckInResponseSchema>;
