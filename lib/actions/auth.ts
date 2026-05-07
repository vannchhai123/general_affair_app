'use server';

import { cookies } from 'next/headers';
import { createSession } from '@/lib/api/auth';
import { normalizeSessionUser, type SessionUser } from '@/lib/auth/session';

function buildApiBaseUrl(baseUrl: string) {
  const normalized = baseUrl?.replace(/\/$/, '') ?? '';

  if (normalized.endsWith('/api/v1')) {
    return normalized;
  }

  return `${normalized}/api/v1`;
}

export async function createUserSession(user: SessionUser) {
  await createSession(user);
}

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  try {
    const apiBaseUrl = buildApiBaseUrl(process.env.NEXT_PUBLIC_API_URL as string);
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.message || 'Login failed' };
    }

    const data = await response.json();
    const authData = data.data ?? data.user ?? {};
    const user = normalizeSessionUser({
      uuid: authData.uuid,
      username,
      fullName: authData.fullName,
      role: authData.role,
      enabled: authData.enabled,
      avatarUrl: authData.avatarUrl ?? authData.imageUrl,
      permissions: authData.permissions,
    });

    await createSession(user);

    const cookieStore = await cookies();
    cookieStore.set('accessToken', data.accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    cookieStore.set('refreshToken', data.refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user,
    };
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }
}
