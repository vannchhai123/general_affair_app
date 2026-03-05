import { NextResponse } from 'next/server';
import { leaveRequests } from '@/lib/mock-data';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    const session = await getSession();

    const index = leaveRequests.findIndex((l) => l.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    leaveRequests[index] = {
      ...leaveRequests[index],
      status,
      approved_by: status === 'Approved' && session ? session.id : leaveRequests[index].approved_by,
      approved_at:
        status === 'Approved'
          ? new Date().toISOString().split('T')[0]
          : leaveRequests[index].approved_at,
      approver_name:
        status === 'Approved' && session ? session.full_name : leaveRequests[index].approver_name,
    };

    return NextResponse.json(leaveRequests[index]);
  } catch (error) {
    console.error('Leave request update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
