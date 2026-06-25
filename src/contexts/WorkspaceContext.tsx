import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WORKSPACE_STORAGE_KEY } from "@/lib/api";
import type { Workspace } from "@/types";

interface WorkspaceContextValue {
  workspace: Workspace | null;
  workspaceId: string | null;
  setWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);

  const setWorkspace = useCallback((next: Workspace) => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, next.id);
    setWorkspaceState(next);
  }, []);

  const clearWorkspace = useCallback(() => {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    setWorkspaceState(null);
  }, []);

  const workspaceId = workspace?.id ?? localStorage.getItem(WORKSPACE_STORAGE_KEY);

  const value = useMemo(
    () => ({
      workspace,
      workspaceId,
      setWorkspace,
      clearWorkspace,
    }),
    [workspace, workspaceId, setWorkspace, clearWorkspace],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
