'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Users,
  UserMinus,
  ClipboardCheck,
  UserX,
  Search,
  ExternalLink,
  Calendar,
  Clock,
  Building2,
  Phone,
  Briefcase,
  X,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getOfficerImageUrl, getOfficerInitials } from '@/lib/image-utils';
import type {
  DashboardStats,
  Officer,
  LeaveRequest,
  Attendance,
  QrSessionCheckIn,
  AbsentOfficer,
} from '@/lib/schemas';

export type StatModalType =
  | 'officers'
  | 'leaves'
  | 'present'
  | 'absent'
  | 'attendance'
  | 'qr_sessions'
  | null;

export type OfficerFilterType = 'all' | 'active' | 'on_leave' | 'inactive';
export type LeaveFilterType =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'Pending'
  | 'Approved'
  | 'Rejected';
export type AttendanceFilterType = 'all' | 'on_time' | 'late';

interface StatCardDetailDialogProps {
  type: StatModalType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardData?: DashboardStats;
  officers?: Officer[];
  leaveRequests?: LeaveRequest[];
  attendanceRecords?: Attendance[];
  qrCheckIns?: QrSessionCheckIn[];
  todayPresentRecords?: Attendance[];
  todayAbsentOfficers?: (AbsentOfficer | Officer)[];
  todayApprovedLeaves?: LeaveRequest[];
  initialOfficerFilter?: OfficerFilterType;
  initialLeaveFilter?: LeaveFilterType;
  initialAttendanceFilter?: AttendanceFilterType;
}

