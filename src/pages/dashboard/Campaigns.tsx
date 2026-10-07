import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, EmptyStateButton } from '@/components/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { StatusPill } from '@/components/newsletter/StatusPill';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fieldClass, primaryButtonClass } from '@/components/newsletter/classes';
import { useCampaignMutations, useCampaigns, useNewsletterSettings } from '@/hooks/useNewsletter';
import {
  campaignReasonLine,
  campaignScheduleLabel,
  filterCampaigns,
  formatCount,
  formatRate,
} from '@/lib/newsletter/format';
import { CAMPAIGN_LIST_TABS, type CampaignListTab } from '@/lib/newsletter/tabs';
import { toastError, toastSuccess } from '@/lib/toast';

export default function Campaigns() {
  const navigate = useNavigate();
  const query = useCampaigns();
  const settings = useNewsletterSettings();
  const pausePolicy = {
    bouncePausePercent: settings.data?.bounce_pause_percent,
    complaintPausePercent: settings.data?.complaint_pause_percent,
  };
  const { create } = useCampaignMutations();
  const [tab, setTab] = useState<CampaignListTab>('all');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const rows = useMemo(
    () => filterCampaigns(query.data?.data ?? [], tab),
    [query.data?.data, tab],
  );

  async function handleCreate() {
    try {
      const result = await create.mutateAsync({ name: name.trim() });
      setOpen(false);
      setName('');
      toastSuccess(result.message);
      navigate(`/dashboard/campaigns/${result.campaign.id}`);
    } catch (error) {
      toastError(error, 'Could not create the campaign.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title="Campaigns"
        description="Drafts, schedules, and sends. Times show in the campaign time zone."
        actions={
          <button type="button" className={primaryButtonClass} onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New campaign
          </button>
        }
      />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {CAMPAIGN_LIST_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3.5 py-2 text-[13px] ${tab === item.id ? '-mb-px border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading campaigns…</p> : null}
      {query.isError ? <QueryErrorState error={query.error} subject="campaigns" onRetry={() => void query.refetch()} framed /> : null}
      {query.isSuccess && rows.length === 0 ? (
        <EmptyState framed title="Nothing in this tab" description="Draft a campaign when you have an audience with consent." action={<EmptyStateButton onClick={() => setOpen(true)}>New campaign</EmptyStateButton>} />
      ) : null}
      {rows.length > 0 ? (
        <>
          <div className="hidden border border-border bg-card md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Status', 'Audience', 'Recipients', 'Click rate', 'Sent / scheduled'].map((heading) => (
                    <th key={heading} className="p-3 text-left label-mono">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((campaign) => {
                  const reason = campaignReasonLine(campaign, pausePolicy);
                  return (
                    <tr key={campaign.id} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <Link to={`/dashboard/campaigns/${campaign.id}`} className="font-medium hover:underline">{campaign.name}</Link>
                        {reason ? <p className="mt-1 text-[12px] text-muted-foreground">{reason}</p> : null}
                      </td>
                      <td className="p-3"><StatusPill status={campaign.status} /></td>
                      <td className="p-3">{campaign.audience_name || '—'}</td>
                      <td className="p-3">{formatCount(campaign.total_recipients ?? campaign.eligible_count)}</td>
                      <td className="p-3">{formatRate(campaign.click_rate)}</td>
                      <td className="p-3">{campaignScheduleLabel(campaign)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {rows.map((campaign) => (
              <Link key={campaign.id} to={`/dashboard/campaigns/${campaign.id}`} className="block border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{campaign.name}</span>
                  <StatusPill status={campaign.status} />
                </div>
                {campaignReasonLine(campaign, pausePolicy) ? <p className="mt-1 text-[12px] text-muted-foreground">{campaignReasonLine(campaign, pausePolicy)}</p> : null}
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {formatRate(campaign.click_rate)} clicks · {campaignScheduleLabel(campaign)}
                </p>
              </Link>
            ))}
          </div>
        </>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New campaign</DialogTitle></DialogHeader>
          <label className="block text-[13px]">
            Name
            <input className={`${fieldClass} mt-1.5`} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <DialogFooter>
            <button type="button" className={primaryButtonClass} disabled={!name.trim() || create.isPending} onClick={() => void handleCreate()}>
              Create draft
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
