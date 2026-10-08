import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

/** Same pattern as `.dotted-bg`: 1px-radius dots centered on a 22px grid. */
const DOT_SPACING = 22;
const DOT_RADIUS = 1;
const DOT_SCALE_MAX = 1.4;
const REST_EPSILON = 0.05;

const DEFAULT_INFLUENCE_RADIUS = 90;
const DEFAULT_PUSH_STRENGTH = 2;
const DEFAULT_STIFFNESS = 0.08;
const DEFAULT_DAMPING = 0.85;

export type DottedBgTune = {
  influenceRadius?: number;
  pushStrength?: number;
  stiffness?: number;
  damping?: number;
};

type Rgb = [number, number, number];

type Dot = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Options = Required<DottedBgTune> & { overlay: boolean };

function parseRgb(color: string): Rgb {
  const channels = color.match(/[\d.]+/g);
  if (!channels || channels.length < 3) return [0, 0, 0];
  return [Number(channels[0]), Number(channels[1]), Number(channels[2])];
}

function mixRgb(from: Rgb, to: Rgb, amount: number): string {
  const r = Math.round(from[0] + (to[0] - from[0]) * amount);
  const g = Math.round(from[1] + (to[1] - from[1]) * amount);
  const b = Math.round(from[2] + (to[2] - from[2]) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function borderTokenColor(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--border")
    .trim();
  return raw ? `hsl(${raw})` : "rgb(0, 0, 0)";
}

function useInteractiveDots(
  containerRef: RefObject<HTMLElement | null>,
  options: Options,
) {
  const {
    overlay,
    influenceRadius,
    pushStrength,
    stiffness,
    damping,
  } = options;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const listenTarget = overlay ? container.parentElement : container;
    if (!listenTarget) return;

    let restorePosition = false;
    let restoreIsolation = false;
    if (overlay) {
      const parentStyle = getComputedStyle(listenTarget);
      if (parentStyle.position === "static") {
        listenTarget.style.position = "relative";
        restorePosition = true;
      }
      if (parentStyle.isolation === "auto") {
        listenTarget.style.isolation = "isolate";
        restoreIsolation = true;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "-1";
    container.prepend(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }

    let dots: Dot[] = [];
    let cssWidth = 0;
    let cssHeight = 0;
    let borderLeft = 0;
    let borderTop = 0;
    let baseColor = "rgb(0, 0, 0)";
    let baseRgb: Rgb = [0, 0, 0];
    let foregroundRgb: Rgb = [255, 255, 255];
    const cursor = { x: -9999, y: -9999, active: false };
    let frame = 0;

    const readColors = () => {
      baseColor = borderTokenColor();
      baseRgb = parseRgb(baseColor);
      foregroundRgb = parseRgb(getComputedStyle(container).color);
    };

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        let scale = 1;
        let fill = baseColor;
        if (cursor.active) {
          const dx = dot.x - cursor.x;
          const dy = dot.y - cursor.y;
          const dist = Math.hypot(dx, dy);
          if (dist < influenceRadius) {
            const proximity = 1 - dist / influenceRadius;
            scale = 1 + (DOT_SCALE_MAX - 1) * proximity;
            fill = mixRgb(baseRgb, foregroundRgb, proximity * 0.85);
          }
        }
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const layout = () => {
      const box = getComputedStyle(container);
      borderLeft = parseFloat(box.borderLeftWidth) || 0;
      borderTop = parseFloat(box.borderTopWidth) || 0;
      cssWidth = container.clientWidth;
      cssHeight = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const next: Dot[] = [];
      const cols = Math.ceil(cssWidth / DOT_SPACING);
      const rows = Math.ceil(cssHeight / DOT_SPACING);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const homeX = col * DOT_SPACING + DOT_SPACING / 2;
          const homeY = row * DOT_SPACING + DOT_SPACING / 2;
          next.push({ homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0 });
        }
      }
      dots = next;
      readColors();
      draw();
    };

    const tick = () => {
      let moving = false;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        if (cursor.active) {
          const dx = dot.x - cursor.x;
          const dy = dot.y - cursor.y;
          const dist = Math.hypot(dx, dy);
          if (dist < influenceRadius && dist > 0.001) {
            const falloff = 1 - dist / influenceRadius;
            const push = (pushStrength * falloff) / dist;
            dot.vx += dx * push;
            dot.vy += dy * push;
          }
        }

        dot.vx += (dot.homeX - dot.x) * stiffness;
        dot.vy += (dot.homeY - dot.y) * stiffness;
        dot.vx *= damping;
        dot.vy *= damping;
        dot.x += dot.vx;
        dot.y += dot.vy;

        const nearHome =
          Math.abs(dot.x - dot.homeX) <= REST_EPSILON &&
          Math.abs(dot.y - dot.homeY) <= REST_EPSILON;
        const settled =
          Math.abs(dot.vx) <= REST_EPSILON && Math.abs(dot.vy) <= REST_EPSILON;

        if (!cursor.active && nearHome && settled) {
          dot.x = dot.homeX;
          dot.y = dot.homeY;
          dot.vx = 0;
          dot.vy = 0;
          continue;
        }

        if (!settled || (!cursor.active && !nearHome)) moving = true;
      }

      draw();
      if (moving) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const start = () => {
      if (frame) return;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      cursor.x = event.clientX - rect.left - borderLeft;
      cursor.y = event.clientY - rect.top - borderTop;
      cursor.active = true;
      start();
    };

    const onLeave = () => {
      cursor.x = -9999;
      cursor.y = -9999;
      cursor.active = false;
      start();
    };

    layout();
    container.style.backgroundImage = "none";

    listenTarget.addEventListener("pointermove", onMove);
    listenTarget.addEventListener("pointerleave", onLeave);

    const resizeObserver = new ResizeObserver(() => {
      layout();
    });
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver(() => {
      readColors();
      if (!frame) draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      listenTarget.removeEventListener("pointermove", onMove);
      listenTarget.removeEventListener("pointerleave", onLeave);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.remove();
      container.style.backgroundImage = "";
      if (restorePosition) listenTarget.style.position = "";
      if (restoreIsolation) listenTarget.style.isolation = "";
    };
  }, [
    containerRef,
    overlay,
    influenceRadius,
    pushStrength,
    stiffness,
    damping,
  ]);
}

type DottedBgProps<T extends ElementType = "div"> = DottedBgTune & {
  as?: T;
  /** Fill the parent and sit behind its other children. */
  overlay?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Dotted field with the reviews hover. Wrap content, or set `overlay` and
 * drop it inside a box to paint behind that box's other children.
 */
export function DottedBg<T extends ElementType = "div">({
  as,
  overlay = false,
  className,
  children,
  influenceRadius = DEFAULT_INFLUENCE_RADIUS,
  pushStrength = DEFAULT_PUSH_STRENGTH,
  stiffness = DEFAULT_STIFFNESS,
  damping = DEFAULT_DAMPING,
  ...props
}: DottedBgProps<T>) {
  const ref = useRef<HTMLElement>(null);
  useInteractiveDots(ref, {
    overlay,
    influenceRadius,
    pushStrength,
    stiffness,
    damping,
  });

  // `ElementType` collapses JSX props to `never` under TypeScript 6. The runtime tag is still `as`.
  const Tag = (as ?? "div") as unknown as "div";

  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement>}
      className={cn(
        "dotted-bg",
        overlay ? "pointer-events-none absolute inset-0 -z-10" : "relative isolate",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
