import { DocsLayout } from "@/components/layouts/DocsLayout";
import { Link } from "react-router-dom";
import { ArrowRight, Send, FlaskConical, Inbox, Webhook, KeyRound, Server, BookOpen, Code2, Terminal, Globe } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";

const TILES = [
  { icon: Terminal, title: "Quickstart", desc: "Send your first email in 5 minutes.", to: "/docs/quickstart" },
  { icon: Code2, title: "API reference", desc: "Every endpoint, every parameter.", to: "/docs/api-reference" },
  { icon: Server, title: "SMTP guide", desc: "Drop-in SMTP relay.", to: "/docs/smtp" },
  { icon: Webhook, title: "Webhooks", desc: "Signed, retried, replayable.", to: "/docs/webhooks" },
  { icon: KeyRound, title: "Authentication", desc: "API keys, scopes, rotation.", to: "/docs/authentication" },
  { icon: Globe, title: "Domains", desc: "SPF, DKIM, DMARC.", to: "/docs/verify-domain" },
  { icon: FlaskConical, title: "Testing", desc: "Sandbox, render previews, spam checks.", to: "/docs/testing-overview" },
  { icon: Inbox, title: "Temporary inboxes", desc: "Disposable inboxes from CI.", to: "/docs/temporary-inboxes" },
];

export default function DocsLanding() {
  return (
    <DocsLayout>
      <div>
        <span className="label-mono">Documentation</span>
        <h1 className="mt-3 text-5xl tracking-tight font-medium leading-[1]">Build with Mailvoidr.</h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          Everything you need to send, test, and inspect email through the Mailvoidr platform — from your first cURL to a multi-region SMTP cluster.
        </p>

        <div className="mt-10 border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span className="label-mono">Install in 30 seconds</span>
          </div>
          <CodeBlock language="bash" className="mt-3" code={`# Node
npm install @mailvoidr/node

# Python
pip install mailvoidr

# Go
go get github.com/mailvoidr/go`} />
        </div>

        <h2 className="mt-16 text-2xl tracking-tight font-medium">Pick your starting point</h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-px bg-border border border-border">
          {TILES.map((t) => (
            <Link key={t.title} to={t.to} className="bg-card p-5 hover:bg-accent/30 transition-colors group">
              <t.icon className="h-4 w-4 text-primary" />
              <h3 className="mt-3 text-[15px] font-medium tracking-tight">{t.title}</h3>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{t.desc}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Read more <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-px bg-border border border-border">
          {[
            ["Node.js", "@mailvoidr/node"],
            ["Python", "mailvoidr"],
            ["Go", "github.com/mailvoidr/go"],
            ["Ruby", "mailvoidr"],
            ["PHP", "mailvoidr/sdk"],
            ["Rust", "mailvoidr-rs"],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-4 flex items-center justify-between">
              <span className="text-[13px]">{k}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </DocsLayout>
  );
}
