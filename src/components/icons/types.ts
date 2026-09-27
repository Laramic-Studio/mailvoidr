import type { ForwardRefExoticComponent, RefAttributes } from 'react';

/** Imperative handle exposed by every AnimateIcons component in this folder. */
export type AnimatedIconHandle = { startAnimation: () => void; stopAnimation: () => void };

export type AnimatedIcon = ForwardRefExoticComponent<
  { size?: number; className?: string } & RefAttributes<AnimatedIconHandle>
>;
