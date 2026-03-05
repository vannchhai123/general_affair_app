import { NextResponse } from 'next/server';
import { invitations, getNextInvitationId } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Invitations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, organizer, date, location, status } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newInvitation = {
      id: getNextInvitationId(),
      title,
      organizer: organizer || '',
      date: date || '',
      location: location || '',
      status: status || 'active',
      image_url: null,
      total_assigned: 0,
      accepted_count: 0,
      pending_count: 0,
    };

    invitations.unshift(newInvitation);
    return NextResponse.json(newInvitation, { status: 201 });
  } catch (error) {
    console.error('Invitation create error:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
