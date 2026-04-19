import { NextResponse } from 'next/server';
import { officers, attendance, invitations, missions, leaveRequests } from '@/lib/mock-data';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const officerStats = {
      total: officers.length,
      active: officers.filter((o) => o.status === 'active').length,
      on_leave: officers.filter((o) => o.status === 'on_leave').length,
    };

    const todayAttendance = attendance.filter((a) => a.date === today);
    const attendanceStats = {
      total: todayAttendance.length,
      approved: todayAttendance.filter((a) => a.status === 'APPROVED').length,
      pending: todayAttendance.filter((a) => a.status === 'PENDING').length,
      absent: todayAttendance.filter((a) => a.status === 'ABSENT').length,
    };

    const invitationStats = {
      total: invitations.length,
      active: invitations.filter((i) => i.status === 'pending' || i.status === 'accepted').length,
    };

    const missionStats = {
      total: missions.length,
      pending: missions.filter((m) => m.status === 'Pending').length,
      approved: missions.filter((m) => m.status === 'Approved').length,
    };

    const leaveStats = {
      total: leaveRequests.length,
      pending: leaveRequests.filter((l) => l.status === 'Pending').length,
    };

    const recentAttendance = [...attendance]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        total_work_minutes: a.total_work_minutes,
        total_late_minutes: a.total_late_minutes,
        first_name: a.first_name,
        last_name: a.last_name,
        department: a.department,
      }));

    return NextResponse.json({
      officers: officerStats,
      attendance: attendanceStats,
      invitations: invitationStats,
      missions: missionStats,
      leaves: leaveStats,
      recentAttendance,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
