import { z } from 'zod';

export const officerSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  officerCode: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  position: z.string(),
  department: z.string(),
  phone: z.string(),
  status: z.string(),
  username: z.string().nullable().optional(),
});

export const officersResponseSchema = z.array(officerSchema);

export const createOfficerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  position: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
});

export const updateOfficerSchema = createOfficerSchema.partial();

export type Officer = z.infer<typeof officerSchema>;
export type OfficersResponse = z.infer<typeof officersResponseSchema>;
export type CreateOfficer = z.infer<typeof createOfficerSchema>;
export type UpdateOfficer = z.infer<typeof updateOfficerSchema>;
