import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
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
} from "lucide-react";
import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { HomeTrustStack } from "@/components/marketing/HomeTrustStack";
import { HomeSend } from "@/components/marketing/HomeSend";
import { SheetKicker } from "@/components/marketing/SheetKicker";
import {
  HOME_BENTO,
  HOME_CHART_PREVIEW,
  HOME_HERO,
  HOME_METRICS,
  HOME_PLATFORM,
  HOME_QUOTE,
  HOME_REVIEWS,
  HOME_REVIEWS_HEADING,
  mailSendUrl,
} from "@/content/marketing/home";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTiltCard } from "@/hooks/useTiltCard";
import PixelBlast from "@/components/pixel-blast";

export default function Home() {
  const sendUrl = mailSendUrl();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroDottedRef = useRef<HTMLDivElement>(null);
  const heroGradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: MouseEvent) {
      const rect = hero!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (heroDottedRef.current) {
        heroDottedRef.current.style.transform = `translate3d(${px * 10}px, ${py * 10}px, 0)`;
      }
      if (heroGradientRef.current) {
        heroGradientRef.current.style.transform = `translate3d(${px * -20}px, ${py * -20}px, 0)`;
      }
    }

    function handleLeave() {
      if (heroDottedRef.current) heroDottedRef.current.style.transform = "";
      if (heroGradientRef.current) heroGradientRef.current.style.transform = "";
    }

    hero.addEventListener("mousemove", handleMove);
    hero.addEventListener("mouseleave", handleLeave);
    return () => {
      hero.removeEventListener("mousemove", handleMove);
      hero.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const platformRevealRef = useScrollReveal();
  const metricsRevealRef = useScrollReveal();
  const reviewsRevealRef = useScrollReveal();
  const ctaRevealRef = useScrollReveal();

  const bentoTilt1 = useTiltCard();
  const bentoTilt2 = useTiltCard();
  const bentoTilt3 = useTiltCard();
  const bentoTilt4 = useTiltCard();
  const smallTilt1 = useTiltCard();
  const smallTilt2 = useTiltCard();
  const smallTilt3 = useTiltCard();
  const smallTilt4 = useTiltCard();

  return (
    <MarketingLayout>
      <section ref={heroRef} className="relative min-h-[85vh] overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <PixelBlast
            variant="circle"
            pixelSize={4}
            color="#B497CF"
            patternScale={4.25}
            patternDensity={0.9}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.4}
            edgeFade={0.3}
            transparent
          />
        </div>
        <div className="relative z-10 flex min-h-[85vh] w-full items-center page-band">
          <div className="max-w-2xl">
            <Link
              to={HOME_HERO.eyebrow.href}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[12.5px] shadow-sm backdrop-blur transition-colors hover:bg-accent"
            >
              <span className="font-body text-[10.5px] uppercase tracking-wider text-primary">
                {HOME_HERO.eyebrow.label}
              </span>
              <span className="text-muted-foreground">
                {HOME_HERO.eyebrow.text}
              </span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
            <h1 className="mt-6 max-w-5xl text-balance font-sora text-5xl font-medium leading-[1] tracking-[-0.04em] md:text-7xl">
              {HOME_HERO.title}
              <br />
              <span className="text-gradient-primary">
                {HOME_HERO.titleMuted}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {HOME_HERO.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                data-testid="hero-cta-primary"
                className="inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]"
              >
                Start sending free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/docs"
                data-testid="hero-cta-docs"
                className="inline-flex items-center gap-2 rounded border border-border bg-card px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-accent"
              >
                <Terminal className="h-3.5 w-3.5" /> Read the docs
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 font-outfit text-[11px] text-muted-foreground">
              {HOME_HERO.bullets.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeTrustStack />

      <section className="border-b border-border">
        <blockquote className="page-band py-7 md:py-9">
          <p className="max-w-5xl font-sora text-lg leading-snug tracking-tight text-foreground/90 md:text-3xl">
            <span className="mr-3 font-mono text-muted-foreground">“</span>
            {HOME_QUOTE.text}
          </p>
          <footer className="mt-4 font-mono text-[12px] text-muted-foreground">
            {HOME_QUOTE.attribution}
          </footer>
        </blockquote>
      </section>

      <HomeSend />

      <section className="border-b border-border">
        <div ref={platformRevealRef} className="page-band border-b border-border py-10 md:py-12">
          <SheetKicker>Platform</SheetKicker>
          <h2 className="mt-3 max-w-2xl text-balance font-sora text-3xl font-medium tracking-tight md:text-4xl">
            Everything you need to send, test, and observe email — in one
            workspace.
          </h2>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-3">
          <Bento
            icon={Send}
            title={HOME_BENTO.send.title}
            desc={HOME_BENTO.send.desc}
            span="md:col-span-2"
            preview={<SendPreview endpoint={sendUrl} />}
            tiltRef={bentoTilt1}
          />
          <Bento
            icon={FlaskConical}
            title={HOME_BENTO.testing.title}
            desc={HOME_BENTO.testing.desc}
            preview={<TestPreview />}
            tiltRef={bentoTilt2}
          />
          <Bento
            icon={Inbox}
            title={HOME_BENTO.inboxes.title}
            desc={HOME_BENTO.inboxes.desc}
            preview={<InboxPreview />}
            tiltRef={bentoTilt3}
          />
          <Bento
            icon={LineChart}
            title={HOME_BENTO.analytics.title}
            desc={HOME_BENTO.analytics.desc}
            span="md:col-span-2"
            preview={<AnalyticsPreview />}
            tiltRef={bentoTilt4}
          />
        </div>
        <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 md:grid-cols-4">
          <SmallFeature
            icon={ShieldCheck}
            title={HOME_PLATFORM[0].title}
            desc={HOME_PLATFORM[0].desc}
            tiltRef={smallTilt1}
          />
          <SmallFeature
            icon={Webhook}
            title={HOME_PLATFORM[1].title}
            desc={HOME_PLATFORM[1].desc}
            tiltRef={smallTilt2}
          />
          <SmallFeature
            icon={KeyRound}
            title={HOME_PLATFORM[2].title}
            desc={HOME_PLATFORM[2].desc}
            tiltRef={smallTilt3}
          />
          <SmallFeature
            icon={Globe}
            title={HOME_PLATFORM[3].title}
            desc={HOME_PLATFORM[3].desc}
            tiltRef={smallTilt4}
          />
        </div>
      </section>

      <section className="border-b border-border">
        <div
          ref={metricsRevealRef}
          className="grid gap-px bg-border sm:grid-cols-2 md:grid-cols-4"
        >
          {HOME_METRICS.map(([value, label]) => (
            <div key={label} data-reveal className="bg-background p-8 md:p-10">
              <div className="text-3xl font-medium tracking-tight">{value}</div>
              <div className="mt-2 label-mono">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border">
        <div ref={reviewsRevealRef} className="page-band border-b border-border py-10 md:py-12">
          <SheetKicker>{HOME_REVIEWS_HEADING.kicker}</SheetKicker>
          <h2
            data-reveal
            className="mt-3 text-balance font-sora text-3xl font-medium tracking-tight md:text-4xl"
          >
            {HOME_REVIEWS_HEADING.title}
          </h2>
          <p
            data-reveal
            className="mt-3 max-w-xl text-[15px] text-muted-foreground"
          >
            {HOME_REVIEWS_HEADING.subtitle}
          </p>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2">
          {HOME_REVIEWS.slice(0, 4).map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </div>
      </section>

      <section>
        <div ref={ctaRevealRef} className="page-band py-20 md:py-28">
          <SheetKicker>Get started</SheetKicker>
          <h2
            data-reveal
            className="mt-3 max-w-3xl text-balance font-sora text-4xl font-medium tracking-tight md:text-6xl"
          >
            Ship email like you ship code.
          </h2>
          <p
            data-reveal
            className="mt-4 max-w-xl text-muted-foreground"
          >
            Create a workspace, verify a domain, and send your first message in
            minutes. No sales calls required.
          </p>
          <div
            data-reveal
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]"
            >
              Start for free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded border border-border bg-card px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
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
  span = "",
  preview,
  tiltRef,
}: {
  icon: typeof Send;
  title: string;
  desc: string;
  span?: string;
  preview: ReactNode;
  tiltRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={tiltRef} data-reveal className={`tilt-card bg-card p-6 ${span}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
      </div>
      <p className="max-w-xs mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6">{preview}</div>
    </div>
  );
}

function SmallFeature({
  icon: Icon,
  title,
  desc,
  tiltRef,
}: {
  icon: typeof Send;
  title: string;
  desc: string;
  tiltRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={tiltRef} data-reveal className="p-6 tilt-card bg-card">
      <Icon className="w-4 h-4 text-primary" />
      <h4 className="mt-3 text-sm font-medium">{title}</h4>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function SendPreview({ endpoint }: { endpoint: string }) {
  const path = endpoint.replace(/^https?:\/\/[^/]+/, "");

  return (
    <div className="border border-border bg-background">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-destructive/60" />
        <span className="w-2 h-2 rounded-full bg-amber-500/60" />
        <span className="w-2 h-2 rounded-full bg-primary/60" />
        <span className="ml-2 font-body text-[10.5px] text-muted-foreground">
          POST {path}
        </span>
      </div>
      <div className="space-y-1 p-3 font-body text-[11.5px] text-muted-foreground">
        <div>
          <span className="text-foreground">→</span> from:
          hello@mail.yourdomain.com
        </div>
        <div>
          <span className="text-foreground">→</span> to: riya@example.com
        </div>
        <div>
          <span className="text-foreground">→</span> subject: Welcome to Acme
        </div>
        <div className="text-primary">
          ← 202 Accepted · id=01H… · status=queued
        </div>
      </div>
    </div>
  );
}

function TestPreview() {
  return (
    <div className="p-4 border border-border bg-background">
      <div className="flex items-center justify-between">
        <span className="label-mono">Spam score</span>
        <span className="text-xs font-body text-primary">0.4 / 10</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden bg-muted">
        <div className="h-full bg-primary" style={{ width: "4%" }} />
      </div>
      <div className="mt-4 space-y-1.5 text-[11.5px]">
        {["DKIM ✓", "SPF ✓", "List-Unsubscribe ✓"].map((item) => (
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
    <div className="border divide-y divide-border border-border bg-background">
      {[
        ["Stripe", "Receipt #4922"],
        ["GitHub", "New SSH key added"],
        ["Figma", "Comment on Dashboard v4"],
      ].map(([from, subject]) => (
        <div key={subject} className="flex items-center gap-3 px-3 py-2">
          <div className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted font-body text-[9.5px]">
            {from.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1 text-[12px]">
            <div className="truncate">{from}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {subject}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="h-32 p-3 border border-border bg-background">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={HOME_CHART_PREVIEW}>
          <defs>
            <linearGradient
              id="home-preview-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
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

function reviewAvatarHue(name: string): string {
  const hues = ["151", "160", "142", "172"];
  const index =
    [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % hues.length;
  return hues[index];
}

function ReviewCard({ review }: { review: (typeof HOME_REVIEWS)[number] }) {
  const initials = review.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = reviewAvatarHue(review.name);

  return (
    <figure className="flex flex-col justify-between bg-background p-6 md:p-8">
      <blockquote className="text-[15px] leading-[1.65] text-foreground/90">
        {review.quote}
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-2.5">
        <div
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden font-body text-[10px] font-semibold text-white"
          style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {review.name}
          </span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {review.role} · {review.company}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
