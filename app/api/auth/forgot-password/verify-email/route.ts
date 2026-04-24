import { NextResponse } from 'next/server';

const DEFAULT_VERIFY_EMAIL_PATH = '/auth/forgot-password/verify-email';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
  };

  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const verifyEmailPath =
    process.env.AUTH_FORGOT_PASSWORD_VERIFY_EMAIL_PATH || DEFAULT_VERIFY_EMAIL_PATH;

  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}${verifyEmailPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error || data.message || 'Failed to verify email for password reset',
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        data.message ||
        'If an account exists for that email, password reset instructions have been sent.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to the password reset service' },
      { status: 500 },
    );
  }
}
