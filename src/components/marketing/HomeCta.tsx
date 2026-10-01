import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SheetKicker } from "@/components/marketing/SheetKicker";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const VIEWBOX = 24;
const EYE_MAX = 0.5;
const LERP = 0.12;
const FACE_TILT = -28;
const FACE_ORIGIN = VIEWBOX / 2;
const GAZE_UP = 0.34;

const LEFT_EYE = { x: 11.2896, y: 13.0165 };
const RIGHT_EYE = { x: 17.1712, y: 13.4613 };

function rotateAround(
  point: { x: number; y: number },
  degrees: number,
  origin = FACE_ORIGIN,
) {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - origin;
  const dy = point.y - origin;
  return {
    x: origin + dx * cos - dy * sin,
    y: origin + dx * sin + dy * cos,
  };
}

function faceShift() {
  return Math.min(240, window.innerWidth * 0.2);
}

const FACE_PATH =
  "M4.52737 11.3358C3.9727 12.4992 3.37988 15.1803 5.44595 16.5981M5.67831 14.8162C5.53293 15.7889 5.68624 17.5284 6.24647 18.7455C6.94676 20.2668 9.20556 22.9961 12.9666 23C15.005 23.0001 18.2818 21.9974 19 16.7521M14.1622 13.6976C14.2615 14.7881 15.1034 17.4055 13.0963 16.7811M9.96235 11.7543C10.0537 11.55 11.0981 10.3917 12.1694 11.4197M15.9188 11.7543C15.9188 11.4196 17.5257 10.9056 18.1856 11.7543M14 19.5C12.5 20 11.7778 19.486 10.9141 19M15 4.5C15.5 4 16.5 3 15.5 2M19.2323 5.87468C19.4764 6.50278 19.8182 8.0831 19.2323 9.3795M17.5 6.5C17.8333 6.16667 18.3 5.1 17.5 3.5M4.97558 11.8859C4.84836 11.4164 4.63467 10.9826 4.31298 11.0113C4.24007 11.0178 4.16222 10.9788 4.1475 10.9018C3.84195 9.30466 3.82077 6.18267 6.01077 5.32461C6.03235 5.31616 6.05175 5.30119 6.06602 5.28186C6.30364 4.95979 6.91699 4.31765 7.67218 4.06053C7.7036 4.04983 7.72951 4.02638 7.74552 3.99543C7.94227 3.61507 8.568 2.88273 9.71025 2.6426C11.2019 2.329 15.0065 0.803818 13.7494 3.96746C13.4787 4.60595 12.6115 5.8196 11.282 5.65416C11.2396 5.64888 11.1974 5.6676 11.1666 5.69941C11.0015 5.86985 10.5896 6.08997 9.9181 5.9466C9.8691 5.93614 9.81902 5.95786 9.79032 6.00178C9.46333 6.50226 8.65552 7.26862 7.62738 6.93924C7.56094 6.91796 7.4871 6.95829 7.44356 7.01624C7.34921 7.14184 7.14432 7.27739 6.766 7.27075C6.70109 7.26961 6.64425 7.32051 6.63778 7.38988C6.58147 7.99357 6.41293 9.09608 6.1003 9.52022C5.80619 9.91923 5.69853 10.9032 5.67339 11.5122C5.66925 11.6124 5.54004 11.7149 5.46658 11.7769C5.42979 11.808 5.39097 11.8541 5.35159 11.9197C5.27968 12.0395 5.01266 12.0228 4.97558 11.8859Z";

const LEFT_EYE_PATH =
  "M11.665 13.0965C11.6036 13.3618 11.3858 13.541 11.1784 13.4968M11.665 13.0965C11.7264 12.8312 11.608 12.5804 11.4007 12.5362M11.665 13.0965L10.9141 12.9365M11.1784 13.4968C10.9711 13.4527 10.8527 13.2018 10.9141 12.9365M11.1784 13.4968L11.4007 12.5362M10.9141 12.9365C10.9755 12.6713 11.1933 12.492 11.4007 12.5362";

const RIGHT_EYE_PATH =
  "M17.5049 13.5324C17.4435 13.7977 17.2443 13.9809 17.06 13.9416M17.5049 13.5324C17.5662 13.2671 17.4666 13.0203 17.2823 12.981M17.5049 13.5324L16.8374 13.3902M17.06 13.9416C16.8757 13.9024 16.776 13.6555 16.8374 13.3902M17.06 13.9416L17.2823 12.981M16.8374 13.3902C16.8988 13.125 17.098 12.9417 17.2823 12.981";

const FACE_MASK = "linear-gradient(to bottom, black 46%, transparent 78%)";


const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function restGaze() {
  const rad = (-FACE_TILT * Math.PI) / 180;
  return { x: Math.sin(rad) * GAZE_UP, y: -Math.cos(rad) * GAZE_UP };
}

function eyeOffset(
  center: { x: number; y: number },
  cursor: { x: number; y: number } | null,
) {
  if (!cursor) return restGaze();
  const dx = cursor.x - center.x;
  const dy = cursor.y - center.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return { x: 0, y: 0 };
  const mag = Math.min(EYE_MAX, dist);
  return { x: (dx / dist) * mag, y: (dy / dist) * mag };
}

