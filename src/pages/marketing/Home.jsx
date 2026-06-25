import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { CodeBlock } from "@/components/CodeBlock";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Send, FlaskConical, Inbox, ShieldCheck, LineChart, Webhook, Server, Globe, KeyRound, Zap, Terminal } from "lucide-react";
import { CODE_SAMPLES, USAGE_CHART, TOP_DOMAINS, EMAIL_LOGS } from "@/lib/dummyData";
import { Sparkline } from "@/components/Sparkline";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const LANGS = [
  { id: "send_node", label: "Node.js" },
  { id: "send_python", label: "Python" },
  { id: "send_curl", label: "cURL" },
  { id: "send_go", label: "Go" },
];

const COMPANIES = ["Linear", "Vercel", "Supabase", "Northwind", "Cal.com", "PostHog", "Resend", "Stripe", "Railway", "Plaid"];

export default function Home() {
  const [lang, setLang] = useState("send_node");

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 dotted-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 gradient-radial-primary pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20">
          <Link to="/blog/we-raised-series-b" className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 rounded-full text-[12.5px] hover:bg-accent transition-colors">
            <span className="font-mono text-[10.5px] uppercase text-primary tracking-wider">New</span>
            <span className="text-muted-foreground">We raised a $42M Series B</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </Link>
          <h1 className="mt-6 text-balance text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] font-medium max-w-4xl leading-[1]">
            Email infrastructure<br />
            <span className="text-muted-foreground">for developers who ship.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Mailvoidr is the email layer behind 12,400+ teams. Send transactional and bulk mail, test renders in disposable inboxes, and watch every delivery in real time — all from a single, type-safe API.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" data-testid="hero-cta-primary" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[14px] font-medium rounded-md hover:bg-primary/90 transition-colors">
              Start sending free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/docs" data-testid="hero-cta-docs" className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-[14px] font-medium rounded-md hover:bg-accent transition-colors">
              <Terminal className="h-3.5 w-3.5" /> Read the docs
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-4 text-[12.5px] text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> 1,000 emails free</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> SOC 2 Type II</span>
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="label-mono text-center mb-6">Trusted by engineering teams at</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-8 gap-y-6 items-center justify-items-center">
            {COMPANIES.slice(0, 10).map((c) => (
              <div key={c} className="text-muted-foreground/70 hover:text-foreground transition-colors text-lg tracking-tight font-medium">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code + dashboard preview */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-mono">Send</span>
              <h2 className="mt-2 text-4xl tracking-tight font-medium leading-tight">One API, one SDK, one quota.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Drop our SDK in and ship. We handle the rest — IPs, warm-up, suppression, retries, and bounce parsing.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Type-safe SDKs for Node, Python, Go, Ruby", "Idempotent sends with built-in retries", "Sub-second p99 latency across regions", "Tags, metadata, and webhooks on every send"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            <div className="border border-border bg-card">
              <div className="flex items-center gap-1 border-b border-border px-2">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id)}
                    data-testid={`code-lang-${l.label.toLowerCase()}`}
                    className={`px-3 py-2 text-[12.5px] font-mono transition-colors ${
                      lang === l.id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <CodeBlock code={CODE_SAMPLES[lang]} language={lang.replace("send_", "")} filename={`send-email.${lang === "send_curl" ? "sh" : lang.replace("send_", "").replace("node", "ts").replace("go", "go").replace("python", "py")}`} />
            </div>
          </div>
        </div>
      </section>

      {/* Bento features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl mb-12">
            <span className="label-mono">Platform</span>
            <h2 className="mt-2 text-4xl tracking-tight font-medium leading-tight text-balance">Everything email infrastructure should be, finally in one place.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
            <Bento icon={Send} title="Sending" desc="Transactional + bulk. SMTP and HTTP. Lowest p99 in the category." span="md:col-span-2" preview={<SendPreview />} />
            <Bento icon={FlaskConical} title="Testing" desc="Spam score, HTML render, link checks — every send." preview={<TestPreview />} />
            <Bento icon={Inbox} title="Temporary inboxes" desc="Spin up disposable inboxes from your test suite." preview={<InboxPreview />} />
            <Bento icon={LineChart} title="Real-time analytics" desc="Opens, clicks, bounces — by domain, template, region." span="md:col-span-2" preview={<AnalyticsPreview />} />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border border-t-0">
            <SmallFeature icon={ShieldCheck} title="SPF / DKIM / DMARC" desc="One-click setup, continuous monitoring." />
            <SmallFeature icon={Webhook} title="Webhooks" desc="Signed, retried, replayable." />
            <SmallFeature icon={KeyRound} title="Scoped API keys" desc="Per-environment, instantly revocable." />
            <SmallFeature icon={Globe} title="Multi-region" desc="US, EU, APAC routing with residency." />
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
            {[
              ["12.4B+", "emails delivered / month"],
              ["240ms", "p99 send latency"],
              ["99.99%", "API uptime"],
              ["38", "countries served"],
            ].map(([v, l]) => (
              <div key={l} className="bg-card p-8">
                <div className="text-3xl tracking-tight font-medium">{v}</div>
                <div className="label-mono mt-2">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-primary pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <h2 className="text-4xl md:text-5xl tracking-tight font-medium text-balance">Ship email like you ship code.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Get up and running in under five minutes. No sales calls, no credit cards — just docs and a great SDK.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium rounded-md hover:bg-primary/90">
              Start for free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-sm font-medium rounded-md hover:bg-accent">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Bento({ icon: Icon, title, desc, span = "", preview }) {
  return (
    <div className={`bg-card p-6 ${span} group relative overflow-hidden`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">{desc}</p>
      <div className="mt-6">{preview}</div>
    </div>
  );
}
function SmallFeature({ icon: Icon, title, desc }) {
  return (
    <div className="bg-card p-6">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="mt-3 text-sm font-medium">{title}</h4>
      <p className="text-[12.5px] text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

function SendPreview() {
  return (
    <div className="border border-border bg-background">
      <div className="border-b border-border px-3 py-1.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-destructive/60" />
        <span className="h-2 w-2 rounded-full bg-amber-500/60" />
        <span className="h-2 w-2 rounded-full bg-primary/60" />
        <span className="ml-2 font-mono text-[10.5px] text-muted-foreground">POST /v1/emails</span>
      </div>
      <div className="p-3 font-mono text-[11.5px] space-y-1 text-muted-foreground">
        <div><span className="text-foreground">→</span> from: hello@mail.acme.com</div>
        <div><span className="text-foreground">→</span> to: riya@example.com</div>
        <div><span className="text-foreground">→</span> subject: Welcome to Acme</div>
        <div className="text-primary">← 200 OK · id=msg_8K3xPa · 142ms</div>
      </div>
    </div>
  );
}
function TestPreview() {
  return (
    <div className="border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="label-mono">Spam score</span>
        <span className="font-mono text-xs text-primary">0.4 / 10</span>
      </div>
      <div className="mt-2 h-1.5 bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: "4%" }} />
      </div>
      <div className="mt-4 space-y-1.5 text-[11.5px]">
        {["DKIM ✓", "SPF ✓", "DMARC ✓", "List-Unsubscribe ✓"].map((s) => (
          <div key={s} className="font-mono text-muted-foreground">{s}</div>
        ))}
      </div>
    </div>
  );
}
function InboxPreview() {
  return (
    <div className="border border-border bg-background divide-y divide-border">
      {[
        ["Stripe", "Receipt #4922"],
        ["GitHub", "New SSH key added"],
        ["Figma", "Comment on Dashboard v4"],
      ].map(([f, s], i) => (
        <div key={i} className="px-3 py-2 flex items-center gap-3">
          <div className="h-5 w-5 rounded bg-muted inline-flex items-center justify-center font-mono text-[9.5px]">{f.slice(0,2)}</div>
          <div className="text-[12px] flex-1 min-w-0">
            <div className="truncate">{f}</div>
            <div className="text-muted-foreground truncate text-[11px]">{s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
function AnalyticsPreview() {
  return (
    <div className="border border-border bg-background p-3 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={USAGE_CHART.slice(-14)}>
          <defs>
            <linearGradient id="prevg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fill="url(#prevg)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
