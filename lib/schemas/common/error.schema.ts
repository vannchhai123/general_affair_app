import { z } from 'zod';

export const errorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  error: z.string(),
  path: z.string(),
  timestamp: z.string(),
  errors: z.record(z.string()).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
