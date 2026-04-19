import { z } from 'zod';

export const invitationStatusValues = ['pending', 'accepted', 'rejected', 'completed'] as const;
export const invitationTypeValues = ['incoming', 'outgoing'] as const;

export const invitationFormSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required' }),
  organization: z.string().min(1, { message: 'Organization is required' }),
  type: z.enum(invitationTypeValues, {
    errorMap: () => ({ message: 'Type must be either incoming or outgoing' }),
  }),
  date: z.string().min(1, { message: 'Date is required' }),
  time: z.string().optional(),
  location: z.string().min(1, { message: 'Location is required' }),
  description: z.string().optional(),
  officers: z.array(z.number()).optional(),
  status: z
    .enum(invitationStatusValues, {
      errorMap: () => ({
        message: 'Status must be pending, accepted, rejected, or completed',
      }),
    })
    .default('pending'),
});

export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
