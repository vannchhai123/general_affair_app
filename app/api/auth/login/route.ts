import { NextResponse } from 'next/server';
import { users } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = users.find(
      (u) => u.username === username && u.password === password && u.status === 'active',
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const sessionData = Buffer.from(
      JSON.stringify({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name,
      }),
    ).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_name: user.role_name,
      },
    });

    response.cookies.set('session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
