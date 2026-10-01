import type { ComponentType, JSX, SVGProps } from "react";
import {
  HOME_TRUST_INTRO,
  HOME_TRUST_SUB,
} from "@/content/marketing/home";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Laravel } from "@/components/ui/svgs/laravel";
import { Swagger } from "@/components/ui/svgs/swagger";
import { N8n } from "@/components/ui/svgs/n8n";
import { Html5 } from "@/components/ui/svgs/html5";
import { CodexDark } from "@/components/ui/svgs/codexDark";
import { CodexLight } from "@/components/ui/svgs/codexLight";

type StackIcon = ComponentType<SVGProps<SVGSVGElement>>;

const STACK: {
  label: string;
  Icon: StackIcon;
  IconDark?: StackIcon;
}[] = [
  { label: "Node.js", Icon: Nodejs },
  { label: "Python", Icon: Python },
  { label: "Go", Icon: Golang },
  { label: "Laravel", Icon: Laravel },
  { label: "REST API", Icon: Swagger },
  { label: "Sandbox", Icon: CodexLight, IconDark: CodexDark },
  { label: "Webhooks", Icon: N8n },
  { label: "Templates", Icon: Html5 },
];

const logoClass =
  "h-8 w-auto max-w-[4.5rem] shrink-0 grayscale brightness-150 opacity-55 transition duration-200 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100";

  // rows[i] = how many cells row i has, right-aligned to the card's edge
const ROWS = [6, 3, 3, 3, 3];
const COLS = Math.max(...ROWS);
const CW = 96; // cell width  (CW and CH must be multiples of 8 so dashes line up)
const CH = 46; // cell height

const filled = (r: number, c: number) =>
  r >= 0 && r < ROWS.length && c >= 0 && c < COLS && c >= COLS - ROWS[r];

function DashedCorner() {
  const W = COLS * CW;
  const H = ROWS.length * CH;
  const lines: JSX.Element[] = [];

  // vertical edges: draw a segment if either neighbouring cell is filled
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS.length; r++) {
      if (filled(r, c) || filled(r, c - 1)) {
        lines.push(
          <line key={`v${r}-${c}`} x1={c * CW + 0.5} y1={r * CH} x2={c * CW + 0.5} y2={(r + 1) * CH} />
        );
      }
    }
  }
  // horizontal edges (skip r = 0, the card's own top border does that)
  for (let r = 1; r <= ROWS.length; r++) {
    for (let c = 0; c < COLS; c++) {
      if (filled(r, c) || filled(r - 1, c)) {
        lines.push(
          <line key={`h${r}-${c}`} x1={c * CW} y1={r * CH + 0.5} x2={(c + 1) * CW} y2={r * CH + 0.5} />
        );
      }
    }
  }

  return (
    <svg
      aria-hidden
      width={W}
      height={H + 1}
      viewBox={`0 0 ${W} ${H + 1}`}
      className="pointer-events-none absolute right-0 top-0 hidden text-foreground/10 lg:block"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 35%)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 35%)",
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeDasharray="4 4"
      shapeRendering="crispEdges"
    >
      {lines}
    </svg>
  );
}

export function HomeTrustStack() {
  return (
    <section className="relative border-b border-border">
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-tl" aria-hidden />
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-tr" aria-hidden />
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-bl" aria-hidden />
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-br" aria-hidden />

      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
      <div className="relative col-span-2 row-span-2 flex flex-col justify-center gap-4 overflow-hidden bg-background p-10 md:p-16 lg:p-20">
  <DashedCorner />
  <p className="relative max-w-sm text-xl font-medium leading-snug tracking-tight md:text-2xl">
    {HOME_TRUST_INTRO}
  </p>
  <p className="relative font-mono text-[13px] text-muted-foreground">
    {HOME_TRUST_SUB}
  </p>
</div>

        {STACK.map(({ label, Icon, IconDark }) => (
          <div
            key={label}
            className="group flex items-center gap-3 bg-background px-5 py-8 md:px-8"
          >
            {IconDark ? (
              <>
                <Icon
                  aria-hidden
                  className={`${logoClass} dark:hidden`}
                />
                <IconDark
                  aria-hidden
                  className={`${logoClass} hidden dark:block`}
                />
              </>
            ) : (
              <Icon
                aria-hidden
                className={`${logoClass} ${label === "Go" ? "text-foreground" : ""}`}
              />
            )}
            <span className="text-lg font-medium tracking-tight text-foreground/80 md:text-xl">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
