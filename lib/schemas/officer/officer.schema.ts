import { z } from 'zod';

export const officerSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  uuid: z.string().nullable().optional(),
  officerCode: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  sex: z.enum(['male', 'female']).optional(),
  email: z.string(),
  position: z.string(),
  department: z.string(),
  phone: z.string(),
  status: z.string(),
  username: z.string().nullable().optional(),
  /**
   * GET /api/v1/officer returns image_url from OfficerResponseDto.
   * Keep imageUrl aliases optional for older client-side call sites.
   */
  imageUrl: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  profile_image: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
});

export const officersResponseSchema = z.array(officerSchema);

export const createOfficerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  sex: z.enum(['male', 'female']).optional(),
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
