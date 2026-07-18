import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import {
  ABOUT_CTA,
  ABOUT_FOCUS,
  ABOUT_HERO,
  ABOUT_METRICS,
} from '@/content/marketing/about';

export default function About() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <span className="label-mono">About</span>
          <h1 className="mt-2 text-5xl md:text-6xl tracking-tight font-medium leading-[1] text-balance">
            {ABOUT_HERO.title}{' '}
            <span className="text-muted-foreground">{ABOUT_HERO.titleMuted}</span>
          </h1>
          <div className="mt-10 space-y-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {ABOUT_HERO.paragraphs.map((paragraph) => (
              <p key={paragraph} className={paragraph === ABOUT_HERO.paragraphs[0] ? 'text-foreground' : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {ABOUT_METRICS.map(([value, label]) => (
            <div key={label} className="bg-card p-8">
              <div className="text-4xl font-medium tracking-tight">{value}</div>
              <div className="label-mono mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium">What we focus on</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {ABOUT_FOCUS.map((item) => (
              <div key={item.title} className="bg-card p-6">
                <h3 className="text-base font-medium tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl tracking-tight font-medium">{ABOUT_CTA.title}</h2>
          <p className="mt-4 text-muted-foreground">{ABOUT_CTA.body}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={ABOUT_CTA.primaryHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {ABOUT_CTA.primaryLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={ABOUT_CTA.secondaryHref}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {ABOUT_CTA.secondaryLabel}
            </Link>
            <Link
              to={ABOUT_CTA.contactHref}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {ABOUT_CTA.contactLabel}
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
