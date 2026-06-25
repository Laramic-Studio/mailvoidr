import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { INBOXES } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Copy, Inbox as InboxIcon, Clock, Forward } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Inboxes() {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Temporary Email"
        title="Inboxes"
        description="Disposable inboxes for testing. Generate from CI, auto-expire, forward to your team."
        actions={
          <button onClick={() => setShowCreate(true)} data-testid="inbox-create-btn" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <Plus className="h-3 w-3" /> Create inbox
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input placeholder="Search inboxes…" className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-[13px]" />
        </div>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-[13px] min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 label-mono">Address</th>
              <th className="text-left p-3 label-mono">Label</th>
              <th className="text-left p-3 label-mono">Messages</th>
              <th className="text-left p-3 label-mono">TTL</th>
              <th className="text-left p-3 label-mono">Forwarding</th>
              <th className="text-left p-3 label-mono">Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {INBOXES.map((i) => (
              <tr key={i.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="p-3">
                  <Link to={`/dashboard/inboxes/${i.id}`} data-testid={`inbox-row-${i.id}`} className="font-mono text-foreground hover:text-primary inline-flex items-center gap-2">
                    <InboxIcon className="h-3 w-3 text-muted-foreground" />
                    {i.address}
                  </Link>
                </td>
                <td className="p-3">{i.label}</td>
                <td className="p-3 font-mono text-muted-foreground">
                  {i.messages}
                  {i.unread > 0 && <span className="ml-2 inline-flex items-center gap-1 text-primary">· {i.unread} unread</span>}
                </td>
                <td className="p-3 font-mono text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{i.ttl}</td>
                <td className="p-3 text-muted-foreground">
                  {i.forwarding ? <span className="inline-flex items-center gap-1"><Forward className="h-3 w-3" />{i.forwarding}</span> : <span className="text-muted-foreground/50">—</span>}
                </td>
                <td className="p-3 font-mono text-muted-foreground">{i.created}</td>
                <td className="p-3"><button className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-6">
          <div data-testid="inbox-create-modal" className="w-full max-w-md border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-base font-medium">Create inbox</h3>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">Spin up a disposable inbox for testing.</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label-mono block mb-1.5">Label (optional)</label>
                <input data-testid="inbox-label" placeholder="e.g. QA · signup-flow" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="label-mono block mb-1.5">TTL</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>24 hours</option><option>7 days</option><option>30 days</option><option>Never expire</option>
                </select>
              </div>
              <div>
                <label className="label-mono block mb-1.5">Forward to (optional)</label>
                <input placeholder="qa@acme.com" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="border border-border rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">Cancel</button>
              <button onClick={() => setShowCreate(false)} data-testid="inbox-create-submit" className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium">Create</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
