/**
 * Scroll progress (0-1) through the hero, written by HeroScene's
 * ScrollTrigger and read inside Scene's useFrame loop. A plain mutable
 * object rather than React state — driving a per-frame WebGL animation
 * through React re-renders would be wasteful.
 */
export const heroScrollState = { progress: 0 };
