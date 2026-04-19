'use server';

import { createSession, SessionUser } from '@/lib/api/auth';

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
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || 'Login failed' };
    }

    const data = await response.json();

    // Create server-side session
    await createSession({
      id: data.user?.id || 0,
      username: username,
      full_name: data.user?.fullName || username,
      role_id: data.user?.roleId || 0,
      role_name: data.user?.role || 'user',
    });

    // Return tokens to client
    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user?.id || 0,
        username: username,
        fullName: data.user?.fullName || username,
        roleId: data.user?.roleId || 0,
        role: data.user?.role || 'user',
      },
    };
  } catch (error) {
    return { error: 'Something went wrong. Please try again.' };
  }
}
