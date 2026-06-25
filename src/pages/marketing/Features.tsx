import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FlaskConical,
  Inbox,
  KeyRound,
  LayoutTemplate,
  LineChart,
  ListChecks,
  ScanEye,
  Send,
  Server,
  ShieldCheck,
  Square,
  Users,
  Webhook,
  type LucideIcon,
} from 'lucide-react';
import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import {
  FEATURES_CTA,
  FEATURES_HERO,
  FEATURES_LIST,
  FEATURES_PILLARS,
  type FeatureIcon,
} from '@/content/marketing/features';

const ICON_MAP: Record<FeatureIcon, LucideIcon> = {
  send: Send,
  'flask-conical': FlaskConical,
  inbox: Inbox,
  'shield-check': ShieldCheck,
  'line-chart': LineChart,
  webhook: Webhook,
  'key-round': KeyRound,
  server: Server,
  'layout-template': LayoutTemplate,
  'list-checks': ListChecks,
  users: Users,
  'scan-eye': ScanEye,
};

export default function Features() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <span className="label-mono">Features</span>
          <h1 className="mt-2 max-w-3xl text-5xl font-medium leading-[1.02] tracking-tight md:text-6xl">
            {FEATURES_HERO.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{FEATURES_HERO.subtitle}</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES_LIST.map((feature) => {
              const Icon = ICON_MAP[feature.icon] ?? Square;

              return (
                <div
                  key={feature.title}
                  data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group bg-card p-6 transition-colors hover:bg-accent/30"
                >
                  <div className="inline-flex h-8 w-8 items-center justify-center border border-border bg-background">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-medium tracking-tight">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  <Link
                    to={feature.docHref}
                    className="mt-4 inline-flex items-center gap-1 text-[12.5px] text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  >
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
          <div className="grid gap-6 lg:grid-cols-3">
            {FEATURES_PILLARS.map((pillar) => (
              <div key={pillar.title} className="border border-border bg-card p-6">
                <span className="label-mono">{pillar.kicker}</span>
                <h3 className="mt-3 text-lg font-medium tracking-tight">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                <div className="mt-5 grid grid-cols-2 gap-px border border-border bg-border">
                  {pillar.stats.map(([value, label]) => (
                    <div key={label} className="bg-background p-3">
                      <div className="text-base font-medium">{value}</div>
                      <div className="label-mono mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">{FEATURES_CTA.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{FEATURES_CTA.body}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={FEATURES_CTA.primaryHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {FEATURES_CTA.primaryLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={FEATURES_CTA.secondaryHref}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {FEATURES_CTA.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
