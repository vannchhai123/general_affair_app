import { apiFetch } from '@/lib/client';
import { parseApiError } from '@/lib/api-error';
import { invitationsResponseSchema, invitationSchema, type Invitation } from '@/lib/schemas';
import type { InvitationFormValues } from '@/lib/schemas/invitation/invitation';

async function request<T>(
  input: string,
  init: RequestInit,
  parser: { parse: (data: unknown) => T },
) {
  let response = await apiFetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  // If 404 on plural, try singular (e.g. /invitation vs /invitations)
  if (response.status === 404 && input.endsWith('s')) {
    const singularInput = input.slice(0, -1);
    const retryResponse = await apiFetch(singularInput, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
    if (retryResponse.ok) {
      response = retryResponse;
    }
  }

  if (!response.ok) {
    const message = await parseApiError(response, 'សំណើលិខិតអញ្ជើញបរាជ័យ');
    console.error(`[Invitation API Error] ${input}: status ${response.status}`, message);
    throw new Error(message);
  }

  const payload = await response.json().catch(() => null);
  try {
    return parser.parse(payload);
  } catch (zodErr) {
    console.error(`[Invitation Validation Warning]`, zodErr, payload);
    // If array fallback is available
    if (Array.isArray(payload)) return payload as unknown as T;
    if (payload && typeof payload === 'object') {
      if (Array.isArray((payload as any).content)) return (payload as any).content as unknown as T;
      if (Array.isArray((payload as any).data)) return (payload as any).data as unknown as T;
    }
    throw zodErr;
  }
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
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid delete response');
          }

          return data as { success?: boolean; message?: string };
        },
      },
    );
  },
};

export type { Invitation };
