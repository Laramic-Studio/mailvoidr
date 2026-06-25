import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { EMAIL_LOGS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Send, Calendar, Eye, Code2, Paperclip, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";

const TABS = [
  { id: "compose", label: "Compose" },
  { id: "templates", label: "Templates" },
  { id: "scheduled", label: "Scheduled" },
  { id: "history", label: "History" },
  { id: "transactional", label: "Transactional" },
];

export default function SendEmail() {
  const [tab, setTab] = useState("compose");
  const [preview, setPreview] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Email sending"
        title="Send email"
        description="Compose, schedule, or send transactional email through the API or this UI."
        actions={null}
      />

      <div className="flex items-center gap-1 border-b border-border mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`send-tab-${t.id}`}
            className={`px-3.5 py-2 text-[13px] transition-colors ${
              tab === t.id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="border border-border bg-card">
            <div className="border-b border-border p-4 space-y-3">
              <FieldRow label="From" defaultValue="Acme <hello@mail.acme.com>" testid="send-from" />
              <FieldRow label="To" defaultValue="riya@example.com" testid="send-to" />
              <FieldRow label="Reply-to" defaultValue="support@acme.com" testid="send-replyto" />
              <FieldRow label="Subject" defaultValue="Welcome to Acme — get started in 5 minutes" testid="send-subject" />
              <FieldRow label="Template" defaultValue="welcome-v3" select options={["welcome-v3", "password-reset", "magic-link", "invoice-monthly"]} testid="send-template" />
            </div>
            <div className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <div className="flex items-center gap-1">
                  {["Visual", "HTML", "Variables"].map((s, i) => (
                    <button key={s} className={`px-2 py-1 text-[12px] rounded ${i === 0 ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{s}</button>
                  ))}
                </div>
                <button className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Paperclip className="h-3 w-3" /> Attach</button>
              </div>
              <div className="p-6 min-h-[280px] bg-background">
                <div className="prose prose-sm text-foreground">
                  <h1 className="text-2xl font-medium mb-3">Hey Riya 👋</h1>
                  <p className="text-muted-foreground text-sm">Welcome to Acme. We're excited to have you on board. Here's everything you need to get started in the next 5 minutes:</p>
                  <ol className="mt-4 space-y-1.5 text-sm text-muted-foreground list-decimal pl-5">
                    <li>Create your first project</li>
                    <li>Invite your team</li>
                    <li>Connect your first integration</li>
                  </ol>
                  <p className="mt-6 text-sm text-muted-foreground">If you have any questions, just reply to this email — we read every one.</p>
                  <p className="mt-4 text-sm">— The Acme team</p>
                </div>
              </div>
            </div>
            <div className="border-t border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(true)} data-testid="send-preview-btn" className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><Eye className="h-3 w-3" />Preview</button>
                <button className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><Calendar className="h-3 w-3" />Schedule</button>
              </div>
              <button onClick={() => setSent(true)} data-testid="send-now-btn" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3.5 py-1.5 text-[13px] font-medium hover:bg-primary/90">
                <Send className="h-3 w-3" />{sent ? "Sent ✓" : "Send now"}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border border-border bg-card p-4">
              <div className="label-mono">Test send</div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">Try the API directly from here.</p>
              <CodeBlock language="bash" code={`curl https://api.mailvoidr.io/v1/emails \\
  -H "Authorization: Bearer $MV_KEY" \\
  -d '{ "from":"...", "to":"...", "subject":"...", "html":"..." }'`} />
            </div>
            <div className="border border-border bg-card p-4">
              <div className="label-mono">Insights</div>
              <div className="mt-3 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Spam score</span><span className="font-mono text-primary">0.4 / 10</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">DKIM</span><span className="font-mono text-primary">aligned</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Estimated send</span><span className="font-mono">142ms</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Cost</span><span className="font-mono">$0.0004</span></div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === "history" && (
        <div className="border border-border bg-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 label-mono">Sent</th>
                <th className="text-left p-3 label-mono">Recipient</th>
                <th className="text-left p-3 label-mono">Subject</th>
                <th className="text-left p-3 label-mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {EMAIL_LOGS.slice(0, 12).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="p-3 font-mono text-muted-foreground">{new Date(e.ts).toLocaleString()}</td>
                  <td className="p-3 font-mono">{e.recipient}</td>
                  <td className="p-3 truncate max-w-[300px]">{e.subject}</td>
                  <td className="p-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== "compose" && tab !== "history" && (
        <div className="border border-dashed border-border bg-card/30 p-16 text-center">
          <h3 className="text-base font-medium">No {tab} emails yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">{tab === "templates" ? "Switch to the Templates page to manage them." : "When you create one, it'll show up here."}</p>
        </div>
      )}

      {preview && <PreviewModal onClose={() => setPreview(false)} />}
    </DashboardLayout>
  );
}

function FieldRow({ label, defaultValue, testid, select, options = [] }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3 border-b border-border last:border-0 -mx-4 px-4 pb-3 last:pb-0">
      <label className="label-mono">{label}</label>
      {select ? (
        <select data-testid={testid} defaultValue={defaultValue} className="bg-transparent text-sm focus:outline-none">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input data-testid={testid} defaultValue={defaultValue} className="bg-transparent text-sm focus:outline-none" />
      )}
    </div>
  );
}

function PreviewModal({ onClose }) {
  const [device, setDevice] = useState("desktop");
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-6" data-testid="preview-modal">
      <div className="w-full max-w-4xl border border-border bg-card max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-medium">Preview</h3>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">welcome-v3 · Spam score 0.4 / 10</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md text-[12px]">
              {["desktop", "mobile"].map((d) => (
                <button key={d} onClick={() => setDevice(d)} className={`px-3 py-1 ${device === d ? "bg-accent" : ""}`}>{d}</button>
              ))}
            </div>
            <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center border border-border hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-muted/30 flex items-start justify-center">
          <div className={`${device === "mobile" ? "max-w-sm" : "max-w-2xl"} w-full bg-white text-zinc-900 p-8 border border-border`}>
            <div className="text-xs text-zinc-500">From hello@mail.acme.com</div>
            <h1 className="mt-4 text-2xl font-medium">Hey Riya 👋</h1>
            <p className="mt-3 text-sm text-zinc-700">Welcome to Acme. We're excited to have you on board.</p>
            <a className="inline-block mt-5 bg-primary text-primary-foreground px-4 py-2 text-sm rounded">Get started</a>
          </div>
        </div>
      </div>
    </div>
  );
}
