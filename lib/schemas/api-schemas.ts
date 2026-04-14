import { z } from 'zod';

// ─── Base Schemas ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

// ─── Officer Schemas ──────────────────────────────────────────

export const officerSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  position: z.string(),
  department: z.string(),
  phone: z.string(),
  status: z.string(),
  username: z.string().nullable().optional(),
});

export const officersResponseSchema = z.array(officerSchema);

export const createOfficerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  position: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
});

export const updateOfficerSchema = createOfficerSchema.partial();

// ─── Permission Schemas ───────────────────────────────────────

export const permissionSchema = z.object({
  id: z.number(),
  permission_name: z.string(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const permissionsResponseSchema = z.object({
  content: z.array(permissionSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

export const permissionsListResponseSchema = z.array(permissionSchema);

export const createPermissionSchema = z.object({
  permission_name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const updatePermissionSchema = z
  .object({
    permission_name: z.string().min(1, 'Permission name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
  })
  .partial();

export const assignPermissionToRoleSchema = z.object({
  permissionName: z.string().min(1, 'Permission name is required'),
});

// ─── Role Permission Schemas ──────────────────────────────────

export const rolePermissionsResponseSchema = z.object({
  content: z.array(permissionSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

// ─── Officer Permission Assignment Schemas ────────────────────

export const officerPermissionSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  permission_id: z.number(),
  granted_at: z.string(),
  officer_name: z.string(),
  officer_department: z.string(),
  permission_name: z.string(),
  permission_category: z.string(),
});

export const officerPermissionsResponseSchema = z.array(officerPermissionSchema);

export const backendOfficerPermissionSchema = z.object({
  id: z.number(),
  officerId: z.number(),
  permissionId: z.number(),
  grantedAt: z.string(),
  grantedBy: z.number().nullable(),
  officerName: z.string(),
  officerDepartment: z.string(),
  permissionName: z.string(),
  permissionCategory: z.string(),
});

export const backendOfficerPermissionsPaginatedResponseSchema = z.object({
  content: z.array(backendOfficerPermissionSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

export const assignPermissionSchema = z.object({
  officer_id: z.number(),
  permission_id: z.number(),
});

// ─── Attendance Schemas ───────────────────────────────────────

export const attendanceSessionSchema = z.object({
  id: z.number(),
  shift_name: z.string(),
  check_in: z.string(),
  check_out: z.string().nullable(),
  status: z.string(),
});

export const attendanceSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  date: z.string(),
  total_work_minutes: z.number(),
  total_late_minutes: z.number(),
  status: z.string(),
  approved_by: z.number().nullable(),
  approved_at: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  department: z.string(),
  sessions: z.array(attendanceSessionSchema).nullable(),
});

export const attendanceResponseSchema = z.array(attendanceSchema);

// ─── Invitation Schemas ───────────────────────────────────────

export const invitationSchema = z.object({
  id: z.number(),
  title: z.string(),
  organizer: z.string(),
  date: z.string(),
  location: z.string(),
  status: z.string(),
  image_url: z.string().nullable(),
  total_assigned: z.number(),
  accepted_count: z.number(),
  pending_count: z.number(),
});

export const invitationsResponseSchema = z.array(invitationSchema);

// ─── Mission Schemas ──────────────────────────────────────────

export const missionSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  approved_by: z.number().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  purpose: z.string(),
  location: z.string(),
  status: z.string(),
  approved_date: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  department: z.string(),
  approver_name: z.string().nullable(),
});

export const missionsResponseSchema = z.array(missionSchema);

// ─── Leave Request Schemas ────────────────────────────────────

export const leaveRequestSchema = z.object({
  id: z.number(),
  officer_id: z.number(),
  approved_by: z.number().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  leave_type: z.string(),
  total_days: z.number(),
  reason: z.string(),
  status: z.string(),
  approved_at: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  department: z.string(),
  approver_name: z.string().nullable(),
});

export const leaveRequestsResponseSchema = z.array(leaveRequestSchema);

// ─── Shift Schemas ────────────────────────────────────────────

export const shiftSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean(),
});

export const shiftsResponseSchema = z.array(shiftSchema);

// ─── Dashboard Schemas ────────────────────────────────────────

export const dashboardStatsSchema = z.object({
  officers: z.object({
    total: z.number(),
    active: z.number(),
    on_leave: z.number(),
    inactive: z.number(),
  }),
  attendance: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
    absent: z.number(),
  }),
  invitations: z.object({
    total: z.number(),
    active: z.number(),
    completed: z.number(),
  }),
  missions: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
  }),
  leave_requests: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
  }),
  recent_attendance: z.array(attendanceSchema),
});

// ─── Report Schemas ───────────────────────────────────────────

export const reportDataSchema = z.object({
  attendance_by_department: z.array(
    z.object({
      department: z.string(),
      total: z.number(),
      avg_work_minutes: z.number(),
      avg_late_minutes: z.number(),
    }),
  ),
  officers_by_department: z.array(
    z.object({
      department: z.string(),
      total: z.number(),
      active: z.number(),
    }),
  ),
  invitation_response_rates: z.array(
    z.object({
      title: z.string(),
      accepted: z.number(),
      pending: z.number(),
      declined: z.number(),
    }),
  ),
  leave_summary: z.array(
    z.object({
      leave_type: z.string(),
      total: z.number(),
      approved: z.number(),
      pending: z.number(),
    }),
  ),
  mission_summary: z.array(
    z.object({
      status: z.string(),
      total: z.number(),
    }),
  ),
  audit_log: z.array(
    z.object({
      id: z.number(),
      user_id: z.number(),
      action: z.string(),
      table_name: z.string(),
      record_id: z.number(),
      file_path: z.string().nullable(),
      timestamp: z.string(),
      full_name: z.string(),
    }),
  ),
});

// ─── Error Response Schema ────────────────────────────────────

export const errorResponseSchema = z.object({
  error: z.string(),
});

// ─── Success Response Schema ──────────────────────────────────

export const successResponseSchema = z.object({
  success: z.boolean(),
});

// ─── Type Exports ─────────────────────────────────────────────

export type Officer = z.infer<typeof officerSchema>;
export type CreateOfficer = z.infer<typeof createOfficerSchema>;
export type UpdateOfficer = z.infer<typeof updateOfficerSchema>;

export type Permission = z.infer<typeof permissionSchema>;
export type PermissionsPaginatedResponse = z.infer<typeof permissionsResponseSchema>;
export type CreatePermission = z.infer<typeof createPermissionSchema>;
export type UpdatePermission = z.infer<typeof updatePermissionSchema>;
export type AssignPermissionToRole = z.infer<typeof assignPermissionToRoleSchema>;

export type RolePermissionsResponse = z.infer<typeof rolePermissionsResponseSchema>;

export type OfficerPermission = z.infer<typeof officerPermissionSchema>;
export type AssignPermission = z.infer<typeof assignPermissionSchema>;

export type Attendance = z.infer<typeof attendanceSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type Mission = z.infer<typeof missionSchema>;
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export type Shift = z.infer<typeof shiftSchema>;

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type ReportData = z.infer<typeof reportDataSchema>;

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
