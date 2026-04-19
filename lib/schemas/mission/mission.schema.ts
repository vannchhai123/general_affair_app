import { z } from 'zod';

export const missionSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  approved_by: z.number().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  purpose: z.string(),
  location: z.string(),
  status: z.string(),
  approved_date: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  department: z.string(),
  approver_name: z.string().nullable(),
});

export const missionsResponseSchema = z.array(missionSchema);

export type Mission = z.infer<typeof missionSchema>;
export type MissionsResponse = z.infer<typeof missionsResponseSchema>;
