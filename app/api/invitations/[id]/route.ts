import { NextResponse } from 'next/server';
import { invitations, officers } from '@/lib/mock-data';
import { invitationFormSchema } from '@/lib/schemas/invitation/invitation';

function enrichInvitation(invitation: (typeof invitations)[number]) {
  return {
    ...invitation,
    assigned_officers: invitation.assigned_officer_ids
      .map((officerId) => officers.find((officer) => officer.id === officerId))
      .filter((officer): officer is NonNullable<typeof officer> => Boolean(officer))
      .map((officer) => ({
        id: officer.id,
        first_name: officer.first_name,
        last_name: officer.last_name,
        department: officer.department,
        position: officer.position,
        officerCode: officer.officerCode,
      })),
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = invitationFormSchema.partial().safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: payload.error.issues[0]?.message ?? 'Invalid invitation payload' },
        { status: 400 },
      );
    }

    const index = invitations.findIndex((i) => i.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const body = payload.data;

    invitations[index] = {
      ...invitations[index],
      ...(body.subject !== undefined ? { subject: body.subject } : {}),
      ...(body.organization !== undefined ? { organization: body.organization } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.date !== undefined ? { date: body.date } : {}),
      ...(body.time !== undefined ? { time: body.time || null } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.officers !== undefined ? { assigned_officer_ids: body.officers } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(enrichInvitation(invitations[index]));
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
