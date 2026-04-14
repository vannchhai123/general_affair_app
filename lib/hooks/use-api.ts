import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/client';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import {
  officersResponseSchema,
  officerSchema,
  createOfficerSchema,
  updateOfficerSchema,
  permissionsResponseSchema,
  permissionsListResponseSchema,
  permissionSchema,
  createPermissionSchema,
  updatePermissionSchema,
  assignPermissionToRoleSchema,
  officerPermissionsResponseSchema,
  assignPermissionSchema,
  successResponseSchema,
  officerPermissionSchema,
  backendOfficerPermissionsPaginatedResponseSchema,
  attendanceResponseSchema,
  attendanceSchema,
  invitationsResponseSchema,
  invitationSchema,
  missionsResponseSchema,
  missionSchema,
  leaveRequestsResponseSchema,
  leaveRequestSchema,
  shiftsResponseSchema,
  shiftSchema,
  dashboardStatsSchema,
  reportDataSchema,
  type Officer,
  type CreateOfficer,
  type UpdateOfficer,
  type Permission,
  type PermissionsPaginatedResponse,
  type CreatePermission,
  type UpdatePermission,
  type AssignPermissionToRole,
  type OfficerPermission,
  type Attendance,
  type Invitation,
  type Mission,
  type LeaveRequest,
  type Shift,
  type DashboardStats,
  type ReportData,
} from '@/lib/schemas/api-schemas';

const paginatedOfficersResponseSchema = z.object({
  content: officersResponseSchema,
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
  last: z.boolean().optional(),
});

const paginatedPermissionsResponseSchema = z.object({
  content: permissionsListResponseSchema,
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
  last: z.boolean().optional(),
});

async function fetchBackendData(endpoint: string): Promise<unknown> {
  const response = await apiFetch(endpoint);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { error?: string }).error || `API request failed: ${response.statusText}`,
      response.status,
      response.statusText,
      errorData,
    );
  }

  return response.json();
}

// ─── Officers Hooks ───────────────────────────────────────────

