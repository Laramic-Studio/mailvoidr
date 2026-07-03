import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import {
  ArrowRight,
  Check,
  FlaskConical,
  Globe,
  Inbox,
  KeyRound,
  LineChart,
  Send,
  ShieldCheck,
  Terminal,
  Webhook,
} from 'lucide-react';
import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import { CodeBlock } from '@/components/CodeBlock';
import { DashboardPreview } from '@/components/marketing/DashboardPreview';
import {
  buildCodeSamples,
  CODE_SAMPLE_LANGS,
  HOME_BENTO,
  HOME_CHART_PREVIEW,
  HOME_HERO,
  HOME_METRICS,
  HOME_PLATFORM,
  HOME_REVIEWS,
  HOME_REVIEWS_HEADING,
  HOME_SEND_FEATURES,
  HOME_STACK,
  mailSendUrl,
  type CodeSampleId,
} from '@/content/marketing/home';
import DeliverySpeedometer from './particle';

export default function Home() {
  const [lang, setLang] = useState<CodeSampleId>('send_node');
  const sendUrl = mailSendUrl();
  const codeSamples = useMemo(() => buildCodeSamples(sendUrl), [sendUrl]);

  return (
    <MarketingLayout>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 dotted-bg opacity-40" />
        <div className="pointer-events-none absolute inset-0 gradient-radial-primary" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24">
          <div className="grid items-center gap-10 md:grid-cols-[1fr,minmax(300px,400px)] md:gap-8 lg:gap-12">
            <div className="min-w-0">
              <Link
                to={HOME_HERO.eyebrow.href}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12.5px] transition-colors hover:bg-accent"
              >
                <span className="font-body text-[10.5px] uppercase tracking-wider text-primary">
                  {HOME_HERO.eyebrow.label}
                </span>
                <span className="text-muted-foreground">{HOME_HERO.eyebrow.text}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Link>
              <h1 className="mt-6 max-w-4xl text-balance text-5xl font-medium leading-[1] tracking-[-0.04em] md:text-6xl lg:text-7xl">
                {HOME_HERO.title}
                <br />
                <span className="text-muted-foreground">{HOME_HERO.titleMuted}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {HOME_HERO.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  data-testid="hero-cta-primary"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start sending free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/docs"
                  data-testid="hero-cta-docs"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-accent"
                >
                  <Terminal className="h-3.5 w-3.5" /> Read the docs
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4 font-headline text-[11px] text-muted-foreground">
                {HOME_HERO.bullets.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-primary" /> {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-md md:mx-0 md:justify-self-end">
              <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-primary/10 blur-3xl" />
              <DeliverySpeedometer />
            </div>
          </div>

          
        </div>
      </section>

      <section className="overflow-hidden  py-12">
        <p className="label-mono mb-8 text-center">Built for your stack</p>
        <div className="reviews-edge-mask">
          <StackMarquee items={HOME_STACK} />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="label-mono">Send</span>
              <h2 className="mt-2 text-4xl font-medium leading-tight tracking-tight">
                One HTTP endpoint. One SMTP relay.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Create an API key, verify a domain, and send. Mailvoidr queues the message, relays over
                SMTP, records lifecycle events, and fires webhooks your app can trust.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {HOME_SEND_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary font-outfit" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <CodeBlock
              code={codeSamples[lang]}
              language={lang === 'send_curl' ? 'bash' : lang.replace('send_', '')}
              filename={
                lang === 'send_curl'
                  ? 'send-email.sh'
                  : lang === 'send_node'
                    ? 'send-email.ts'
                    : 'send-email.py'
              }
              showWindowChrome
              elevated
              showLineNumbers
              tabs={CODE_SAMPLE_LANGS.map((sample) => ({
                id: sample.id,
                label: sample.label,
              }))}
              activeTab={lang}
              onTabChange={(id) => setLang(id as CodeSampleId)}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <span className="label-mono">Platform</span>
            <h2 className="mt-2 text-balance text-4xl font-medium leading-tight tracking-tight">
              Everything you need to send, test, and observe email — in one workspace.
            </h2>
          </div>
          <div className="grid gap-px border border-border bg-border md:grid-cols-3">
            <Bento
              icon={Send}
              title={HOME_BENTO.send.title}
              desc={HOME_BENTO.send.desc}
              span="md:col-span-2"
              preview={<SendPreview endpoint={sendUrl} />}
            />
            <Bento
              icon={FlaskConical}
              title={HOME_BENTO.testing.title}
              desc={HOME_BENTO.testing.desc}
              preview={<TestPreview />}
            />
            <Bento
              icon={Inbox}
              title={HOME_BENTO.inboxes.title}
              desc={HOME_BENTO.inboxes.desc}
              preview={<InboxPreview />}
            />
            <Bento
              icon={LineChart}
              title={HOME_BENTO.analytics.title}
              desc={HOME_BENTO.analytics.desc}
              span="md:col-span-2"
              preview={<AnalyticsPreview />}
            />
          </div>
          <div className="grid gap-px border border-border border-t-0 bg-border sm:grid-cols-2 md:grid-cols-4">
            <SmallFeature icon={ShieldCheck} title={HOME_PLATFORM[0].title} desc={HOME_PLATFORM[0].desc} />
            <SmallFeature icon={Webhook} title={HOME_PLATFORM[1].title} desc={HOME_PLATFORM[1].desc} />
            <SmallFeature icon={KeyRound} title={HOME_PLATFORM[2].title} desc={HOME_PLATFORM[2].desc} />
            <SmallFeature icon={Globe} title={HOME_PLATFORM[3].title} desc={HOME_PLATFORM[3].desc} />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-4">
            {HOME_METRICS.map(([value, label]) => (
              <div key={label} className="bg-card p-8">
                <div className="text-3xl font-medium tracking-tight">{value}</div>
                <div className="label-mono mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border bg-background py-24">
        <div className="pointer-events-none absolute inset-0 gradient-radial-muted" />

        <div className="relative mx-auto mb-14 max-w-7xl px-6 text-center">
          <h2 className="text-balance text-4xl font-medium tracking-tight md:text-5xl">
            {HOME_REVIEWS_HEADING.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            {HOME_REVIEWS_HEADING.subtitle}
          </p>
        </div>

        <div className="reviews-edge-mask relative space-y-3">
          <ReviewsMarqueeRow reviews={HOME_REVIEWS} />
          <ReviewsMarqueeRow reviews={[...HOME_REVIEWS].reverse()} reverse />
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 gradient-radial-primary" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <h2 className="text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Ship email like you ship code.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create a workspace, verify a domain, and send your first message in minutes. No sales calls
            required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start for free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Bento({
  icon: Icon,
  title,
  desc,
  span = '',
  preview,
}: {
  icon: typeof Send;
  title: string;
  desc: string;
  span?: string;
  preview: ReactNode;
}) {
  return (
    <div className={`bg-card p-6 ${span}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
      </div>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6">{preview}</div>
    </div>
  );
}

function SmallFeature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Send;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-card p-6">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="mt-3 text-sm font-medium">{title}</h4>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function SendPreview({ endpoint }: { endpoint: string }) {
  const path = endpoint.replace(/^https?:\/\/[^/]+/, '');

  return (
    <div className="border border-border bg-background">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-destructive/60" />
        <span className="h-2 w-2 rounded-full bg-amber-500/60" />
        <span className="h-2 w-2 rounded-full bg-primary/60" />
        <span className="ml-2 font-body text-[10.5px] text-muted-foreground">POST {path}</span>
      </div>
      <div className="space-y-1 p-3 font-body text-[11.5px] text-muted-foreground">
        <div>
          <span className="text-foreground">→</span> from: hello@mail.yourdomain.com
        </div>
        <div>
          <span className="text-foreground">→</span> to: riya@example.com
        </div>
        <div>
          <span className="text-foreground">→</span> subject: Welcome to Acme
        </div>
        <div className="text-primary">← 202 Accepted · id=01H… · status=queued</div>
      </div>
    </div>
  );
}

function TestPreview() {
  return (
    <div className="border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="label-mono">Spam score</span>
        <span className="font-body text-xs text-primary">0.4 / 10</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden bg-muted">
        <div className="h-full bg-primary" style={{ width: '4%' }} />
      </div>
      <div className="mt-4 space-y-1.5 text-[11.5px]">
        {['DKIM ✓', 'SPF ✓', 'List-Unsubscribe ✓'].map((item) => (
          <div key={item} className="font-body text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function InboxPreview() {
  return (
    <div className="divide-y divide-border border border-border bg-background">
      {[
        ['Stripe', 'Receipt #4922'],
        ['GitHub', 'New SSH key added'],
        ['Figma', 'Comment on Dashboard v4'],
      ].map(([from, subject]) => (
        <div key={subject} className="flex items-center gap-3 px-3 py-2">
          <div className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted font-body text-[9.5px]">
            {from.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1 text-[12px]">
            <div className="truncate">{from}</div>
            <div className="truncate text-[11px] text-muted-foreground">{subject}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="h-32 border border-border bg-background p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={HOME_CHART_PREVIEW}>
          <defs>
            <linearGradient id="home-preview-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="sent"
            stroke="hsl(var(--primary))"
            fill="url(#home-preview-gradient)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StackMarquee({ items }: { items: readonly string[] }) {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden">
      <div className="flex w-max items-center gap-x-10 md:gap-x-14 stack-marquee-track">
        {repeated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="shrink-0 font-display text-lg font-semibold tracking-tight text-muted-foreground/50 md:text-xl"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewsMarqueeRow({
  reviews,
  reverse = false,
}: {
  reviews: readonly (typeof HOME_REVIEWS)[number][];
  reverse?: boolean;
}) {
  const items = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-3 ${reverse ? 'reviews-marquee-track-reverse' : 'reviews-marquee-track'}`}
      >
        {items.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

function reviewAvatarHue(name: string): string {
  const hues = ['151', '217', '38', '271', '339', '200'];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % hues.length;
  return hues[index];
}

function ReviewCard({ review }: { review: (typeof HOME_REVIEWS)[number] }) {
  const initials = review.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const hue = reviewAvatarHue(review.name);

  return (
    <figure className="flex w-[min(88vw,340px)] shrink-0 flex-col justify-between rounded-lg bg-muted/50 p-6">
      <blockquote className="text-[14px] leading-[1.65] text-foreground/90">
        {review.quote}
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-2.5">
        <div
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md font-body text-[10px] font-semibold text-white"
          style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium">{review.name}</span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {review.role} · {review.company}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
