'use server';

import { createSession, SessionUser } from '@/lib/api/auth';

export async function createUserSession(user: SessionUser) {
  await createSession(user);
}
