import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';

export function CreditsUsageWidget({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isLoading } = useCredits();
  const credits = data?.credits;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!credits?.live_sending_enabled) {
    return (
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="label-mono mb-1">Send credits</div>
        <p className="text-[12px] text-muted-foreground">Enable live sending to start outbound mail.</p>
        <Link
          to="/dashboard/smtp"
          onClick={onNavigate}
          className="mt-3 inline-flex items-center text-[11.5px] text-primary hover:underline"
        >
          Enable live sending →
        </Link>
      </div>
    );
  }

  const usedPercent = credits.free_allowance
    ? Math.min(100, Math.round((credits.free_used / credits.free_allowance) * 100))
    : 0;

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="label-mono mb-1">Send credits</div>
      <div className="flex items-center justify-between text-[12px]">
        <span>
          {credits.total_available.toLocaleString()} available
        </span>
        <span className="font-mono text-muted-foreground">
          {credits.free_remaining}/{credits.free_allowance} free
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden bg-muted">
        <div className="h-full bg-primary" style={{ width: `${usedPercent}%` }} />
      </div>
      {credits.purchased_balance > 0 ? (
        <p className="mt-2 text-[11px] text-muted-foreground font-mono">
          +{credits.purchased_balance.toLocaleString()} purchased
        </p>
      ) : null}
      <Link
        to="/dashboard/billing"
        onClick={onNavigate}
        className="mt-3 inline-flex items-center text-[11.5px] text-primary hover:underline"
      >
        Buy credits →
      </Link>
    </div>
  );
}
