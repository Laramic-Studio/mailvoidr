import { forwardRef, useImperativeHandle } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { AnimatedIconHandle } from '@/components/icons/types';

export function createNavIcon(Icon: LucideIcon) {
  const NavIcon = forwardRef<AnimatedIconHandle, { size?: number; className?: string }>(
    function NavIcon({ size = 16, className }, ref) {
      useImperativeHandle(ref, () => ({
        startAnimation() {},
        stopAnimation() {},
      }));
      return <Icon size={size} className={className} aria-hidden />;
    },
  );
  return NavIcon;
}
