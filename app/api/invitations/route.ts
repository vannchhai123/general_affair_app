import { NextResponse } from 'next/server';
import { invitations, officers, getNextInvitationId } from '@/lib/mock-data';
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

export async function GET() {
  try {
    return NextResponse.json(invitations.map(enrichInvitation));
  } catch (error) {
    console.error('Invitations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = invitationFormSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: payload.error.issues[0]?.message ?? 'Invalid invitation payload' },
        { status: 400 },
      );
    }

    const body = payload.data;
    const timestamp = new Date().toISOString();

    const newInvitation = {
      id: getNextInvitationId(),
      subject: body.subject,
      organization: body.organization,
      type: body.type,
      date: body.date,
      time: body.time || null,
      location: body.location,
      description: body.description || null,
      status: body.status,
      assigned_officer_ids: body.officers || [],
      created_at: timestamp,
      updated_at: timestamp,
    };

    invitations.unshift(newInvitation);
    return NextResponse.json(enrichInvitation(newInvitation), { status: 201 });
  } catch (error) {
    console.error('Invitation create error:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
