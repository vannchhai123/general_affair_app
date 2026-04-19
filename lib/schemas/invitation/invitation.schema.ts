import { z } from 'zod';
import { invitationStatusValues, invitationTypeValues } from './invitation';

export const invitationSchema = z.object({
  id: z.number(),
  subject: z.string(),
  organization: z.string(),
  type: z.enum(invitationTypeValues),
  date: z.string(),
  time: z.string().nullable().optional(),
  location: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(invitationStatusValues),
  assigned_officer_ids: z.array(z.number()),
  assigned_officers: z.array(
    z.object({
      id: z.number(),
      first_name: z.string(),
      last_name: z.string(),
      department: z.string(),
      position: z.string(),
      officerCode: z.string().optional(),
    }),
  ),
  created_at: z.string(),
  updated_at: z.string(),
});

export const invitationsResponseSchema = z.array(invitationSchema);

export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationsResponse = z.infer<typeof invitationsResponseSchema>;
