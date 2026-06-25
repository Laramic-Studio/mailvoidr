import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { FEATURES_LIST } from "@/lib/dummyData";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ICON_MAP = {
  send: Icons.Send, "flask-conical": Icons.FlaskConical, inbox: Icons.Inbox,
  "shield-check": Icons.ShieldCheck, "line-chart": Icons.LineChart, webhook: Icons.Webhook,
  "key-round": Icons.KeyRound, server: Icons.Server, users: Icons.Users,
  globe: Icons.Globe, shield: Icons.Shield, terminal: Icons.Terminal,
};

export default function Features() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <span className="label-mono">Features</span>
          <h1 className="mt-2 text-5xl md:text-6xl tracking-tight font-medium max-w-3xl leading-[1.02]">
            The complete email infrastructure stack.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground text-lg">
            Twelve products in one platform. Everything you need to send, test, monitor, and analyze email — without stitching three vendors together.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {FEATURES_LIST.map((f) => {
              const Icon = ICON_MAP[f.icon] || Icons.Square;
              return (
                <div key={f.title} className="bg-card p-6 hover:bg-accent/30 transition-colors group">
                  <div className="inline-flex h-8 w-8 items-center justify-center border border-border bg-background">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-medium tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <Link to="/docs" className="mt-4 inline-flex items-center gap-1 text-[12.5px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { kicker: "Reliability", title: "Built on a multi-region SMTP cluster", body: "Active-active deployments in us-east-1, eu-west-1, and ap-south-1. Automatic failover with regional retention.", stats: [["99.99%", "uptime"], ["3", "regions"]] },
              { kicker: "Security", title: "Enterprise-grade by default", body: "SOC 2 Type II, ISO 27001, HIPAA BAA, GDPR. Audit logs, SCIM, and SAML on Scale and Enterprise.", stats: [["SOC 2", "Type II"], ["SAML", "SSO"]] },
              { kicker: "Performance", title: "Engineered for the long tail", body: "p99 < 240ms on transactional traffic. Idempotent sends. Built-in rate limiting per credential.", stats: [["240ms", "p99"], ["10k/s", "burst"]] },
            ].map((c) => (
              <div key={c.title} className="border border-border bg-card p-6">
                <span className="label-mono">{c.kicker}</span>
                <h3 className="mt-3 text-lg font-medium tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                <div className="mt-5 grid grid-cols-2 gap-px bg-border border border-border">
                  {c.stats.map(([v, l]) => (
                    <div key={l} className="bg-background p-3">
                      <div className="text-base font-medium">{v}</div>
                      <div className="label-mono mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
