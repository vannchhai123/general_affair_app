import { NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/api/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(session);
}

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    full_name?: string;
    avatar_url?: string;
  };

  const fullName = body.full_name?.trim();
  const avatarUrl = body.avatar_url?.trim();

  const updatedSession = {
    ...session,
    ...(fullName ? { full_name: fullName } : {}),
    ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
  };

  await createSession(updatedSession);

  return NextResponse.json(updatedSession);
}
