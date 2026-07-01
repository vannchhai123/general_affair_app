import { z } from 'zod';

const nullableDisplayString = z.string().nullable().optional();

export const officerApiSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable().optional(),
  office_id: z.number().nullable().optional(),
  position_id: z.number().nullable().optional(),
  education_level_id: z.number().nullable().optional(),
  uuid: z.string().nullable().optional(),
  officerCode: z.string(),
  first_name_en: z.string(),
  last_name_en: z.string(),
  first_name_kh: nullableDisplayString,
  last_name_kh: nullableDisplayString,
  sex: z.enum(['male', 'female', 'MALE', 'FEMALE']).nullable().optional(),
  date_of_birth: nullableDisplayString,
  national_id: nullableDisplayString,
  nationality: nullableDisplayString,
  ethnicity: nullableDisplayString,
  email: z.string().nullable().optional(),
  position: nullableDisplayString,
  department: nullableDisplayString,
  office: nullableDisplayString,
  phone: nullableDisplayString,
  hire_date: nullableDisplayString,
  contract_type: nullableDisplayString,
  status: z.string(),
  username: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  profile_image: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  invitation_priority: z.boolean().nullable().optional(),
  education_level: z.string().nullable().optional(),
});

export const officerSchema = officerApiSchema.transform((officer) => ({
  ...officer,
  first_name: officer.first_name_en,
  last_name: officer.last_name_en,
  department: officer.department ?? officer.office ?? '',
  office: officer.office ?? officer.department ?? '',
  phone: officer.phone ?? '',
  position: officer.position ?? '',
  first_name_kh: officer.first_name_kh ?? '',
  last_name_kh: officer.last_name_kh ?? '',
  date_of_birth: officer.date_of_birth ?? '',
  national_id: officer.national_id ?? '',
  nationality: officer.nationality ?? '',
  ethnicity: officer.ethnicity ?? '',
  hire_date: officer.hire_date ?? '',
  contract_type: officer.contract_type ?? '',
  invitation_priority: officer.invitation_priority ?? false,
  education_level: officer.education_level ?? '',
}));

export const paginatedOfficersResponseSchema = z.object({
  content: z.array(officerSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

export const createOfficerSchema = z.object({
  officerCode: z.string().trim().min(1, 'Officer code is required'),
  username: z.string().trim().min(1, 'Username is required'),
  first_name_en: z.string().trim().min(1, 'English first name is required'),
  last_name_en: z.string().trim().min(1, 'English last name is required'),
  first_name_kh: z.string().trim().min(1, 'Khmer first name is required'),
  last_name_kh: z.string().trim().min(1, 'Khmer last name is required'),
  sex: z.enum(['MALE', 'FEMALE', 'male', 'female']),
  date_of_birth: z.string().trim().nullable().optional(),
  national_id: z.string().trim().nullable().optional(),
  nationality: z.string().trim().nullable().optional(),
  ethnicity: z.string().trim().nullable().optional(),
  email: z
    .union([z.string().trim().email('Invalid email'), z.literal('')])
    .nullable()
    .optional(),
  position_id: z.number().int().nullable().optional(),
  office_id: z.number().int().nullable().optional(),
  education_level: z.string().trim().nullable().optional(),
  hire_date: z.string().trim().min(1, 'Hire date is required'),
  contract_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).nullable().optional(),
  phone: z.string().trim().min(1, 'Phone is required'),
  status: z.string().trim().min(1, 'Status is required'),
  invitation_priority: z.boolean().nullable().optional(),
});

export const updateOfficerSchema = createOfficerSchema.partial();

export type OfficerApi = z.infer<typeof officerApiSchema>;
export type Officer = z.infer<typeof officerSchema>;
export type PaginatedOfficersResponse = z.infer<typeof paginatedOfficersResponseSchema>;
export type CreateOfficer = z.infer<typeof createOfficerSchema>;
export type UpdateOfficer = z.infer<typeof updateOfficerSchema>;
