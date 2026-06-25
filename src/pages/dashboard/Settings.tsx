import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { USER, WORKSPACES } from "@/lib/dummyData";
import { useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const SECTIONS = [
  "General", "Profile", "Security", "Notifications", "API", "Workspace", "Domains", "SMTP", "Branding", "Danger zone"
];

export default function Settings() {
  const [active, setActive] = useState("General");
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Profile, workspace, security, and integrations."
      />

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside>
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => (
              <li key={s}>
                <button
                  data-testid={`settings-nav-${s.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setActive(s)}
                  className={`w-full text-left px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                    active === s ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  } ${s === "Danger zone" ? "text-destructive hover:text-destructive" : ""}`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6 max-w-2xl">
          {active === "General" && (
            <Section title="General" desc="Workspace-wide preferences">
              <Field label="Workspace name" defaultValue="Acme Inc." />
              <Field label="Workspace URL" defaultValue="mailvoidr.io/acme" mono />
              <Field label="Default region" defaultValue="us-east-1" mono />
              <Field label="Default sender email" defaultValue="hello@mail.acme.com" mono />
            </Section>
          )}
          {active === "Profile" && (
            <Section title="Profile" desc="Your personal info">
              <Field label="Full name" defaultValue={USER.name} />
              <Field label="Email" defaultValue={USER.email} mono />
              <Field label="Timezone" defaultValue="UTC+05:30 · Asia/Kolkata" />
              <Field label="Avatar" custom={
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/15 border border-primary/30 inline-flex items-center justify-center font-mono">RM</div>
                  <button className="text-[12.5px] border border-border rounded-md px-3 py-1.5 hover:bg-accent">Upload new</button>
                </div>
              } />
            </Section>
          )}
          {active === "Security" && (
            <Section title="Security" desc="Password, 2FA, sessions">
              <div className="border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Two-factor authentication</div>
                    <p className="text-[12.5px] text-muted-foreground mt-1">Authenticator app · enabled · last verified 2 hr ago</p>
                  </div>
                  <button className="text-[12.5px] border border-border rounded-md px-3 py-1.5 hover:bg-accent">Manage</button>
                </div>
              </div>
              <Field label="Current password" type="password" />
              <Field label="New password" type="password" />
            </Section>
          )}
          {active === "Notifications" && (
            <Section title="Notifications" desc="Pick what you want to hear about">
              {[
                ["Deliverability alerts", "Drops below 95% for any domain", true],
                ["New invitations", "When someone accepts an invite", true],
                ["Weekly digest", "Email volume summary every Monday", true],
                ["Product updates", "New features and changelog", false],
                ["Billing alerts", "Plan limits, payment failures", true],
              ].map(([l, d, on]) => (
                <Toggle key={String(l)} label={String(l)} desc={String(d)} defaultOn={Boolean(on)} />
              ))}
            </Section>
          )}
          {active === "API" && (
            <Section title="API" desc="Default API behaviour">
              <Field label="Default region" defaultValue="us-east-1" mono />
              <Field label="Idempotency window" defaultValue="24 hours" />
              <Field label="Rate limit policy" defaultValue="Per-key (10k req/s burst)" />
            </Section>
          )}
          {active === "Workspace" && (
            <Section title="Workspace" desc="Settings that affect everyone">
              <Field label="Allowed email domains" defaultValue="acme.com" mono />
              <Field label="Default member role" defaultValue="Developer" />
              <Toggle label="Require 2FA for all members" desc="Enforce two-factor across the workspace" defaultOn={true} />
              <Toggle label="Allow public invites" desc="Members can invite without admin approval" defaultOn={false} />
            </Section>
          )}
          {active === "Domains" && <Section title="Domains" desc="Manage from the Domains page">
            <p className="text-[13px] text-muted-foreground">Domain configuration lives under <a href="/dashboard/domains" className="text-primary hover:underline">Domains</a>.</p>
          </Section>}
          {active === "SMTP" && <Section title="SMTP" desc="Manage from the SMTP page">
            <p className="text-[13px] text-muted-foreground">SMTP credentials live under <a href="/dashboard/smtp" className="text-primary hover:underline">SMTP</a>.</p>
          </Section>}
          {active === "Branding" && (
            <Section title="Branding" desc="Customize tracking links and dashboard">
              <Field label="Custom tracking domain" defaultValue="track.acme.com" mono />
              <Field label="Workspace logo" custom={<div className="text-[12.5px] text-muted-foreground">Drop SVG/PNG · 2MB max</div>} />
              <Field label="Primary color" custom={<div className="flex items-center gap-2"><div className="h-6 w-6 rounded border border-border bg-primary" /><span className="font-mono text-[12.5px]">#3ECF8E</span></div>} />
            </Section>
          )}
          {active === "Danger zone" && (
            <Section title="Danger zone" desc="Irreversible actions" danger>
              <div className="border border-destructive/30 bg-destructive/5 p-4 rounded-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium inline-flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Transfer workspace</div>
                    <p className="text-[12.5px] text-muted-foreground mt-1">Hand over ownership to another admin.</p>
                  </div>
                  <button className="border border-destructive/30 text-destructive rounded-md px-3 py-1.5 text-[13px]">Transfer</button>
                </div>
              </div>
              <div className="border border-destructive/30 bg-destructive/5 p-4 rounded-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium inline-flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Delete workspace</div>
                    <p className="text-[12.5px] text-muted-foreground mt-1">All data — domains, inboxes, keys — will be permanently destroyed.</p>
                  </div>
                  <button data-testid="settings-delete-workspace" className="border border-destructive bg-destructive text-destructive-foreground rounded-md px-3 py-1.5 text-[13px]">Delete</button>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({
  title,
  desc,
  children,
  danger = false,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div>
      <h2 className={`text-lg font-medium tracking-tight ${danger ? "text-destructive" : ""}`}>{title}</h2>
      <p className="text-[13px] text-muted-foreground mt-0.5">{desc}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  defaultValue = "",
  type = "text",
  mono = false,
  custom,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  mono?: boolean;
  custom?: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <label className="label-mono block mb-2">{label}</label>
      {custom ? custom : (
        <input
          type={type}
          defaultValue={defaultValue}
          className={`w-full bg-background border border-border rounded-md px-3 py-2 text-sm ${mono ? "font-mono" : ""} focus:outline-none focus:ring-1 focus:ring-primary`}
        />
      )}
    </div>
  );
}

function Toggle({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="border border-border bg-card p-4 flex items-start justify-between gap-4">
      <div>
        <div className="text-[14px]">{label}</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, "-")}`}
        className={`relative inline-flex h-5 w-9 rounded-full border transition-colors ${on ? "bg-primary border-primary" : "bg-muted border-border"}`}
      >
        <span className={`absolute top-0.5 ${on ? "right-0.5" : "left-0.5"} h-3.5 w-3.5 rounded-full bg-white transition-all`} />
      </button>
    </div>
  );
}
