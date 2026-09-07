import { useEffect, useRef } from 'react';

/**
 * Attach the returned ref to a card element for a subtle perspective tilt
 * that follows the cursor. Skips itself on touch devices and under
 * prefers-reduced-motion.
 */
export function useTiltCard<T extends HTMLElement = HTMLDivElement>(intensity = 8) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el!.style.transform = `perspective(800px) rotateX(${(-py * intensity).toFixed(2)}deg) rotateY(${(px * intensity).toFixed(2)}deg)`;
    }

    function handleLeave() {
      el!.style.transform = '';
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [intensity]);

  return ref;
}
