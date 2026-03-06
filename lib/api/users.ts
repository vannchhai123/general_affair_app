import { apiFetch } from '@/lib/client';

export async function getUsers() {
  const res = await apiFetch('/users');

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}
