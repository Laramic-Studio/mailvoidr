import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { DOMAINS, DNS_RECORDS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, ShieldCheck, Globe, Copy, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Domains() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operate"
        title="Domains"
        description="Verified sending domains with continuous SPF, DKIM, and DMARC monitoring."
        actions={
          <button data-testid="domain-add-btn" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <Plus className="h-3 w-3" /> Add domain
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-6">
        {[
          ["Verified", DOMAINS.filter((d) => d.status === "verified").length, "primary"],
          ["Warning", DOMAINS.filter((d) => d.status === "warning").length, "warn"],
          ["Pending", DOMAINS.filter((d) => d.status === "pending").length, "info"],
          ["Avg reputation", "94 / 100", "primary"],
        ].map(([l, v, t]) => (
          <div key={l} className="bg-card p-5">
            <div className="label-mono">{l}</div>
            <div className={`mt-2 text-2xl font-medium tracking-tight ${t === "primary" ? "text-foreground" : ""}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 label-mono">Domain</th>
              <th className="text-left p-3 label-mono">Status</th>
              <th className="text-left p-3 label-mono">Reputation</th>
              <th className="text-left p-3 label-mono">Records</th>
              <th className="text-left p-3 label-mono">Sent · 30d</th>
              <th className="text-left p-3 label-mono">Region</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => (
              <tr key={d.id} data-testid={`domain-row-${d.id}`} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="p-3"><div className="inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{d.name}</span></div></td>
                <td className="p-3"><StatusBadge status={d.status} /></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-16 bg-muted overflow-hidden">
                      <div className={`h-full ${d.reputation > 90 ? "bg-primary" : d.reputation > 70 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${d.reputation}%` }} />
                    </div>
                    <span className="font-mono text-[12px]">{d.reputation}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    {["spf", "dkim", "dmarc", "mx"].map((k) => (
                      <span key={k} className={`px-1.5 py-0.5 border ${
                        d[k] === "pass" ? "border-primary/40 text-primary" :
                        d[k] === "warn" ? "border-amber-500/40 text-amber-500" :
                        d[k] === "fail" ? "border-destructive/40 text-destructive" :
                        "border-border text-muted-foreground"
                      }`}>{k.toUpperCase()}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 font-mono text-muted-foreground">{d.sent.toLocaleString()}</td>
                <td className="p-3 font-mono text-muted-foreground">{d.region}</td>
                <td className="p-3"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DNS records sample */}
      <div className="mt-8">
        <h3 className="text-base font-medium">DNS records for <span className="font-mono">mail.acme.com</span></h3>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">Add the following records to your DNS provider. We re-check every 5 minutes.</p>
        <div className="mt-4 border border-border bg-card divide-y divide-border">
          {DNS_RECORDS.map((r, i) => (
            <div key={i} className="p-4 grid grid-cols-[60px_140px_1fr_auto] items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary">{r.type}</span>
              <div>
                <div className="font-mono text-[12.5px]">{r.host}</div>
                <div className="label-mono mt-0.5">{r.purpose}</div>
              </div>
              <div className="font-mono text-[12px] text-muted-foreground truncate">{r.value}</div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <button className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-6">
          <div data-testid="domain-add-modal" className="w-full max-w-md border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-base font-medium">Add a domain</h3>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">We recommend a subdomain like <span className="font-mono">mail.yourcompany.com</span>.</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label-mono block mb-1.5">Domain</label>
                <input data-testid="domain-add-input" placeholder="mail.yourcompany.com" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label className="label-mono block mb-1.5">Region</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>us-east-1</option><option>eu-west-1</option><option>ap-south-1</option>
                </select>
              </div>
            </div>
            <div className="border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="border border-border rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium">Add domain</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
