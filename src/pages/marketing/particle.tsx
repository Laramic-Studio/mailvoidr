import { useEffect, useRef, useState } from "react";

const GREEN = "#3ecf8e";
const GREEN2 = "#22c55e";

const ZONES = [
  { end: 0.35, color: "#ef4444", label: "slow" },
  { end: 0.60, color: "#f59e0b", label: "okay" },
  { end: 0.80, color: GREEN,     label: "fast" },
  { end: 1.00, color: GREEN2,    label: "instant" },
];

const TICK_LABELS = ["0", "100", "200", "300", "400", "500+"];

const SCENARIOS = [
  { ms: 87,  inbox: 99.8, pos: 0.83 },
  { ms: 124, inbox: 99.6, pos: 0.75 },
  { ms: 61,  inbox: 99.9, pos: 0.92 },
  { ms: 44,  inbox: 99.9, pos: 0.97 },
  { ms: 156, inbox: 99.3, pos: 0.69 },
  { ms: 203, inbox: 98.9, pos: 0.60 },
];

const START_ANG = Math.PI * 0.75;
const END_ANG   = Math.PI * 2.25;
const ARC_SPAN  = END_ANG - START_ANG;

function posToAngle(p) {
  return START_ANG + p * ARC_SPAN;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function DeliverySpeedometer() {
  const canvasRef   = useRef(null);
  const needleRef   = useRef(0);
  const rafRef      = useRef(null);
  const animatingRef = useRef(false);
  const scenarioIdx = useRef(0);
  const totalSent   = useRef(0);

  const [stats, setStats]   = useState(null);
  const [phase, setPhase]   = useState("idle"); // idle | sending | done

  function isDark() {
    return (
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }

  function trackColor() {
    return isDark() ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  }
  function mutedColor() {
    return isDark() ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.35)';
  }
  function bgColor() {
    const card = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
    return card ? `hsl(${card})` : isDark() ? '#111111' : '#ffffff';
  }

  function draw(pos) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const cx  = W / 2;
    const cy  = H - 52;
    const R   = Math.min(W, H) * 0.52;
    const IR  = R * 0.67;

    ctx.clearRect(0, 0, W * dpr, H * dpr);

    // Track background
    ctx.beginPath();
    ctx.arc(cx, cy, R, START_ANG, END_ANG);
    ctx.strokeStyle = trackColor();
    ctx.lineWidth   = 18;
    ctx.lineCap     = "butt";
    ctx.stroke();

    // Zone tints
    let prev = START_ANG;
    for (const zone of ZONES) {
      const end = START_ANG + zone.end * ARC_SPAN;
      ctx.beginPath();
      ctx.arc(cx, cy, R, prev, end);
      ctx.strokeStyle  = zone.color;
      ctx.lineWidth    = 18;
      ctx.globalAlpha  = 0.18;
      ctx.stroke();
      ctx.globalAlpha  = 1;
      prev = end;
    }

    // Active fill
    if (pos > 0) {
      let zp = START_ANG;
      for (const zone of ZONES) {
        const ze = START_ANG + zone.end * ARC_SPAN;
        const fe = posToAngle(pos);
        if (zp >= fe) break;
        const se = Math.min(ze, fe);
        ctx.beginPath();
        ctx.arc(cx, cy, R, zp, se);
        ctx.strokeStyle = zone.color;
        ctx.lineWidth   = 18;
        ctx.lineCap     = "round";
        ctx.stroke();
        zp = ze;
      }
    }

    // Tick marks + labels
    for (let i = 0; i <= 5; i++) {
      const ang = posToAngle(i / 5);
      const x1 = cx + Math.cos(ang) * (R - 14);
      const y1 = cy + Math.sin(ang) * (R - 14);
      const x2 = cx + Math.cos(ang) * (R + 4);
      const y2 = cy + Math.sin(ang) * (R + 4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = mutedColor();
      ctx.lineWidth   = 1.5;
      ctx.lineCap     = "round";
      ctx.stroke();

      const lx = cx + Math.cos(ang) * (R + 20);
      const ly = cy + Math.sin(ang) * (R + 20);
      ctx.fillStyle    = mutedColor();
      ctx.font         = "500 11px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(TICK_LABELS[i], lx, ly);
    }

    // Needle
    const ang    = posToAngle(pos);
    const needleLen = IR - 10;
    const nx = cx + Math.cos(ang) * needleLen;
    const ny = cy + Math.sin(ang) * needleLen;
    const tx = cx + Math.cos(ang + Math.PI) * 18;
    const ty = cy + Math.sin(ang + Math.PI) * 18;

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = pos > 0 ? GREEN : mutedColor();
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = pos > 0 ? GREEN : trackColor();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = bgColor();
    ctx.fill();

    // Zone label above center
    if (pos > 0) {
      const activeZone = ZONES.find((z) => pos <= z.end) || ZONES[ZONES.length - 1];
      ctx.fillStyle    = activeZone.color;
      ctx.font         = "500 13px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(activeZone.label, cx, cy - 38);
    }

    // "ms to inbox" label
    ctx.fillStyle    = mutedColor();
    ctx.font         = "400 11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ms to inbox", cx, cy - 22);
  }

  function animate(from, to, duration, onDone) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    animatingRef.current = true;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const pos = from + (to - from) * easeOut(t);
      needleRef.current = pos;
      draw(pos);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        animatingRef.current = false;
        needleRef.current = to;
        draw(to);
        if (onDone) onDone();
      }
    }
    rafRef.current = requestAnimationFrame(step);
  }

  function handleSend() {
    if (animatingRef.current || phase === "sending") return;
    const s = SCENARIOS[scenarioIdx.current % SCENARIOS.length];
    scenarioIdx.current++;
    totalSent.current++;
    setPhase("sending");
    setStats(null);

    animate(needleRef.current, 0, 300, () => {
      setTimeout(() => {
        animate(0, s.pos, 900, () => {
          setStats({
            ms:    s.ms,
            inbox: s.inbox.toFixed(1),
            count: totalSent.current,
          });
          setPhase("done");
        });
      }, 350);
    });
  }

  // Setup canvas with DPR scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 340, H = 240;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    canvas.getContext("2d").scale(dpr, dpr);
    draw(0);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
        <span className="ml-2 font-body text-[11px] tracking-wide text-muted-foreground">
          mailvoidr — delivery speed
        </span>
      </div>

      <div className="flex justify-center px-4 pt-2">
        <canvas ref={canvasRef} />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <StatCard label="Delivery time" value={stats?.ms ?? '—'} unit="ms" />
        <StatCard label="Inbox rate" value={stats?.inbox ?? '—'} unit="%" />
        <StatCard label="Emails sent" value={stats?.count ?? '—'} />
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              phase === 'done'
                ? 'bg-primary'
                : phase === 'sending'
                  ? 'animate-pulse bg-amber-500'
                  : 'bg-muted-foreground/40'
            }`}
          />
          <span className="font-body text-xs text-muted-foreground">
            {phase === 'done' ? 'Delivered' : phase === 'sending' ? 'Sending…' : 'Idle'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={phase === 'sending'}
          className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === 'sending' ? 'Sending…' : phase === 'done' ? 'Send another' : 'Send a test email'}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <p className="mb-1 font-body text-[10.5px] text-muted-foreground">{label}</p>
      <p className="text-base font-medium leading-none text-foreground">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}