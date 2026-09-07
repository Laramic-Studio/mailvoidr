import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Attach the returned ref to a section wrapper. Any descendant carrying
 * `data-reveal` fades + rises into place, staggered, the first time the
 * section crosses into view. No-ops entirely under prefers-reduced-motion.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(selector = '[data-reveal]') {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (reduceMotion || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
          }),
      });
    }, container);

    return () => ctx.revert();
  }, [selector]);

  return ref;
}
