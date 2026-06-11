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
  sex: z.enum(['male', 'female']).nullable().optional(),
  date_of_birth: nullableDisplayString,
  national_id: nullableDisplayString,
  nationality: nullableDisplayString,
  ethnicity: nullableDisplayString,
  email: z.string(),
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
  first_name_en: z.string().trim().min(1, 'English first name is required'),
  last_name_en: z.string().trim().min(1, 'English last name is required'),
  first_name_kh: z.string().trim().min(1, 'Khmer first name is required'),
  last_name_kh: z.string().trim().min(1, 'Khmer last name is required'),
  sex: z.enum(['male', 'female']),
  date_of_birth: z.string().trim().min(1, 'Date of birth is required'),
  national_id: z.string().trim().min(1, 'National ID is required'),
  nationality: z.string().trim().min(1, 'Nationality is required'),
  ethnicity: z.string().trim().min(1, 'Ethnicity is required'),
  email: z.string().trim().email('Invalid email'),
  position_id: z.number().int().positive('Position is required'),
  office_id: z.number().int().positive('Office is required'),
  education_level_id: z.number().int().positive('Education level is required'),
  hire_date: z.string().trim().min(1, 'Hire date is required'),
  contract_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  phone: z.string().trim().min(1, 'Phone is required'),
  status: z.string().trim().min(1, 'Status is required'),
});

export const updateOfficerSchema = createOfficerSchema.partial();

export type OfficerApi = z.infer<typeof officerApiSchema>;
export type Officer = z.infer<typeof officerSchema>;
export type PaginatedOfficersResponse = z.infer<typeof paginatedOfficersResponseSchema>;
export type CreateOfficer = z.infer<typeof createOfficerSchema>;
export type UpdateOfficer = z.infer<typeof updateOfficerSchema>;
