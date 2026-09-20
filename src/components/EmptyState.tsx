import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** Small uppercase label above the title, e.g. the section name. */
  eyebrow?: string;
  /** Primary call to action — usually an {@link EmptyStateButton}. */
  action?: ReactNode;
  /** Secondary text under the action, e.g. a tip or a link. */
  hint?: ReactNode;
  /** `compact` is for empties that sit inside a card or panel next to other content. */
  size?: 'default' | 'compact';
  /** Adds the standard bordered card around the empty state, for use outside a table/list container. */
  framed?: boolean;
  testId?: string;
  className?: string;
}

/**
 * Shared empty state for dashboard pages: soft primary glow, optional eyebrow,
 * title, description and a call to action.
 */
export function EmptyState({
  title,
  description,
  eyebrow,
  action,
  hint,
  size = 'default',
  framed = false,
  testId = 'empty-state',
  className,
}: EmptyStateProps) {
  const compact = size === 'compact';

  return (
    <div
      data-testid={testId}
      className={cn(
        'relative overflow-hidden px-6 text-center',
        compact ? 'py-10' : 'py-14',
        framed ? 'border border-border bg-card' : 'rounded-2xl',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-lg">
        {eyebrow ? <span className="label-mono">{eyebrow}</span> : null}
        <h3
          className={cn(
            'font-medium tracking-tight',
            compact ? 'text-base' : 'text-xl',
            eyebrow && 'mt-2',
          )}
        >
          {title}
        </h3>
        {description ? (
          <p
            className={cn(
              'mx-auto mt-2 max-w-md text-sm text-muted-foreground',
              !compact && 'leading-relaxed',
            )}
          >
            {description}
          </p>
        ) : null}
        {action ? <div className={compact ? 'mt-4' : 'mt-6'}>{action}</div> : null}
        {hint ? <div className="mt-3 text-[12px] text-muted-foreground">{hint}</div> : null}
      </div>
    </div>
  );
}

interface EmptyStateButtonProps {
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  /** Renders a router link instead of a button. */
  to?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  testId?: string;
}

/** The call-to-action button used inside {@link EmptyState}. */
export function EmptyStateButton({
  children,
  icon: Icon,
  onClick,
  to,
  variant = 'primary',
  disabled,
  testId,
}: EmptyStateButtonProps) {
  const className = cn(
    'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium disabled:opacity-50',
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : 'border border-border hover:bg-accent',
  );
  const content = (
    <>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} data-testid={testId} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" data-testid={testId} disabled={disabled} onClick={onClick} className={className}>
      {content}
    </button>
  );
}
