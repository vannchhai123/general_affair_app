import { z } from 'zod';
import { apiFetch } from '@/lib/client';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T, S extends z.ZodType<T>>(
  url: string,
  schema: S,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await apiFetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        (errorData as { error?: string }).error || `API request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData,
      );
    }

    const data = await response.json();
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      throw new ApiError(
        `Validation failed: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        500,
        'Validation Error',
        { zodErrors: parsed.error.errors },
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new ApiError(
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
        500,
        'Validation Error',
        { zodErrors: error.errors },
      );
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500,
      'Internal Error',
    );
  }
}

export const queryKeys = {
  officers: {
    all: ['officers'] as const,
    lists: () => [...queryKeys.officers.all, 'list'] as const,
    list: (filters: Record<string, string>) =>
      [...queryKeys.officers.lists(), { filters }] as const,
    details: () => [...queryKeys.officers.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.officers.details(), id] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...queryKeys.permissions.all, 'list'] as const,
    list: (filters?: Record<string, string>) =>
      [...queryKeys.permissions.lists(), { filters }] as const,
    details: () => [...queryKeys.permissions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.permissions.details(), id] as const,
  },
  rolePermissions: {
    all: ['rolePermissions'] as const,
    byRole: (role: string | number, params?: Record<string, string>) =>
      [...queryKeys.rolePermissions.all, role, params] as const,
  },
  officerPermissions: {
    all: ['officerPermissions'] as const,
    lists: () => [...queryKeys.officerPermissions.all, 'list'] as const,
    list: (filters?: Record<string, string>) =>
      [...queryKeys.officerPermissions.lists(), { filters }] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters?: Record<string, string>) =>
      [...queryKeys.attendance.lists(), { filters }] as const,
  },
  qrSessions: {
    all: ['qrSessions'] as const,
    lists: () => [...queryKeys.qrSessions.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.qrSessions.all, 'detail', id] as const,
  },
  invitations: {
    all: ['invitations'] as const,
    lists: () => [...queryKeys.invitations.all, 'list'] as const,
  },
  missions: {
    all: ['missions'] as const,
    lists: () => [...queryKeys.missions.all, 'list'] as const,
  },
  leaveRequests: {
    all: ['leaveRequests'] as const,
    lists: () => [...queryKeys.leaveRequests.all, 'list'] as const,
  },
  shifts: {
    all: ['shifts'] as const,
    lists: () => [...queryKeys.shifts.all, 'list'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
  },
  reports: {
    all: ['reports'] as const,
  },
} as const;
