import { create } from 'zustand';
import { User } from '../types';
import { userApi, setUserIdGetter } from '../services/api';
import { authApi } from '../services/authApi';

interface UserState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  users: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  initAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  setCurrentUserId: (id: string) => void;
}

const TOKEN_KEY = 'teamnest_auth_token';

export const useUserStore = create<UserState>((set, get) => {
  // Wire global user_id getter into the API client wrapper
  setUserIdGetter(() => get().currentUser?.id || null);

  return {
    currentUser: null,
    token: localStorage.getItem(TOKEN_KEY),
    isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),
    users: [],
    isLoading: true,
    error: null,

    fetchUsers: async () => {
      try {
        const users = await userApi.getAll();
        set({ users });
      } catch (err: any) {
        console.warn('Failed to fetch user directory:', err.message);
      }
    },

    initAuth: async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        set({ isLoading: false, isAuthenticated: false, currentUser: null });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const userProfile = await authApi.getMe(storedToken);
        const users = await userApi.getAll().catch(() => []);
        set({
          currentUser: userProfile,
          token: storedToken,
          isAuthenticated: true,
          users,
          isLoading: false,
        });
      } catch (err) {
        // Token expired or invalid -> clear session
        localStorage.removeItem(TOKEN_KEY);
        set({
          token: null,
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    login: async (email: string, password?: string) => {
      set({ isLoading: true, error: null });
      try {
        const { token, user } = await authApi.login(email, password);
        localStorage.setItem(TOKEN_KEY, token);

        const users = await userApi.getAll().catch(() => []);

        set({
          token,
          currentUser: user,
          isAuthenticated: true,
          users,
          isLoading: false,
        });
      } catch (err: any) {
        set({ error: err.message || 'Login failed', isLoading: false });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      set({
        token: null,
        currentUser: null,
        isAuthenticated: false,
      });
    },

    setCurrentUser: (user: User) => {
      set({ currentUser: user });
    },

    setCurrentUserId: (id: string) => {
      const user = get().users.find((u) => u.id === id);
      if (user) {
        set({ currentUser: user });
      }
    },
  };
});
