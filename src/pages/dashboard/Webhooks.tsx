import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { WEBHOOKS, WEBHOOK_LOGS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Webhook as WebhookIcon, Play, RotateCw, Copy } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";

export default function Webhooks() {
  const [tab, setTab] = useState("endpoints");
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="Webhooks"
        description="Signed, retried, replayable. Mailvoidr will deliver every event with exponential backoff."
        actions={
          <button data-testid="webhook-create" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <Plus className="h-3 w-3" /> New endpoint
          </button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-6">
        {[["endpoints", "Endpoints"], ["logs", "Delivery logs"], ["events", "Event types"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`webhook-tab-${id}`} className={`px-3.5 py-2 text-[13px] transition-colors ${tab === id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "endpoints" && (
        <div className="space-y-3">
          {WEBHOOKS.map((w) => (
            <div key={w.id} data-testid={`webhook-row-${w.id}`} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2"><WebhookIcon className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-mono text-[13px] truncate">{w.url}</span></div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {w.events.map((e) => <span key={e} className="font-mono text-[10.5px] px-1.5 py-0.5 border border-border">{e}</span>)}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <StatusBadge status={w.status} />
                  <div className="text-[11px] font-mono text-muted-foreground">{w.lastDelivery}</div>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-3 gap-px bg-border border border-border">
                <div className="bg-card p-3"><div className="label-mono">Success rate</div><div className="mt-0.5 font-mono text-sm text-primary">{w.success}%</div></div>
                <div className="bg-card p-3"><div className="label-mono">Secret</div><div className="mt-0.5 font-mono text-sm">{w.secret}</div></div>
                <div className="bg-card p-3"><div className="label-mono">Last delivery</div><div className="mt-0.5 font-mono text-sm">{w.lastDelivery}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="border border-border bg-card">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 label-mono">Timestamp</th>
                <th className="text-left p-3 label-mono">Event</th>
                <th className="text-left p-3 label-mono">URL</th>
                <th className="text-left p-3 label-mono">Status</th>
                <th className="text-left p-3 label-mono">Duration</th>
                <th className="text-left p-3 label-mono">Attempts</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {WEBHOOK_LOGS.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="p-3 font-mono text-muted-foreground">{new Date(l.ts).toLocaleString()}</td>
                  <td className="p-3 font-mono">{l.event}</td>
                  <td className="p-3 font-mono truncate max-w-[260px]">{l.url}</td>
                  <td className="p-3"><span className={`font-mono text-[12px] ${l.status === 200 ? "text-primary" : "text-destructive"}`}>{l.status}</span></td>
                  <td className="p-3 font-mono text-muted-foreground">{l.duration}</td>
                  <td className="p-3 font-mono">{l.attempts}</td>
                  <td className="p-3"><button data-testid={`webhook-replay-${l.id}`} className="inline-flex items-center gap-1 text-[12px] hover:text-primary"><Play className="h-3 w-3" />Replay</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "events" && (
        <div className="border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Available events</h3>
          <p className="text-[12.5px] text-muted-foreground mt-1">Subscribe to any combination from your endpoint configuration.</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-px bg-border border border-border">
            {[
              ["email.queued", "Email accepted into the queue"],
              ["email.sent", "Handed off to MTA"],
              ["email.delivered", "Accepted by recipient MTA"],
              ["email.opened", "Tracking pixel hit"],
              ["email.clicked", "Tracked link click"],
              ["email.bounced", "Permanent failure"],
              ["email.deferred", "Temporary failure"],
              ["email.complained", "Recipient marked as spam"],
              ["domain.verified", "DNS verification passed"],
              ["domain.unverified", "DNS verification failed"],
            ].map(([k, v]) => (
              <div key={k} className="bg-card p-3">
                <div className="font-mono text-[12px]">{k}</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{v}</div>
              </div>
            ))}
          </div>
          <CodeBlock language="json" className="mt-5" code={JSON.stringify({
            id: "evt_8K3xPa9", type: "email.delivered", created: "2026-02-18T09:42:18Z",
            data: { message_id: "msg_8K3xPa", recipient: "riya@example.com", domain: "mail.acme.com", response: "250 2.0.0 OK", tags: ["welcome"] }
          }, null, 2)} />
        </div>
      )}
    </DashboardLayout>
  );
}
