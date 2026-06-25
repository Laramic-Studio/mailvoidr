import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { WORKSPACES } from "@/lib/dummyData";
import { Plus, ChevronRight } from "lucide-react";

export default function InviteAccept() {
  const nav = useNavigate();
  return (
    <AuthLayout side="left">
      <div className="text-center">
        <div className="h-12 w-12 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center font-mono">AC</div>
        <h1 className="mt-4 text-2xl tracking-tight font-medium">You've been invited</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="text-foreground">Riya Mehta</span> invited you to join <span className="text-foreground font-medium">Acme Inc.</span> on Mailvoidr.
        </p>
        <div className="mt-6 border border-border bg-card p-4 text-left">
          <div className="label-mono">Workspace</div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-primary/20 border border-primary/30 inline-flex items-center justify-center font-mono text-[10px]">AC</div>
            <div>
              <div className="text-sm">Acme Inc.</div>
              <div className="text-[11.5px] text-muted-foreground font-mono">12 members · Scale plan</div>
            </div>
          </div>
          <div className="mt-4 label-mono">Your role</div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Developer
          </div>
        </div>
        <button data-testid="invite-accept" onClick={() => nav("/dashboard")} className="mt-6 w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          Accept invitation
        </button>
        <button data-testid="invite-decline" className="mt-2 w-full text-[12.5px] text-muted-foreground hover:text-foreground">Decline</button>
      </div>
    </AuthLayout>
  );
}
