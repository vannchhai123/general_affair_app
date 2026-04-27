import { NextResponse } from 'next/server';

const DEFAULT_RESET_PASSWORD_PATH = '/auth/forgot-password/reset-password';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  const email = body.email?.trim();
  const otp = body.otp?.trim();
  const newPassword = body.newPassword?.trim();
  const confirmPassword = body.confirmPassword?.trim();

  if (!email || !otp || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'សូមបំពេញព័ត៌មានទាំងអស់' }, { status: 400 });
  }

  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: 'លេខកូដ OTP ត្រូវតែមាន ៦ ខ្ទង់' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'ពាក្យសម្ងាត់មិនត្រូវគ្នា' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ' },
      { status: 400 },
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const resetPasswordPath =
    process.env.AUTH_FORGOT_PASSWORD_RESET_PASSWORD_PATH || DEFAULT_RESET_PASSWORD_PATH;

  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'មិនទាន់បានកំណត់ API URL' }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}${resetPasswordPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
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
          error: data.error || data.message || 'ការកំណត់ពាក្យសម្ងាត់ឡើងវិញមិនបានជោគជ័យ',
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'ពាក្យសម្ងាត់ត្រូវបានកំណត់ឡើងវិញដោយជោគជ័យ',
    });
  } catch {
    return NextResponse.json(
      { error: 'មិនអាចភ្ជាប់ទៅសេវាកំណត់ពាក្យសម្ងាត់ឡើងវិញបានទេ' },
      { status: 500 },
    );
  }
}
