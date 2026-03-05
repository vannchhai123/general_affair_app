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
  title: string;
  organizer: string;
  date: string;
  location: string;
  status: string;
  image_url: string | null;
  total_assigned: number;
  accepted_count: number;
  pending_count: number;
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
    title: 'Annual Security Conference 2026',
    organizer: 'National Security Agency',
    date: '2026-03-15',
    location: 'Convention Center Hall A',
    status: 'active',
    image_url: null,
    total_assigned: 5,
    accepted_count: 3,
    pending_count: 2,
  },
  {
    id: 2,
    title: 'Inter-Agency Coordination Meeting',
    organizer: 'Department of Defense',
    date: '2026-03-20',
    location: 'Federal Building Room 301',
    status: 'active',
    image_url: null,
    total_assigned: 3,
    accepted_count: 1,
    pending_count: 2,
  },
  {
    id: 3,
    title: 'Community Outreach Program',
    organizer: 'Public Relations Office',
    date: '2026-02-10',
    location: 'City Community Center',
    status: 'completed',
    image_url: null,
    total_assigned: 4,
    accepted_count: 4,
    pending_count: 0,
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
