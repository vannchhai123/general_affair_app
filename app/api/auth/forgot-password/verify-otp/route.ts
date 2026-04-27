import { NextResponse } from 'next/server';

const DEFAULT_VERIFY_OTP_PATH = '/auth/forgot-password/verify-otp';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    otp?: string;
  };

  const email = body.email?.trim();
  const otp = body.otp?.trim();

  if (!email || !otp) {
    return NextResponse.json({ error: 'សូមបញ្ចូលអ៊ីមែល និងលេខកូដ OTP' }, { status: 400 });
  }

  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: 'លេខកូដ OTP ត្រូវតែមាន ៦ ខ្ទង់' }, { status: 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const verifyOtpPath = process.env.AUTH_FORGOT_PASSWORD_VERIFY_OTP_PATH || DEFAULT_VERIFY_OTP_PATH;

  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'មិនទាន់បានកំណត់ API URL' }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}${verifyOtpPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error || data.message || 'ការផ្ទៀងផ្ទាត់លេខកូដ OTP មិនបានជោគជ័យ',
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        data.message ||
        'លេខកូដ OTP ត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ។ ឥឡូវនេះអ្នកអាចកំណត់ពាក្យសម្ងាត់ថ្មីបាន។',
    });
  } catch {
    return NextResponse.json({ error: 'មិនអាចភ្ជាប់ទៅសេវាផ្ទៀងផ្ទាត់ OTP បានទេ' }, { status: 500 });
  }
}
