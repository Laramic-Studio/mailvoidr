import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { CodeBlock } from '@/components/CodeBlock';
import { useWebhookDeliveries, useWebhookMutations, useWebhooks } from '@/hooks/useWebhooks';
import { toastError, toastSuccess } from '@/lib/toast';
import type { WebhookEndpoint, WebhookEventOption } from '@/types';
import { Copy, Loader2, Play, Plus, RotateCw, Webhook as WebhookIcon } from 'lucide-react';

function formatRelativeTime(value?: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString();
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  return `${ms}ms`;
}

export default function Webhooks() {
  const [tab, setTab] = useState<'endpoints' | 'logs' | 'events'>('endpoints');
  const [showCreate, setShowCreate] = useState(false);
  const [endpointToDelete, setEndpointToDelete] = useState<WebhookEndpoint | null>(null);
  const [plainSecret, setPlainSecret] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['email.queued', 'email.delivered']);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useWebhooks();
  const { data: deliveriesData, isLoading: deliveriesLoading } = useWebhookDeliveries();
  const { create, update, remove, rotateSecret, sendTest, replay } = useWebhookMutations();

  const endpoints = useMemo(() => data?.data ?? [], [data?.data]);
  const availableEvents = useMemo(() => data?.meta.available_events ?? [], [data?.meta.available_events]);
  const deliveries = useMemo(() => deliveriesData?.data ?? [], [deliveriesData?.data]);

  function toggleEvent(event: string) {
    setSelectedEvents((current) =>
      current.includes(event) ? current.filter((item) => item !== event) : [...current, event],
    );
  }

  async function handleCreate() {
    if (!url.trim() || selectedEvents.length === 0) {
      toastError('URL and at least one event are required.');
      return;
    }

    try {
      const result = await create.mutateAsync({
        url: url.trim(),
        events: selectedEvents,
        description: description.trim() || undefined,
      });
      setShowCreate(false);
      setUrl('');
      setDescription('');
      setPlainSecret(result.plain_secret);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not create webhook endpoint.');
    }
  }

  async function handleDeleteConfirm() {
    if (!endpointToDelete) return;

    try {
      const result = await remove.mutateAsync(endpointToDelete.id);
      setEndpointToDelete(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not delete webhook endpoint.');
    }
  }

  async function handleToggleStatus(endpoint: WebhookEndpoint) {
    try {
      const result = await update.mutateAsync({
        id: endpoint.id,
        payload: { status: endpoint.status === 'active' ? 'paused' : 'active' },
      });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not update webhook endpoint.');
    }
  }

  async function handleRotateSecret(endpoint: WebhookEndpoint) {
    try {
      const result = await rotateSecret.mutateAsync(endpoint.id);
      setPlainSecret(result.plain_secret);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not rotate signing secret.');
    }
  }

  async function handleTest(endpoint: WebhookEndpoint) {
    const event = endpoint.events.includes('*') ? 'email.queued' : endpoint.events[0];
    if (!event) {
      toastError('This endpoint has no subscribed events.');
      return;
    }

    try {
      const result = await sendTest.mutateAsync({ id: endpoint.id, event });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not send test webhook.');
    }
  }

  async function handleReplay(deliveryId: string) {
    setReplayingId(deliveryId);
    try {
      const result = await replay.mutateAsync(deliveryId);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not replay delivery.');
    } finally {
      setReplayingId(null);
    }
  }

  async function copySecret() {
    if (!plainSecret) return;
    await navigator.clipboard.writeText(plainSecret);
    toastSuccess('Signing secret copied.');
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="Webhooks"
        description="Signed, retried, replayable deliveries for email and domain events."
        actions={
          <button
            type="button"
            data-testid="webhook-create"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" /> New endpoint
          </button>
        }
      />

      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {[
          ['endpoints', 'Endpoints'],
          ['logs', 'Delivery logs'],
          ['events', 'Event types'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as typeof tab)}
            data-testid={`webhook-tab-${id}`}
            className={`px-3.5 py-2 text-[13px] transition-colors ${
              tab === id
                ? '-mb-px border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'endpoints' && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : isError ? (
            <div className="border border-border bg-card p-8 text-[13px] text-destructive">
              Could not load webhook endpoints.
            </div>
          ) : endpoints.length === 0 ? (
            <div className="border border-dashed border-border bg-card/30 p-16 text-center">
              <h3 className="text-base font-medium">No webhook endpoints yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an HTTPS endpoint to receive signed event payloads.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} data-testid={`webhook-row-${endpoint.id}`} className="border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-2">
                        <WebhookIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate font-mono text-[13px]">{endpoint.url}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {endpoint.events.map((event) => (
                          <span key={event} className="border border-border px-1.5 py-0.5 font-mono text-[10.5px]">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={endpoint.status === 'active' ? 'active' : 'inactive'} />
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {formatRelativeTime(endpoint.last_delivery_at)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-px border border-border bg-border sm:grid-cols-3">
                    <div className="bg-card p-3">
                      <div className="label-mono">Success rate</div>
                      <div className="mt-0.5 font-mono text-sm text-primary">
                        {endpoint.success_rate != null ? `${endpoint.success_rate}%` : '—'}
                      </div>
                    </div>
                    <div className="bg-card p-3">
                      <div className="label-mono">Secret</div>
                      <div className="mt-0.5 font-mono text-sm">{endpoint.secret_prefix}…</div>
                    </div>
                    <div className="bg-card p-3">
                      <div className="label-mono">Deliveries</div>
                      <div className="mt-0.5 font-mono text-sm">{endpoint.deliveries_count ?? 0}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTest(endpoint)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-accent"
                    >
                      <Play className="h-3 w-3" /> Send test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(endpoint)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-accent"
                    >
                      {endpoint.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRotateSecret(endpoint)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-accent"
                    >
                      <RotateCw className="h-3 w-3" /> Rotate secret
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndpointToDelete(endpoint)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[12px] text-destructive hover:bg-accent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'logs' && (
        <div className="border border-border bg-card">
          {deliveriesLoading ? (
            <div className="flex items-center justify-center p-16 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-16 text-center text-[13px] text-muted-foreground">No deliveries yet.</div>
          ) : (
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left label-mono">Timestamp</th>
                  <th className="p-3 text-left label-mono">Event</th>
                  <th className="p-3 text-left label-mono">URL</th>
                  <th className="p-3 text-left label-mono">Status</th>
                  <th className="p-3 text-left label-mono">Duration</th>
                  <th className="p-3 text-left label-mono">Attempts</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {deliveries.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="p-3 font-mono text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono">{log.event}</td>
                    <td className="max-w-[260px] truncate p-3 font-mono">{log.endpoint?.url ?? '—'}</td>
                    <td className="p-3">
                      <span
                        className={`font-mono text-[12px] ${
                          log.status_code && log.status_code >= 200 && log.status_code < 300
                            ? 'text-primary'
                            : 'text-destructive'
                        }`}
                      >
                        {log.status_code ?? 'ERR'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{formatDuration(log.duration_ms)}</td>
                    <td className="p-3 font-mono">{log.attempts}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        data-testid={`webhook-replay-${log.id}`}
                        disabled={replayingId === log.id}
                        onClick={() => handleReplay(log.id)}
                        className="inline-flex items-center gap-1 text-[12px] hover:text-primary disabled:opacity-60"
                      >
                        {replayingId === log.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        Replay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div className="border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Available events</h3>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Subscribe to any combination from your endpoint configuration.
          </p>
          <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2">
            {availableEvents.map((event: WebhookEventOption) => (
              <div key={event.key} className="bg-card p-3">
                <div className="font-mono text-[12px]">{event.key}</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{event.label}</div>
                {!event.dispatchable ? (
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Subscribe only — dispatch coming soon
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <CodeBlock
            language="json"
            className="mt-5"
            code={JSON.stringify(
              {
                id: 'evt_8K3xPa9',
                type: 'email.delivered',
                created: '2026-02-18T09:42:18Z',
                data: {
                  email_send_id: '01H…',
                  recipient: 'riya@example.com',
                  from: 'hello@mail.acme.com',
                  status: 'delivered',
                },
              },
              null,
              2,
            )}
          />
        </div>
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div className="w-full max-w-2xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="text-base font-medium">New webhook endpoint</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">HTTPS URLs only. Payloads are signed with HMAC SHA-256.</p>
            </div>
            <div className="space-y-4 p-5">
              <label className="block space-y-1.5">
                <span className="label-mono">Endpoint URL</span>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://api.example.com/webhooks/mailvoidr"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Description</span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </label>
              <div>
                <div className="label-mono mb-2">Events</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableEvents.map((event) => (
                    <label key={event.key} className="flex items-start gap-2 rounded-md border border-border p-3 text-[12px]">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.key)}
                        onChange={() => toggleEvent(event.key)}
                      />
                      <span>
                        <span className="font-mono">{event.key}</span>
                        <span className="mt-0.5 block text-muted-foreground">{event.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-5">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={create.isPending}
                onClick={handleCreate}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {create.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Create endpoint
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {plainSecret ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div className="w-full max-w-lg border border-border bg-card p-5">
            <h3 className="text-base font-medium">Copy your signing secret</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Use this to verify `Mailvoidr-Signature` on incoming requests. It won&apos;t be shown again.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background p-3 font-mono text-[12px]">
              <span className="flex-1 break-all">{plainSecret}</span>
              <button type="button" onClick={copySecret} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <button
              type="button"
              className="mt-4 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
              onClick={() => setPlainSecret(null)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(endpointToDelete)}
        onOpenChange={(open) => {
          if (!open) setEndpointToDelete(null);
        }}
        resourceName={endpointToDelete?.url ?? ''}
        resourceLabel="webhook endpoint"
        title="Delete webhook endpoint"
        description="Delivery history for this endpoint will also be removed."
        onConfirm={handleDeleteConfirm}
        isPending={remove.isPending}
      />
    </DashboardLayout>
  );
}
