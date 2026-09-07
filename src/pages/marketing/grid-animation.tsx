import React, { useEffect, useRef } from "react";

/**
 * Mailvoidr — Email Network Visual
 * ---------------------------------
 * A 5x5 grid (4 internal horizontal + 4 internal vertical lines, no outer
 * border) with envelope icons that travel along the grid lines between
 * intersections, turning cleanly at each node, to represent mail moving
 * through a network.
 *
 * v2 changes:
 * - Brand palette swapped to Mailvoidr green (Supabase-style), was indigo/cyan
 * - Envelope + pulse positions are driven by direct DOM style mutation inside
 *   the rAF loop instead of a React state tick, so we're not forcing a full
 *   component re-render 60x/sec
 * - Envelope count, spawn cadence, and speed are now props with sane defaults
 * - aria-hidden on the decorative canvas; respects prefers-reduced-motion
 * - Dead-end fallback in the random walk (defensive, graph is connected today
 *   but this keeps it safe if the grid shape ever changes)
 */

const UNIT = 100; // px per cell in the 500x500 coordinate space
const DIVS = 5; // 5x5 sections
const POINTS = DIVS + 1; // 6x6 intersection points
const SIZE = UNIT * DIVS; // 500

// --- Brand palette (Mailvoidr — green, Supabase-style) ---------------------
const PALETTE = {
    primary: { stroke: "#10b981", from: "#6ee7b7", to: "#059669", glow: "rgba(16,185,129,0.55)" },
    accent: { stroke: "#3ecf8e", from: "#86efac", to: "#15803d", glow: "rgba(62,207,142,0.55)" },
    line: "#7dd3ac", // faint green-tinted grid lines instead of neutral slate
    node: "#7dd3ac",
};

// --- Build the graph of valid intersections + edges -----------------------
// Horizontal internal lines only exist at rows j = 1..4 (y = 100,200,300,400)
// Vertical internal lines only exist at cols i = 1..4 (x = 100,200,300,400)
// This naturally excludes the outer border while keeping a fully connected
// interior lattice to travel along.

function buildGraph() {
    const nodes = [];
    for (let j = 0; j < POINTS; j++) {
        for (let i = 0; i < POINTS; i++) {
            nodes.push({ i, j, x: i * UNIT, y: j * UNIT });
        }
    }
    const key = (i, j) => `${i}-${j}`;
    const adj = new Map();
    nodes.forEach((n) => adj.set(key(n.i, n.j), []));

    // horizontal edges (only on interior rows j = 1..4)
    for (let j = 1; j <= 4; j++) {
        for (let i = 0; i < POINTS - 1; i++) {
            adj.get(key(i, j)).push(key(i + 1, j));
            adj.get(key(i + 1, j)).push(key(i, j));
        }
    }
    // vertical edges (only on interior columns i = 1..4)
    for (let i = 1; i <= 4; i++) {
        for (let j = 0; j < POINTS - 1; j++) {
            adj.get(key(i, j)).push(key(i, j + 1));
            adj.get(key(i, j + 1)).push(key(i, j));
        }
    }

    const nodeMap = new Map(nodes.map((n) => [key(n.i, n.j), n]));
    const validKeys = nodes
        .filter((n) => adj.get(key(n.i, n.j)).length > 0)
        .map((n) => key(n.i, n.j));

    return { adj, nodeMap, validKeys, key };
}

const GRAPH = buildGraph();

function randomWalkPath() {
    const { adj, nodeMap, validKeys } = GRAPH;
    const steps = 4 + Math.floor(Math.random() * 4); // 4-7 segments
    let current = validKeys[Math.floor(Math.random() * validKeys.length)];
    const path = [nodeMap.get(current)];
    let prev = null;

    for (let s = 0; s < steps; s++) {
        const neighbors = adj.get(current);
        if (!neighbors || neighbors.length === 0) break; // defensive dead-end guard
        let candidates = neighbors.filter((n) => n !== prev);
        if (candidates.length === 0) candidates = neighbors;
        const next = candidates[Math.floor(Math.random() * candidates.length)];
        prev = current;
        current = next;
        path.push(nodeMap.get(current));
    }

    // collapse any accidental zero-length dupes
    return path.filter((p, idx) => idx === 0 || p !== path[idx - 1]);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

const EnvelopeIcon = ({ variant }) => {
    const p = PALETTE[variant];
    const gradId = variant === "primary" ? "envGradPrimary" : "envGradAccent";
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={p.from} />
                    <stop offset="100%" stopColor={p.to} />
                </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="11" fill={`url(#${gradId})`} opacity="0.14" />
            <rect x="4" y="6.5" width="16" height="11" rx="2.2" fill={`url(#${gradId})`} stroke={p.stroke} strokeWidth="1.1" />
            <path
                d="M4.6 7.2 L12 13 L19.4 7.2"
                fill="none"
                stroke="white"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.92"
            />
        </svg>
    );
};

