import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { SPAM_REPORT, INBOX_MESSAGES, INBOX_RAW, INBOX_HEADERS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, FlaskConical, Monitor, Smartphone, Bug, Eye, Code2, ShieldCheck } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { useState } from "react";

const PROJECTS = [
  { id: "p1", name: "QA · Signup flow", inbox: "qa-signup@inbox.mailvoidr.io", messages: 142, lastSeen: "2 min ago" },
  { id: "p2", name: "Marketing previews", inbox: "marketing@inbox.mailvoidr.io", messages: 56, lastSeen: "1 hr ago" },
  { id: "p3", name: "Staging webhooks", inbox: "staging@inbox.mailvoidr.io", messages: 89, lastSeen: "Yesterday" },
];

export default function Inbox() {
  const [tab, setTab] = useState("sandbox");
  const [device, setDevice] = useState("desktop");

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Workspace"
        title="Inbox"
        description="Your sandbox inbox — SMTP credentials, captured messages, spam checks, and render previews."
        actions={
          <button data-testid="inbox-new-project" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <Plus className="h-3 w-3" /> New project
          </button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-6">
        {[["sandbox", "Sandbox"], ["projects", "Projects"], ["spam", "Spam check"], ["preview", "Render preview"], ["headers", "Headers"], ["source", "Source"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`inbox-tab-${id}`} className={`px-3.5 py-2 text-[13px] transition-colors ${tab === id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "sandbox" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-6">
            {[
              ["Messages captured · 24h", "1,284"],
              ["Avg spam score", "0.4 / 10"],
              ["Render issues", "3"],
              ["Active projects", "3"],
            ].map(([l, v]) => (
              <div key={l} className="bg-card p-5">
                <div className="label-mono">{l}</div>
                <div className="mt-2 text-2xl font-medium">{v}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-border bg-card">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-medium">Captured messages</h3>
                <span className="label-mono">Latest</span>
              </div>
              <ul className="divide-y divide-border">
                {INBOX_MESSAGES.slice(0, 6).map((m) => (
                  <li key={m.id} className="p-4 flex items-start gap-3 hover:bg-accent/30">
                    <FlaskConical className="h-3.5 w-3.5 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] truncate">{m.subject}</div>
                      <div className="text-[11.5px] text-muted-foreground font-mono mt-0.5">{m.fromName} · {m.time}</div>
                    </div>
                    <StatusBadge status={m.score < 1 ? "delivered" : "warning"} label={`${m.score}`} tone={m.score < 1 ? "success" : "warn"} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border bg-card p-4">
              <div className="label-mono">Sandbox SMTP</div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">Drop these credentials into your test environment.</p>
              <div className="mt-3 space-y-2 font-mono text-[12px]">
                <KV k="Host" v="smtp.sandbox.mailvoidr.io" />
                <KV k="Port" v="2525" />
                <KV k="Username" v="sb_8K3xPa9LmQ" />
                <KV k="Password" v="•••••••• (reveal)" />
              </div>
              <CodeBlock language="bash" code={`SMTP_HOST=smtp.sandbox.mailvoidr.io
SMTP_PORT=2525
SMTP_USER=sb_8K3xPa9LmQ
SMTP_PASS=$SANDBOX_PASS`} className="mt-3" />
            </div>
          </div>
        </>
      )}

      {tab === "projects" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {PROJECTS.map((p) => (
            <div key={p.id} className="bg-card p-5">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h3 className="mt-4 text-base font-medium">{p.name}</h3>
              <div className="mt-1 text-[11.5px] text-muted-foreground font-mono">{p.inbox}</div>
              <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[12px]">
                <div><div className="label-mono">Messages</div><div className="mt-0.5 font-mono">{p.messages}</div></div>
                <div><div className="label-mono">Last seen</div><div className="mt-0.5 font-mono text-muted-foreground">{p.lastSeen}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "spam" && (
        <div className="border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="label-mono">Spam analysis</span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-medium tracking-tight">{SPAM_REPORT.score}</span>
                <span className="text-sm text-muted-foreground font-mono">/ 10 · {SPAM_REPORT.rating}</span>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-2 h-1.5 bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${SPAM_REPORT.score * 10}%` }} />
          </div>
          <ul className="mt-6 divide-y divide-border">
            {SPAM_REPORT.rules.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${r.status === "pass" ? "bg-primary" : "bg-amber-500"}`} />
                  <div>
                    <div className="font-mono text-[12.5px]">{r.id}</div>
                    <div className="text-[11.5px] text-muted-foreground">{r.desc}</div>
                  </div>
                </div>
                <span className="font-mono text-[12px] text-muted-foreground">{r.points > 0 ? `+${r.points}` : r.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "preview" && (
        <div className="border border-border bg-card">
          <div className="border-b border-border p-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Render preview · welcome-v3</h3>
            <div className="flex border border-border text-[12px] rounded-md">
              {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
                <button key={d} onClick={() => setDevice(d)} className={`px-3 py-1 inline-flex items-center gap-1 ${device === d ? "bg-accent" : ""}`}>
                  <Icon className="h-3 w-3" /> {d}
                </button>
              ))}
            </div>
          </div>
          <div className="p-8 bg-muted/30 flex justify-center">
            <div className={`${device === "mobile" ? "max-w-sm" : "max-w-2xl"} w-full bg-white text-zinc-900 p-8 border border-border`}>
              <div className="text-xs text-zinc-500">hello@mail.acme.com</div>
              <h1 className="mt-4 text-2xl font-medium">Welcome to Acme</h1>
              <p className="mt-3 text-sm text-zinc-700">Hi Riya, thanks for joining us. Here's how to get started in 5 minutes.</p>
              <a className="inline-block mt-5 bg-primary text-primary-foreground px-4 py-2 text-sm rounded">Get started</a>
            </div>
          </div>
          <div className="border-t border-border p-3 grid grid-cols-3 gap-3 text-[12px]">
            {["Gmail (Web)", "Outlook (Mac)", "Apple Mail (iOS)"].map((c) => (
              <div key={c} className="flex items-center gap-2 font-mono text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />{c} — OK
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "headers" && (
        <div className="border border-border bg-card p-4">
          <table className="w-full text-[12.5px] font-mono">
            <tbody>
              {INBOX_HEADERS.map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-muted-foreground w-48">{k}</td>
                  <td className="py-2 break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "source" && <CodeBlock language="text" code={INBOX_RAW} showLineNumbers />}
    </DashboardLayout>
  );
}

function KV({ k, v }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="break-all">{v}</span>
    </div>
  );
}
