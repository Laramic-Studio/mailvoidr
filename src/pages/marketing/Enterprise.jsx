import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Lock, FileBadge, Users, Globe, Database, Headphones, Building2 } from "lucide-react";

const COMPLIANCE = [
  { icon: Shield, label: "SOC 2 Type II" },
  { icon: Lock, label: "ISO 27001" },
  { icon: FileBadge, label: "HIPAA BAA" },
  { icon: Globe, label: "GDPR" },
];

const ENTERPRISE = [
  { icon: Users, title: "SAML SSO + SCIM", desc: "Okta, Google Workspace, Azure AD. Just-in-time provisioning." },
  { icon: Database, title: "Data residency", desc: "Pin sends, logs, and inboxes to a specific region for compliance." },
  { icon: Headphones, title: "Dedicated success", desc: "Named engineer, Slack Connect channel, 99.99% SLA with credits." },
  { icon: Building2, title: "Private SMTP cluster", desc: "Dedicated IPs and capacity. Bring your own warm-up plan." },
  { icon: Lock, title: "Audit logs + retention", desc: "Immutable audit trail with up to 7-year retention." },
  { icon: FileBadge, title: "Custom contracts", desc: "MSAs, DPAs, BAAs. Procurement-friendly terms." },
];

export default function Enterprise() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 gradient-radial-primary pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <span className="label-mono">Enterprise</span>
          <h1 className="mt-3 text-5xl md:text-6xl lg:text-7xl tracking-tight font-medium leading-[1.02] max-w-4xl text-balance">
            The email layer behind the world's most demanding senders.
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground text-lg">
            Mailvoidr Enterprise is purpose-built for regulated industries, very large volumes, and teams that treat email as critical infrastructure.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium rounded-md hover:bg-primary/90">
              Talk to sales <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-sm font-medium rounded-md hover:bg-accent">
              Compare plans
            </Link>
          </div>
          <div className="mt-12 grid sm:grid-cols-4 gap-px bg-border border border-border max-w-2xl">
            {COMPLIANCE.map((c) => (
              <div key={c.label} className="bg-card p-4 flex items-center gap-2">
                <c.icon className="h-4 w-4 text-primary" />
                <span className="text-[12.5px] font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {ENTERPRISE.map((f) => (
              <div key={f.title} className="bg-card p-6">
                <f.icon className="h-4 w-4 text-primary" />
                <h3 className="mt-4 text-base font-medium tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl tracking-tight font-medium">A platform you can build a business on.</h2>
          <p className="mt-4 text-muted-foreground">Custom commercial terms, dedicated capacity, and 24/7 support — talk to us about an Enterprise contract.</p>
          <Link to="/contact" className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium rounded-md">
            Contact sales <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
