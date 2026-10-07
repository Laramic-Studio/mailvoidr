import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { QueryErrorState } from '@/components/QueryErrorState';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { DisabledWithTooltip } from '@/components/DisabledWithTooltip';
import { StatusPill } from '@/components/newsletter/StatusPill';
import { ImportWizard } from '@/components/newsletter/ImportWizard';
import { PlanLimitAlert, SubscriberCapNotice } from '@/components/newsletter/SubscriberLimitNotice';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/newsletter/classes';
import {
  useAudience,
  useAudienceMutations,
  useAudiences,
  useForms,
  useNewsletterSettings,
  useSubscriber,
  useSubscriberMutations,
  useSubscribers,
} from '@/hooks/useNewsletter';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { exportAudience, exportSubscriberConsent } from '@/lib/api/newsletter';
import { saveBlob } from '@/lib/newsletter/download';
import {
  doiImportCopy,
  exportPermission,
  formatCount,
  formatRate,
  formatShortDate,
  manualResubscribeBlocked,
  statusLabel,
  subscriberPlanLimitMessage,
} from '@/lib/newsletter/format';
import { SUBSCRIBER_STATUSES } from '@/types/newsletter';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Subscriber } from '@/types/newsletter';

export default function AudienceDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const audienceQuery = useAudience(id);
  const settingsQuery = useNewsletterSettings();
  const audiencesQuery = useAudiences();
  const [tab, setTab] = useState<'subscribers' | 'forms' | 'settings'>('subscribers');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const subscribers = useSubscribers(id, { search: search.trim() || undefined, status: status || undefined, tag: tag || undefined, page });
  const forms = useForms(id);
  const { update, remove } = useAudienceMutations();
  const audience = audienceQuery.data?.audience;
  const exportGate = exportPermission(currentWorkspace?.role, subscribers.data?.meta?.can_export);

  async function handleExport() {
    if (!audience) return;
    try {
      const blob = await exportAudience(audience.id);
      saveBlob(blob, `${audience.name}.csv`);
    } catch (error) {
      toastError(error, 'Could not export this audience.');
    }
  }

  if (audienceQuery.isLoading) {
    return (
      <DashboardLayout>
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading audience…</p>
      </DashboardLayout>
    );
  }

  if (audienceQuery.isError || !audience) {
    return (
      <DashboardLayout>
        <QueryErrorState error={audienceQuery.error} subject="this audience" onRetry={() => void audienceQuery.refetch()} framed />
      </DashboardLayout>
    );
  }

  const counts = subscribers.data?.meta?.counts;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title={audience.name}
        description={audience.description ?? 'Subscribers, forms, and list settings.'}
        breadcrumbs={['Audiences', audience.name]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondaryButtonClass} onClick={() => setImportOpen(true)}>Import CSV</button>
            <button type="button" className={primaryButtonClass} onClick={() => setAddOpen(true)}>Add subscriber</button>
          </div>
        }
      />

      <div className="mb-4">
        <SubscriberCapNotice used={settingsQuery.data?.subscribers_used} limit={settingsQuery.data?.subscriber_limit} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Subscribed" value={formatCount(audience.subscribed_count)} hint="Will receive campaigns" />
        <Stat label="Pending" value={formatCount(audience.pending_count)} hint="Auto-purged after 30 days" />
        <Stat label="Unsubscribed" value={formatCount(audience.unsubscribed_count)} />
        <Stat label="Bounced / complained" value={`${formatCount(audience.bounced_count)} / ${formatCount(audience.complained_count)}`} />
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {([
          ['subscribers', 'Subscribers'],
          ['forms', 'Forms'],
          ['settings', 'Settings'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 text-[13px] ${tab === key ? '-mb-px border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'subscribers' ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className={fieldClass}
              placeholder="Search email or name"
              aria-label="Search subscribers"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            {exportGate.allowed ? (
              <button type="button" className={secondaryButtonClass} onClick={() => void handleExport()}>Export</button>
            ) : (
              <DisabledWithTooltip tooltip={exportGate.reason}>
                <button type="button" className={secondaryButtonClass} disabled>Export</button>
              </DisabledWithTooltip>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" count={subscribers.data?.meta?.total} active={!status} onClick={() => { setStatus(''); setPage(1); }} />
            {SUBSCRIBER_STATUSES.map((item) => (
              <FilterChip
                key={item}
                label={statusLabel(item)}
                count={counts?.[item]}
                active={status === item}
                onClick={() => { setStatus(item); setPage(1); }}
              />
            ))}
          </div>
          {(subscribers.data?.meta?.tags ?? []).length > 0 ? (
            <label className="block max-w-xs text-[13px]">
              Tag
              <select className={`${fieldClass} mt-1`} value={tag} onChange={(event) => { setTag(event.target.value); setPage(1); }}>
                <option value="">All tags</option>
                {subscribers.data?.meta?.tags?.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          ) : null}
          {subscribers.isError ? (
            <QueryErrorState error={subscribers.error} subject="subscribers" onRetry={() => void subscribers.refetch()} />
          ) : null}
          {subscribers.isSuccess && subscribers.data.data.length === 0 ? (
            <EmptyState size="compact" title="No subscribers match" description="Add someone manually or import a CSV you have consent for." />
          ) : null}
          <div className="hidden border border-border bg-card md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {['Email', 'Name', 'Status', 'Source', 'Tags', 'Added'].map((heading) => (
                    <th key={heading} className="p-3 text-left label-mono">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(subscribers.data?.data ?? []).map((subscriber) => (
                  <SubscriberRow key={subscriber.id} subscriber={subscriber} onOpen={() => setSelectedId(subscriber.id)} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 md:hidden">
            {(subscribers.data?.data ?? []).map((subscriber) => (
              <button key={subscriber.id} type="button" onClick={() => setSelectedId(subscriber.id)} className="w-full border border-border bg-card p-3 text-left">
                <div className="font-medium">{subscriber.email}</div>
                <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                  <StatusPill status={subscriber.status} />
                  {subscriber.name}
                </div>
              </button>
            ))}
          </div>
          <Pager page={subscribers.data?.meta?.current_page ?? page} last={subscribers.data?.meta?.last_page ?? 1} onPage={setPage} />
        </div>
      ) : null}

      {tab === 'forms' ? (
        <div className="space-y-3">
          {(forms.data?.data ?? []).length === 0 ? (
            <EmptyState framed title="No forms for this audience" action={<Link to="/dashboard/forms" className={primaryButtonClass}>New form</Link>} />
          ) : (
            (forms.data?.data ?? []).map((form) => (
              <Link key={form.id} to={`/dashboard/forms/${form.id}`} className="block border border-border bg-card p-4 hover:bg-accent/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{form.name}</span>
                  <StatusPill status={form.status} />
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {formatCount(form.signups_30d)} signups · {formatRate(form.confirmation_rate)} confirmed
                </p>
              </Link>
            ))
          )}
        </div>
      ) : null}

      {tab === 'settings' ? (
        <SettingsPane
          name={audience.name}
          description={audience.description ?? ''}
          pending={update.isPending || remove.isPending}
          onSave={async (nextName, nextDescription) => {
            const result = await update.mutateAsync({
              id: audience.id,
              payload: { name: nextName, description: nextDescription },
            });
            toastSuccess(result.message);
          }}
          onDelete={async () => {
            const result = await remove.mutateAsync(audience.id);
            toastSuccess(result.message);
            navigate('/dashboard/audiences');
          }}
        />
      ) : null}

      <AddSubscriberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        audienceId={id}
        note={doiImportCopy(settingsQuery.data)}
        used={settingsQuery.data?.subscribers_used}
        limit={settingsQuery.data?.subscriber_limit}
      />
      <SubscriberSheet audienceId={id} subscriberId={selectedId} onClose={() => setSelectedId(null)} />
      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        audiences={audiencesQuery.data?.data ?? (audience ? [audience] : [])}
        defaultAudienceId={audience.id}
        settings={settingsQuery.data}
      />
    </DashboardLayout>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="label-mono">{label}</div>
      <div className="mt-1 text-2xl font-medium tracking-tight">{value}</div>
      {hint ? <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12px] ${active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground'}`}
    >
      {label}
      {count != null ? ` · ${formatCount(count)}` : ''}
    </button>
  );
}

function SubscriberRow({ subscriber, onOpen }: { subscriber: Subscriber; onOpen: () => void }) {
  return (
    <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/30" onClick={onOpen}>
      <td className="p-3">{subscriber.email}</td>
      <td className="p-3">{subscriber.name || '—'}</td>
      <td className="p-3"><StatusPill status={subscriber.status} /></td>
      <td className="p-3">{subscriber.source || '—'}</td>
      <td className="p-3">{subscriber.tags.join(', ') || '—'}</td>
      <td className="p-3">{formatShortDate(subscriber.created_at)}</td>
    </tr>
  );
}

function Pager({ page, last, onPage }: { page: number; last: number; onPage: (page: number) => void }) {
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-between text-[13px]">
      <button type="button" className={secondaryButtonClass} disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span>Page {page} of {last}</span>
      <button type="button" className={secondaryButtonClass} disabled={page >= last} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

function AddSubscriberDialog({
  open,
  onOpenChange,
  audienceId,
  note,
  used,
  limit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audienceId: string;
  note: string;
  used?: number | null;
  limit?: number | null;
}) {
  const { create } = useSubscriberMutations(audienceId);
  const [email, setEmail] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [limitError, setLimitError] = useState<string | null>(null);

  async function handleSubmit() {
    setLimitError(null);
    try {
      const result = await create.mutateAsync({
        email: email.trim(),
        first_name: first.trim() || undefined,
        last_name: last.trim() || undefined,
      });
      toastSuccess(result.message);
      setEmail('');
      setFirst('');
      setLast('');
      onOpenChange(false);
    } catch (error) {
      const planLimit = subscriberPlanLimitMessage(error);
      if (planLimit) setLimitError(planLimit);
      toastError(error, 'Could not add the subscriber.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add subscriber</DialogTitle>
        </DialogHeader>
        <SubscriberCapNotice used={used} limit={limit} />
        <PlanLimitAlert message={limitError} />
        <p className="text-[13px] text-muted-foreground">{note}</p>
        <label className="block text-[13px]">Email<input className={`${fieldClass} mt-1.5`} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[13px]">First name<input className={`${fieldClass} mt-1.5`} value={first} onChange={(event) => setFirst(event.target.value)} /></label>
          <label className="block text-[13px]">Last name<input className={`${fieldClass} mt-1.5`} value={last} onChange={(event) => setLast(event.target.value)} /></label>
        </div>
        <DialogFooter>
          <button type="button" className={primaryButtonClass} disabled={!email.trim() || create.isPending} onClick={() => void handleSubmit()}>
            Add subscriber
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriberSheet({
  audienceId,
  subscriberId,
  onClose,
}: {
  audienceId: string;
  subscriberId: string | null;
  onClose: () => void;
}) {
  const query = useSubscriber(audienceId, subscriberId ?? undefined);
  const { update, unsubscribe, remove } = useSubscriberMutations(audienceId);
  const subscriber = query.data?.subscriber;
  const [tags, setTags] = useState('');
  const [tagsReady, setTagsReady] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const tagValue = tagsReady === subscriberId ? tags : (subscriber?.tags.join(', ') ?? '');

  async function saveTags() {
    if (!subscriberId) return;
    try {
      const result = await update.mutateAsync({
        subscriberId,
        payload: { tags: tagValue.split(',').map((item) => item.trim()).filter(Boolean) },
      });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not update tags.');
    }
  }

  async function handleUnsubscribe() {
    if (!subscriberId) return;
    try {
      const result = await unsubscribe.mutateAsync(subscriberId);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not unsubscribe this person.');
    }
  }

  async function handleDelete() {
    if (!subscriberId) return;
    try {
      const result = await remove.mutateAsync(subscriberId);
      setDeleteOpen(false);
      onClose();
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not delete personal data.');
    }
  }

  async function handleConsent() {
    if (!subscriber) return;
    try {
      const blob = await exportSubscriberConsent(audienceId, subscriber.id);
      saveBlob(blob, `consent-${subscriber.id}.json`);
    } catch (error) {
      toastError(error, 'Could not export the consent record.');
    }
  }

  const blocked = subscriber ? manualResubscribeBlocked(subscriber.status) : false;

  return (
    <>
      <Sheet open={Boolean(subscriberId)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{subscriber?.email ?? 'Subscriber'}</SheetTitle>
            <SheetDescription>Consent, tags, and recent activity.</SheetDescription>
          </SheetHeader>
          {query.isLoading ? <p className="mt-4 text-[13px] text-muted-foreground">Loading…</p> : null}
          {subscriber ? (
            <div className="mt-4 space-y-5 text-[13px]">
              <div className="flex items-center gap-2">
                <StatusPill status={subscriber.status} />
                <span className="text-muted-foreground">{subscriber.source || 'Unknown source'}</span>
              </div>
              {blocked ? (
                <p className="border border-border bg-muted/40 p-3">
                  A subscriber who is unsubscribed, bounced, or complained cannot be set back to subscribed. They can only return through a new confirmed signup.
                </p>
              ) : null}
              <label className="block">
                Tags
                <input
                  className={`${fieldClass} mt-1.5`}
                  value={tagValue}
                  onChange={(event) => {
                    setTagsReady(subscriberId);
                    setTags(event.target.value);
                  }}
                />
              </label>
              <button type="button" className={secondaryButtonClass} onClick={() => void saveTags()}>Save tags</button>
              <section>
                <h3 className="font-medium">Consent log</h3>
                {subscriber.consent_log.length === 0 ? <p className="mt-1 text-muted-foreground">No consent events yet.</p> : null}
                <ul className="mt-2 space-y-3">
                  {subscriber.consent_log.map((entry, index) => (
                    <li key={`${entry.timestamp}-${index}`} className="border border-border p-3">
                      <p>{formatShortDate(entry.timestamp)} · {entry.source || '—'}</p>
                      <p className="text-muted-foreground">IP {entry.ip || '—'} · {entry.user_agent || '—'}</p>
                      <p className="text-muted-foreground">
                        Form {entry.form_id || '—'} · Import {entry.import_id || '—'} · Consent v{entry.consent_text_version || '—'}
                      </p>
                      <p className="text-muted-foreground">Confirmed {formatShortDate(entry.confirmed_at)} · {entry.confirmed_ip || '—'}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="font-medium">Activity</h3>
                {subscriber.activity.length === 0 ? <p className="mt-1 text-muted-foreground">No campaigns yet.</p> : null}
                <ul className="mt-2 space-y-2">
                  {subscriber.activity.map((item) => (
                    <li key={item.campaign_id} className="flex justify-between gap-3">
                      <span>{item.campaign_name}</span>
                      <span className="text-muted-foreground">{item.clicks} clicks</span>
                    </li>
                  ))}
                </ul>
              </section>
              <div className="flex flex-wrap gap-2">
                {subscriber.status === 'subscribed' || subscriber.status === 'pending' ? (
                  <button type="button" className={secondaryButtonClass} onClick={() => void handleUnsubscribe()}>Unsubscribe</button>
                ) : null}
                <button type="button" className={secondaryButtonClass} onClick={() => void handleConsent()}>Export consent record</button>
                <button type="button" className="text-[13px] text-destructive" onClick={() => setDeleteOpen(true)}>Delete personal data</button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resourceName={subscriber?.email ?? ''}
        resourceLabel="subscriber"
        description="Deletes personal data. A hashed suppression entry stays so this address is not emailed again."
        confirmLabel="Delete personal data"
        onConfirm={handleDelete}
        isPending={remove.isPending}
      />
    </>
  );
}

function SettingsPane({
  name,
  description,
  pending,
  onSave,
  onDelete,
}: {
  name: string;
  description: string;
  pending: boolean;
  onSave: (name: string, description: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [nextName, setNextName] = useState(name);
  const [nextDescription, setNextDescription] = useState(description);
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <div className="max-w-xl space-y-4">
      <label className="block text-[13px]">Name<input className={`${fieldClass} mt-1.5`} value={nextName} onChange={(event) => setNextName(event.target.value)} /></label>
      <label className="block text-[13px]">Description<textarea className={`${fieldClass} mt-1.5 min-h-24`} value={nextDescription} onChange={(event) => setNextDescription(event.target.value)} /></label>
      <button
        type="button"
        className={primaryButtonClass}
        disabled={pending}
        onClick={() => void onSave(nextName.trim(), nextDescription).catch((error) => toastError(error, 'Could not save.'))}
      >
        Save settings
      </button>
      <div className="border border-destructive/40 p-4">
        <h3 className="text-sm font-medium text-destructive">Delete audience</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Subscribers stay in workspace suppression.</p>
        <button type="button" className="mt-3 text-[13px] text-destructive" onClick={() => setDeleteOpen(true)}>Delete</button>
      </div>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resourceName={name}
        resourceLabel="audience"
        description="Subscribers stay in workspace suppression."
        onConfirm={onDelete}
        isPending={pending}
      />
    </div>
  );
}
