import { MarketingLayout } from "@/components/layouts/MarketingLayout";

const TEAM = [
  { name: "Riya Mehta", role: "Co-founder, CEO", bio: "Previously eng at Stripe & Vercel. Believes email is still software." },
  { name: "Marcus Lee", role: "Co-founder, CTO", bio: "Built the SMTP cluster from scratch. ex-Cloudflare." },
  { name: "Sara Park", role: "Head of Deliverability", bio: "Lead engineer at Postmark before joining. M3AAWG board member." },
  { name: "Chen Wu", role: "Head of Security", bio: "Drove SOC 2 + ISO 27001 in 9 months." },
  { name: "Priya Singh", role: "Head of Solutions", bio: "Helped 800+ teams migrate from SendGrid." },
  { name: "Noor Ali", role: "Head of Design", bio: "Previously at Linear and Vercel." },
];

const INVESTORS = ["Greylock", "Sequoia", "Founders Fund", "SV Angel", "Y Combinator", "Initialized", "Khosla", "Index"];

export default function About() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <span className="label-mono">About</span>
          <h1 className="mt-2 text-5xl md:text-6xl tracking-tight font-medium leading-[1] text-balance">
            We're rebuilding email <span className="text-muted-foreground">— for developers, by developers.</span>
          </h1>
          <div className="mt-10 space-y-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            <p className="text-foreground">Mailvoidr was founded in 2024 by two engineers who'd spent a decade gluing together SendGrid, Mailtrap, and homegrown DKIM scripts.</p>
            <p>Email is still the most reliable channel on the internet. It's also the most fragmented developer experience. We're building the layer that consolidates sending, testing, and inspection into one API — so you can stop thinking about email and get back to shipping.</p>
            <p>Today, Mailvoidr delivers over 12 billion emails per month for 12,400+ teams in 38 countries.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {[
            ["2024", "founded"],
            ["12B+", "monthly volume"],
            ["12.4k+", "teams"],
            ["54", "employees"],
          ].map(([v, l]) => (
            <div key={l} className="bg-card p-8">
              <div className="text-4xl font-medium tracking-tight">{v}</div>
              <div className="label-mono mt-2">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium">The team</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {TEAM.map((t) => (
              <div key={t.name} className="bg-card p-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 inline-flex items-center justify-center font-mono text-sm">
                  {t.name.split(" ").map((s) => s[0]).join("")}
                </div>
                <h3 className="mt-4 text-base font-medium">{t.name}</h3>
                <div className="label-mono mt-0.5">{t.role}</div>
                <p className="mt-3 text-sm text-muted-foreground">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium">Backed by</h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border">
            {INVESTORS.map((i) => (
              <div key={i} className="bg-card p-8 text-center text-lg tracking-tight font-medium text-muted-foreground hover:text-foreground transition-colors">{i}</div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
