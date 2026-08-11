import { User } from '../types';

const API_BASE = '/api';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password?: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Authentication error');
    }

    return res.json();
  },

  getMe: async (token: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Session expired or invalid');
    }

    return res.json();
  },
};
