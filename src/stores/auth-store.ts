import { create } from "zustand";
import { REFRESH_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY } from "@/lib/api";

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
      accessToken: localStorage.getItem(TOKEN_STORAGE_KEY),
      hydrated: true,
    });
  },
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    set({ accessToken: token });
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    set({ accessToken: null });
  },
}));
