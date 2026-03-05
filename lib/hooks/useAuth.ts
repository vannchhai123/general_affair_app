'use client';

import { useMutation } from '@tanstack/react-query';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    username: string;
    full_name: string;
    role_name: string;
  };
}

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }

      return res.json() as Promise<LoginResponse>;
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    user: loginMutation.data?.user,
  };
}
