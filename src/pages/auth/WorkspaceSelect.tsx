import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WORKSPACES } from "@/lib/dummyData";
import { Plus, ChevronRight, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function WorkspaceSelect() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border px-6 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-6 py-16">
        <span className="label-mono">Sign in</span>
        <h1 className="mt-2 text-3xl tracking-tight font-medium">Choose a workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick which workspace to sign in to. You can switch anytime.</p>
        <div className="mt-8 border border-border bg-card divide-y divide-border">
          {WORKSPACES.map((w) => (
            <button
              key={w.id}
              onClick={() => nav("/dashboard")}
              data-testid={`workspace-${w.slug}`}
              className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-md bg-primary/15 border border-primary/30 inline-flex items-center justify-center font-mono text-[12px]">
                {w.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium">{w.name}</div>
                <div className="text-[11.5px] text-muted-foreground font-mono">{w.plan} · {w.region} · {w.role}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
          <button data-testid="workspace-create" className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left">
            <div className="h-9 w-9 rounded-md border border-dashed border-border inline-flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-[14px]">Create a new workspace</div>
              <div className="text-[11.5px] text-muted-foreground">For a new team or project</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
