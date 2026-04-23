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
    current: () => [...queryKeys.qrSessions.all, 'current'] as const,
    today: () => [...queryKeys.qrSessions.all, 'today'] as const,
    detail: (id: string) => [...queryKeys.qrSessions.all, 'detail', id] as const,
    checkins: (sessionId: string) => [...queryKeys.qrSessions.all, 'checkins', sessionId] as const,
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
