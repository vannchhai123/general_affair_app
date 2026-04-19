'use client';

import { invitationsResponseSchema, invitationSchema, type Invitation } from '@/lib/schemas';
import type { InvitationFormValues } from '@/lib/schemas/invitation/invitation';

async function request<T>(
  input: RequestInfo,
  init: RequestInit,
  parser: { parse: (data: unknown) => T },
) {
  const response = await fetch(input, {
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
    request('/api/invitations', { method: 'GET', cache: 'no-store' }, invitationsResponseSchema),
  create: async (data: InvitationFormValues) =>
    request('/api/invitations', { method: 'POST', body: JSON.stringify(data) }, invitationSchema),
  update: async (id: number, data: Partial<InvitationFormValues>) =>
    request(
      `/api/invitations/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      invitationSchema,
    ),
  delete: async (id: number) => {
    await request(
      `/api/invitations/${id}`,
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
