import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { SMTP_CREDS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { CodeBlock } from "@/components/CodeBlock";
import { Plus, Server, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SMTP() {
  const [revealed, setRevealed] = useState({});
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="SMTP credentials"
        description="Drop-in SMTP relay. Use these on top of (or instead of) the HTTP API."
        actions={
          <button data-testid="smtp-create" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <Plus className="h-3 w-3" /> New credential
          </button>
        }
      />

      <div className="space-y-4 mb-8">
        {SMTP_CREDS.map((c) => (
          <div key={c.id} data-testid={`smtp-row-${c.id}`} className="border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2"><Server className="h-4 w-4 text-muted-foreground" /><h3 className="text-base font-medium">{c.name}</h3></div>
                <div className="mt-1 text-[11.5px] text-muted-foreground font-mono">{c.region}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-5 grid sm:grid-cols-4 gap-px bg-border border border-border">
              <KV k="HOST" v={c.host} mono />
              <KV k="PORT" v={c.port} mono />
              <KV k="USERNAME" v={c.username} mono />
              <KV k="PASSWORD" v={revealed[c.id] ? "8K3xPa9LmQ2v7N4cT1b" : "••••••••••••••"} mono action={
                <button onClick={() => setRevealed({ ...revealed, [c.id]: !revealed[c.id] })} className="text-muted-foreground hover:text-foreground">{revealed[c.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
              } />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-px bg-border border border-border">
              <div className="bg-card p-3"><div className="label-mono">Sent · 30d</div><div className="mt-1 font-mono text-sm">{c.sent}</div></div>
              <div className="bg-card p-3"><div className="label-mono">Delivery</div><div className="mt-1 font-mono text-sm text-primary">99.4%</div></div>
              <div className="bg-card p-3"><div className="label-mono">p99 latency</div><div className="mt-1 font-mono text-sm">240ms</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card p-5">
        <h3 className="text-base font-medium">Connect via SMTP</h3>
        <p className="text-[12.5px] text-muted-foreground mt-1">Example using Node.js + nodemailer:</p>
        <CodeBlock language="js" code={`import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.mailvoidr.io",
  port: 587,
  secure: false,
  auth: { user: "mv_live_8k3@smtp", pass: process.env.MV_SMTP_PASS },
});

await transporter.sendMail({
  from: "hello@mail.acme.com",
  to: "riya@example.com",
  subject: "Welcome",
  html: "<h1>Hey Riya</h1>",
});`} className="mt-3" />
      </div>
    </DashboardLayout>
  );
}

function KV({
  k,
  v,
  mono = false,
  action,
}: {
  k: string;
  v: string | number;
  mono?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card p-3">
      <div className="label-mono">{k}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className={`text-[12.5px] ${mono ? "font-mono" : ""} truncate`}>{v}</span>
        <div className="flex items-center gap-1">{action} <button className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button></div>
      </div>
    </div>
  );
}
