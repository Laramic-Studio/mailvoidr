import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, Terminal } from "lucide-react";
import { HOME_HERO, mailSendUrl } from "@/content/marketing/home";

const MOSAIC_TILES = [
  { col: "1 / 4", row: "1 / 3", bg: "linear-gradient(180deg, #8b7cff 0%, #3a1db8 55%, #1a0a55 100%)" },
  { col: "4 / 13", row: "1 / 3", bg: "linear-gradient(90deg, #4c2ad4 0%, #7a5cff 50%, #24106a 100%)" },
  { col: "1 / 4", row: "3 / 5", bg: "linear-gradient(200deg, #5a3dff 0%, #2c1580 45%, #12062c 100%)" },
  { col: "4 / 9", row: "3 / 5", bg: "linear-gradient(180deg, #8b7cff 0%, #3a1db8 55%, #1a0a55 100%)" },
  { col: "9 / 13", row: "3 / 5", bg: "linear-gradient(15deg, #9a8cff 0%, #4a2ad4 60%, #1a0a40 100%)" },
  { col: "1 / 13", row: "5 / 7", bg: "linear-gradient(90deg, #4c2ad4 0%, #7a5cff 50%, #24106a 100%)" },
  { col: "1 / 4", row: "7 / 9", bg: "linear-gradient(15deg, #9a8cff 0%, #4a2ad4 60%, #1a0a40 100%)" },
  { col: "4 / 13", row: "7 / 9", bg: "linear-gradient(200deg, #5a3dff 0%, #2c1580 45%, #12062c 100%)" },
  { col: "1 / 4", row: "9 / 11", bg: "linear-gradient(180deg, #8b7cff 0%, #3a1db8 55%, #1a0a55 100%)" },
  { col: "4 / 9", row: "9 / 11", bg: "linear-gradient(90deg, #4c2ad4 0%, #7a5cff 50%, #24106a 100%)" },
  { col: "9 / 13", row: "9 / 11", bg: "linear-gradient(200deg, #5a3dff 0%, #2c1580 45%, #12062c 100%)" },
  { col: "1 / 4", row: "11 / 13", bg: "linear-gradient(15deg, #9a8cff 0%, #4a2ad4 60%, #1a0a40 100%)" },
  { col: "4 / 13", row: "11 / 13", bg: "linear-gradient(180deg, #8b7cff 0%, #3a1db8 55%, #1a0a55 100%)" },
] as const;

function heroCommand(sendUrl: string): string {
  try {
    const url = new URL(sendUrl);
    return `curl -X POST ${url.host}${url.pathname}`;
  } catch {
    return "curl -X POST api.mailvoidr.com/api/v1/mail/send";
  }
}

export function CommandHero() {
  const sendUrl = mailSendUrl();
  const command = heroCommand(sendUrl);
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="relative overflow-hidden px-3 pb-4 pt-2 md:px-6">
      <div className="hero-crop-frame relative mx-auto min-h-[calc(100vh-6.5rem)] max-w-[1440px]">
        <span className="hero-crop-handle hero-crop-handle-tl" aria-hidden />
        <span className="hero-crop-handle hero-crop-handle-tr" aria-hidden />
        <span className="hero-crop-handle hero-crop-handle-bl" aria-hidden />
        <span className="hero-crop-handle hero-crop-handle-br" aria-hidden />
        <span className="hero-crop-bracket hero-crop-bracket-tl" aria-hidden />
        <span className="hero-crop-bracket hero-crop-bracket-tr" aria-hidden />
        <span className="hero-crop-bracket hero-crop-bracket-bl" aria-hidden />
        <span className="hero-crop-bracket hero-crop-bracket-br" aria-hidden />
        <div className="hero-crop-grid pointer-events-none absolute inset-0" aria-hidden />

        <div
          className="hero-mosaic pointer-events-none absolute inset-y-[8%] right-[3%] hidden w-[40%] md:grid"
          aria-hidden
        >
          {MOSAIC_TILES.map((tile) => (
            <div
              key={`${tile.col}-${tile.row}`}
              className="hero-mosaic-tile"
              style={{
                gridColumn: tile.col,
                gridRow: tile.row,
                backgroundImage: tile.bg,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex justify-center px-4 pt-6 md:pt-8">
          <Link
            to={HOME_HERO.eyebrow.href}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[13px] text-foreground/80 backdrop-blur-sm transition-colors hover:bg-white/5"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">
              ✦
            </span>
            <span className="underline decoration-white/30 underline-offset-4">
              {HOME_HERO.eyebrow.text}
            </span>
          </Link>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-11rem)] items-center px-6 pb-16 pt-10 md:w-[58%] md:px-12 md:pt-4">
          <div>
            <h1 className="max-w-3xl font-sora text-[2.55rem] font-semibold leading-[1.05] tracking-[-0.045em] text-foreground md:text-5xl lg:text-[4.1rem]">
              {HOME_HERO.title}
              <br />
              <span className="text-foreground/50">{HOME_HERO.titleMuted}</span>
            </h1>

            <div className="mt-10 flex max-w-md flex-col gap-3">
              <Link
                to="/register"
                data-testid="hero-cta-primary"
                className="hero-pill-primary inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-medium"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={copyCommand}
                className="hero-pill-ghost inline-flex h-14 items-center justify-center gap-3 rounded-full px-6 font-mono text-[13px] tracking-tight text-foreground/80"
                aria-label="Copy send API curl command"
              >
                <span className="truncate">{command}</span>
                {copied ? (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 opacity-70" />
                )}
              </button>

              <Link
                to="/docs"
                data-testid="hero-cta-docs"
                className="hero-pill-ghost inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-medium text-foreground/80"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                Read the docs
                <Terminal className="h-4 w-4 opacity-60" />
              </Link>
            </div>

            <p className="mt-10 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              {HOME_HERO.subtitle}
            </p>
            <p className="mt-3 max-w-lg text-[14px] text-muted-foreground">
              Start with{" "}
              <Link
                to="/pricing"
                className="text-primary underline-offset-4 hover:underline"
              >
                {HOME_HERO.bullets[1]}
              </Link>
              . {HOME_HERO.bullets[0]}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