export function useOfficers(filters?: { search?: string; department?: string; status?: string }) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.department) queryParams.set('department', filters.department);
  if (filters?.status) queryParams.set('status', filters.status);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery({
    queryKey: queryKeys.officers.list(Object.fromEntries(queryParams)),
    queryFn: async () => {
      const data = await fetchBackendData(`/officer${queryString}`);

      const listResult = officersResponseSchema.safeParse(data);
      if (listResult.success) return listResult.data;

      const paginatedResult = paginatedOfficersResponseSchema.safeParse(data);
      if (paginatedResult.success) return paginatedResult.data.content;

      throw new ApiError('Validation failed: invalid officers response', 500, 'Validation Error');
    },
  }) as {
    data: Officer[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

export function useOfficer(id: number) {
  return useQuery({
    queryKey: queryKeys.officers.detail(id),
    queryFn: () => fetchApi(`/api/officer/${id}`, officerSchema),
    enabled: !!id,
  });
}

export function useCreateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfficer) =>
      fetchApi('/api/officer', officerSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('Officer created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOfficer }) =>
      fetchApi(`/api/officer/${id}`, officerSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('Officer updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/officer/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('Officer deleted successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Permissions Hooks ────────────────────────────────────────

export function usePermissionsByRole(role: string, params?: { page?: number; size?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.set('page', String(params.page));
  if (params?.size !== undefined) queryParams.set('size', String(params.size));

  return useQuery<PermissionsPaginatedResponse>({
    queryKey: queryKeys.rolePermissions.byRole(role, Object.fromEntries(queryParams)),
    queryFn: () =>
      fetchApi(
        `/api/permissions/${role}/permissions?${queryParams.toString()}`,
        permissionsResponseSchema,
      ),
    enabled: !!role,
  });
}

export function usePermission(id: number) {
  return useQuery<Permission>({
    queryKey: queryKeys.permissions.detail(id),
    queryFn: () => fetchApi(`/api/permissions/${id}`, permissionSchema),
    enabled: !!id,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation<Permission, ApiError, CreatePermission>({
    mutationFn: (data: CreatePermission) =>
      fetchApi('/api/permissions', permissionSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.all });
      toast.success('Permission created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation<Permission, ApiError, { id: number; data: UpdatePermission }>({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermission }) =>
      fetchApi(`/api/permissions/${id}`, permissionSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.all });
      toast.success('Permission updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/permissions/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.all });
      toast.success('Permission deleted successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useAssignPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, data }: { role: string; data: AssignPermissionToRole }) =>
      fetchApi(`/api/permissions/roles/${role}/assign`, successResponseSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions.byRole(variables.role) });
      toast.success('Permission assigned to role successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function usePermissions(category?: string) {
  const filters = category ? { category } : undefined;
  const queryParams = filters ? new URLSearchParams(filters) : null;
  const queryString = queryParams && queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery({
    queryKey: queryKeys.permissions.list(filters || {}),
    queryFn: async () => {
      const data = await fetchBackendData(`/permissions${queryString}`);

      const listResult = permissionsListResponseSchema.safeParse(data);
      if (listResult.success) return listResult.data;

      const paginatedResult = paginatedPermissionsResponseSchema.safeParse(data);
      if (paginatedResult.success) return paginatedResult.data.content;

      throw new ApiError(
        'Validation failed: invalid permissions response',
        500,
        'Validation Error',
      );
    },
  }) as {
    data: Permission[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

export function useOfficerPermissions() {
  return useQuery({
    queryKey: queryKeys.officerPermissions.lists(),
    queryFn: async () => {
      const response = await apiFetch('/officer-permissions');

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
      const parsed = backendOfficerPermissionsPaginatedResponseSchema.parse(data);

      return officerPermissionsResponseSchema.parse(
        parsed.content.map((assignment) => ({
          id: assignment.id,
          officer_id: assignment.officerId,
          permission_id: assignment.permissionId,
          granted_at: assignment.grantedAt,
          granted_by: assignment.grantedBy,
          officer_name: assignment.officerName,
          officer_department: assignment.officerDepartment,
          permission_name: assignment.permissionName,
          permission_category: assignment.permissionCategory,
        })),
      );
    },
  }) as {
    data: OfficerPermission[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

export function useAssignPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { officer_id: number; permission_id: number }) =>
      fetchApi('/api/officer-permissions', officerPermissionSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
      toast.success('Permission assigned to officer successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useRevokePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/officer-permissions/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.officerPermissions.all });
      toast.success('Permission revoked from officer successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Attendance Hooks ─────────────────────────────────────────

export function useAttendance() {
  return useQuery({
    queryKey: queryKeys.attendance.list(),
    queryFn: () => fetchApi('/api/attendance', attendanceResponseSchema),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Attendance>) =>
      fetchApi('/api/attendance', attendanceSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      toast.success('Attendance record created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Attendance> }) =>
      fetchApi(`/api/attendance/${id}`, attendanceSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      toast.success('Attendance updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Invitations Hooks ────────────────────────────────────────

export function useInvitations() {
  return useQuery({
    queryKey: queryKeys.invitations.lists(),
    queryFn: () => fetchApi('/api/invitations', invitationsResponseSchema),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Invitation>) =>
      fetchApi('/api/invitations', invitationSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      toast.success('Invitation created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Invitation> }) =>
      fetchApi(`/api/invitations/${id}`, invitationSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      toast.success('Invitation updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/invitations/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      toast.success('Invitation deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Missions Hooks ───────────────────────────────────────────

export function useMissions() {
  return useQuery({
    queryKey: queryKeys.missions.lists(),
    queryFn: () => fetchApi('/api/missions', missionsResponseSchema),
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Mission>) =>
      fetchApi('/api/missions', missionSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      toast.success('Mission created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Mission> }) =>
      fetchApi(`/api/missions/${id}`, missionSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      toast.success('Mission updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/missions/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      toast.success('Mission deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Leave Requests Hooks ─────────────────────────────────────

export function useLeaveRequests() {
  return useQuery({
    queryKey: queryKeys.leaveRequests.lists(),
    queryFn: () => fetchApi('/api/leave-requests', leaveRequestsResponseSchema),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) =>
      fetchApi('/api/leave-requests', leaveRequestSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Leave request created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LeaveRequest> }) =>
      fetchApi(`/api/leave-requests/${id}`, leaveRequestSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Leave request updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Shifts Hooks ─────────────────────────────────────────────

export function useShifts() {
  return useQuery({
    queryKey: queryKeys.shifts.lists(),
    queryFn: () => fetchApi('/api/shifts', shiftsResponseSchema),
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Shift>) =>
      fetchApi('/api/shifts', shiftSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Shift> }) =>
      fetchApi(`/api/shifts/${id}`, shiftSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/shifts/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// ─── Dashboard Hooks ──────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => fetchApi('/api/dashboard', dashboardStatsSchema),
  });
}

// ─── Reports Hooks ────────────────────────────────────────────

export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: () => fetchApi('/api/reports', reportDataSchema),
  });
}
