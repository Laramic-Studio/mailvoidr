import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { EMAIL_LOGS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Filter, Search, Download, RefreshCw, ChevronRight, X, Copy } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";

const STATUS_FILTERS = ["all", "delivered", "opened", "clicked", "bounced", "deferred", "complained", "failed"];

export default function EmailLogs() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = EMAIL_LOGS.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (search && !e.recipient.includes(search) && !e.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operate"
        title="Email logs"
        description="Every message that flowed through Mailvoidr. Filter, drill down, and replay."
        actions={
          <>
            <button data-testid="logs-export" className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><Download className="h-3 w-3" />Export</button>
            <button className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><RefreshCw className="h-3 w-3" />Refresh</button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="border border-border bg-card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            data-testid="logs-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, subject, message ID…"
            className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-[12.5px]"
          />
        </div>
        <select data-testid="logs-domain-filter" className="bg-background border border-border rounded-md px-2.5 py-1.5 text-[12.5px]">
          <option>All domains</option>
          <option>mail.acme.com</option>
          <option>notify.acme.com</option>
        </select>
        <select data-testid="logs-date-filter" className="bg-background border border-border rounded-md px-2.5 py-1.5 text-[12.5px]">
          <option>Last 24h</option><option>Last 7d</option><option>Last 30d</option><option>Custom</option>
        </select>
        <select data-testid="logs-template-filter" className="bg-background border border-border rounded-md px-2.5 py-1.5 text-[12.5px]">
          <option>All templates</option><option>welcome-v3</option><option>password-reset</option>
        </select>
        <div className="ml-auto flex items-center gap-1 font-mono text-[11.5px] text-muted-foreground">
          {filtered.length} of {EMAIL_LOGS.length}
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            data-testid={`logs-status-${s}`}
            className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border transition-colors ${
              filter === s ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-[12.5px] min-w-[1000px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 label-mono">Timestamp</th>
              <th className="text-left p-3 label-mono">Message ID</th>
              <th className="text-left p-3 label-mono">Recipient</th>
              <th className="text-left p-3 label-mono">Domain</th>
              <th className="text-left p-3 label-mono">Status</th>
              <th className="text-left p-3 label-mono">IP</th>
              <th className="text-left p-3 label-mono">Response</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 40).map((e) => (
              <tr
                key={e.id}
                data-testid={`log-row-${e.id}`}
                onClick={() => setActive(e)}
                className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer"
              >
                <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">{new Date(e.ts).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}</td>
                <td className="p-3 font-mono text-foreground/80">{e.id}</td>
                <td className="p-3 font-mono">{e.recipient}</td>
                <td className="p-3 text-muted-foreground">{e.domain}</td>
                <td className="p-3"><StatusBadge status={e.status} /></td>
                <td className="p-3 font-mono text-muted-foreground">{e.ip}</td>
                <td className="p-3 font-mono text-[11.5px] text-muted-foreground truncate max-w-[180px]">{e.response}</td>
                <td className="p-3"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && <LogDrawer log={active} onClose={() => setActive(null)} />}
    </DashboardLayout>
  );
}

function LogDrawer({ log, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div data-testid="log-drawer" className="fixed right-0 top-0 h-screen w-full max-w-xl bg-card border-l border-border z-50 flex flex-col overflow-hidden">
        <div className="border-b border-border p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[12.5px] text-muted-foreground">{log.id}</div>
            <h3 className="mt-1 text-lg font-medium tracking-tight truncate">{log.subject}</h3>
            <div className="mt-2"><StatusBadge status={log.status} /></div>
          </div>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center border border-border hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <KV label="To" value={log.recipient} mono />
          <KV label="From" value="hello@mail.acme.com" mono />
          <KV label="Domain" value={log.domain} mono />
          <KV label="Template" value={log.template} mono />
          <KV label="Sent IP" value={log.ip} mono />
          <KV label="Size" value={log.size} mono />
          <KV label="Provider response" value={log.response} mono />
          <div>
            <div className="label-mono mb-2">Timeline</div>
            <ul className="space-y-2.5">
              {[
                ["Accepted by API", "00:00.012"],
                ["Queued", "00:00.024"],
                ["DKIM signed", "00:00.041"],
                ["Sent to MTA", "00:00.082"],
                ["Delivered (250 2.0.0 OK)", "00:00.142"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-start gap-3 text-[12.5px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <div>{k}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">+{v}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label-mono mb-2">Raw event</div>
            <CodeBlock language="json" code={JSON.stringify({
              id: log.id, ts: log.ts, status: log.status, recipient: log.recipient,
              template: log.template, ip: log.ip, response: log.response,
              tags: ["welcome", "onboarding-v3"], metadata: { user_id: "u_018kJ2", env: "production" }
            }, null, 2)} />
          </div>
        </div>
        <div className="border-t border-border p-4 flex items-center justify-between">
          <button data-testid="log-retry" className="inline-flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">Retry</button>
          <button className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium">View in inbox</button>
        </div>
      </div>
    </>
  );
}

function KV({ label, value, mono }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-start text-[12.5px]">
      <span className="label-mono pt-0.5">{label}</span>
      <span className={`${mono ? "font-mono" : ""} break-all`}>{value}</span>
    </div>
  );
}
