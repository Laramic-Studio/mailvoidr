import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { useTheme } from 'next-themes';
import { MoonStarIcon } from '@/components/icons/moon-star';
import { SunMediumIcon } from '@/components/icons/sun-medium';
import { MonitorSmartphoneIcon } from '@/components/icons/monitor-smartphone';
import type { AnimatedIcon, AnimatedIconHandle } from '@/components/icons/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const THEME_OPTIONS: { value: 'dark' | 'light' | 'system'; icon: AnimatedIcon; label: string }[] = [
  { value: 'dark', icon: MoonStarIcon, label: 'Dark' },
  { value: 'light', icon: SunMediumIcon, label: 'Light' },
  { value: 'system', icon: MonitorSmartphoneIcon, label: 'Auto' },
];

type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];

/** Button that plays its animated icon while the whole button is hovered. */
const AnimatedIconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { icon: AnimatedIcon; iconSize: number }
>(({ icon: Icon, iconSize, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
  const iconRef = useRef<AnimatedIconHandle>(null);
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      onMouseEnter={(e) => {
        iconRef.current?.startAnimation();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        iconRef.current?.stopAnimation();
        onMouseLeave?.(e);
      }}
    >
      <Icon ref={iconRef} size={iconSize} className="shrink-0" />
      {children}
    </button>
  );
});
AnimatedIconButton.displayName = 'AnimatedIconButton';

export function SidebarThemeSwitcher({ expanded }: { expanded: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid a hydration flash of the wrong selection before next-themes resolves.
  const current: ThemeValue | undefined = mounted
    ? (THEME_OPTIONS.find((o) => o.value === theme)?.value ?? 'system')
    : undefined;

  if (!expanded) {
    // Rail mode: a single button that cycles Dark → Light → Auto.
    const index = THEME_OPTIONS.findIndex((o) => o.value === current);
    const active = THEME_OPTIONS[index === -1 ? 0 : index];
    const next = THEME_OPTIONS[(index + 1) % THEME_OPTIONS.length];

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <AnimatedIconButton
            key={active.value}
            icon={active.icon}
            iconSize={16}
            onClick={() => setTheme(next.value)}
            data-testid="sidebar-theme-cycle"
            aria-label={`Theme: ${active.label}. Switch to ${next.label}`}
            className="flex items-center justify-center transition-colors rounded-md h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground"
          />
        </TooltipTrigger>
        <TooltipContent side="right">Theme: {active.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid w-full grid-cols-3 gap-1 p-1 border rounded-2xl border-border bg-muted/40"
    >
      {THEME_OPTIONS.map(({ value, icon, label }) => {
        const selected = current === value;
        return (
          <AnimatedIconButton
            key={value}
            icon={icon}
            iconSize={14}
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            data-testid={`sidebar-theme-${label.toLowerCase()}`}
            className={cn(
              'flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl px-1.5 text-[12px] transition-colors',
              selected
                ? 'bg-background text-foreground font-medium shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="truncate">{label}</span>
          </AnimatedIconButton>
        );
      })}
    </div>
  );
}
