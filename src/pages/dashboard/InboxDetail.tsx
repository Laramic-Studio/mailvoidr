import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { INBOXES, INBOX_MESSAGES, INBOX_RAW, INBOX_HEADERS, SPAM_REPORT } from "@/lib/dummyData";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Copy, Trash2, Forward, RefreshCw, Search, Paperclip } from "lucide-react";

const TABS = [
  { id: "preview", label: "Preview" },
  { id: "html", label: "HTML" },
  { id: "raw", label: "Raw source" },
  { id: "headers", label: "Headers" },
  { id: "attachments", label: "Attachments" },
  { id: "analytics", label: "Analytics" },
];

export default function InboxDetail() {
  const { id } = useParams();
  const inbox = INBOXES.find((i) => i.id === id) || INBOXES[0];
  const [active, setActive] = useState(INBOX_MESSAGES[0].id);
  const [tab, setTab] = useState("preview");
  const msg = INBOX_MESSAGES.find((m) => m.id === active);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/inboxes" className="text-muted-foreground hover:text-foreground" data-testid="inbox-back"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl tracking-tight font-medium">{inbox.label}</h1>
              <StatusBadge status="active" />
            </div>
            <div className="mt-1 flex items-center gap-3 text-[12.5px] font-mono text-muted-foreground">
              <span className="text-foreground">{inbox.address}</span>
              <button className="hover:text-foreground"><Copy className="h-3 w-3" /></button>
              <span>·</span><span>{inbox.messages} messages</span>
              <span>·</span><span>TTL {inbox.ttl}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><RefreshCw className="h-3 w-3" /> Refresh</button>
          <button className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><Forward className="h-3 w-3" /> Forwarding</button>
          <button className="inline-flex items-center gap-1.5 border border-destructive/30 text-destructive bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-destructive/10"><Trash2 className="h-3 w-3" /> Delete inbox</button>
        </div>
      </div>

      {/* Split view */}
      <div className="grid lg:grid-cols-[360px_1fr] gap-4 min-h-[600px]">
        {/* Message list */}
        <aside className="border border-border bg-card overflow-hidden flex flex-col">
          <div className="border-b border-border p-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Search messages…" className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-[12.5px]" />
            </div>
          </div>
          <ul className="divide-y divide-border overflow-y-auto flex-1">
            {INBOX_MESSAGES.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setActive(m.id)}
                  data-testid={`message-row-${m.id}`}
                  className={`w-full text-left p-3 transition-colors ${active === m.id ? "bg-accent/60" : "hover:bg-accent/30"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] truncate ${!m.read ? "text-foreground font-medium" : "text-muted-foreground"}`}>{m.fromName}</span>
                    <span className="text-[10.5px] font-mono text-muted-foreground whitespace-nowrap">{m.time}</span>
                  </div>
                  <div className={`mt-0.5 text-[12.5px] truncate ${!m.read ? "text-foreground" : "text-muted-foreground"}`}>{m.subject}</div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground truncate">{m.preview}</div>
                  {m.attachments > 0 && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-mono text-muted-foreground"><Paperclip className="h-2.5 w-2.5" />{m.attachments} attachment</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Message detail */}
        <section className="border border-border bg-card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[18px] tracking-tight font-medium">{msg.subject}</div>
                <div className="mt-2 flex items-center gap-2 text-[12.5px]">
                  <div className="h-6 w-6 rounded-full bg-muted inline-flex items-center justify-center font-mono text-[10px]">{msg.fromName.slice(0, 1)}</div>
                  <span>{msg.fromName} <span className="text-muted-foreground">&lt;{msg.from}&gt;</span></span>
                </div>
                <div className="mt-1 text-[11.5px] text-muted-foreground font-mono">to {inbox.address} · {msg.time}</div>
              </div>
              <StatusBadge status={msg.score < 1 ? "delivered" : "warning"} label={`Spam ${msg.score}/10`} tone={msg.score < 1 ? "success" : "warn"} />
            </div>
            <div className="mt-4 flex items-center gap-1 border-b border-border -mx-5 px-5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`detail-tab-${t.id}`}
                  className={`px-3 py-2 text-[12.5px] transition-colors ${tab === t.id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "preview" && (
              <div className="p-8 bg-muted/30 min-h-full">
                <div className="max-w-2xl mx-auto bg-white text-zinc-900 p-8 border border-border">
                  <div className="text-xs text-zinc-500">{msg.from}</div>
                  <h1 className="mt-4 text-xl font-medium">{msg.subject}</h1>
                  <p className="mt-3 text-sm text-zinc-700">{msg.preview}</p>
                  <p className="mt-6 text-sm text-zinc-700">This is a rendered preview of the HTML message body. Use the HTML or Raw tabs to inspect the source.</p>
                  <a className="inline-block mt-5 bg-primary text-primary-foreground px-4 py-2 text-sm rounded">View in browser</a>
                </div>
              </div>
            )}
            {tab === "html" && (
              <div className="p-4">
                <CodeBlock language="html" code={`<!doctype html>
<html>
  <body style="font-family: -apple-system, sans-serif; background:#fafafa; padding:32px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;padding:32px">
      <h1 style="margin:0 0 12px">${msg.subject}</h1>
      <p style="color:#555">${msg.preview}</p>
      <a href="https://acme.com" style="display:inline-block;background:#3ECF8E;color:#000;padding:10px 16px;text-decoration:none;border-radius:4px">View in browser</a>
    </div>
  </body>
</html>`} />
              </div>
            )}
            {tab === "raw" && (
              <div className="p-4"><CodeBlock language="text" code={INBOX_RAW} showLineNumbers /></div>
            )}
            {tab === "headers" && (
              <div className="p-4">
                <table className="w-full text-[12.5px] font-mono">
                  <tbody>
                    {INBOX_HEADERS.map(([k, v]) => (
                      <tr key={k} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 align-top text-muted-foreground w-44 whitespace-nowrap">{k}</td>
                        <td className="py-2 break-all">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tab === "attachments" && (
              <div className="p-6">
                {msg.attachments > 0 ? (
                  <div className="border border-border bg-background p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted inline-flex items-center justify-center"><Paperclip className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">receipt-4922-2018.pdf</div>
                      <div className="text-[11.5px] text-muted-foreground font-mono">PDF · 142 KB</div>
                    </div>
                    <button className="border border-border rounded px-2.5 py-1 text-[12px] hover:bg-accent">Download</button>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-12">No attachments in this message.</div>
                )}
              </div>
            )}
            {tab === "analytics" && (
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                <div className="border border-border bg-background p-4">
                  <div className="label-mono">Spam analysis</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-medium">{SPAM_REPORT.score}</span>
                    <span className="text-[11.5px] text-muted-foreground font-mono">/ 10 · {SPAM_REPORT.rating}</span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-[12px]">
                    {SPAM_REPORT.rules.map((r) => (
                      <li key={r.id} className="flex items-start justify-between gap-2 font-mono">
                        <span className={`${r.status === "pass" ? "text-primary" : "text-amber-500"}`}>● {r.id}</span>
                        <span className="text-muted-foreground text-right text-[11.5px]">{r.points > 0 ? `+${r.points}` : r.points}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-border bg-background p-4">
                  <div className="label-mono">Delivery timeline</div>
                  <ul className="mt-3 space-y-2.5 text-[12.5px]">
                    {[
                      ["Accepted by MTA", "09:42:18.012"],
                      ["DKIM verified", "09:42:18.089"],
                      ["Delivered to inbox", "09:42:18.241"],
                      ["Opened", "09:43:08.811"],
                    ].map(([k, v]) => (
                      <li key={k} className="flex items-start gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                        <div className="flex-1">
                          <div>{k}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{v}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
