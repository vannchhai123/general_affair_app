import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/api/auth';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
  }

  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex !== -1 ? file.name.substring(dotIndex).toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WEBP are allowed' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
  }

  let buildUrl = apiBaseUrl.replace(/\/$/, '');
  if (!buildUrl.endsWith('/api/v1')) {
    buildUrl = `${buildUrl}/api/v1`;
  }

  try {
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch(`${buildUrl}/officer/me/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: backendFormData,
    });

    const responseData = (await response.json().catch(() => ({}))) as {
      imageUrl?: string;
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error || responseData.message || 'Failed to upload image' },
        { status: response.status },
      );
    }

    const avatarUrl = responseData.imageUrl;
    const updatedSession = {
      ...session,
      avatarUrl,
    };

    await createSession(updatedSession);

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to connect to the profile service' },
      { status: 500 },
    );
  }
}
