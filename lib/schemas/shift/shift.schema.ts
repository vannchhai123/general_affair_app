import { z } from 'zod';

export const shiftSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean(),
});

export const shiftsResponseSchema = z.array(shiftSchema);

export type Shift = z.infer<typeof shiftSchema>;
export type ShiftsResponse = z.infer<typeof shiftsResponseSchema>;
