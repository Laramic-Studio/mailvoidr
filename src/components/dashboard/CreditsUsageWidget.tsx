import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';

function formatUsage(used: number, limit: number | null): string {
  if (limit === null) {
    return `${used.toLocaleString()} used`;
  }

  return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
}

function usagePercent(used: number, limit: number | null): number {
  if (!limit) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

export function CreditsUsageWidget({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isLoading } = useBilling();
  const usage = data?.usage;
  const plan = data?.plan;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const emailPercent = usagePercent(usage.emails.used, usage.emails.limit);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="label-mono mb-1">Plan usage</div>
      <div className="text-[11px] text-muted-foreground capitalize">
        {plan?.name ?? usage.plan_slug} plan
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span>Emails this month</span>
        <span className="font-mono text-muted-foreground">
          {formatUsage(usage.emails.used, usage.emails.limit)}
        </span>
      </div>
      {usage.emails.limit !== null ? (
        <div className="mt-1.5 h-1 overflow-hidden bg-muted">
          <div className="h-full bg-primary" style={{ width: `${emailPercent}%` }} />
        </div>
      ) : null}
      <Link
        to="/dashboard/billing"
        onClick={onNavigate}
        className="mt-3 inline-flex items-center text-[11.5px] text-primary hover:underline"
      >
        Manage plan →
      </Link>
    </div>
  );
}
