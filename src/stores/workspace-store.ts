import { create } from "zustand";
import { WORKSPACE_STORAGE_KEY } from "@/lib/api";
import type { Workspace } from "@/types";

interface WorkspaceStore {
  workspace: Workspace | null;
  workspaceId: string | null;
  hydrate: () => void;
  setWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspace: null,
  workspaceId: null,
  hydrate: () => {
    set({ workspaceId: localStorage.getItem(WORKSPACE_STORAGE_KEY) });
  },
  setWorkspace: (workspace) => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace.id);
    set({ workspace, workspaceId: workspace.id });
  },
  clearWorkspace: () => {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    set({ workspace: null, workspaceId: null });
  },
}));
