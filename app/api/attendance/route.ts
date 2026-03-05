import { NextResponse } from 'next/server';
import { attendance, getNextAttendanceId, officers } from '@/lib/mock-data';

export async function GET() {
  try {
    const sorted = [...attendance].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Attendance fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { officer_id, date, total_work_minutes, total_late_minutes, status } = body;

    const officer = officers.find((o) => o.id === officer_id);
    if (!officer) {
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    const newAttendance = {
      id: getNextAttendanceId(),
      officer_id,
      date,
      total_work_minutes: total_work_minutes || 0,
      total_late_minutes: total_late_minutes || 0,
      status: status || 'PENDING',
      approved_by: null,
      approved_at: null,
      first_name: officer.first_name,
      last_name: officer.last_name,
      department: officer.department,
      sessions: null,
    };

    attendance.push(newAttendance);
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error('Attendance create error:', error);
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
}
