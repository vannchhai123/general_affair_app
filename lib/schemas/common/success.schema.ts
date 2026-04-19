import { z } from 'zod';

export const successResponseSchema = z.object({
  success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;
