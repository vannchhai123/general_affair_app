import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/api/auth';

const DEFAULT_CHANGE_PASSWORD_PATH = '/auth/change-password';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  const currentPassword = body.currentPassword?.trim();
  const newPassword = body.newPassword?.trim();
  const confirmPassword = body.confirmPassword?.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters long' },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const changePasswordPath = process.env.AUTH_CHANGE_PASSWORD_PATH || DEFAULT_CHANGE_PASSWORD_PATH;

  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}${changePasswordPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error ||
            data.message ||
            'Failed to change password. Please verify the current password.',
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Password changed successfully',
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to the password service' },
      { status: 500 },
    );
  }
}
