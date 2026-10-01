import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Terminal } from "lucide-react";
import { HOME_HERO } from "@/content/marketing/home";
import PixelBlast from "@/components/pixel-blast";

export function HomeHero() {
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

  return (
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
  );
}
