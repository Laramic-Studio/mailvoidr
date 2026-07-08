import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  formatWorkspaceRole,
  useWorkspaceMutations,
  useWorkspaces,
  workspaceInitials,
} from "@/hooks/useWorkspaces";
import { toastError, toastSuccess } from "@/lib/toast";
import { Plus, ChevronRight, LogOut, Loader2, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function WorkspaceSelect() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const { workspaces, isLoading, isError, data } = useWorkspaces();
  const quota = data?.meta?.owned_workspaces;
  const canCreate = quota?.can_create ?? true;
  const { switchWorkspace, createWorkspace } = useWorkspaceMutations();
  const { loading: switching, run } = useAsyncAction();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleSelect(workspaceId: string) {
    await run(async () => {
      await switchWorkspace.mutateAsync(workspaceId);
      nav("/dashboard");
    }, { fallbackMessage: "Could not switch workspace" });
  }

  async function handleLogout() {
    await logout();
    nav("/login");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      await createWorkspace.mutateAsync({ name: newName.trim() });
      toastSuccess("Workspace created.");
      setNewName("");
      nav("/dashboard");
    } catch (err) {
      toastError(err, "Could not create workspace");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border px-6 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-6 py-16">
        <span className="label-mono">Workspaces</span>
        <h1 className="mt-2 text-3xl tracking-tight font-medium">Choose a workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick which workspace to open. You can switch anytime from the dashboard.</p>

        {isLoading ? (
          <div className="mt-12 flex justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="mt-8 text-sm text-destructive">Could not load workspaces.</p>
        ) : (
          <div className="mt-8 border border-border bg-card divide-y divide-border">
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelect(w.id)}
                disabled={switching}
                data-testid={`workspace-${w.slug}`}
                className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left disabled:opacity-60"
              >
                <div className="h-9 w-9 rounded-md bg-primary/15 border border-primary/30 inline-flex items-center justify-center font-mono text-[12px]">
                  {workspaceInitials(w.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium">{w.name}</div>
                  <div className="text-[11.5px] text-muted-foreground font-mono">
                    {formatWorkspaceRole(w.role)}
                    {w.use_case ? ` · ${w.use_case}` : ""}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}

            {canCreate ? (
              <form onSubmit={handleCreate} className="p-4 space-y-3" data-testid="workspace-create-form">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md border border-dashed border-border inline-flex items-center justify-center shrink-0">
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="label-mono block mb-1.5" htmlFor="new-workspace-name">New workspace</label>
                    <input
                      id="new-workspace-name"
                      data-testid="workspace-create-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Team or project name"
                      disabled={creating || switching}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>
                </div>
                {quota?.limit != null && (
                  <p className="text-[11.5px] text-muted-foreground">
                    {quota.used} of {quota.limit} workspaces used on your {quota.plan_slug} plan.
                  </p>
                )}
                <SubmitButton
                  type="submit"
                  data-testid="workspace-create"
                  loading={creating}
                  loadingText="Creating…"
                  disabled={!newName.trim() || switching}
                  className="w-full"
                >
                  Create workspace
                </SubmitButton>
              </form>
            ) : (
              <div className="p-4 space-y-2" data-testid="workspace-create-limit">
                <p className="text-sm text-muted-foreground">
                  {quota?.plan_slug === "starter"
                    ? "You've reached the Starter plan limit of 3 workspaces."
                    : "You've reached your workspace limit for this plan."}
                </p>
                <Link
                  to="/dashboard/billing"
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-primary hover:underline"
                >
                  Upgrade to Growth for unlimited workspaces
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
