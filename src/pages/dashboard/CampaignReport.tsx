import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { QueryErrorState } from '@/components/QueryErrorState';
import { StatusPill } from '@/components/newsletter/StatusPill';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { secondaryButtonClass } from '@/components/newsletter/classes';
import { useCampaign, useCampaignRecipients, useCampaignReport } from '@/hooks/useNewsletter';
import { exportCampaignRecipients } from '@/lib/api/newsletter';
import { saveBlob } from '@/lib/newsletter/download';
import { abPickedByLabel, formatComplaint, formatCount, formatRate } from '@/lib/newsletter/format';
import { toastError } from '@/lib/toast';

const RECIPIENT_FILTERS = ['', 'delivered', 'bounced', 'unsubscribed', 'complained'];

export default function CampaignReport() {
  const { id = '' } = useParams();
  const campaign = useCampaign(id);
  const report = useCampaignReport(id);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const recipients = useCampaignRecipients(id, status, page);
  const data = report.data?.report;

  async function handleExport() {
    try {
      const blob = await exportCampaignRecipients(id);
      saveBlob(blob, `campaign-${id}-recipients.csv`);
    } catch (error) {
      toastError(error, 'Could not export recipients.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title={campaign.data?.campaign.name ?? 'Report'}
        description="Clicks lead. Opens are approximate."
        breadcrumbs={['Campaigns', 'Report']}
        actions={<Link to={`/dashboard/campaigns/${id}`} className={secondaryButtonClass}>Back to campaign</Link>}
      />
      {report.isLoading ? <p className="text-[13px] text-muted-foreground">Loading report…</p> : null}
      {report.isError ? <QueryErrorState error={report.error} subject="this report" onRetry={() => void report.refetch()} framed /> : null}
      {data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Hero label="Click rate" value={formatRate(data.click_rate)} />
            <Stat label="Delivered" value={formatCount(data.delivered_count)} />
            <Stat label="Unsubscribed" value={formatCount(data.unsubscribed_count)} />
            <div className="border border-border bg-card p-4">
              <Tooltip>
                <TooltipTrigger className="label-mono underline decoration-dotted">Bounced</TooltipTrigger>
                <TooltipContent>
                  {data.bounced_hard_count == null && data.bounced_soft_count == null
                    ? 'Hard and soft split appears when the API sends it.'
                    : `${formatCount(data.bounced_hard_count)} hard · ${formatCount(data.bounced_soft_count)} soft`}
                </TooltipContent>
              </Tooltip>
              <p className="mt-1 text-2xl font-medium">{formatCount(data.bounced_count)}</p>
            </div>
            <Stat label="Complaints" value={formatComplaint(data.complaint_rate, data.complaints_available)} />
          </div>
          <p className="text-[13px] text-muted-foreground">
            Opens (approximate). Apple Mail Privacy Protection inflates opens.
            {' '}
            <span className="text-foreground">{formatRate(data.open_rate)}</span>
            {data.unique_opens != null ? ` · ${formatCount(data.unique_opens)} unique` : ''}
          </p>

          {data.ab ? (
            <section className="border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-medium">Subject test</h2>
                <span className="text-[13px] text-muted-foreground">{abPickedByLabel(data.ab.picked_by)}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {data.ab.variants.map((variant) => (
                  <article key={variant.variant} className="border border-border p-3 text-[13px]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{variant.subject || `Subject ${variant.variant.toUpperCase()}`}</p>
                      {variant.winner ? <StatusPill status="winner_picked" /> : null}
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {formatCount(variant.recipients)} recipients · {formatCount(variant.unique_clicks)} unique clicks · {formatRate(variant.click_rate)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-sm font-medium">Top links</h2>
            <div className="hidden border border-border md:block">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left label-mono">URL</th>
                    <th className="p-3 text-left label-mono">Unique clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_links.map((link) => (
                    <tr key={link.url} className="border-b border-border last:border-0">
                      <td className="p-3 break-all">{link.url}</td>
                      <td className="p-3">{formatCount(link.unique_clicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2 md:hidden">
              {data.top_links.map((link) => (
                <li key={link.url} className="border border-border p-3 text-[13px]">
                  <p className="break-all">{link.url}</p>
                  <p className="text-muted-foreground">{formatCount(link.unique_clicks)} unique clicks</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Recipients</h2>
              <button type="button" className={secondaryButtonClass} onClick={() => void handleExport()}>Export CSV</button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {RECIPIENT_FILTERS.map((filter) => (
                <button
                  key={filter || 'all'}
                  type="button"
                  onClick={() => { setStatus(filter); setPage(1); }}
                  className={`rounded-full border px-3 py-1 text-[12px] ${status === filter ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
                >
                  {filter || 'All'}
                </button>
              ))}
            </div>
            <div className="hidden border border-border md:block">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left label-mono">Email</th>
                    <th className="p-3 text-left label-mono">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(recipients.data?.data ?? []).map((recipient) => (
                    <tr key={recipient.id} className="border-b border-border last:border-0">
                      <td className="p-3">{recipient.email}</td>
                      <td className="p-3"><StatusPill status={recipient.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2 md:hidden">
              {(recipients.data?.data ?? []).map((recipient) => (
                <li key={recipient.id} className="flex items-center justify-between border border-border p-3 text-[13px]">
                  <span>{recipient.email}</span>
                  <StatusPill status={recipient.status} />
                </li>
              ))}
            </ul>
            {(recipients.data?.meta?.last_page ?? 1) > 1 ? (
              <div className="mt-3 flex justify-between">
                <button type="button" className={secondaryButtonClass} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <button type="button" className={secondaryButtonClass} disabled={page >= (recipients.data?.meta?.last_page ?? 1)} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

function Hero({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-4 lg:col-span-1">
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-3xl font-medium tracking-tight text-primary">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="label-mono">{label}</p>
      <p className="mt-1 text-2xl font-medium">{value}</p>
    </div>
  );
}
