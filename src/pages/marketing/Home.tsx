import {
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { CodeBlock } from "@/components/CodeBlock";
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
} from "@/content/marketing/home";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTiltCard } from "@/hooks/useTiltCard";
import PixelBlast from "@/components/pixel-blast";
import { PortalFieldCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import { useTheme } from "next-themes";

export default function Home() {
  const [lang, setLang] = useState<CodeSampleId>("send_node");
  const sendUrl = mailSendUrl();
  const codeSamples = useMemo(() => buildCodeSamples(sendUrl), [sendUrl]);
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

  const sendRevealRef = useScrollReveal();
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
      <section ref={heroRef} className="relative min-h-[85vh] overflow-hidden">
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
        <div className="relative z-10 flex items-center justify-center w-full min-h-[85vh] h-full px-6 mx-auto max-w-7xl ">
          <div className="text-center">
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
            <h1 className="mx-auto font-sora mt-6 max-w-5xl text-balance text-5xl font-medium leading-[1] tracking-[-0.04em] md:text-7xl">
              {HOME_HERO.title}
              <br />
              <span className="text-gradient-primary">
                {HOME_HERO.titleMuted}
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-base leading-relaxed text-muted-foreground md:mx-0 md:text-lg">
              {HOME_HERO.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 ">
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 font-outfit text-[11px] text-muted-foreground">
              {HOME_HERO.bullets.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 overflow-hidden">
        <div className="reviews-edge-mask">
          <StackMarquee items={HOME_STACK} />
        </div>
      </section>

      <section className="border-b border-border">
        <div ref={sendRevealRef} className="px-6 py-24 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal>
              <span className="label-mono">Send</span>
              <h2 className="mt-2 text-4xl font-medium leading-tight tracking-tight">
                One HTTP endpoint. One SMTP relay.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Create an API key, verify a domain, and send. Mailvoidr queues
                the message, relays over SMTP, records lifecycle events, and
                fires webhooks your app can trust.
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
            <div data-reveal>
              <CodeBlock
                code={codeSamples[lang]}
                language={
                  lang === "send_curl" ? "bash" : lang.replace("send_", "")
                }
                filename={
                  lang === "send_curl"
                    ? "send-email.sh"
                    : lang === "send_node"
                      ? "send-email.ts"
                      : "send-email.py"
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
        </div>
      </section>

      <section className="border-b border-border">
        <div ref={platformRevealRef} className="px-6 py-24 mx-auto max-w-7xl">
          <div data-reveal className="max-w-2xl mb-12">
            <span className="label-mono">Platform</span>
            <h2 className="mt-2 text-4xl font-medium leading-tight tracking-tight text-balance">
              Everything you need to send, test, and observe email — in one
              workspace.
            </h2>
          </div>
          <div className="grid gap-px border border-border bg-border md:grid-cols-3">
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
          <div className="grid gap-px border border-t-0 border-border bg-border sm:grid-cols-2 md:grid-cols-4">
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
        </div>
      </section>

      <section className="">
        <div ref={metricsRevealRef} className="px-6 py-20 mx-auto max-w-7xl">
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-4">
            {HOME_METRICS.map(([value, label]) => (
              <div key={label} data-reveal className="p-8 bg-card">
                <div className="text-3xl font-medium tracking-tight">
                  {value}
                </div>
                <div className="mt-2 label-mono">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden bg-transparent">
        <div className="absolute inset-0 pointer-events-none gradient-radial-muted" />

        <div
          ref={reviewsRevealRef}
          className="relative px-6 mx-auto text-center mb-14 max-w-7xl"
        >
          <h2
            data-reveal
            className="text-4xl font-medium tracking-tight text-balance md:text-5xl"
          >
            {HOME_REVIEWS_HEADING.title}
          </h2>
          <p
            data-reveal
            className="max-w-xl mx-auto mt-3 text-base text-muted-foreground md:text-lg"
          >
            {HOME_REVIEWS_HEADING.subtitle}
          </p>
        </div>

        <div className="relative space-y-3 reviews-edge-mask">
          <ReviewsMarqueeRow reviews={HOME_REVIEWS} />
          <ReviewsMarqueeRow reviews={[...HOME_REVIEWS].reverse()} reverse />
        </div>
      </section>

      <section className="relative  min-h-[80vh]">
        {isDark && (
          <div className="relative z-0 shader-frame">
            <div className="absolute z-10 -inset-1 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 blur-md" />
            <PortalFieldCollection
              variant="cloud-field"
              hue={0}
              saturation={1.0}
              brightness={1.0}
              className="min-h-[80vh] z-0 absolute"
            />
          </div>
        )}

        <div
          ref={ctaRevealRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full max-w-4xl py-32 mx-auto text-center"
        >
          <span data-reveal className="label-mono">
            Get started
          </span>
          <h2
            data-reveal
            className="mt-3 text-4xl font-medium tracking-tight text-balance md:text-6xl"
          >
            Ship email like you ship code.
          </h2>
          <p
            data-reveal
            className="max-w-xl mx-auto mt-4 text-muted-foreground"
          >
            Create a workspace, verify a domain, and send your first message in
            minutes. No sales calls required.
          </p>
          <div
            data-reveal
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]"
            >
              Start for free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded border-border bg-card/80 backdrop-blur hover:bg-accent"
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

function StackMarquee({ items }: { items: readonly string[] }) {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden">
      <div className="flex items-center w-max gap-x-10 md:gap-x-14 stack-marquee-track">
        {repeated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="text-lg font-semibold tracking-tight shrink-0 font-display text-muted-foreground/50 md:text-xl"
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
        className={`flex w-max gap-3 ${reverse ? "reviews-marquee-track-reverse" : "reviews-marquee-track"}`}
      >
        {items.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

function reviewAvatarHue(name: string): string {
  const hues = ["151", "217", "38", "271", "339", "200"];
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
          <span className="block text-sm font-medium truncate">
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
