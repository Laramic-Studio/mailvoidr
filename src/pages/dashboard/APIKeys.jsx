import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { API_KEYS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Copy, Eye, EyeOff, MoreHorizontal, KeyRound, RotateCw, Ban, Check } from "lucide-react";
import { useState } from "react";

export default function APIKeys() {
  const [showCreate, setShowCreate] = useState(false);
  const [revealed, setRevealed] = useState({});

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="API keys"
        description="Scoped tokens for the Mailvoidr API. Rotate or revoke at any time."
        actions={
          <button data-testid="apikey-create" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <Plus className="h-3 w-3" /> Create API key
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-6">
        {[["Active keys", "4"], ["Requests · 24h", "9.2M"], ["Rotated · 30d", "2"], ["Revoked", "1"]].map(([l, v]) => (
          <div key={l} className="bg-card p-5"><div className="label-mono">{l}</div><div className="mt-2 text-xl font-medium">{v}</div></div>
        ))}
      </div>

      <div className="border border-border bg-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 label-mono">Name</th>
              <th className="text-left p-3 label-mono">Token</th>
              <th className="text-left p-3 label-mono">Scopes</th>
              <th className="text-left p-3 label-mono">Created</th>
              <th className="text-left p-3 label-mono">Last used</th>
              <th className="text-left p-3 label-mono">Requests</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {API_KEYS.map((k) => (
              <tr key={k.id} data-testid={`apikey-row-${k.id}`} className={`border-b border-border last:border-0 ${k.revoked ? "opacity-50" : ""} hover:bg-accent/30`}>
                <td className="p-3"><div className="inline-flex items-center gap-2"><KeyRound className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{k.name}</span></div></td>
                <td className="p-3">
                  <div className="inline-flex items-center gap-1.5 font-mono text-[12px]">
                    <span>{revealed[k.id] ? `${k.prefix}xPa9LmQ2v7N4cT1b` : `${k.prefix}••••••••••••`}</span>
                    <button onClick={() => setRevealed({ ...revealed, [k.id]: !revealed[k.id] })} className="text-muted-foreground hover:text-foreground">{revealed[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                    <button className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">{k.scopes.map((s) => <span key={s} className="font-mono text-[10.5px] px-1.5 py-0.5 border border-border">{s}</span>)}</div>
                </td>
                <td className="p-3 font-mono text-muted-foreground">{k.created}</td>
                <td className="p-3 font-mono text-muted-foreground">{k.lastUsed}</td>
                <td className="p-3 font-mono">{k.requests}</td>
                <td className="p-3">
                  {k.revoked ? <StatusBadge status="revoked" /> :
                    <div className="flex items-center gap-1">
                      <button className="h-7 w-7 inline-flex items-center justify-center hover:bg-accent rounded" title="Rotate"><RotateCw className="h-3 w-3" /></button>
                      <button className="h-7 w-7 inline-flex items-center justify-center hover:bg-accent rounded" title="Revoke"><Ban className="h-3 w-3 text-destructive" /></button>
                    </div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-6">
          <div data-testid="apikey-create-modal" className="w-full max-w-md border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-base font-medium">Create API key</h3>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">Choose name and scopes. You'll see the full key only once.</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label-mono block mb-1.5">Name</label>
                <input data-testid="apikey-name" placeholder="e.g. Production · web-app" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="label-mono block mb-2">Scopes</label>
                <div className="space-y-1.5">
                  {["send.write", "logs.read", "domains.read", "templates.read", "analytics.read"].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-[13px]">
                      <input type="checkbox" defaultChecked className="accent-primary" /> <span className="font-mono">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="border border-border rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">Cancel</button>
              <button onClick={() => setShowCreate(false)} data-testid="apikey-create-submit" className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium">Create key</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
