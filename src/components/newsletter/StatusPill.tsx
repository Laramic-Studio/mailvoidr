import { Flag } from 'lucide-react';
import { statusLabel, statusPillClass } from '@/lib/newsletter/format';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const label = statusLabel(status);
  return (
    <span
      data-testid={`newsletter-status-${status}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-none',
        statusPillClass(status),
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('h-1.5 w-1.5 rounded-full bg-current', status === 'sending' && 'animate-pulse')}
      />
      {status === 'complained' ? <Flag className="h-3 w-3" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
}
