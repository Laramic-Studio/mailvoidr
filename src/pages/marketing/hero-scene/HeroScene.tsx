import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GridAnimation from '../grid-animation.tsx';
import { heroScrollState } from './scrollState';

gsap.registerPlugin(ScrollTrigger);

const Scene = lazy(() => import('./Scene'));

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

function computeMode(): '3d' | 'fallback' {
  if (typeof window === 'undefined') return 'fallback';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (reduceMotion || isMobile || !supportsWebGL()) return 'fallback';
  return '3d';
}

/**
 * Hero visual slot. Renders the WebGL "floating faceted core" scene on
 * capable desktop browsers; falls back to the existing 2D GridAnimation
 * canvas for prefers-reduced-motion, mobile viewports, and WebGL-less
 * browsers, mirroring the reduced-motion pattern already used for the
 * marquees in index.css.
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode] = useState(computeMode);

  useEffect(() => {
    if (mode !== '3d' || !containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        heroScrollState.progress = self.progress;
      },
    });

    return () => {
      trigger.kill();
      heroScrollState.progress = 0;
    };
  }, [mode]);

  if (mode === 'fallback') {
    return <GridAnimation />;
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </div>
  );
}
