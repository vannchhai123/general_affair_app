'use client';

import { apiFetch } from '@/lib/client';
import { invitationsResponseSchema, invitationSchema, type Invitation } from '@/lib/schemas';
import type { InvitationFormValues } from '@/lib/schemas/invitation/invitation';

async function request<T>(
  input: string,
  init: RequestInit,
  parser: { parse: (data: unknown) => T },
) {
  const response = await apiFetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String(payload.error)
        : 'Invitation request failed';
    throw new Error(message);
  }

  return parser.parse(payload);
}

export const invitationApi = {
  list: async () =>
    request('/invitations', { method: 'GET', cache: 'no-store' }, invitationsResponseSchema),
  create: async (data: InvitationFormValues) =>
    request('/invitations', { method: 'POST', body: JSON.stringify(data) }, invitationSchema),
  update: async (id: number, data: Partial<InvitationFormValues>) =>
    request(`/invitations/${id}`, { method: 'PUT', body: JSON.stringify(data) }, invitationSchema),
  delete: async (id: number) => {
    await request(
      `/invitations/${id}`,
      { method: 'DELETE' },
      {
        parse: (data: unknown) => {
          if (
            !data ||
            typeof data !== 'object' ||
            !('success' in data) ||
            typeof data.success !== 'boolean'
          ) {
            throw new Error('Invalid delete response');
          }

          return data as { success: boolean };
        },
      },
    );
  },
};

export type { Invitation };
