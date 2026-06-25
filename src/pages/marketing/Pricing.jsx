import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { PLANS } from "@/lib/dummyData";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const COMPARE = [
  { group: "Sending", rows: [
    ["Monthly email volume", "1,000", "50,000", "500,000", "Custom"],
    ["Verified domains", "1", "10", "Unlimited", "Unlimited"],
    ["Burst rate", "1/s", "100/s", "10k/s", "Custom"],
    ["Dedicated IP", false, false, "$80/mo add-on", "Included"],
  ]},
  { group: "Testing", rows: [
    ["Temporary inboxes", "3", "100", "Unlimited", "Unlimited"],
    ["Spam checker", true, true, true, true],
    ["HTML render previews", false, true, true, true],
  ]},
  { group: "Reliability", rows: [
    ["Log retention", "7 days", "30 days", "90 days", "Custom"],
    ["Webhooks", true, true, true, true],
    ["SLA", "None", "99.9%", "99.99%", "99.99% + credits"],
  ]},
  { group: "Security", rows: [
    ["SAML SSO", false, false, true, true],
    ["SCIM provisioning", false, false, true, true],
    ["SOC 2 report", false, "On request", true, true],
    ["HIPAA BAA", false, false, "Add-on", true],
  ]},
];

const FAQ = [
  ["What counts as an email?", "Each unique recipient counts as one email. A message to 3 recipients counts as 3."],
  ["Can I switch plans anytime?", "Yes — upgrades are instant, downgrades take effect at the end of your billing cycle."],
  ["Do you offer a free trial?", "Our Free plan is free forever for up to 1,000 emails per month. No card required."],
  ["What payment methods do you accept?", "All major credit cards, ACH for annual contracts, and SEPA/wires for Enterprise."],
  ["Is there an annual discount?", "Yes — pay annually and get 2 months free on Pro and Scale."],
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <span className="label-mono">Pricing</span>
          <h1 className="mt-2 text-5xl md:text-6xl tracking-tight font-medium leading-[1.02] max-w-3xl mx-auto text-balance">
            Pay for what you send. Nothing more.
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
            Transparent, usage-based pricing. Start free, scale to billions.
          </p>
          <div className="mt-8 inline-flex border border-border rounded-md p-0.5 bg-card">
            <button onClick={() => setAnnual(false)} data-testid="billing-toggle-monthly" className={`px-4 py-1.5 rounded text-sm transition-colors ${!annual ? "bg-accent text-foreground" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} data-testid="billing-toggle-annual" className={`px-4 py-1.5 rounded text-sm transition-colors ${annual ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="ml-1 font-mono text-[10.5px] text-primary">-17%</span>
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {PLANS.map((p) => (
              <div key={p.name} data-testid={`plan-${p.name.toLowerCase()}`} className={`bg-card p-6 flex flex-col ${p.popular ? "relative ring-1 ring-primary -m-px" : ""}`}>
                {p.popular && (
                  <div className="absolute -top-px left-6 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">Most popular</div>
                )}
                <h3 className="text-lg font-medium tracking-tight">{p.name}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.blurb}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  {p.priceMonthly === null ? (
                    <span className="text-3xl font-medium">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-medium tracking-tight">${annual ? Math.round(p.priceMonthly * 10) : p.priceMonthly}</span>
                      <span className="text-[12.5px] text-muted-foreground">/{annual ? "year" : "month"}</span>
                    </>
                  )}
                </div>
                <Link
                  to={p.priceMonthly === null ? "/contact" : "/register"}
                  data-testid={`plan-cta-${p.name.toLowerCase()}`}
                  className={`mt-5 inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    p.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-background hover:bg-accent"
                  }`}
                >
                  {p.priceMonthly === null ? "Contact sales" : p.priceMonthly === 0 ? "Start free" : "Start trial"}
                </Link>
                <ul className="mt-6 space-y-2.5 text-[13px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium">Compare plans</h2>
          <div className="mt-8 border border-border bg-card overflow-x-auto">
            <table className="w-full text-[13px] min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium w-1/3">Features</th>
                  {PLANS.map((p) => (
                    <th key={p.name} className="text-left p-4 font-medium">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((g) => (
                  <>
                    <tr key={g.group} className="bg-background">
                      <td colSpan={5} className="label-mono px-4 py-2">{g.group}</td>
                    </tr>
                    {g.rows.map((row, i) => (
                      <tr key={`${g.group}-${i}`} className="border-b border-border last:border-0">
                        {row.map((cell, j) => (
                          <td key={j} className={`px-4 py-3 ${j === 0 ? "text-muted-foreground" : ""}`}>
                            {cell === true ? <Check className="h-4 w-4 text-primary" /> :
                             cell === false ? <X className="h-4 w-4 text-muted-foreground/40" /> :
                             cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium text-center">Frequently asked</h2>
          <div className="mt-10 border-t border-border">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-border py-5">
                <summary className="flex items-center justify-between cursor-pointer text-[15px] font-medium list-none">
                  {q}
                  <span className="font-mono text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
