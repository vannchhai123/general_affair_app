import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/api/auth';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}
