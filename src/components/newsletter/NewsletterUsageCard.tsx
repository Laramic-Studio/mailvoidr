import { useNewsletterSettings } from '@/hooks/useNewsletter';
import { subscriberMeterCopy, subscriberMeterKnown } from '@/lib/newsletter/format';

/** Subscriber count only. Campaign sends are unlimited aside from the workspace ramp cap. */
export function NewsletterUsageCard() {
  const query = useNewsletterSettings();
  const used = query.data?.subscribers_used;
  const limit = query.data?.subscriber_limit;
  const known = subscriberMeterKnown(used, limit);

  return (
    <div className="border border-border bg-card p-6" data-testid="newsletter-usage-card">
      <span className="label-mono">Newsletters</span>
      <h3 className="mt-2 text-base font-medium">Subscribers</h3>
      {known ? (
        <p className="mt-2 text-[13px]">{subscriberMeterCopy(used, limit)}</p>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          Subscriber limits are not available yet. Campaign sends are not shown on this card.
        </p>
      )}
    </div>
  );
}
