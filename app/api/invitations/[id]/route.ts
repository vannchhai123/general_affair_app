import { NextResponse } from 'next/server';
import { invitations } from '@/lib/mock-data';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, organizer, date, location, status } = body;

    const index = invitations.findIndex((i) => i.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    invitations[index] = {
      ...invitations[index],
      title,
      organizer: organizer || '',
      date: date || '',
      location: location || '',
      status: status || 'active',
    };

    return NextResponse.json(invitations[index]);
  } catch (error) {
    console.error('Invitation update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const index = invitations.findIndex((i) => i.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    invitations.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invitation delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
