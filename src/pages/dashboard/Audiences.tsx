import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, EmptyStateButton } from '@/components/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { StatusPill } from '@/components/newsletter/StatusPill';
import { ImportWizard } from '@/components/newsletter/ImportWizard';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/newsletter/classes';
import { useAudienceMutations, useAudiences, useNewsletterSettings } from '@/hooks/useNewsletter';
import { exportAudience } from '@/lib/api/newsletter';
import { saveBlob } from '@/lib/newsletter/download';
import { CONFIRMATION_RATE_TOOLTIP, formatCount, formatRate } from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Audience } from '@/types/newsletter';

export default function Audiences() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [renameTarget, setRenameTarget] = useState<Audience | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Audience | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importAudienceId, setImportAudienceId] = useState<string | undefined>();
  const query = useAudiences(search.trim() || undefined);
  const settings = useNewsletterSettings();
  const { create, update, remove } = useAudienceMutations();
  const audiences = query.data?.data ?? [];

  async function handleCreate() {
    try {
      const result = await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      setCreateOpen(false);
      setName('');
      setDescription('');
      toastSuccess(result.message);
      navigate(`/dashboard/audiences/${result.audience.id}`);
    } catch (error) {
      toastError(error, 'Could not create the audience.');
    }
  }

  async function handleRename() {
    if (!renameTarget) return;
    try {
      const result = await update.mutateAsync({ id: renameTarget.id, payload: { name: renameName.trim() } });
      setRenameTarget(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not rename the audience.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const result = await remove.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not delete the audience.');
    }
  }

  async function handleExport(audience: Audience) {
    try {
      const blob = await exportAudience(audience.id);
      saveBlob(blob, `${audience.name}.csv`);
    } catch (error) {
      toastError(error, 'Could not export this audience.');
    }
  }

  function openImport(audienceId?: string) {
    setImportAudienceId(audienceId);
    setImportOpen(true);
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title="Audiences"
        description="Lists you have consent to email."
        actions={
          <button type="button" className={primaryButtonClass} onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New audience
          </button>
        }
      />

      <div className="mb-4 max-w-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search audiences"
          aria-label="Search audiences"
          className={fieldClass}
        />
      </div>

      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading audiences…</p> : null}
      {query.isError ? (
        <QueryErrorState error={query.error} subject="audiences" onRetry={() => void query.refetch()} retrying={query.isFetching} framed />
      ) : null}

      {query.isSuccess && audiences.length === 0 ? (
        <EmptyState
          framed
          title="No audiences yet"
          description="Collect subscribers with a form or import a list you have consent for."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <EmptyStateButton to="/dashboard/forms">Create a form</EmptyStateButton>
              <EmptyStateButton variant="secondary" onClick={() => openImport()}>Import CSV</EmptyStateButton>
            </div>
          }
        />
      ) : null}

      {audiences.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto border border-border bg-card md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left label-mono">Name</th>
                  <th className="p-3 text-left label-mono">Subscribed</th>
                  <th className="p-3 text-left label-mono">Pending</th>
                  <th className="p-3 text-left label-mono">Confirmation rate</th>
                  <th className="p-3 text-left label-mono">Last campaign</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {audiences.map((audience) => (
                  <tr key={audience.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <Link to={`/dashboard/audiences/${audience.id}`} className="font-medium hover:underline">
                        {audience.name}
                      </Link>
                    </td>
                    <td className="p-3">{formatCount(audience.subscribed_count)}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        {formatCount(audience.pending_count)}
                        <StatusPill status="pending" />
                      </span>
                    </td>
                    <td className="p-3">
                      <Tooltip>
                        <TooltipTrigger className="underline decoration-dotted underline-offset-4">
                          {formatRate(audience.confirmation_rate)}
                        </TooltipTrigger>
                        <TooltipContent>{CONFIRMATION_RATE_TOOLTIP}</TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="p-3 text-muted-foreground">{audience.last_campaign?.name ?? '—'}</td>
                    <td className="p-3 text-right">
                      <AudienceMenu
                        audience={audience}
                        onRename={() => {
                          setRenameTarget(audience);
                          setRenameName(audience.name);
                        }}
                        onExport={() => void handleExport(audience)}
                        onDelete={() => setDeleteTarget(audience)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {audiences.map((audience) => (
              <article key={audience.id} className="border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/dashboard/audiences/${audience.id}`} className="font-medium">{audience.name}</Link>
                  <AudienceMenu
                    audience={audience}
                    onRename={() => {
                      setRenameTarget(audience);
                      setRenameName(audience.name);
                    }}
                    onExport={() => void handleExport(audience)}
                    onDelete={() => setDeleteTarget(audience)}
                  />
                </div>
                <p className="mt-2 text-[13px]">
                  {formatCount(audience.subscribed_count)} subscribed · {formatCount(audience.pending_count)} pending
                </p>
                <p className="text-[13px] text-muted-foreground">{formatRate(audience.confirmation_rate)} confirmed</p>
              </article>
            ))}
          </div>
        </>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New audience</DialogTitle>
          </DialogHeader>
          <label className="block text-[13px]">
            Name
            <input className={`${fieldClass} mt-1.5`} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block text-[13px]">
            Description
            <input className={`${fieldClass} mt-1.5`} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <DialogFooter>
            <button type="button" className={primaryButtonClass} disabled={!name.trim() || create.isPending} onClick={() => void handleCreate()}>
              Create audience
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename audience</DialogTitle>
          </DialogHeader>
          <input className={fieldClass} value={renameName} onChange={(event) => setRenameName(event.target.value)} aria-label="Audience name" />
          <DialogFooter>
            <button type="button" className={secondaryButtonClass} onClick={() => setRenameTarget(null)}>Cancel</button>
            <button type="button" className={primaryButtonClass} disabled={!renameName.trim() || update.isPending} onClick={() => void handleRename()}>
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        resourceName={deleteTarget?.name ?? ''}
        resourceLabel="audience"
        description="Subscribers stay in workspace suppression. Type the audience name to confirm."
        onConfirm={handleDelete}
        isPending={remove.isPending}
      />

      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        audiences={audiences}
        defaultAudienceId={importAudienceId}
        settings={settings.data}
        onCreateAudience={async (audienceName) => {
          const result = await create.mutateAsync({ name: audienceName });
          return result.audience;
        }}
      />
    </DashboardLayout>
  );
}

function AudienceMenu({
  audience,
  onRename,
  onExport,
  onDelete,
}: {
  audience: Audience;
  onRename: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" aria-label={`Actions for ${audience.name}`}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>Export</DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
