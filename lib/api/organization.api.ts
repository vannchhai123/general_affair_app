import { z } from 'zod';
import { fetchApi, type ApiError } from '@/lib/api/fetcher';
import {
  type DeleteMessageResponse,
  deleteMessageResponseSchema,
  departmentFormSchema,
  departmentsListResponseSchema,
  departmentRequestSchema,
  departmentSchema,
  positionFormSchema,
  positionsListResponseSchema,
  positionRequestSchema,
  positionSchema,
  type DepartmentField,
  type DepartmentFormValues,
  type DepartmentRequest,
  type DepartmentsListResponse,
  type OrganizationStatus,
  type PositionField,
  type PositionFormValues,
  type PositionRequest,
  type PositionsListResponse,
} from '@/lib/schemas';

const ORGANIZATION_BASE = '/organizations';

export type DepartmentListParams = {
  search?: string;
  status?: OrganizationStatus;
  page?: number;
  size?: number;
};

export type PositionListParams = {
  search?: string;
  departmentId?: number;
  status?: OrganizationStatus;
  page?: number;
  size?: number;
};

type ValidationResult<TData, TField extends string> =
  | { success: true; data: TData }
  | { success: false; fieldErrors: Partial<Record<TField, string>> };

function buildQueryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function mapValidationIssues<TField extends string>(
  issues: z.ZodIssue[],
): Partial<Record<TField, string>> {
  const fieldErrors: Partial<Record<TField, string>> = {};

  issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === 'string' && !fieldErrors[field as TField]) {
      fieldErrors[field as TField] = issue.message;
    }
  });

  return fieldErrors;
}

function validateWithSchema<TOutput, TField extends string>(
  schema: { safeParse: (data: unknown) => z.SafeParseReturnType<unknown, TOutput> },
  input: unknown,
): ValidationResult<TOutput, TField> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapValidationIssues<TField>(parsed.error.issues),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function buildDepartmentListQuery(params: DepartmentListParams = {}) {
  return buildQueryString({
    search: params.search?.trim(),
    status: params.status?.toLowerCase(),
    page: params.page ?? 0,
    size: params.size ?? 10,
  });
}

export function buildPositionListQuery(params: PositionListParams = {}) {
  return buildQueryString({
    search: params.search?.trim(),
    department_id: params.departmentId,
    status: params.status?.toLowerCase(),
    page: params.page ?? 0,
    size: params.size ?? 10,
  });
}

export function validateDepartment(values: DepartmentFormValues) {
  return validateWithSchema<DepartmentRequest, DepartmentField>(departmentRequestSchema, values);
}

export function validatePosition(values: PositionFormValues) {
  return validateWithSchema<PositionRequest, PositionField>(positionRequestSchema, values);
}

async function organizationFetch<T, S extends z.ZodType<T, z.ZodTypeDef, any>>(
  path: string,
  schema: S,
  options?: RequestInit,
): Promise<T> {
  return fetchApi(`${ORGANIZATION_BASE}${path}`, schema, options);
}

export const organizationApi = {
  buildDepartmentListQuery,
  buildPositionListQuery,
  validateDepartment,
  validatePosition,
  getDepartments(params: DepartmentListParams = {}): Promise<DepartmentsListResponse> {
    return organizationFetch(
      `/department${buildDepartmentListQuery(params)}`,
      departmentsListResponseSchema,
    );
  },
  createDepartment(payload: DepartmentRequest) {
    return organizationFetch('/department', departmentSchema, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getDepartment(id: number) {
    return organizationFetch(`/department/${id}`, departmentSchema);
  },
  updateDepartment(id: number, payload: DepartmentRequest) {
    return organizationFetch(`/department/${id}`, departmentSchema, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteDepartment(id: number): Promise<DeleteMessageResponse> {
    return organizationFetch(`/department/${id}`, deleteMessageResponseSchema, {
      method: 'DELETE',
    });
  },
  getPositions(params: PositionListParams = {}): Promise<PositionsListResponse> {
    return organizationFetch(
      `/position${buildPositionListQuery(params)}`,
      positionsListResponseSchema,
    );
  },
  createPosition(payload: PositionRequest) {
    return organizationFetch('/position', positionSchema, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getPosition(id: number) {
    return organizationFetch(`/position/${id}`, positionSchema);
  },
  updatePosition(id: number, payload: PositionRequest) {
    return organizationFetch(`/position/${id}`, positionSchema, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deletePosition(id: number): Promise<DeleteMessageResponse> {
    return organizationFetch(`/position/${id}`, deleteMessageResponseSchema, {
      method: 'DELETE',
    });
  },
};

export function getDepartmentFieldErrors(error: unknown) {
  return (error as ApiError<DepartmentField>)?.fieldErrors ?? {};
}

export function getPositionFieldErrors(error: unknown) {
  return (error as ApiError<PositionField>)?.fieldErrors ?? {};
}
