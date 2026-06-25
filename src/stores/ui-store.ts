import { create } from 'zustand';

const SIDEBAR_STORAGE_KEY = 'mailvoidr_sidebar_collapsed';

interface UiStore {
  sidebarCollapsed: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  sidebarCollapsed: false,
  hydrated: false,
  hydrate: () => {
    set({
      sidebarCollapsed: localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
      hydrated: true,
    });
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    set({ sidebarCollapsed: next });
  },
}));
