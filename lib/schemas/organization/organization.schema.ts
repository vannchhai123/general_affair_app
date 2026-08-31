import { z } from 'zod';

const nullableDisplayString = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform((value) => (value !== null && value !== undefined ? String(value) : ''));

const nullableNumber = z
  .union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((value) => (value !== null && value !== undefined ? Number(value) : 0));

const organizationStatusSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => (value ? String(value).toLowerCase() : 'active'))
  .pipe(z.enum(['active', 'inactive']));

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

export const departmentApiSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    uuid: nullableDisplayString,
    name: nullableDisplayString,
    departmentName: nullableDisplayString,
    department_name: nullableDisplayString,
    code: nullableDisplayString,
    manager: nullableDisplayString,
    officer_count: nullableNumber,
    officerCount: nullableNumber,
    status: z.any().optional(),
    description: nullableDisplayString,
  })
  .passthrough();

export const positionApiSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    uuid: nullableDisplayString,
    title: nullableDisplayString,
    positionName: nullableDisplayString,
    position_name: nullableDisplayString,
    code: nullableDisplayString,
    department_id: nullableNumber,
    departmentId: nullableNumber,
    department_name: nullableDisplayString,
    departmentName: nullableDisplayString,
    officer_count: nullableNumber,
    officerCount: nullableNumber,
    status: z.any().optional(),
    description: nullableDisplayString,
  })
  .passthrough();

export const officeApiSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    uuid: nullableDisplayString,
    name: nullableDisplayString,
    officeName: nullableDisplayString,
    office_name: nullableDisplayString,
    code: nullableDisplayString,
    manager: nullableDisplayString,
    adminId: nullableNumber,
    admin_id: nullableNumber,
    adminName: nullableDisplayString,
    admin_name: nullableDisplayString,
    adminUsername: nullableDisplayString,
    admin_username: nullableDisplayString,
    officer_count: nullableNumber,
    officerCount: nullableNumber,
    status: z.any().optional(),
    description: nullableDisplayString,
  })
  .passthrough();

export const departmentSchema = departmentApiSchema.transform((department) => ({
  id: department.id,
  uuid: department.uuid || '',
  name: department.name || department.departmentName || department.department_name || '',
  code: department.code || '',
  manager: department.manager || undefined,
  officerCount: department.officerCount || department.officer_count || 0,
  status: (String(department.status || 'active').toLowerCase() === 'inactive'
    ? 'inactive'
    : 'active') as 'active' | 'inactive',
  description: department.description || null,
}));

export const positionSchema = positionApiSchema.transform((position) => ({
  id: position.id,
  uuid: position.uuid || '',
  title: position.title || position.positionName || position.position_name || '',
  code: position.code || '',
  departmentId: position.departmentId || position.department_id || 0,
  departmentName: position.departmentName || position.department_name || '',
  officerCount: position.officerCount || position.officer_count || 0,
  status: (String(position.status || 'active').toLowerCase() === 'inactive'
    ? 'inactive'
    : 'active') as 'active' | 'inactive',
  description: position.description || null,
}));

export const officeSchema = officeApiSchema.transform((office) => ({
  id: office.id,
  uuid: office.uuid || '',
  name: office.name || office.officeName || office.office_name || '',
  code: office.code || '',
  manager: office.manager || undefined,
  adminId: office.adminId || office.admin_id || null,
  adminName: office.adminName || office.admin_name || null,
  adminUsername: office.adminUsername || office.admin_username || null,
  officerCount: office.officerCount || office.officer_count || 0,
  status: (String(office.status || 'active').toLowerCase() === 'inactive'
    ? 'inactive'
    : 'active') as 'active' | 'inactive',
  description: office.description || null,
}));

function createFlexibleListResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z
    .union([
      z
        .object({
          content: z.array(z.any()),
          page: z.number().optional().default(0),
          size: z.number().optional().default(10),
          totalElements: z.number().optional().default(0),
          totalPages: z.number().optional().default(1),
          last: z.boolean().optional().default(true),
        })
        .passthrough(),
      z
        .object({
          data: z.union([
            z.array(z.any()),
            z
              .object({
                content: z.array(z.any()).optional(),
                totalElements: z.number().optional(),
                totalPages: z.number().optional(),
                page: z.number().optional(),
                size: z.number().optional(),
                last: z.boolean().optional(),
              })
              .passthrough(),
          ]),
        })
        .passthrough(),
      z.array(z.any()),
    ])
    .transform((raw: any) => {
      let rawList: any[] = [];
      let totalElements = 0;
      let totalPages = 1;
      let page = 0;
      let size = 10;
      let last = true;

      if (Array.isArray(raw)) {
        rawList = raw;
        totalElements = raw.length;
        totalPages = raw.length > 0 ? 1 : 0;
      } else if (raw.content && Array.isArray(raw.content)) {
        rawList = raw.content;
        totalElements = raw.totalElements ?? raw.content.length;
        totalPages = raw.totalPages ?? 1;
        page = raw.page ?? 0;
        size = raw.size ?? 10;
        last = raw.last ?? true;
      } else if (raw.data) {
        if (Array.isArray(raw.data)) {
          rawList = raw.data;
          totalElements = raw.data.length;
          totalPages = raw.data.length > 0 ? 1 : 0;
        } else if (raw.data.content && Array.isArray(raw.data.content)) {
          rawList = raw.data.content;
          totalElements = raw.data.totalElements ?? raw.data.content.length;
          totalPages = raw.data.totalPages ?? 1;
          page = raw.data.page ?? 0;
          size = raw.data.size ?? 10;
          last = raw.data.last ?? true;
        }
      }

      const content = rawList
        .map((item) => {
          const parsed = itemSchema.safeParse(item);
          return parsed.success ? parsed.data : null;
        })
        .filter(Boolean);

      return {
        content,
        totalElements,
        totalPages,
        page,
        size,
        last,
      };
    });
}

export const departmentsListResponseSchema = createFlexibleListResponseSchema(departmentSchema);
export const positionsListResponseSchema = createFlexibleListResponseSchema(positionSchema);
export const officesListResponseSchema = createFlexibleListResponseSchema(officeSchema);

export const departmentFormSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(100),
  code: z.string().trim().min(1, 'Department code is required').max(50),
  manager: optionalTrimmedString(255),
  status: z.enum(['active', 'inactive']),
  description: optionalTrimmedString(500),
});

export const positionFormSchema = z.object({
  title: z.string().trim().min(1, 'Position title is required').max(100),
  code: z.string().trim().min(1, 'Position code is required').max(50),
  departmentId: z.number({ required_error: 'Department is required' }).int().positive(),
  status: z.enum(['active', 'inactive']),
  description: optionalTrimmedString(500),
});

export const departmentRequestSchema = departmentFormSchema.transform((data) => ({
  name: data.name.trim(),
  code: data.code.trim(),
  manager: data.manager,
  status: data.status.toLowerCase() as OrganizationStatus,
  description: data.description,
}));

export const positionRequestSchema = positionFormSchema.transform((data) => ({
  title: data.title.trim(),
  code: data.code.trim(),
  department_id: data.departmentId,
  status: data.status.toLowerCase() as OrganizationStatus,
  description: data.description,
}));

export const deleteMessageResponseSchema = z.object({
  message: z.string(),
});

export type OrganizationStatus = z.infer<typeof organizationStatusSchema>;
export type DepartmentApi = z.infer<typeof departmentApiSchema>;
export type PositionApi = z.infer<typeof positionApiSchema>;
export type OfficeApi = z.infer<typeof officeApiSchema>;
export type Department = z.infer<typeof departmentSchema>;
export type Position = z.infer<typeof positionSchema>;
export type Office = z.infer<typeof officeSchema>;
export type DepartmentsListResponse = z.infer<typeof departmentsListResponseSchema>;
export type PositionsListResponse = z.infer<typeof positionsListResponseSchema>;
export type OfficesListResponse = z.infer<typeof officesListResponseSchema>;
export type DepartmentFormValues = z.output<typeof departmentFormSchema>;
export type PositionFormValues = z.output<typeof positionFormSchema>;
export type DepartmentRequest = z.infer<typeof departmentRequestSchema>;
export type PositionRequest = z.infer<typeof positionRequestSchema>;
export type DeleteMessageResponse = z.infer<typeof deleteMessageResponseSchema>;

export type DepartmentField = keyof DepartmentFormValues;
export type PositionField = keyof PositionFormValues;
