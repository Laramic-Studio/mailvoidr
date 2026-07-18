import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useTemplateMutations, useTemplates } from '@/hooks/useTemplates';
import { DEFAULT_TEMPLATE_VARIABLES } from '@/lib/templates/editor';
import { toastError, toastSuccess } from '@/lib/toast';
import type { EmailTemplate, TemplateCategory, TemplateVisibility } from '@/types';
import { Plus, Search, FileCode2, Loader2, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // use shadcn/ui components as directed

const CATEGORY_OPTIONS = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public (marketplace)' },
  { value: 'private', label: 'Private (library only)' },
] as const;

function categoryLabel(category: TemplateCategory): string {
  return category === 'marketing' ? 'Marketing' : 'Transactional';
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('transactional');
  const [visibility, setVisibility] = useState<TemplateVisibility>('public');

  const { data, isLoading, isError } = useTemplates(search.trim() || undefined);
  const { create, remove } = useTemplateMutations();

  const templates = useMemo(() => data?.data ?? [], [data?.data]);

  async function handleCreate() {
    if (!name.trim()) {
      toastError('Name is required.');
      return;
    }

    try {
      const result = await create.mutateAsync({
        name: name.trim(),
        category,
        visibility,
        variables: DEFAULT_TEMPLATE_VARIABLES,
      });
      setShowCreate(false);
      setName('');
      toastSuccess(result.message);
      navigate(`/dashboard/templates/${result.template.id}`);
    } catch (error) {
      toastError(error, 'Could not create template.');
    }
  }

  async function handleDeleteConfirm() {
    if (!templateToDelete) return;

    try {
      const result = await remove.mutateAsync(templateToDelete.id);
      setTemplateToDelete(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not delete template.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Templates"
        title="My templates"
        description="Your workspace library — templates you created or added from the marketplace."
        actions={
          <>
            <Link
              to="/dashboard/templates/marketplace"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              <Store className="h-3 w-3" /> Marketplace
            </Link>
            <button
              type="button"
              data-testid="template-create"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" /> New template
            </button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            data-testid="template-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates…"
            className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-[13px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : isError ? (
        <div className="border border-border bg-card p-8 text-[13px] text-destructive">
          Could not load templates.
        </div>
      ) : templates.length === 0 ? (
        <div className="border border-dashed border-border bg-card/30 p-16 text-center">
          <h3 className="text-base font-medium">No templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a reusable template for transactional or marketing sends.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {templates.map((template) => (
            <div key={template.id} className="bg-card p-5 flex flex-col">
              <Link
                to={`/dashboard/templates/${template.id}`}
                data-testid={`template-card-${template.id}`}
                className="group flex flex-col flex-1 hover:text-foreground"
              >
                <div className="flex items-start justify-between">
                  <FileCode2 className="h-4 w-4 text-muted-foreground" />
                  <StatusBadge
                    status={template.is_active ? 'active' : 'inactive'}
                    label={categoryLabel(template.category)}
                    tone={template.category === 'marketing' ? 'info' : 'success'}
                  />
                </div>
                <h3 className="mt-4 text-[14.5px] font-medium tracking-tight">{template.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.source_template_id ? (
                    <span className="rounded border border-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                      From marketplace
                    </span>
                  ) : null}
                  {template.visibility === 'private' ? (
                    <span className="rounded border border-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                      Private
                    </span>
                  ) : null}
                </div>
                <div className="mt-1.5 text-[11.5px] text-muted-foreground font-mono">
                  Updated {formatUpdatedAt(template.updated_at)} · {template.version_count ?? 1} versions
                </div>
                <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <div className="label-mono">Sent</div>
                    <div className="mt-1 font-mono">{(template.sends_count ?? 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="label-mono">Subject</div>
                    <div className="mt-1 truncate text-muted-foreground">{template.subject ?? '—'}</div>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                className="mt-4 text-left text-[12px] text-muted-foreground hover:text-destructive"
                onClick={() => setTemplateToDelete(template)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div className="w-full max-w-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="text-base font-medium">New template</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Name your template, then build it in the visual editor.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <label className="block space-y-1.5">
                <span className="label-mono">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                  placeholder="Password reset"
                  autoFocus
                />
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Category</span>
                <div>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as TemplateCategory)}
                  >
                    <SelectTrigger className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Visibility</span>
                <div>
                  <Select
                    value={visibility}
                    onValueChange={(value) => setVisibility(value as TemplateVisibility)}
                  >
                    <SelectTrigger className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (marketplace)</SelectItem>
                      <SelectItem value="private">Private (library only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </label>
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
                Create &amp; open editor
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(templateToDelete)}
        onOpenChange={(open) => {
          if (!open) setTemplateToDelete(null);
        }}
        resourceName={templateToDelete?.name ?? ''}
        resourceLabel="template"
        title="Delete template"
        description={
          templateToDelete
            ? 'Sends already logged will keep their history. Type the template name below to confirm removal.'
            : undefined
        }
        onConfirm={handleDeleteConfirm}
        isPending={remove.isPending}
      />
    </DashboardLayout>
  );
}
