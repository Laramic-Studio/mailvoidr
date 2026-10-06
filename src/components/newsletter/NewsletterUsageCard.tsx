import { useNewsletterSettings } from '@/hooks/useNewsletter';
import { formatCount } from '@/lib/newsletter/format';

/** Separate from the transactional quota. Limits stay blank until the API publishes them. */
export function NewsletterUsageCard() {
  const query = useNewsletterSettings();
  const limit = query.data?.monthly_send_limit;
  const used = query.data?.monthly_sends_used;
  const known = typeof limit === 'number' && typeof used === 'number';

  return (
    <div className="border border-border bg-card p-6" data-testid="newsletter-usage-card">
      <span className="label-mono">Newsletters</span>
      <h3 className="mt-2 text-base font-medium">Campaign sends</h3>
      {known ? (
        <p className="mt-2 text-[13px]">
          {formatCount(used)} of {formatCount(limit)} campaign sends this month. This meter is separate from transactional email.
        </p>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          Newsletter usage is metered separately from transactional email. Plan limits are not available yet.
        </p>
      )}
    </div>
  );
}
