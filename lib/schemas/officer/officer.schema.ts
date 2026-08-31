import { z } from 'zod';

const nullableDisplayString = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform((v) => (v !== null && v !== undefined ? String(v) : ''));

export const officerRoleItemSchema = z
  .object({
    id: z.number().optional(),
    code: z.string().optional(),
    name: z.string().optional(),
    roleName: z.string().optional(),
    role_name: z.string().optional(),
    name_km: z.string().nullable().optional(),
    nameKm: z.string().nullable().optional(),
    hierarchy_level: z.number().optional(),
    hierarchyLevel: z.number().optional(),
  })
  .passthrough();

export const officerApiSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    user_id: z
      .union([z.number(), z.string()])
      .nullable()
      .optional()
      .transform((val) => (val ? Number(val) : null)),
    userId: z
      .union([z.number(), z.string()])
      .nullable()
      .optional()
      .transform((val) => (val ? Number(val) : null)),
    user: z.any().optional(),
    office_id: z.number().nullable().optional(),
    position_id: z.number().nullable().optional(),
    education_level_id: z.number().nullable().optional(),
    uuid: z.string().nullable().optional(),
    officerCode: nullableDisplayString,
    officer_code: nullableDisplayString,
    code: nullableDisplayString,
    first_name_en: nullableDisplayString,
    last_name_en: nullableDisplayString,
    first_name: nullableDisplayString,
    last_name: nullableDisplayString,
    firstName: nullableDisplayString,
    lastName: nullableDisplayString,
    first_name_kh: nullableDisplayString,
    last_name_kh: nullableDisplayString,
    firstNameKh: nullableDisplayString,
    lastNameKh: nullableDisplayString,
    full_name: nullableDisplayString,
    fullName: nullableDisplayString,
    sex: z.union([z.string(), z.null()]).optional(),
    date_of_birth: nullableDisplayString,
    national_id: nullableDisplayString,
    nationality: nullableDisplayString,
    ethnicity: nullableDisplayString,
    email: z.string().nullable().optional(),
    position: nullableDisplayString,
    department: nullableDisplayString,
    office: nullableDisplayString,
    phone: nullableDisplayString,
    phoneNumber: nullableDisplayString,
    hire_date: nullableDisplayString,
    contract_type: nullableDisplayString,
    status: nullableDisplayString,
    username: nullableDisplayString,
    imageUrl: nullableDisplayString,
    image_url: nullableDisplayString,
    avatar_url: nullableDisplayString,
    profileImage: nullableDisplayString,
    profile_image: nullableDisplayString,
    photoUrl: nullableDisplayString,
    photo_url: nullableDisplayString,
    invitation_priority: z.boolean().nullable().optional(),
    education_level: nullableDisplayString,
    role: z
      .union([z.string(), officerRoleItemSchema, z.record(z.any())])
      .nullable()
      .optional(),
    roles: z
      .array(z.union([z.string(), officerRoleItemSchema, z.record(z.any())]))
      .nullable()
      .optional(),
    user_roles: z
      .array(z.union([z.string(), officerRoleItemSchema, z.record(z.any())]))
      .nullable()
      .optional(),
    userRoles: z
      .array(z.union([z.string(), officerRoleItemSchema, z.record(z.any())]))
      .nullable()
      .optional(),
    permissions: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

export const officerSchema = officerApiSchema.transform((officer) => {
  const firstNameEn = officer.first_name_en || officer.first_name || officer.firstName || '';
  const lastNameEn = officer.last_name_en || officer.last_name || officer.lastName || '';
  const firstNameKh = officer.first_name_kh || officer.firstNameKh || '';
  const lastNameKh = officer.last_name_kh || officer.lastNameKh || '';
  const officerCode =
    officer.officerCode || officer.officer_code || officer.code || String(officer.id);

  // Normalize roles from any possible location
  const rawRoles: any[] = [];
  const userObj = officer.user && typeof officer.user === 'object' ? officer.user : null;

  if (Array.isArray(officer.roles) && officer.roles.length > 0) {
    rawRoles.push(...officer.roles);
  } else if (Array.isArray(officer.user_roles) && officer.user_roles.length > 0) {
    rawRoles.push(...officer.user_roles);
  } else if (Array.isArray(officer.userRoles) && officer.userRoles.length > 0) {
    rawRoles.push(...officer.userRoles);
  } else if (userObj && Array.isArray(userObj.roles) && userObj.roles.length > 0) {
    rawRoles.push(...userObj.roles);
  } else if (userObj && Array.isArray(userObj.user_roles) && userObj.user_roles.length > 0) {
    rawRoles.push(...userObj.user_roles);
  } else if (officer.role) {
    rawRoles.push(officer.role);
  } else if (userObj?.role) {
    rawRoles.push(userObj.role);
  }

  const roleCodes: string[] = [];
  const normalizedRoles: any[] = [];

  for (const r of rawRoles) {
    if (typeof r === 'string') {
      const code = r.toUpperCase();
      if (code && !roleCodes.includes(code)) {
        roleCodes.push(code);
        normalizedRoles.push({ code });
      }
    } else if (r && typeof r === 'object') {
      const code = (r.code || r.name || r.roleName || r.role_name || '').toUpperCase();
      if (code && !roleCodes.includes(code)) {
        roleCodes.push(code);
        normalizedRoles.push({
          id: r.id,
          code,
          name_km: r.name_km || r.nameKm,
          nameKm: r.nameKm || r.name_km,
          hierarchy_level: r.hierarchy_level || r.hierarchyLevel,
          hierarchyLevel: r.hierarchyLevel || r.hierarchy_level,
        });
      }
    }
  }

  const resolvedUserId = officer.user_id ?? officer.userId ?? userObj?.id ?? null;

  return {
    ...officer,
    user_id: resolvedUserId,
    officerCode,
    first_name_en: firstNameEn,
    last_name_en: lastNameEn,
    first_name: firstNameEn,
    last_name: lastNameEn,
    first_name_kh: firstNameKh,
    last_name_kh: lastNameKh,
    department: officer.department || officer.office || '',
    office: officer.office || officer.department || '',
    phone: officer.phone || officer.phoneNumber || '',
    position: officer.position || '',
    date_of_birth: officer.date_of_birth || '',
    national_id: officer.national_id || '',
    nationality: officer.nationality || '',
    ethnicity: officer.ethnicity || '',
    hire_date: officer.hire_date || '',
    contract_type: officer.contract_type || '',
    status: officer.status || 'ACTIVE',
    invitation_priority: officer.invitation_priority ?? false,
    education_level: officer.education_level || '',
    roleCodes,
    roles: normalizedRoles,
    permissions: officer.permissions ?? userObj?.permissions ?? [],
  };
});

export const paginatedOfficersResponseSchema = z
  .object({
    content: z.array(officerSchema),
    page: z.number().optional().default(0),
    size: z.number().optional().default(10),
    totalElements: z.number().optional().default(0),
    totalPages: z.number().optional().default(1),
    last: z.boolean().optional().default(true),
  })
  .passthrough();

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
