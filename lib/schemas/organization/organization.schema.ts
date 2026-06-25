import { z } from 'zod';
import { paginationSchema } from '@/lib/schemas/common';

const organizationStatusSchema = z
  .string()
  .transform((value) => value.toLowerCase())
  .pipe(z.enum(['active', 'inactive']));

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

export const departmentApiSchema = z.object({
  id: z.number(),
  uuid: z.string().nullable(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  manager: z.string().nullable(),
  officer_count: z.number(),
  status: organizationStatusSchema,
  description: z.string().nullable(),
});

export const positionApiSchema = z.object({
  id: z.number(),
  uuid: z.string().nullable(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  department_id: z.number(),
  department_name: z.string().nullable(),
  officer_count: z.number(),
  status: organizationStatusSchema,
  description: z.string().nullable(),
});

export const officeApiSchema = z.object({
  id: z.number(),
  uuid: z.string().nullable(),
  name: z.string().nullable(),
  code: z.string().nullable(),
  manager: z.string().nullable(),
  adminId: z.number().nullable(),
  adminName: z.string().nullable(),
  adminUsername: z.string().nullable(),
  officer_count: z.number(),
  status: organizationStatusSchema,
  description: z.string().nullable(),
});

export const departmentSchema = departmentApiSchema.transform((department) => ({
  id: department.id,
  uuid: department.uuid ?? '',
  name: department.name ?? '',
  code: department.code ?? '',
  manager: department.manager,
  officerCount: department.officer_count,
  status: department.status,
  description: department.description,
}));

export const positionSchema = positionApiSchema.transform((position) => ({
  id: position.id,
  uuid: position.uuid ?? '',
  title: position.title ?? '',
  code: position.code ?? '',
  departmentId: position.department_id,
  departmentName: position.department_name ?? '',
  officerCount: position.officer_count,
  status: position.status,
  description: position.description,
}));

export const officeSchema = officeApiSchema.transform((office) => ({
  id: office.id,
  uuid: office.uuid ?? '',
  name: office.name ?? '',
  code: office.code ?? '',
  manager: office.manager,
  adminId: office.adminId,
  adminName: office.adminName,
  adminUsername: office.adminUsername,
  officerCount: office.officer_count,
  status: office.status,
  description: office.description,
}));

export const departmentsListResponseSchema = paginationSchema.extend({
  content: z.array(departmentSchema),
});

export const positionsListResponseSchema = paginationSchema.extend({
  content: z.array(positionSchema),
});

export const officesListResponseSchema = paginationSchema.extend({
  content: z.array(officeSchema),
});

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
