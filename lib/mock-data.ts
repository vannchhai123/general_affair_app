// ─── Types ─────────────────────────────────────────────
export interface Officer {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  status: string;
  username?: string;
  officerCode?: string;
}

export interface Attendance {
  id: number;
  officer_id: number;
  date: string;
  total_work_minutes: number;
  total_late_minutes: number;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  first_name: string;
  last_name: string;
  department: string;
  sessions: AttendanceSession[] | null;
}

export interface AttendanceSession {
  id: number;
  shift_name: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

export interface Invitation {
  id: number;
  subject: string;
  organization: string;
  type: 'incoming' | 'outgoing';
  date: string;
  time?: string | null;
  location: string;
  description?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_officer_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: number;
  officer_id: number;
  approved_by: number | null;
  start_date: string;
  end_date: string;
  purpose: string;
  location: string;
  status: string;
  approved_date: string | null;
  first_name: string;
  last_name: string;
  department: string;
  approver_name: string | null;
}

export interface LeaveRequest {
  id: number;
  officer_id: number;
  approved_by: number | null;
  start_date: string;
  end_date: string;
  leave_type: string;
  total_days: number;
  reason: string;
  status: string;
  approved_at: string | null;
  first_name: string;
  last_name: string;
  department: string;
  approver_name: string | null;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Permission {
  id: number;
  permission_name: string;
  description?: string;
  category?: string;
}

export interface OfficerPermission {
  id: number;
  officer_id: number;
  permission_id: number;
  granted_at: string;
  granted_by: number | null;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  action: string;
  table_name: string;
  record_id: number;
  file_path: string | null;
  timestamp: string;
  full_name: string;
}

// ─── Mock Data ─────────────────────────────────────────

let nextOfficerId = 9;
let nextAttendanceId = 9;
let nextInvitationId = 4;
let nextMissionId = 4;
let nextLeaveId = 4;
let nextShiftId = 4;
let nextPermissionId = 11;
let nextOfficerPermissionId = 9;

export const users = [
  {
    id: 1,
    role_id: 1,
    full_name: 'System Admin',
    username: 'admin',
    password: 'admin123',
    status: 'active',
    role_name: 'Admin',
  },
  {
    id: 2,
    role_id: 2,
    full_name: 'John Manager',
    username: 'manager1',
    password: 'manager123',
    status: 'active',
    role_name: 'Manager',
  },
];

export const officers: Officer[] = [
  {
    id: 1,
    user_id: null,
    first_name: 'James',
    last_name: 'Wilson',
    email: 'james.wilson@gov.org',
    position: 'Senior Officer',
    department: 'Operations',
    phone: '555-0101',
    status: 'active',
  },
  {
    id: 2,
    user_id: null,
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@gov.org',
    position: 'Field Officer',
    department: 'Intelligence',
    phone: '555-0102',
    status: 'active',
  },
  {
    id: 3,
    user_id: null,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@gov.org',
    position: 'Team Lead',
    department: 'Operations',
    phone: '555-0103',
    status: 'active',
  },
  {
    id: 4,
    user_id: null,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@gov.org',
    position: 'Analyst',
    department: 'Intelligence',
    phone: '555-0104',
    status: 'active',
  },
  {
    id: 5,
    user_id: null,
    first_name: 'Robert',
    last_name: 'Martinez',
    email: 'robert.martinez@gov.org',
    position: 'Officer',
    department: 'Logistics',
    phone: '555-0105',
    status: 'on_leave',
  },
  {
    id: 6,
    user_id: null,
    first_name: 'Lisa',
    last_name: 'Anderson',
    email: 'lisa.anderson@gov.org',
    position: 'Coordinator',
    department: 'Logistics',
    phone: '555-0106',
    status: 'active',
  },
  {
    id: 7,
    user_id: null,
    first_name: 'David',
    last_name: 'Taylor',
    email: 'david.taylor@gov.org',
    position: 'Senior Analyst',
    department: 'Intelligence',
    phone: '555-0107',
    status: 'active',
  },
  {
    id: 8,
    user_id: null,
    first_name: 'Karen',
    last_name: 'Thomas',
    email: 'karen.thomas@gov.org',
    position: 'Deputy Lead',
    department: 'Operations',
    phone: '555-0108',
    status: 'inactive',
  },
];

export const shifts: Shift[] = [
  { id: 1, name: 'Morning Shift', start_time: '06:00:00', end_time: '14:00:00', is_active: true },
  { id: 2, name: 'Afternoon Shift', start_time: '14:00:00', end_time: '22:00:00', is_active: true },
  { id: 3, name: 'Night Shift', start_time: '22:00:00', end_time: '06:00:00', is_active: true },
];

export const attendance: Attendance[] = [
  {
    id: 1,
    officer_id: 1,
    date: '2026-02-26',
    total_work_minutes: 480,
    total_late_minutes: 0,
    status: 'APPROVED',
    approved_by: 1,
    approved_at: '2026-02-26T09:00:00',
    first_name: 'James',
    last_name: 'Wilson',
    department: 'Operations',
    sessions: [
      {
        id: 1,
        shift_name: 'Morning Shift',
        check_in: '06:00',
        check_out: '14:00',
        status: 'PRESENT',
      },
    ],
  },
  {
    id: 2,
    officer_id: 2,
    date: '2026-02-26',
    total_work_minutes: 450,
    total_late_minutes: 15,
    status: 'APPROVED',
    approved_by: 1,
    approved_at: '2026-02-26T09:10:00',
    first_name: 'Sarah',
    last_name: 'Chen',
    department: 'Intelligence',
    sessions: [
      {
        id: 2,
        shift_name: 'Morning Shift',
        check_in: '06:15',
        check_out: '13:45',
        status: 'PRESENT',
      },
    ],
  },
  {
    id: 3,
    officer_id: 3,
    date: '2026-02-26',
    total_work_minutes: 475,
    total_late_minutes: 5,
    status: 'PENDING',
    approved_by: null,
    approved_at: null,
    first_name: 'Michael',
    last_name: 'Brown',
    department: 'Operations',
    sessions: [
      {
        id: 3,
        shift_name: 'Morning Shift',
        check_in: '06:05',
        check_out: '13:55',
        status: 'PRESENT',
      },
    ],
  },
  {
    id: 4,
    officer_id: 4,
    date: '2026-02-26',
    total_work_minutes: 0,
    total_late_minutes: 0,
    status: 'ABSENT',
    approved_by: null,
    approved_at: null,
    first_name: 'Emily',
    last_name: 'Davis',
    department: 'Intelligence',
    sessions: null,
  },
  {
    id: 5,
    officer_id: 6,
    date: '2026-02-26',
    total_work_minutes: 460,
    total_late_minutes: 10,
    status: 'PENDING',
    approved_by: null,
    approved_at: null,
    first_name: 'Lisa',
    last_name: 'Anderson',
    department: 'Logistics',
    sessions: [
      {
        id: 4,
        shift_name: 'Afternoon Shift',
        check_in: '14:10',
        check_out: '22:00',
        status: 'PRESENT',
      },
    ],
  },
  {
    id: 6,
    officer_id: 7,
    date: '2026-02-25',
    total_work_minutes: 480,
    total_late_minutes: 0,
    status: 'APPROVED',
    approved_by: 1,
    approved_at: '2026-02-25T09:00:00',
    first_name: 'David',
    last_name: 'Taylor',
    department: 'Intelligence',
    sessions: [
      {
        id: 5,
        shift_name: 'Morning Shift',
        check_in: '06:00',
        check_out: '14:00',
        status: 'PRESENT',
      },
    ],
  },
  {
    id: 7,
    officer_id: 1,
    date: '2026-02-25',
    total_work_minutes: 470,
    total_late_minutes: 5,
    status: 'APPROVED',
    approved_by: 1,
    approved_at: '2026-02-25T09:05:00',
    first_name: 'James',
    last_name: 'Wilson',
    department: 'Operations',
    sessions: [
      {
        id: 6,
        shift_name: 'Morning Shift',
        check_in: '06:05',
        check_out: '13:55',
        status: 'PRESENT',
      },
    ],
  },
  {
    id: 8,
    officer_id: 3,
    date: '2026-02-25',
    total_work_minutes: 480,
    total_late_minutes: 0,
    status: 'APPROVED',
    approved_by: 1,
    approved_at: '2026-02-25T09:00:00',
    first_name: 'Michael',
    last_name: 'Brown',
    department: 'Operations',
    sessions: [
      {
        id: 7,
        shift_name: 'Morning Shift',
        check_in: '06:00',
        check_out: '14:00',
        status: 'PRESENT',
      },
    ],
  },
];

export const invitations: Invitation[] = [
  {
    id: 1,
    subject: 'Annual Security Conference 2026',
    organization: 'National Security Agency',
    type: 'incoming',
    date: '2026-03-15',
    time: '09:00',
    location: 'Convention Center Hall A',
    description:
      'Review security posture, inter-agency protocols, and preparedness planning for the 2026 operational year.',
    status: 'pending',
    assigned_officer_ids: [1, 2, 3, 4, 7],
    created_at: '2026-02-18T09:00:00.000Z',
    updated_at: '2026-02-20T10:30:00.000Z',
  },
  {
    id: 2,
    subject: 'Inter-Agency Coordination Meeting',
    organization: 'Department of Defense',
    type: 'outgoing',
    date: '2026-03-20',
    time: '14:30',
    location: 'Federal Building Room 301',
    description:
      'Coordinate departmental representation and finalize speaking points for the quarterly executive meeting.',
    status: 'accepted',
    assigned_officer_ids: [3, 6, 8],
    created_at: '2026-02-21T08:15:00.000Z',
    updated_at: '2026-02-23T12:45:00.000Z',
  },
  {
    id: 3,
    subject: 'Community Outreach Program',
    organization: 'Public Relations Office',
    type: 'outgoing',
    date: '2026-02-10',
    time: '10:00',
    location: 'City Community Center',
    description:
      'Deploy a mixed team for stakeholder engagement, public briefings, and post-event reporting.',
    status: 'completed',
    assigned_officer_ids: [2, 4, 5, 6],
    created_at: '2026-01-28T07:45:00.000Z',
    updated_at: '2026-02-11T16:10:00.000Z',
  },
  {
    id: 4,
    subject: 'Regional Security Roundtable',
    organization: 'Regional Affairs Bureau',
    type: 'incoming',
    date: '2026-04-07',
    time: '13:00',
    location: 'Embassy Annex Auditorium',
    description:
      'Review shared incident response processes with regional partners and confirm officer attendance roster.',
    status: 'rejected',
    assigned_officer_ids: [1, 7],
    created_at: '2026-03-29T11:20:00.000Z',
    updated_at: '2026-03-31T09:05:00.000Z',
  },
];

export const missions: Mission[] = [
  {
    id: 1,
    officer_id: 1,
    approved_by: 1,
    start_date: '2026-03-01',
    end_date: '2026-03-05',
    purpose: 'Border patrol assessment and security audit of southern checkpoints',
    location: 'Southern District',
    status: 'Approved',
    approved_date: '2026-02-25',
    first_name: 'James',
    last_name: 'Wilson',
    department: 'Operations',
    approver_name: 'System Admin',
  },
  {
    id: 2,
    officer_id: 2,
    approved_by: null,
    start_date: '2026-03-10',
    end_date: '2026-03-12',
    purpose: 'Intelligence gathering and threat assessment in eastern sector',
    location: 'Eastern District',
    status: 'Pending',
    approved_date: null,
    first_name: 'Sarah',
    last_name: 'Chen',
    department: 'Intelligence',
    approver_name: null,
  },
  {
    id: 3,
    officer_id: 3,
    approved_by: null,
    start_date: '2026-03-15',
    end_date: '2026-03-20',
    purpose: 'Coordination with allied agencies for joint training exercise',
    location: 'Training Facility Alpha',
    status: 'Pending',
    approved_date: null,
    first_name: 'Michael',
    last_name: 'Brown',
    department: 'Operations',
    approver_name: null,
  },
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: 1,
    officer_id: 5,
    approved_by: 1,
    start_date: '2026-02-20',
    end_date: '2026-02-28',
    leave_type: 'Annual',
    total_days: 7,
    reason: 'Family vacation',
    status: 'Approved',
    approved_at: '2026-02-18',
    first_name: 'Robert',
    last_name: 'Martinez',
    department: 'Logistics',
    approver_name: 'System Admin',
  },
  {
    id: 2,
    officer_id: 4,
    approved_by: null,
    start_date: '2026-03-05',
    end_date: '2026-03-07',
    leave_type: 'Sick',
    total_days: 3,
    reason: 'Medical appointment and recovery',
    status: 'Pending',
    approved_at: null,
    first_name: 'Emily',
    last_name: 'Davis',
    department: 'Intelligence',
    approver_name: null,
  },
  {
    id: 3,
    officer_id: 6,
    approved_by: null,
    start_date: '2026-03-10',
    end_date: '2026-03-11',
    leave_type: 'Personal',
    total_days: 2,
    reason: 'Personal matters',
    status: 'Pending',
    approved_at: null,
    first_name: 'Lisa',
    last_name: 'Anderson',
    department: 'Logistics',
    approver_name: null,
  },
];

export const auditLog: AuditLogEntry[] = [
  {
    id: 1,
    user_id: 1,
    action: 'LOGIN',
    table_name: 'user',
    record_id: 1,
    file_path: null,
    timestamp: '2026-02-26T08:00:00',
    full_name: 'System Admin',
  },
  {
    id: 2,
    user_id: 1,
    action: 'CREATE',
    table_name: 'officers',
    record_id: 1,
    file_path: null,
    timestamp: '2026-02-26T08:15:00',
    full_name: 'System Admin',
  },
  {
    id: 3,
    user_id: 1,
    action: 'APPROVE',
    table_name: 'attendance',
    record_id: 1,
    file_path: null,
    timestamp: '2026-02-26T09:00:00',
    full_name: 'System Admin',
  },
  {
    id: 4,
    user_id: 1,
    action: 'APPROVE',
    table_name: 'attendance',
    record_id: 2,
    file_path: null,
    timestamp: '2026-02-26T09:10:00',
    full_name: 'System Admin',
  },
  {
    id: 5,
    user_id: 1,
    action: 'APPROVE',
    table_name: 'leave_request',
    record_id: 1,
    file_path: null,
    timestamp: '2026-02-18T10:00:00',
    full_name: 'System Admin',
  },
  {
    id: 6,
    user_id: 1,
    action: 'APPROVE',
    table_name: 'mission',
    record_id: 1,
    file_path: null,
    timestamp: '2026-02-25T14:00:00',
    full_name: 'System Admin',
  },
  {
    id: 7,
    user_id: 2,
    action: 'LOGIN',
    table_name: 'user',
    record_id: 2,
    file_path: null,
    timestamp: '2026-02-25T07:30:00',
    full_name: 'John Manager',
  },
  {
    id: 8,
    user_id: 2,
    action: 'UPDATE',
    table_name: 'officers',
    record_id: 5,
    file_path: null,
    timestamp: '2026-02-25T08:00:00',
    full_name: 'John Manager',
  },
];

export const permissions: Permission[] = [
  {
    id: 1,
    permission_name: 'officer.view',
    description: 'View officer records and information',
    category: 'Officers',
  },
  {
    id: 2,
    permission_name: 'officer.create',
    description: 'Create new officer records',
    category: 'Officers',
  },
  {
    id: 3,
    permission_name: 'officer.edit',
    description: 'Edit existing officer records',
    category: 'Officers',
  },
  {
    id: 4,
    permission_name: 'officer.delete',
    description: 'Delete officer records',
    category: 'Officers',
  },
  {
    id: 5,
    permission_name: 'attendance.view',
    description: 'View attendance records',
    category: 'Attendance',
  },
  {
    id: 6,
    permission_name: 'attendance.approve',
    description: 'Approve or reject attendance records',
    category: 'Attendance',
  },
  {
    id: 7,
    permission_name: 'mission.view',
    description: 'View mission records',
    category: 'Missions',
  },
  {
    id: 8,
    permission_name: 'mission.approve',
    description: 'Approve or reject mission requests',
    category: 'Missions',
  },
  {
    id: 9,
    permission_name: 'leave.view',
    description: 'View leave requests',
    category: 'Leave Management',
  },
  {
    id: 10,
    permission_name: 'leave.approve',
    description: 'Approve or reject leave requests',
    category: 'Leave Management',
  },
];

export const officerPermissions: OfficerPermission[] = [
  {
    id: 1,
    officer_id: 1,
    permission_id: 1,
    granted_at: '2026-01-15T08:00:00',
    granted_by: 1,
  },
  {
    id: 2,
    officer_id: 1,
    permission_id: 2,
    granted_at: '2026-01-15T08:00:00',
    granted_by: 1,
  },
  {
    id: 3,
    officer_id: 1,
    permission_id: 3,
    granted_at: '2026-01-15T08:00:00',
    granted_by: 1,
  },
  {
    id: 4,
    officer_id: 1,
    permission_id: 5,
    granted_at: '2026-01-15T08:00:00',
    granted_by: 1,
  },
  {
    id: 5,
    officer_id: 2,
    permission_id: 1,
    granted_at: '2026-01-20T09:00:00',
    granted_by: 1,
  },
  {
    id: 6,
    officer_id: 2,
    permission_id: 6,
    granted_at: '2026-01-20T09:00:00',
    granted_by: 1,
  },
  {
    id: 7,
    officer_id: 3,
    permission_id: 1,
    granted_at: '2026-02-01T10:00:00',
    granted_by: 1,
  },
  {
    id: 8,
    officer_id: 3,
    permission_id: 7,
    granted_at: '2026-02-01T10:00:00',
    granted_by: 1,
  },
];

// ─── Helper functions to get next IDs ──────────────────
export function getNextOfficerId() {
  return nextOfficerId++;
}
export function getNextAttendanceId() {
  return nextAttendanceId++;
}
export function getNextInvitationId() {
  return nextInvitationId++;
}
export function getNextMissionId() {
  return nextMissionId++;
}
export function getNextLeaveId() {
  return nextLeaveId++;
}
export function getNextShiftId() {
  return nextShiftId++;
}
export function getNextPermissionId() {
  return nextPermissionId++;
}
export function getNextOfficerPermissionId() {
  return nextOfficerPermissionId++;
}
