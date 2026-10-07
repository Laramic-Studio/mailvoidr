import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { primaryButtonClass, secondaryButtonClass } from '@/components/newsletter/classes';
import {
  autoPauseTitle,
  campaignActions,
  formatCount,
  inReviewMessage,
  sendingEta,
} from '@/lib/newsletter/format';
import type { CampaignAction } from '@/lib/newsletter/format';

interface CampaignStateBannerProps {
  status: string;
  autoPauseReason?: string | null;
  bouncePausePercent?: number | null;
  complaintPausePercent?: number | null;
  reviewDetail?: string | null;
  turnaround?: string | null;
  scheduledLabel?: string | null;
  sentCount?: number;
  totalRecipients?: number | null;
  recentSendsPerMinute?: number | null;
  pending?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export function CampaignStateBanner({
  status,
  autoPauseReason,
  bouncePausePercent,
  complaintPausePercent,
  reviewDetail,
  turnaround,
  scheduledLabel,
  sentCount = 0,
  totalRecipients,
  recentSendsPerMinute,
  pending = false,
  onEdit,
  onCancel,
  onPause,
  onResume,
}: CampaignStateBannerProps) {
  const actions = campaignActions(status);
  if (actions.length === 0 && status !== 'sending') {
    if (status === 'sent' || status === 'cancelled' || status === 'failed' || status === 'draft') {
      return null;
    }
  }

  const tone =
    status === 'in_review'
      ? 'border-[hsl(var(--chart-4)/0.4)] bg-[hsl(var(--chart-4)/0.1)]'
      : status === 'auto_paused' || status === 'failed'
        ? 'border-[hsl(var(--chart-5)/0.4)] bg-[hsl(var(--chart-5)/0.1)]'
        : status === 'paused'
          ? 'border-[hsl(var(--chart-3)/0.4)] bg-[hsl(var(--chart-3)/0.1)]'
          : 'border-border bg-card';

  const eta = status === 'sending'
    ? sendingEta({ sentCount, totalRecipients, recentSendsPerMinute })
    : null;
  const progress = totalRecipients && totalRecipients > 0
    ? Math.min(100, (sentCount / totalRecipients) * 100)
    : 0;

  return (
    <section role="status" className={`border p-4 ${tone}`} data-testid={`campaign-banner-${status}`}>
      {status === 'scheduled' ? <p className="text-sm">Sends {scheduledLabel || 'at the scheduled time'}.</p> : null}
      {status === 'in_review' ? <p className="text-sm">{inReviewMessage(turnaround, reviewDetail)}</p> : null}
      {status === 'paused' ? <p className="text-sm">Paused by you.</p> : null}
      {status === 'auto_paused' ? (
        <div className="space-y-1 text-sm">
          <p>{autoPauseTitle(autoPauseReason, { bouncePausePercent, complaintPausePercent })}</p>
          <p>Our team has been alerted.</p>
        </div>
      ) : null}
      {status === 'sending' ? (
        <div className="space-y-2">
          <p className="text-sm">
            {formatCount(sentCount)} of {formatCount(totalRecipients)} sent
            {eta ? ` · ${eta}` : ''}
          </p>
          <Progress value={progress} aria-label="Sending progress" />
        </div>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <BannerAction
              key={action}
              action={action}
              pending={pending}
              onEdit={onEdit}
              onCancel={onCancel}
              onPause={onPause}
              onResume={onResume}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function BannerAction({
  action,
  pending,
  onEdit,
  onCancel,
  onPause,
  onResume,
}: {
  action: CampaignAction;
  pending: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}) {
  if (action === 'contact_support') {
    return (
      <Link to="/contact" className={secondaryButtonClass} data-testid="campaign-contact-support">
        Contact support
      </Link>
    );
  }
  const map = {
    edit: { label: 'Edit', onClick: onEdit, className: secondaryButtonClass, testId: 'campaign-edit' },
    cancel: { label: 'Cancel', onClick: onCancel, className: secondaryButtonClass, testId: 'campaign-cancel' },
    pause: { label: 'Pause', onClick: onPause, className: secondaryButtonClass, testId: 'campaign-pause' },
    resume: { label: 'Resume', onClick: onResume, className: primaryButtonClass, testId: 'campaign-resume' },
  } as const;
  const item = map[action];
  return (
    <button type="button" className={item.className} disabled={pending} onClick={item.onClick} data-testid={item.testId}>
      {item.label}
    </button>
  );
}
