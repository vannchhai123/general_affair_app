import { z } from 'zod';

export const qrScanResponseSchema = z.object({
  token: z.string().trim().optional(),
  expiresIn: z.number().optional(),
  sessionName: z.string().optional(),
  active: z.boolean().optional(),
  qr_token: z.string().trim().optional(),
  expires_at: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional().nullable(),
});

export type QrScanResponse = z.infer<typeof qrScanResponseSchema>;
