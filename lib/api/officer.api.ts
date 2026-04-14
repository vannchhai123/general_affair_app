import { apiFetch } from '@/lib/client';
import type { CreateOfficer, UpdateOfficer } from '@/lib/schemas/api-schemas';

const OFFICER_ENDPOINT = '/officer';

export async function getOfficers(query: string) {
  const res = await apiFetch(`${OFFICER_ENDPOINT}?${query}`, {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch officers');
  return res.json();
}

export async function createOfficer(data: CreateOfficer) {
  const res = await apiFetch(OFFICER_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create officer');
  return res.json();
}

export async function updateOfficer(id: number, data: UpdateOfficer) {
  const res = await apiFetch(`${OFFICER_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update officer');
  return res.json();
}

export async function deleteOfficer(id: number) {
  const res = await apiFetch(`${OFFICER_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete officer');
  return res.json();
}
