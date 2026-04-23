import { z } from 'zod';

export const qrScanResponseSchema = z.object({
  token: z.string().trim().nullable().optional(),
  expiresIn: z.number().optional(),
  sessionName: z.string().nullable().optional(),
  active: z.boolean().optional(),
  qr_token: z.string().trim().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  status: z.string().optional(),
  location: z.string().optional().nullable(),
  message: z.string().nullable().optional(),
  session_id: z.string().nullable().optional(),
  shift_type: z.string().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type QrScanResponse = z.infer<typeof qrScanResponseSchema>;
