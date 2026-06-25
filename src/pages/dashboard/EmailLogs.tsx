import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { CodeBlock } from '@/components/CodeBlock';
import { FormSelect } from '@/components/form/FormSelect';
import { useDomains } from '@/hooks/useDomains';
import { useSendDetail, useSendLogMutations, useSends } from '@/hooks/useSends';
import { toastError, toastSuccess } from '@/lib/toast';
import type { EmailSendTimelineEvent } from '@/types';
import { ChevronRight, Download, Loader2, RefreshCw, Search, X } from 'lucide-react';

const STATUS_FILTERS = ['all', 'queued', 'sent', 'delivered', 'bounced', 'failed'] as const;

const PERIOD_OPTIONS = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'All time', value: 'all' },
];

export default function EmailLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(() => searchParams.get('send'));
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [domain, setDomain] = useState('all');
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('24h');

  useEffect(() => {
    const sendId = searchParams.get('send');
    if (sendId) {
      setActiveId(sendId);
    }
  }, [searchParams]);

  function openSend(id: string) {
    setActiveId(id);
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set('send', id);
      return next;
    });
  }

  function closeSend() {
    setActiveId(null);
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.delete('send');
      return next;
    });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filters = useMemo(
    () => ({
      status: filter,
      search: debouncedSearch,
      domain,
      period: period === 'all' ? undefined : period,
    }),
    [filter, debouncedSearch, domain, period],
  );

  const { data: domainsData } = useDomains();
  const { data, isLoading, isFetching, refetch } = useSends(filters);

  const logs = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  const verifiedDomains = domainsData?.data.filter((d) => d.status === 'verified') ?? [];

  const domainOptions = useMemo(
    () => [
      { value: 'all', label: 'All domains' },
      ...verifiedDomains.map((d) => ({ value: d.domain, label: d.domain })),
    ],
    [verifiedDomains],
  );

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operate"
        title="Email logs"
        description="Every message that flowed through Mailvoidr. Filter, drill down, and replay."
        actions={
          <>
            <button
              data-testid="logs-export"
              disabled
              title="Export coming soon"
              className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] text-muted-foreground opacity-60 cursor-not-allowed"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
            >
              {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Refresh
            </button>
          </>
        }
      />

      <div className="border border-border bg-card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            data-testid="logs-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, subject, message ID…"
            className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-[12.5px]"
          />
        </div>
        <FormSelect
          data-testid="logs-domain-filter"
          value={domain}
          onValueChange={setDomain}
          options={domainOptions}
          triggerClassName="h-8 w-[min(100%,180px)] bg-background text-[12.5px] shadow-none"
        />
        <FormSelect
          data-testid="logs-date-filter"
          value={period}
          onValueChange={(value) => setPeriod(value as typeof period)}
          options={PERIOD_OPTIONS}
          triggerClassName="h-8 w-[min(100%,140px)] bg-background text-[12.5px] shadow-none"
        />
        <div className="ml-auto flex items-center gap-1 font-mono text-[11.5px] text-muted-foreground">
          {isLoading ? 'Loading…' : `${logs.length} shown · ${total} total`}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            data-testid={`logs-status-${s}`}
            className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider border transition-colors ${
              filter === s ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-[12.5px] min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 label-mono">Timestamp</th>
              <th className="text-left p-3 label-mono">Message ID</th>
              <th className="text-left p-3 label-mono">Recipient</th>
              <th className="text-left p-3 label-mono">Domain</th>
              <th className="text-left p-3 label-mono">Status</th>
              <th className="text-left p-3 label-mono">Response</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                  Loading sends…
                </td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No sends match your filters.
                </td>
              </tr>
            )}
            {!isLoading &&
              logs.map((e) => (
                <tr
                  key={e.id}
                  data-testid={`log-row-${e.id}`}
                  onClick={() => openSend(e.id)}
                  className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer"
                >
                  <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(e.sent_at ?? e.queued_at ?? e.created_at)}
                  </td>
                  <td className="p-3 font-mono text-foreground/80 truncate max-w-[140px]">
                    {e.message_id ?? e.id.slice(0, 8)}
                  </td>
                  <td className="p-3 font-mono">{e.recipient ?? '—'}</td>
                  <td className="p-3 text-muted-foreground">{e.domain}</td>
                  <td className="p-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="p-3 font-mono text-[11.5px] text-muted-foreground truncate max-w-[180px]">
                    {e.response ?? '—'}
                  </td>
                  <td className="p-3">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {activeId && <LogDrawer id={activeId} onClose={closeSend} />}
    </DashboardLayout>
  );
}

function LogDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading } = useSendDetail(id);
  const { retry } = useSendLogMutations();

  const log = data?.email_send;
  const timeline = data?.timeline ?? [];
  const canRetry = log && (log.status === 'failed' || log.status === 'bounced');

  async function handleRetry() {
    try {
      const result = await retry.mutateAsync(id);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not retry send.');
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        data-testid="log-drawer"
        className="fixed right-0 top-0 h-screen w-full max-w-xl bg-card border-l border-border z-50 flex flex-col overflow-hidden"
      >
        <div className="border-b border-border p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="font-mono text-[12.5px] text-muted-foreground truncate">
                  {log?.message_id ?? log?.id}
                </div>
                <h3 className="mt-1 text-lg font-medium tracking-tight truncate">{log?.subject ?? '—'}</h3>
                {log && (
                  <div className="mt-2">
                    <StatusBadge status={log.status} />
                  </div>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center border border-border hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading && <p className="text-muted-foreground text-[13px]">Loading details…</p>}
          {log && (
            <>
              <KV label="To" value={log.recipients.join(', ') || log.recipient || '—'} mono />
              <KV label="From" value={log.from} mono />
              <KV label="Domain" value={log.domain} mono />
              <KV label="Source" value={log.source} mono />
              <KV label="Provider response" value={log.response ?? '—'} mono />
              <Timeline events={timeline} />
              <div>
                <div className="label-mono mb-2">Raw event</div>
                <CodeBlock
                  language="json"
                  code={JSON.stringify({ email_send: log, timeline }, null, 2)}
                />
              </div>
            </>
          )}
        </div>

        <div className="border-t border-border p-4 flex items-center justify-between">
          <button
            type="button"
            data-testid="log-retry"
            disabled={!canRetry || retry.isPending}
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retry.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Retry
          </button>
        </div>
      </div>
    </>
  );
}

function Timeline({ events }: { events: EmailSendTimelineEvent[] }) {
  return (
    <div>
      <div className="label-mono mb-2">Timeline</div>
      {events.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground">No events recorded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {events.map((event, index) => (
            <li key={`${event.event}-${event.occurred_at}-${index}`} className="flex items-start gap-3 text-[12.5px]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div>{event.label}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {formatTimestamp(event.occurred_at)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-start text-[12.5px]">
      <span className="label-mono pt-0.5">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} break-all`}>{value}</span>
    </div>
  );
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
}
