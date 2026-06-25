import { create } from 'zustand';
import {
  clearAuthStorage,
  readAccessToken,
  TOKEN_STORAGE_KEY,
  writeAccessToken,
} from '@/lib/auth-storage';

interface AuthStore {
  accessToken: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  hydrated: false,
  hydrate: () => {
    set({
      accessToken: readAccessToken(),
      hydrated: true,
    });
  },
  setAccessToken: (token) => {
    if (token) {
      writeAccessToken(token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    set({ accessToken: token });
  },
  clearSession: () => {
    clearAuthStorage();
    set({ accessToken: null });
  },
}));