function placeEye(
  eye: SVGGElement,
  center: { x: number; y: number },
  offset: { x: number; y: number },
  blink: number,
) {
  const idle =
    Math.abs(offset.x) < 0.001 &&
    Math.abs(offset.y) < 0.001 &&
    Math.abs(blink - 1) < 0.001;
  if (idle) {
    eye.removeAttribute("transform");
    return;
  }
  eye.setAttribute(
    "transform",
    `translate(${center.x + offset.x} ${center.y + offset.y}) scale(1 ${blink}) translate(${-center.x} ${-center.y})`,
  );
}

function BotFace() {
  const svgRef = useRef<SVGSVGElement>(null);
  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    if (!svg || !leftEye || !rightEye) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pointer: { x: number; y: number } | null = null;
    let visible = false;
    const rest = restGaze();
    let lx = rest.x;
    let ly = rest.y;
    let rx = rest.x;
    let ry = rest.y;
    let panX = 0;
    let panY = 0;
    let blink = 1;
    let blinking = false;
    let blinkStart = 0;
    let nextBlink = performance.now() + 4000 + Math.random() * 3000;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer = null;
    };

    const tick = (now: number) => {
      if (!visible) {
        frame = 0;
        return;
      }

      const rect = svg.getBoundingClientRect();
      const cursor =
        pointer && rect.width > 0
          ? rotateAround(
              {
                x: ((pointer.x - rect.left) / rect.width) * VIEWBOX,
                y: ((pointer.y - rect.top) / rect.height) * VIEWBOX,
              },
              -FACE_TILT,
            )
          : null;

      const leftTarget = eyeOffset(LEFT_EYE, cursor);
      const rightTarget = eyeOffset(RIGHT_EYE, cursor);
      lx += (leftTarget.x - lx) * LERP;
      ly += (leftTarget.y - ly) * LERP;
      rx += (rightTarget.x - rx) * LERP;
      ry += (rightTarget.y - ry) * LERP;

      if (!blinking && now >= nextBlink) {
        blinking = true;
        blinkStart = now;
      }
      if (blinking) {
        const elapsed = now - blinkStart;
        const half = 90;
        if (elapsed < half) {
          blink = 1 - 0.9 * (elapsed / half);
        } else if (elapsed < half * 2) {
          blink = 0.1 + 0.9 * ((elapsed - half) / half);
        } else {
          blink = 1;
          blinking = false;
          nextBlink = now + 4000 + Math.random() * 3000;
        }
      }

      placeEye(leftEye, LEFT_EYE, { x: lx, y: ly }, blink);
      placeEye(rightEye, RIGHT_EYE, { x: rx, y: ry }, blink);

      let targetPanX = 0;
      let targetPanY = 0;
      if (pointer) {
        const dx = (pointer.x - (rect.left + rect.width / 2)) / window.innerWidth;
        const dy = (pointer.y - (rect.top + rect.height / 2)) / window.innerHeight;
        targetPanX = Math.max(-10, Math.min(10, dx * 18));
        targetPanY = Math.max(-8, Math.min(8, dy * 14));
      }
      panX += (targetPanX - panX) * LERP;
      panY += (targetPanY - panY) * LERP;

      const seconds = now / 1000;
      const breath = 1.01 + Math.sin(seconds * 0.7) * 0.01;
      const floatY = Math.sin(seconds * 0.55) * 8;
      svg.style.transform = `translate(calc(-50% - ${faceShift()}px + ${panX}px), ${panY + floatY}px) scale(${breath})`;

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      visible = entry.isIntersecting;
      if (visible && frame === 0) {
        frame = requestAnimationFrame(tick);
      }
    });

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerout", onLeave);
    observer.observe(svg);
    const initial = svg.getBoundingClientRect();
    if (initial.bottom > 0 && initial.top < window.innerHeight) {
      visible = true;
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute bottom-[-24vw] left-1/3 z-0 aspect-square w-[100vw] text-foreground opacity-20 md:bottom-[-220px] md:w-[1000px]"
      style={{
        transform: "translate(calc(-50% - 20vw), 0px) scale(1)",
        maskImage: FACE_MASK,
        WebkitMaskImage: FACE_MASK,
      }}
    >
      <g transform={`rotate(${FACE_TILT} ${FACE_ORIGIN} ${FACE_ORIGIN})`}>
        <path d={FACE_PATH} {...strokeProps} />
        <g ref={leftEyeRef}>
          <path d={LEFT_EYE_PATH} {...strokeProps} />
        </g>
        <g ref={rightEyeRef}>
          <path d={RIGHT_EYE_PATH} {...strokeProps} />
        </g>
      </g>
    </svg>
  );
}

export function HomeCta() {
  const ctaRevealRef = useScrollReveal();

  return (
    <section className="relative min-h-[90vh] overflow-hidden border-b border-border bg-background">
      <div
        ref={ctaRevealRef}
        className="relative z-10 flex min-h-[100vh] flex-col items-center justify-center px-6 pb-[30vh] pt-10 text-center"
      >
        <SheetKicker>Get started</SheetKicker>
        <h2
          data-reveal
          className="mt-4 max-w-3xl text-balance font-sora text-4xl font-medium tracking-tight md:text-6xl"
        >
          Ship email like you ship code.
        </h2>
        <p
          data-reveal
          className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
        >
          Create a workspace, verify a domain, and send your first message in
          minutes. No sales calls required.
        </p>
        <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
      <BotFace />
    </section>
  );
}
