export interface Officer {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface Invitation {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  invitedOfficers: number;
  confirmedOfficers: number;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  officerId: number;
  officerName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hours: number;
}

export interface Mission {
  id: number;
  officer_id: number;
  approved_id: number | null;
  start_date: string;
  end_date: string;
  purpose: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  approved_date: string | null;
}

// Mock Mission Data
export const initialMissions: Mission[] = [
  {
    id: 1,
    officer_id: 1,
    approved_id: 8,
    start_date: '2026-03-01',
    end_date: '2026-03-05',
    purpose: 'Investigate reported fraud case in district 7',
    location: 'District 7 - Downtown',
    status: 'Approved',
    approved_date: '2026-02-20',
  },
  {
    id: 2,
    officer_id: 2,
    approved_id: null,
    start_date: '2026-03-10',
    end_date: '2026-03-12',
    purpose: 'Undercover surveillance operation at harbor',
    location: 'Harbor District',
    status: 'Pending',
    approved_date: null,
  },
  {
    id: 3,
    officer_id: 5,
    approved_id: 8,
    start_date: '2026-02-15',
    end_date: '2026-02-20',
    purpose: 'Community outreach and safety awareness program',
    location: 'West Side Community Center',
    status: 'Completed',
    approved_date: '2026-02-10',
  },
  {
    id: 4,
    officer_id: 7,
    approved_id: 1,
    start_date: '2026-03-08',
    end_date: '2026-03-08',
    purpose: 'Traffic control for annual city parade',
    location: 'Main Street & 5th Ave',
    status: 'Approved',
    approved_date: '2026-02-22',
  },
  {
    id: 5,
    officer_id: 4,
    approved_id: null,
    start_date: '2026-03-15',
    end_date: '2026-03-18',
    purpose: 'Cross-department joint training exercise',
    location: 'Training Facility B',
    status: 'Pending',
    approved_date: null,
  },
  {
    id: 6,
    officer_id: 2,
    approved_id: 1,
    start_date: '2026-02-10',
    end_date: '2026-02-14',
    purpose: 'Evidence collection at crime scene',
    location: 'Industrial Park Zone',
    status: 'Completed',
    approved_date: '2026-02-08',
  },
  {
    id: 7,
    officer_id: 7,
    approved_id: null,
    start_date: '2026-04-01',
    end_date: '2026-04-03',
    purpose: 'Patrol coverage for upcoming festival',
    location: 'Central Park Area',
    status: 'Pending',
    approved_date: null,
  },
  {
    id: 8,
    officer_id: 5,
    approved_id: 8,
    start_date: '2026-02-25',
    end_date: '2026-03-01',
    purpose: 'Witness protection escort and transfer',
    location: 'Classified',
    status: 'In Progress',
    approved_date: '2026-02-23',
  },
];

// Mock Officer Data
export const initialOfficers: Officer[] = [
  {
    id: 1,
    user_id: 101,
    first_name: 'James',
    last_name: 'Wilson',
    email: 'j.wilson@dept.gov',
    position: 'Captain',
    department: 'Operations',
    phone: '+1-555-0101',
    status: 'active',
  },
  {
    id: 2,
    user_id: 102,
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 's.chen@dept.gov',
    position: 'Lieutenant',
    department: 'Investigations',
    phone: '+1-555-0102',
    status: 'active',
  },
  {
    id: 3,
    user_id: 103,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'm.brown@dept.gov',
    position: 'Sergeant',
    department: 'Patrol',
    phone: '+1-555-0103',
    status: 'on-leave',
  },
  {
    id: 4,
    user_id: 104,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'e.davis@dept.gov',
    position: 'Officer',
    department: 'Traffic',
    phone: '+1-555-0104',
    status: 'active',
  },
  {
    id: 5,
    user_id: 105,
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'r.johnson@dept.gov',
    position: 'Detective',
    department: 'Investigations',
    phone: '+1-555-0105',
    status: 'active',
  },
  {
    id: 6,
    user_id: 106,
    first_name: 'Lisa',
    last_name: 'Anderson',
    email: 'l.anderson@dept.gov',
    position: 'Officer',
    department: 'Community',
    phone: '+1-555-0106',
    status: 'inactive',
  },
  {
    id: 7,
    user_id: 107,
    first_name: 'David',
    last_name: 'Martinez',
    email: 'd.martinez@dept.gov',
    position: 'Sergeant',
    department: 'Patrol',
    phone: '+1-555-0107',
    status: 'active',
  },
  {
    id: 8,
    user_id: 108,
    first_name: 'Amanda',
    last_name: 'Taylor',
    email: 'a.taylor@dept.gov',
    position: 'Lieutenant',
    department: 'Operations',
    phone: '+1-555-0108',
    status: 'active',
  },
];

// Mock Invitation Data
export const initialInvitations: Invitation[] = [
  {
    id: 'INV-001',
    title: 'Annual Training Conference',
    eventDate: '2026-04-15',
    location: 'Main Auditorium',
    invitedOfficers: 45,
    confirmedOfficers: 38,
    status: 'sent',
    createdAt: '2026-02-01',
  },
  {
    id: 'INV-002',
    title: 'Community Engagement Event',
    eventDate: '2026-03-20',
    location: 'City Hall',
    invitedOfficers: 20,
    confirmedOfficers: 15,
    status: 'completed',
    createdAt: '2026-01-15',
  },
  {
    id: 'INV-003',
    title: 'Firearm Certification',
    eventDate: '2026-05-10',
    location: 'Training Range',
    invitedOfficers: 30,
    confirmedOfficers: 0,
    status: 'pending',
    createdAt: '2026-02-20',
  },
  {
    id: 'INV-004',
    title: 'Leadership Workshop',
    eventDate: '2026-06-01',
    location: 'Conference Room A',
    invitedOfficers: 12,
    confirmedOfficers: 8,
    status: 'sent',
    createdAt: '2026-02-10',
  },
  {
    id: 'INV-005',
    title: 'First Aid Refresher',
    eventDate: '2026-03-05',
    location: 'Medical Center',
    invitedOfficers: 50,
    confirmedOfficers: 50,
    status: 'completed',
    createdAt: '2025-12-20',
  },
  {
    id: 'INV-006',
    title: 'Cybersecurity Briefing',
    eventDate: '2026-07-15',
    location: 'Tech Lab',
    invitedOfficers: 25,
    confirmedOfficers: 0,
    status: 'pending',
    createdAt: '2026-02-22',
  },
];

// Mock Attendance Data
export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'ATT-001',
    officerId: 1,
    officerName: 'James Wilson',
    date: '2026-02-24',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'present',
    hours: 9,
  },
  {
    id: 'ATT-002',
    officerId: 2,
    officerName: 'Sarah Chen',
    date: '2026-02-24',
    checkIn: '08:15',
    checkOut: '17:30',
    status: 'present',
    hours: 9.25,
  },
  {
    id: 'ATT-003',
    officerId: 3,
    officerName: 'Michael Brown',
    date: '2026-02-24',
    checkIn: '',
    checkOut: '',
    status: 'absent',
    hours: 0,
  },
  {
    id: 'ATT-004',
    officerId: 4,
    officerName: 'Emily Davis',
    date: '2026-02-24',
    checkIn: '09:30',
    checkOut: '17:00',
    status: 'late',
    hours: 7.5,
  },
  {
    id: 'ATT-005',
    officerId: 5,
    officerName: 'Robert Johnson',
    date: '2026-02-24',
    checkIn: '08:00',
    checkOut: '13:00',
    status: 'half-day',
    hours: 5,
  },
  {
    id: 'ATT-006',
    officerId: 7,
    officerName: 'David Martinez',
    date: '2026-02-24',
    checkIn: '07:55',
    checkOut: '17:05',
    status: 'present',
    hours: 9.17,
  },
  {
    id: 'ATT-007',
    officerId: 8,
    officerName: 'Amanda Taylor',
    date: '2026-02-24',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'present',
    hours: 9,
  },
  {
    id: 'ATT-008',
    officerId: 1,
    officerName: 'James Wilson',
    date: '2026-02-23',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'present',
    hours: 9,
  },
  {
    id: 'ATT-009',
    officerId: 2,
    officerName: 'Sarah Chen',
    date: '2026-02-23',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'present',
    hours: 9,
  },
  {
    id: 'ATT-010',
    officerId: 4,
    officerName: 'Emily Davis',
    date: '2026-02-23',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'present',
    hours: 9,
  },
  {
    id: 'ATT-011',
    officerId: 5,
    officerName: 'Robert Johnson',
    date: '2026-02-23',
    checkIn: '',
    checkOut: '',
    status: 'absent',
    hours: 0,
  },
  {
    id: 'ATT-012',
    officerId: 7,
    officerName: 'David Martinez',
    date: '2026-02-23',
    checkIn: '08:45',
    checkOut: '17:00',
    status: 'late',
    hours: 8.25,
  },
];
