import { create } from 'zustand';

interface AuthState {
  token: string | null;
  host: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, host: string) => void;
  clearAuth: () => void;
  setHost: (host: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  host: null,
  isAuthenticated: false,
  setAuth: (token, host) => set({ token, host, isAuthenticated: true }),
  clearAuth: () => set({ token: null, host: null, isAuthenticated: false }),
  setHost: (host) => set({ host }),
}));
