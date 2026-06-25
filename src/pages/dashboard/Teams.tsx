import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { TEAM, INVITES } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { UserPlus, Mail, Shield, Search } from "lucide-react";
import { useState } from "react";

const ROLE_STYLES = {
  Owner: "border-primary/40 text-primary bg-primary/10",
  Admin: "border-blue-500/40 text-blue-500 bg-blue-500/10",
  Developer: "border-border text-foreground",
  "Billing Manager": "border-amber-500/40 text-amber-500 bg-amber-500/10",
  Viewer: "border-border text-muted-foreground",
};

export default function Teams() {
  const [tab, setTab] = useState("members");
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Team"
        description="Invite collaborators. Assign granular roles. Track activity."
        actions={
          <button data-testid="team-invite" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <UserPlus className="h-3 w-3" /> Invite member
          </button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-6">
        {[["members", `Members · ${TEAM.length}`], ["invitations", `Invitations · ${INVITES.length}`], ["roles", "Roles"], ["activity", "Activity"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`team-tab-${id}`} className={`px-3.5 py-2 text-[13px] transition-colors ${tab === id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "members" && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Search members…" className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-[13px]" />
            </div>
          </div>
          <div className="border border-border bg-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 label-mono">Member</th>
                  <th className="text-left p-3 label-mono">Role</th>
                  <th className="text-left p-3 label-mono">Joined</th>
                  <th className="text-left p-3 label-mono">Last active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {TEAM.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 inline-flex items-center justify-center font-mono text-[10.5px]">{m.avatar}</div>
                        <div>
                          <div className="text-[13px]">{m.name}</div>
                          <div className="text-[11.5px] text-muted-foreground font-mono">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider ${ROLE_STYLES[m.role]}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{m.joined}</td>
                    <td className="p-3 font-mono text-muted-foreground">{m.lastActive}</td>
                    <td className="p-3 text-right">
                      <button className="text-muted-foreground hover:text-foreground text-[12px]">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "invitations" && (
        <div className="border border-border bg-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 label-mono">Email</th>
                <th className="text-left p-3 label-mono">Role</th>
                <th className="text-left p-3 label-mono">Sent</th>
                <th className="text-left p-3 label-mono">Expires in</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {INVITES.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="p-3 font-mono">{i.email}</td>
                  <td className="p-3"><span className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10.5px] uppercase ${ROLE_STYLES[i.role] || "border-border"}`}>{i.role}</span></td>
                  <td className="p-3 font-mono text-muted-foreground">{i.sent}</td>
                  <td className="p-3 font-mono text-muted-foreground">{i.expires}</td>
                  <td className="p-3 text-right space-x-3">
                    <button className="text-[12px] text-muted-foreground hover:text-foreground">Resend</button>
                    <button className="text-[12px] text-destructive hover:underline">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "roles" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {[
            ["Owner", "Full access. Cannot be removed unless ownership transfers."],
            ["Admin", "Manage members, billing, and all resources."],
            ["Developer", "Create and manage API keys, domains, templates. No billing."],
            ["Billing Manager", "Billing, invoices, and plan management only."],
            ["Viewer", "Read-only access to logs and analytics."],
          ].map(([role, desc]) => (
            <div key={role} className="bg-card p-5">
              <span className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10.5px] uppercase ${ROLE_STYLES[role] || "border-border"}`}>{role}</span>
              <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="border border-border bg-card divide-y divide-border">
          {TEAM.slice(0, 6).map((m, i) => (
            <div key={m.id} className="p-4 flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-muted inline-flex items-center justify-center font-mono text-[10.5px]">{m.avatar}</div>
              <div className="flex-1 text-[12.5px]">
                <span>{m.name}</span> <span className="text-muted-foreground">{["created API key", "added domain", "invited member", "viewed logs", "updated template", "rotated key"][i]}</span>
              </div>
              <span className="text-[11.5px] text-muted-foreground font-mono">{m.lastActive}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