export function StatCardDetailDialog({
  type,
  open,
  onOpenChange,
  dashboardData,
  officers = [],
  leaveRequests = [],
  attendanceRecords = [],
  qrCheckIns = [],
  todayPresentRecords,
  todayAbsentOfficers,
  todayApprovedLeaves,
  initialOfficerFilter = 'all',
  initialLeaveFilter = 'all',
  initialAttendanceFilter = 'all',
}: StatCardDetailDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const getInitialFilter = () => {
    if (type === 'officers') return initialOfficerFilter || 'all';
    if (type === 'leaves') return initialLeaveFilter || 'all';
    if (type === 'present' || type === 'attendance') return initialAttendanceFilter || 'all';
    return 'all';
  };

  const [activeFilter, setActiveFilter] = useState<string>(getInitialFilter);

  // Sync initial filter when modal opens
  useEffect(() => {
    if (open) {
      setActiveFilter(getInitialFilter());
      setSearch('');
    }
  }, [open, type, initialOfficerFilter, initialLeaveFilter, initialAttendanceFilter]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch('');
      setActiveFilter(getInitialFilter());
    }
    onOpenChange(isOpen);
  };

  // 1. Filter Officers (All / Active / On Leave / Inactive)
  const filteredOfficers = useMemo(() => {
    if (type !== 'officers') return [];
    const query = search.trim().toLowerCase();

    return officers.filter((officer) => {
      const status = (officer.status || '').toLowerCase().trim();
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && (status === 'active' || status === 'សកម្ម')) ||
        (activeFilter === 'on_leave' &&
          ['on_leave', 'onleave', 'leave', 'សុំច្បាប់'].includes(status)) ||
        (activeFilter === 'inactive' &&
          (status === 'inactive' || status === 'deleted' || status === 'អសកម្ម'));

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchableText = [
        officer.first_name,
        officer.last_name,
        officer.first_name_kh,
        officer.last_name_kh,
        officer.email,
        officer.officerCode,
        officer.phone,
        officer.position,
        officer.department,
        officer.office,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [type, officers, search, activeFilter]);

  // 2. Filter Leaves
  const leavesToUse = useMemo(() => {
    if (leaveRequests && leaveRequests.length > 0) {
      return leaveRequests;
    }
    if (todayApprovedLeaves && todayApprovedLeaves.length > 0) {
      return todayApprovedLeaves;
    }
    return [];
  }, [leaveRequests, todayApprovedLeaves]);

  const pendingLeavesCount = useMemo(() => {
    return leavesToUse.filter((l) => (l.status || '').toLowerCase().trim() === 'pending').length;
  }, [leavesToUse]);

  const approvedLeavesCount = useMemo(() => {
    return leavesToUse.filter((l) => (l.status || '').toLowerCase().trim() === 'approved').length;
  }, [leavesToUse]);

  const rejectedLeavesCount = useMemo(() => {
    return leavesToUse.filter((l) => (l.status || '').toLowerCase().trim() === 'rejected').length;
  }, [leavesToUse]);

  const filteredLeaves = useMemo(() => {
    if (type !== 'leaves') return [];
    const query = search.trim().toLowerCase();

    return leavesToUse.filter((leave) => {
      const status = (leave.status || '').toLowerCase().trim();
      const normFilter = activeFilter.toLowerCase().trim();

      const matchesFilter =
        normFilter === 'all' ||
        (normFilter === 'pending' && status === 'pending') ||
        (normFilter === 'approved' && status === 'approved') ||
        (normFilter === 'rejected' && status === 'rejected');

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchableText = [
        leave.first_name,
        leave.last_name,
        leave.leave_type,
        leave.department,
        leave.reason,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [type, leavesToUse, search, activeFilter]);

  function formatLateDuration(totalMinutes: number | null | undefined): string {
    if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes) || totalMinutes <= 0) {
      return '0 នាទី';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours === 0) return `${minutes} នាទី`;
    if (minutes === 0) return `${hours} ម៉ោង`;
    return `${hours} ម៉ោង ${minutes} នាទី`;
  }

  function isRecordFromToday(dateStr?: string | null): boolean {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()) && d.toDateString() === today.toDateString()) return true;
    const todayYMD = today.toISOString().slice(0, 10);
    const localTodayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const clean = dateStr.slice(0, 10);
    return clean === todayYMD || clean === localTodayYMD;
  }

  // Combined attendance records strictly for today
  const combinedAttendance = useMemo(() => {
    // 1. If today's present records were returned by dedicated API endpoint
    if (todayPresentRecords && todayPresentRecords.length > 0) {
      return todayPresentRecords;
    }

    // 2. If attendanceRecords were fetched for today's date query
    if (attendanceRecords && attendanceRecords.length > 0) {
      return attendanceRecords.filter((rec) => {
        const s = (rec.status || '').toLowerCase().trim();
        return s !== 'absent' && s !== 'rejected';
      });
    }

    // 3. Otherwise check recent attendance strictly for today's date
    const recent = (dashboardData?.recent_attendance ?? []).filter((r) =>
      isRecordFromToday(r.date),
    );
    return recent.map((r) => ({
      id: r.id,
      officerId: r.officer?.id || 0,
      firstName: r.officer?.first_name_kh || r.officer?.first_name_en || '',
      lastName: r.officer?.last_name_kh || r.officer?.last_name_en || '',
      department: r.officer?.department || '',
      officerCode: '',
      date: r.date,
      checkIn: null,
      checkOut: null,
      totalWorkMin: r.total_work_minutes || 0,
      totalLateMin: r.total_late_minutes || 0,
      status: r.status || 'Present',
      imageUrl: null,
      sessions: [],
    })) as Attendance[];
  }, [todayPresentRecords, attendanceRecords, dashboardData]);

  // 3. Filter Present Today (វត្តមាន)
  const filteredPresent = useMemo(() => {
    if (type !== 'present' && type !== 'attendance') return [];
    const query = search.trim().toLowerCase();

    return combinedAttendance.filter((rec) => {
      const status = (rec.status || '').toLowerCase().trim();
      const isLate = status === 'late' || (rec.totalLateMin ?? 0) > 0;

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'on_time' && !isLate) ||
        (activeFilter === 'late' && isLate);

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchableText = [
        rec.firstName,
        rec.lastName,
        rec.officerCode,
        rec.department,
        rec.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [type, combinedAttendance, search, activeFilter]);

  // 4. Filter Absent Today (អវត្តមាន)
  const absentOfficers = useMemo(() => {
    if (type !== 'absent') return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Collect IDs of officers currently on approved leave today
    const onLeaveOfficerIds = new Set<number>();
    leaveRequests.forEach((leave) => {
      const status = (leave.status || '').toLowerCase().trim();
      if (status !== 'rejected') {
        if (leave.start_date && leave.end_date) {
          const start = new Date(leave.start_date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(leave.end_date);
          end.setHours(23, 59, 59, 999);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && today >= start && today <= end) {
            onLeaveOfficerIds.add(leave.officer_id);
          }
        } else if (status === 'approved') {
          onLeaveOfficerIds.add(leave.officer_id);
        }
      }
    });

    officers.forEach((o) => {
      const s = (o.status || '').toLowerCase().trim();
      if (['on_leave', 'onleave', 'leave', 'សុំច្បាប់'].includes(s)) {
        onLeaveOfficerIds.add(o.id);
      }
    });

    // 1. If today's absent records were returned by dedicated API endpoint, still exclude on-leave officers
    if (todayAbsentOfficers && todayAbsentOfficers.length > 0) {
      return todayAbsentOfficers.filter((officer: any) => {
        const s = (officer.status || '').toLowerCase().trim();
        if (
          ['on_leave', 'onleave', 'leave', 'សុំច្បាប់', 'inactive', 'deleted', 'អសកម្ម'].includes(s)
        ) {
          return false;
        }
        if (onLeaveOfficerIds.has(officer.id)) return false;
        return true;
      });
    }

    // Collect IDs and codes of officers who attended TODAY
    const attendedOfficerIds = new Set<number>();
    const attendedCodes = new Set<string>();

    combinedAttendance.forEach((rec) => {
      const s = (rec.status || '').toLowerCase().trim();
      if (s !== 'absent' && s !== 'rejected') {
        if (rec.officerId) attendedOfficerIds.add(rec.officerId);
        if (rec.officerCode) attendedCodes.add(rec.officerCode.toLowerCase().trim());
      }
    });

    // Filter active officers who have neither attended today nor are on leave today
    return officers.filter((officer) => {
      const status = (officer.status || '').toLowerCase().trim();
      if (status === 'inactive' || status === 'deleted' || status === 'អសកម្ម') return false;
      if (['on_leave', 'onleave', 'leave', 'សុំច្បាប់'].includes(status)) return false;

      if (attendedOfficerIds.has(officer.id)) return false;
      if (officer.officerCode && attendedCodes.has(officer.officerCode.toLowerCase().trim()))
        return false;
      if (onLeaveOfficerIds.has(officer.id)) return false;

      return true;
    });
  }, [type, todayAbsentOfficers, officers, combinedAttendance, leaveRequests]);

  const filteredAbsent = useMemo(() => {
    if (type !== 'absent') return [];
    const query = search.trim().toLowerCase();

    return absentOfficers.filter((officer: any) => {
      if (!query) return true;

      const searchableText = [
        officer.firstName,
        officer.first_name,
        officer.lastName,
        officer.last_name,
        officer.firstNameKh,
        officer.first_name_kh,
        officer.lastNameKh,
        officer.last_name_kh,
        officer.email,
        officer.officerCode,
        officer.phone,
        officer.position,
        officer.department,
        officer.office,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [type, absentOfficers, search]);

  if (!type) return null;

  const activeOfficersCount = officers.filter((o) => {
    const s = (o.status || '').toLowerCase().trim();
    return s === 'active' || s === 'សកម្ម';
  }).length;
  const leaveOfficersCount = officers.filter((o) =>
    ['on_leave', 'onleave', 'leave', 'សុំច្បាប់'].includes((o.status || '').toLowerCase().trim()),
  ).length;
  const inactiveOfficersCount = officers.filter((o) => {
    const s = (o.status || '').toLowerCase().trim();
    return s === 'inactive' || s === 'deleted' || s === 'អសកម្ម';
  }).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Section */}
        <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {type === 'officers' && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80">
                  <Users className="h-5 w-5" />
                </div>
              )}
              {type === 'leaves' && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100/80">
                  <UserMinus className="h-5 w-5" />
                </div>
              )}
              {(type === 'present' || type === 'attendance') && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
              )}
              {type === 'absent' && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80">
                  <UserX className="h-5 w-5" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 font-khmer-moul-light">
                    {type === 'officers' && 'បញ្ជីឈ្មោះមន្ត្រី'}
                    {type === 'leaves' && 'បញ្ជីសំណើច្បាប់ឈប់សម្រាក'}
                    {(type === 'present' || type === 'attendance') && 'វត្តមាន'}
                    {type === 'absent' && 'អវត្តមាន'}
                  </DialogTitle>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {type === 'officers' && `${filteredOfficers.length} នាក់`}
                    {type === 'leaves' && `${filteredLeaves.length} សំណើ`}
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {type === 'officers' &&
                    `${activeOfficersCount} មន្ត្រីសកម្ម · ${leaveOfficersCount} សុំច្បាប់ · ${inactiveOfficersCount} ផ្អាកបណ្តោះអាសន្ន`}
                  {type === 'leaves' &&
                    `${pendingLeavesCount} រង់ចាំ · ${approvedLeavesCount} បានអនុម័ត · ${rejectedLeavesCount} បដិសេធ`}
                  {(type === 'present' || type === 'attendance') &&
                    `កំណត់ត្រាមន្ត្រីដែលបានចូលរួមបំពេញការងារប្រចាំថ្ងៃទី ${format(new Date(), 'dd/MM/yyyy')}`}
                  {type === 'absent'}
                </DialogDescription>
              </div>
            </div>

            {/* Quick Action Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-8 rounded-xl border-slate-200 text-xs font-medium hover:bg-slate-50 gap-1.5 text-slate-600"
              onClick={() => {
                onOpenChange(false);
                if (type === 'officers') router.push('/dashboard/officers');
                if (type === 'leaves') router.push('/dashboard/leave-requests');
                if (type === 'present' || type === 'attendance' || type === 'absent')
                  router.push('/dashboard/attendance');
              }}
            >
              <span>ទំព័រពេញ</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>

          {/* Simple Search & Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {type === 'officers' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ទាំងអស់ ({officers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('active')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    សកម្ម ({activeOfficersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('on_leave')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'on_leave'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                    }`}
                  >
                    សុំច្បាប់ ({leaveOfficersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('inactive')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'inactive'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    ផ្អាកបណ្តោះអាសន្ន ({inactiveOfficersCount})
                  </button>
                </>
              )}

              {type === 'leaves' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter.toLowerCase() === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ទាំងអស់ ({leavesToUse.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('pending')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter.toLowerCase() === 'pending'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    រង់ចាំ ({pendingLeavesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('approved')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter.toLowerCase() === 'approved'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    បានអនុម័ត ({approvedLeavesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('rejected')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter.toLowerCase() === 'rejected'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    បដិសេធ ({rejectedLeavesCount})
                  </button>
                </>
              )}

              {(type === 'present' || type === 'attendance') && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    វត្តមានទាំងអស់ ({combinedAttendance.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('on_time')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'on_time'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    ទាន់ពេល
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('late')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === 'late'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    មកយឺត
                  </button>
                </>
              )}

              {type === 'absent' && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    មិនទាន់ឆែកវត្តមាន ({absentOfficers.length} នាក់)
                  </span>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះ ឬកូដ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 rounded-xl border-slate-200 bg-slate-50/50 pl-8.5 text-xs focus-visible:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List Content */}
        <ScrollArea className="max-h-[65vh] min-h-[300px] overflow-y-auto">
          {/* 1. OFFICERS LIST */}
          {type === 'officers' && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredOfficers.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  មិនមានទិន្នន័យមន្ត្រីស្របតាមការស្វែងរកទេ
                </div>
              ) : (
                filteredOfficers.map((officer) => {
                  const fullNameKh =
                    `${officer.last_name_kh || officer.last_name || ''} ${officer.first_name_kh || officer.first_name || ''}`.trim();
                  const fullNameEn =
                    `${officer.first_name || ''} ${officer.last_name || ''}`.trim();
                  const imageUrl = getOfficerImageUrl(officer);
                  const initials = getOfficerInitials(officer);
                  const status = (officer.status || '').toLowerCase();

                  return (
                    <div
                      key={officer.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                          <AvatarImage src={imageUrl} alt={fullNameKh} className="object-cover" />
                          <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {fullNameKh || fullNameEn}
                            </span>
                            {officer.officerCode && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                                {officer.officerCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                            <span>{officer.position || 'មន្ត្រី'}</span>
                            {(officer.department || officer.office) && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">
                                  {officer.department || officer.office}
                                </span>
                              </>
                            )}
                            {officer.phone && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-400">{officer.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-13 sm:pl-0">
                        {status === 'active' || status === 'សកម្ម' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            សកម្ម
                          </span>
                        ) : ['on_leave', 'onleave', 'leave', 'សុំច្បាប់'].includes(status) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                            សុំច្បាប់
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            អសកម្ម
                          </span>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-2 rounded-lg"
                          onClick={() => {
                            onOpenChange(false);
                            router.push(`/dashboard/officers/${officer.id}`);
                          }}
                        >
                          មើលលម្អិត
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. LEAVES LIST */}
          {type === 'leaves' && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredLeaves.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  មិនមានទិន្នន័យសំណើច្បាប់ស្របតាមការស្វែងរកទេ
                </div>
              ) : (
                filteredLeaves.map((leave) => {
                  const fullName =
                    `${leave.last_name || ''} ${leave.first_name || ''}`.trim() || 'មន្ត្រី';
                  const initials = fullName.slice(0, 2);
                  const status = (leave.status || '').toLowerCase();

                  return (
                    <div
                      key={leave.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                          <AvatarFallback className="bg-violet-600 text-xs font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900">{fullName}</span>
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 whitespace-nowrap border border-blue-100">
                              {leave.leave_type || 'ច្បាប់ឈប់សម្រាក'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <div className="flex items-center gap-1 text-slate-600 font-medium">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>
                                {leave.start_date
                                  ? format(new Date(leave.start_date), 'dd/MM/yyyy')
                                  : '?'}
                                {' - '}
                                {leave.end_date
                                  ? format(new Date(leave.end_date), 'dd/MM/yyyy')
                                  : '?'}
                              </span>
                              <span className="text-slate-400 font-normal">
                                ({leave.total_days} ថ្ងៃ)
                              </span>
                            </div>
                            {leave.reason && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 italic truncate max-w-[200px]">
                                  "{leave.reason}"
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-13 sm:pl-0">
                        {status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            បានអនុម័ត
                          </span>
                        ) : status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            រង់ចាំ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            បដិសេធ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. PRESENT TODAY LIST */}
          {(type === 'present' || type === 'attendance') && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredPresent.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  មិនទាន់មានកំណត់ត្រាវត្តមានសម្រាប់ថ្ងៃនេះទេ
                </div>
              ) : (
                filteredPresent.map((rec, idx) => {
                  const fullName =
                    `${rec.lastName || ''} ${rec.firstName || ''}`.trim() || 'មន្ត្រី';
                  const initials = fullName.slice(0, 2);
                  const isLate =
                    (rec.status || '').toLowerCase() === 'late' || (rec.totalLateMin ?? 0) > 0;

                  return (
                    <div
                      key={rec.id || idx}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                          <AvatarImage src={rec.imageUrl || undefined} alt={fullName} />
                          <AvatarFallback className="bg-emerald-600 text-xs font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900">{fullName}</span>
                            {rec.officerCode && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                                {rec.officerCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>{rec.department || 'ទូទៅ'}</span>
                            {rec.checkIn && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-medium">
                                  ចូល៖ {format(new Date(rec.checkIn), 'h:mm a')}
                                </span>
                              </>
                            )}
                            {rec.checkOut && (
                              <>
                                <span>•</span>
                                <span className="text-blue-700 font-medium">
                                  ចេញ៖ {format(new Date(rec.checkOut), 'h:mm a')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-13 sm:pl-0">
                        {rec.totalLateMin ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                            យឺត {formatLateDuration(rec.totalLateMin)}
                          </span>
                        ) : null}

                        {isLate ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            មកយឺត
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            វត្តមាន
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. ABSENT TODAY LIST */}
          {type === 'absent' && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredAbsent.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  អស្ចារ្យណាស់! គ្មានមន្ត្រីអវត្តមានដោយគ្មានការអនុញ្ញាតឡើយ
                </div>
              ) : (
                filteredAbsent.map((rawOfficer: any) => {
                  const fullNameKh =
                    `${rawOfficer.lastNameKh || rawOfficer.last_name_kh || rawOfficer.lastName || rawOfficer.last_name || ''} ${rawOfficer.firstNameKh || rawOfficer.first_name_kh || rawOfficer.firstName || rawOfficer.first_name || ''}`.trim();
                  const fullNameEn =
                    `${rawOfficer.firstName || rawOfficer.first_name || ''} ${rawOfficer.lastName || rawOfficer.last_name || ''}`.trim();
                  const imageUrl = getOfficerImageUrl(rawOfficer);
                  const initials = getOfficerInitials(rawOfficer);
                  const officerCode = rawOfficer.officerCode || rawOfficer.officer_code || '';
                  const department = rawOfficer.department || rawOfficer.office || '';
                  const position = rawOfficer.position || 'មន្ត្រី';
                  const phone = rawOfficer.phone || '';

                  return (
                    <div
                      key={rawOfficer.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-rose-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                          <AvatarImage src={imageUrl} alt={fullNameKh} className="object-cover" />
                          <AvatarFallback className="bg-rose-600 text-xs font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900">
                              {fullNameKh || fullNameEn}
                            </span>
                            {officerCode && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                                {officerCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>{position}</span>
                            {department && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">{department}</span>
                              </>
                            )}
                            {phone && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-500 font-medium">
                                  📞 {phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-13 sm:pl-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 whitespace-nowrap border border-rose-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          អវត្តមាន (Absent)
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium px-2 rounded-lg"
                          onClick={() => {
                            onOpenChange(false);
                            router.push(`/dashboard/officers/${rawOfficer.id}`);
                          }}
                        >
                          មើលប្រវត្តិរូប
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            {type === 'officers' && `បង្ហាញ ${filteredOfficers.length} នៃ ${officers.length} នាក់`}
            {type === 'leaves' && `បង្ហាញ ${filteredLeaves.length} នាក់`}
            {(type === 'present' || type === 'attendance') &&
              `បង្ហាញ ${filteredPresent.length} នាក់`}
            {type === 'absent' && `បង្ហាញ ${filteredAbsent.length} នាក់`}
          </p>

          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-slate-200 text-xs font-medium hover:bg-white bg-white h-8"
            onClick={() => onOpenChange(false)}
          >
            បិទ (Close)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
