'use client';

import Cookies from 'js-cookie';

const API_BASE_URL = buildApiBaseUrl(process.env.NEXT_PUBLIC_API_URL as string);

function buildApiBaseUrl(baseUrl: string) {
  const normalized = baseUrl?.replace(/\/$/, '') ?? '';

  if (normalized.endsWith('/api/v1')) {
    return normalized;
  }

  return `${normalized}/api/v1`;
}

type FetchOptions = RequestInit & {
  retry?: boolean;
};

export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  const accessToken = Cookies.get('accessToken');
  const isFormDataBody = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormDataBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !options.retry) {
    const refreshed = await refreshToken();

    if (refreshed) {
      return apiFetch(endpoint, { ...options, retry: true });
    }
  }

  return response;
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = Cookies.get('refreshToken');

  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    logout();
    return false;
  }

  const data = await response.json();

  Cookies.set('accessToken', data.accessToken);
  Cookies.set('refreshToken', data.refreshToken);

  return true;
}

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('accessToken', accessToken);
  Cookies.set('refreshToken', refreshToken);
}

export function logout() {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}
