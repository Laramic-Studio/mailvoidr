import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusPill } from '@/components/newsletter/StatusPill';
import { CampaignStateBanner } from '@/components/newsletter/CampaignStateBanner';
import { primaryButtonClass, secondaryButtonClass } from '@/components/newsletter/classes';
import { useCampaignMutations, useNewsletterSettings } from '@/hooks/useNewsletter';
import {
  complaintWarningCopy,
  formatCount,
  formatInZone,
  formatRate,
  largeSendReviewCopy,
  rampSummary,
} from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Campaign } from '@/types/newsletter';

export default function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const settings = useNewsletterSettings();
  const { pause, resume, cancel, pickWinner } = useCampaignMutations();
  const pending = pause.isPending || resume.isPending || cancel.isPending || pickWinner.isPending;
  const turnaround = campaign.review_turnaround || settings.data?.review_turnaround;
  const trustTier = campaign.trust_tier ?? settings.data?.trust_tier ?? null;
  const capsFromApi = campaign.ramp_caps_from_api || settings.data?.ramp_caps_from_api === true;
  const rampLine = rampSummary({
    trustTier,
    campaignCap: capsFromApi ? (campaign.ramp_caps_from_api ? campaign.campaign_cap : settings.data?.campaign_cap) : null,
    dailyCap: capsFromApi ? (campaign.ramp_caps_from_api ? campaign.daily_cap : settings.data?.daily_cap) : null,
    capsFromApi,
  });
  const reviewDetail = largeSendReviewCopy({
    eligible: campaign.eligible_count ?? campaign.total_recipients,
    trustTier,
    reviewReason: campaign.review_reason,
    firstThreshold: settings.data?.first_large_send_threshold,
    tierHoldThreshold: settings.data?.large_send_tier_threshold,
    tierHoldMax: settings.data?.large_send_tier_max,
    requiresReview: true,
    firstLargeSendCompleted: settings.data?.first_large_send_completed,
  });

  async function run(action: () => Promise<{ message: string }>) {
    try {
      const result = await action();
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not update the campaign.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title={campaign.name}
        breadcrumbs={['Campaigns', campaign.name]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={campaign.status} />
            {campaign.status !== 'draft' ? (
              <Link to={`/dashboard/campaigns/${campaign.id}/report`} className={secondaryButtonClass}>View report</Link>
            ) : null}
          </div>
        }
      />
      <div className="max-w-3xl space-y-4">
        <CampaignStateBanner
          status={campaign.status}
          autoPauseReason={campaign.auto_pause_reason}
          bouncePausePercent={campaign.bounce_pause_percent ?? settings.data?.bounce_pause_percent}
          complaintPausePercent={campaign.complaint_pause_percent ?? settings.data?.complaint_pause_percent}
          reviewDetail={reviewDetail}
          turnaround={turnaround}
          scheduledLabel={formatInZone(campaign.scheduled_at, campaign.timezone)}
          sentCount={campaign.sent_count}
          totalRecipients={campaign.total_recipients}
          recentSendsPerMinute={campaign.recent_sends_per_minute}
          pending={pending}
          onEdit={() => navigate(`/dashboard/campaigns/${campaign.id}?edit=1`)}
          onCancel={() => void run(() => cancel.mutateAsync(campaign.id))}
          onPause={() => void run(() => pause.mutateAsync(campaign.id))}
          onResume={() => void run(() => resume.mutateAsync(campaign.id))}
        />
        {campaign.complaint_warning && campaign.status !== 'auto_paused' ? (
          <p className="border border-[hsl(var(--chart-3)/0.45)] bg-[hsl(var(--chart-3)/0.1)] p-4 text-sm" role="status">
            {complaintWarningCopy({
              complaintWarnPercent: campaign.complaint_warn_percent ?? settings.data?.complaint_warn_percent,
              complaintPausePercent: campaign.complaint_pause_percent ?? settings.data?.complaint_pause_percent,
            })}
          </p>
        ) : null}
        {campaign.ab_status === 'needs_manual_pick' ? (
          <section className="border border-[hsl(var(--chart-3)/0.45)] bg-[hsl(var(--chart-3)/0.1)] p-4" role="status">
            <div className="mb-3 flex items-center gap-2">
              <StatusPill status="needs_manual_pick" />
              <p className="text-sm">Clicks are tied or too few to pick a winner.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <VariantChoice
                label="Send subject A"
                subject={campaign.subject}
                clicks={campaign.ab_variant_a_clicks}
                disabled={pending}
                onClick={() => void run(() => pickWinner.mutateAsync({ id: campaign.id, variant: 'a' }))}
              />
              <VariantChoice
                label="Send subject B"
                subject={campaign.subject_b}
                clicks={campaign.ab_variant_b_clicks}
                disabled={pending}
                onClick={() => void run(() => pickWinner.mutateAsync({ id: campaign.id, variant: 'b' }))}
              />
            </div>
          </section>
        ) : null}
        {campaign.ab_status && campaign.ab_status !== 'needs_manual_pick' ? (
          <div><StatusPill status={campaign.ab_status} /></div>
        ) : null}
        <dl className="grid gap-3 border border-border bg-card p-4 text-[13px] sm:grid-cols-2">
          <Row label="Trust tier" value={trustTier || '—'} />
          <Row label="Send caps" value={rampLine || '—'} />
          <Row label="Audience" value={campaign.audience_name || '—'} />
          <Row label="From" value={campaign.from_address || '—'} />
          <Row label="Subject" value={campaign.subject || '—'} />
          <Row label="Click rate" value={formatRate(campaign.click_rate)} />
          <Row label="Recipients" value={formatCount(campaign.total_recipients ?? campaign.eligible_count)} />
          <Row label="Sent" value={formatCount(campaign.sent_count)} />
        </dl>
      </div>
    </DashboardLayout>
  );
}

function VariantChoice({
  label,
  subject,
  clicks,
  disabled,
  onClick,
}: {
  label: string;
  subject: string | null;
  clicks: number | null;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-border bg-card p-3">
      <p className="text-[13px] font-medium">{subject || 'Untitled subject'}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">{formatCount(clicks)} clicks</p>
      <button type="button" className={`${primaryButtonClass} mt-3`} disabled={disabled} onClick={onClick}>{label}</button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-mono">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
