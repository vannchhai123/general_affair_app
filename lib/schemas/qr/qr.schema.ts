import { z } from 'zod';

export const qrSessionSchema = z.object({
  id: z.string(),
  status: z.string(),
  qr_token: z.string().optional(),
  qrToken: z.string().optional(),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  expires_at: z.string().optional(),
  expiresAt: z.string().optional(),
  qr_code_url: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  location: z.string().optional().nullable(),
  created_by: z.number().optional(),
  createdBy: z.number().optional(),
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

export const qrSessionCheckInSchema = z.object({
  id: z.number(),
  employee_name: z.string(),
  employee_code: z.string(),
  department: z.string(),
  status: z.string(),
  scanned_at: z.string(),
});

export const createQrSessionCheckInSchema = z.object({
  employee_id: z.number(),
  action: z.string(),
  timestamp: z.string(),
});

export const createQrSessionCheckInResponseSchema = z.object({
  id: z.number(),
  employee_name: z.string(),
  employee_code: z.string(),
  department: z.string(),
  status: z.string(),
  scanned_at: z.string(),
  message: z.string(),
});

export type QrSession = z.infer<typeof qrSessionSchema>;
export type CreateQrSession = z.infer<typeof createQrSessionSchema>;
export type UpdateQrSession = z.infer<typeof updateQrSessionSchema>;
export type UpdateQrSessionResponse = z.infer<typeof updateQrSessionResponseSchema>;
export type QrSessionCheckIn = z.infer<typeof qrSessionCheckInSchema>;
export type CreateQrSessionCheckIn = z.infer<typeof createQrSessionCheckInSchema>;
export type CreateQrSessionCheckInResponse = z.infer<typeof createQrSessionCheckInResponseSchema>;