export default function MailvoidrEmailNetwork({
                                                  maxEnvelopes = 3,
                                                  msPerSegment = 620,
                                                  spawnIntervalMs = [1100, 2500],
                                              }) {
    const containerRef = useRef(null);
    const svgPulseLayerRef = useRef(null);
    const envelopesRef = useRef([]); // { id, path, steps, duration, startTime, hue, el, iconEl }
    const rafRef = useRef(null);
    const spawnTimeoutRef = useRef(null);
    const envIdRef = useRef(0);
    const reducedMotionRef = useRef(false);

    useEffect(() => {
        reducedMotionRef.current =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const mountEnvelopeDOM = (env) => {
            const wrap = document.createElement("div");
            wrap.style.position = "absolute";
            wrap.style.left = "0%";
            wrap.style.top = "0%";
            wrap.style.transform = "translate(-50%, -50%)";
            wrap.style.pointerEvents = "none";
            wrap.style.willChange = "left, top, opacity";
            // wrap.style.filter = `drop-shadow(0 0 6px ${PALETTE[env.hue].glow})`;

            const inner = document.createElement("div");
            inner.style.transition = "transform 0.35s ease";
            wrap.appendChild(inner);

            containerRef.current.appendChild(wrap);

            // render the SVG icon into `inner` via a tiny static markup string
            // (kept in sync with EnvelopeIcon visually; avoids a React render
            // per envelope per frame)
            const p = PALETTE[env.hue];
            const gid = `g-${env.id}`;
            inner.innerHTML = `
              <svg width="22" height="22" viewBox="0 0 24 24" style="overflow:visible">
                <defs>
                  <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${p.from}" />
                    <stop offset="100%" stop-color="${p.to}" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="11" fill="url(#${gid})" opacity="0.14" />
                <rect x="4" y="6.5" width="16" height="11" rx="2.2" fill="url(#${gid})" stroke="${p.stroke}" stroke-width="1.1" />
                <path d="M4.6 7.2 L12 13 L19.4 7.2" fill="none" stroke="white" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />
              </svg>
            `;

            env.el = wrap;
            env.iconEl = inner;
        };

        const spawnPulse = (x, y, hue) => {
            if (!svgPulseLayerRef.current) return;
            const ns = "http://www.w3.org/2000/svg";
            const circle = document.createElementNS(ns, "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "4");
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", PALETTE[hue].stroke);
            circle.setAttribute("stroke-width", "2");
            circle.setAttribute("opacity", "0.7");

            const animR = document.createElementNS(ns, "animate");
            animR.setAttribute("attributeName", "r");
            animR.setAttribute("from", "4");
            animR.setAttribute("to", "26");
            animR.setAttribute("dur", "0.7s");
            animR.setAttribute("fill", "freeze");
            circle.appendChild(animR);

            const animO = document.createElementNS(ns, "animate");
            animO.setAttribute("attributeName", "opacity");
            animO.setAttribute("from", "0.7");
            animO.setAttribute("to", "0");
            animO.setAttribute("dur", "0.7s");
            animO.setAttribute("fill", "freeze");
            circle.appendChild(animO);

            svgPulseLayerRef.current.appendChild(circle);
            setTimeout(() => circle.remove(), 720);
        };

        const makeEnvelope = (now) => {
            const path = randomWalkPath();
            const steps = Math.max(path.length - 1, 1);
            const duration = steps * msPerSegment;
            const env = {
                id: envIdRef.current++,
                path,
                steps,
                duration,
                startTime: now,
                hue: Math.random() > 0.5 ? "primary" : "accent",
            };
            mountEnvelopeDOM(env);
            return env;
        };

        const spawnLoop = () => {
            const now = performance.now();
            if (envelopesRef.current.length < maxEnvelopes) {
                envelopesRef.current.push(makeEnvelope(now));
            }
            const [lo, hi] = spawnIntervalMs;
            const nextIn = lo + Math.random() * (hi - lo);
            spawnTimeoutRef.current = setTimeout(spawnLoop, nextIn);
        };

        // seed with one envelope immediately so the visual isn't empty on load
        envelopesRef.current.push(makeEnvelope(performance.now()));
        spawnTimeoutRef.current = setTimeout(spawnLoop, 900);

        const fadeWindow = 0.09;

        const frame = () => {
            const now = performance.now();
            const stillAlive = [];

            for (const env of envelopesRef.current) {
                const t = Math.min(Math.max((now - env.startTime) / env.duration, 0), 1);

                if (t >= 1) {
                    const last = env.path[env.path.length - 1];
                    spawnPulse(last.x, last.y, env.hue);
                    env.el && env.el.remove();
                    continue;
                }

                const segT = t * env.steps;
                const segIndex = Math.min(Math.floor(segT), env.steps - 1);
                const localT = segT - segIndex;
                const a = env.path[segIndex];
                const b = env.path[Math.min(segIndex + 1, env.path.length - 1)];
                const x = lerp(a.x, b.x, localT);
                const y = lerp(a.y, b.y, localT);
                const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

                let opacity = 1;
                if (t < fadeWindow) opacity = t / fadeWindow;
                else if (t > 1 - fadeWindow) opacity = (1 - t) / fadeWindow;

                if (env.el) {
                    env.el.style.left = `${(x / SIZE) * 100}%`;
                    env.el.style.top = `${(y / SIZE) * 100}%`;
                    env.el.style.opacity = opacity;
                    if (env.iconEl && !reducedMotionRef.current) {
                        env.iconEl.style.transform = `rotate(${angle}deg)`;
                    }
                }

                stillAlive.push(env);
            }

            envelopesRef.current = stillAlive;
            rafRef.current = requestAnimationFrame(frame);
        };
        rafRef.current = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(rafRef.current);
            clearTimeout(spawnTimeoutRef.current);
            envelopesRef.current.forEach((env) => env.el && env.el.remove());
            envelopesRef.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gridLines = [];
    for (let k = 1; k <= 4; k++) {
        gridLines.push({ type: "h", pos: k * UNIT });
        gridLines.push({ type: "v", pos: k * UNIT });
    }

    return (
        <div
            aria-hidden="true"
            style={{
                width: "100%",
                minHeight: "420px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.07), transparent 60%)",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "min(88vw, 500px)",
                    aspectRatio: "1 / 1",
                }}
            >
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                >
                    <defs>
                        <linearGradient id="lineFadeH" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={PALETTE.line} stopOpacity="0" />
                            <stop offset="12%" stopColor={PALETTE.line} stopOpacity="0.35" />
                            <stop offset="88%" stopColor={PALETTE.line} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={PALETTE.line} stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineFadeV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PALETTE.line} stopOpacity="0" />
                            <stop offset="12%" stopColor={PALETTE.line} stopOpacity="0.35" />
                            <stop offset="88%" stopColor={PALETTE.line} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={PALETTE.line} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* internal grid lines only — no outer border */}
                    {gridLines.map((l, idx) =>
                        l.type === "h" ? (
                            <line key={idx} x1={0} y1={l.pos} x2={SIZE} y2={l.pos} stroke="url(#lineFadeH)" strokeWidth="1" />
                        ) : (
                            <line key={idx} x1={l.pos} y1={0} x2={l.pos} y2={SIZE} stroke="url(#lineFadeV)" strokeWidth="1" />
                        )
                    )}

                    {/* subtle intersection nodes */}
                    {GRAPH.validKeys.map((k) => {
                        const n = GRAPH.nodeMap.get(k);
                        return <circle key={k} cx={n.x} cy={n.y} r="2.2" fill={PALETTE.node} opacity="0.28" />;
                    })}

                    {/* arrival pulses are appended here directly by the rAF loop */}
                    <g ref={svgPulseLayerRef} />
                </svg>

                {/* envelopes are mounted/moved here directly by the rAF loop */}
                <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
            </div>
        </div>
    );
}