import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useTemplate, useTemplateMutations } from '@/hooks/useTemplates';
import { toastError, toastSuccess } from '@/lib/toast';
import type { TemplateCategory, TemplatePreview, TemplateVariable, TemplateVersion } from '@/types';
import { ArrowLeft, Eye, Loader2, Save, Send, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function categoryLabel(category: TemplateCategory): string {
  return category === 'marketing' ? 'Marketing' : 'Transactional';
}

function variablesToRecord(variables: TemplateVariable[] | null | undefined): Record<string, string> {
  const record: Record<string, string> = {};
  for (const variable of variables ?? []) {
    record[variable.key] = variable.default ?? '';
  }
  return record;
}

export default function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTemplate(id);
  const { publishVersion, preview, update, remove } = useTemplateMutations();

  const template = data?.template;
  const current = template?.current_version;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('transactional');
  const [isActive, setIsActive] = useState(true);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!template) return;

    setName(template.name);
    setDescription(template.description ?? '');
    setCategory(template.category);
    setIsActive(template.is_active);
  }, [template]);

  useEffect(() => {
    if (!current) return;

    setSelectedVersionId(current.id);
    setSubject(current.subject);
    setHtml(current.html_body ?? '');
    setVariableValues(variablesToRecord(template?.variables));
  }, [current, template?.variables]);

  const versions = useMemo(
    () => template?.versions ?? [],
    [template?.versions],
  );

  const viewingHistoricalVersion =
    Boolean(selectedVersionId && current?.id && selectedVersionId !== current.id);

  function loadVersion(version: TemplateVersion) {
    setSelectedVersionId(version.id);
    setSubject(version.subject);
    setHtml(version.html_body ?? '');
    setVariableValues(variablesToRecord(version.variables ?? template?.variables));
  }

  async function handleSaveSettings() {
    if (!id || !name.trim()) {
      toastError('Template name is required.');
      return;
    }

    try {
      await update.mutateAsync({
        id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
          category,
          is_active: isActive,
        },
      });
      toastSuccess('Template settings saved.');
    } catch (error) {
      toastError(error, 'Could not save template settings.');
    }
  }

  async function handleVisibilityChange(visibility: 'public' | 'private') {
    if (!id || !template || template.source_template_id) return;

    try {
      await update.mutateAsync({
        id,
        payload: { visibility },
      });
      toastSuccess(
        visibility === 'public'
          ? 'Template is now public in the marketplace.'
          : 'Template is now private.',
      );
    } catch (error) {
      toastError(error, 'Could not update visibility.');
    }
  }

  async function handlePublish() {
    if (!id || !subject.trim() || !html.trim()) {
      toastError('Subject and HTML body are required.');
      return;
    }

    try {
      const result = await publishVersion.mutateAsync({
        id,
        payload: {
          subject: subject.trim(),
          html,
          change_notes: changeNotes.trim() || undefined,
          variables: template?.variables ?? undefined,
        },
      });
      setChangeNotes('');
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not publish template version.');
    }
  }

  async function handlePreview() {
    if (!id) return;

    try {
      const result = await preview.mutateAsync({
        id,
        variables: variableValues,
        templateVersionId: selectedVersionId ?? undefined,
      });
      setPreviewData(result.preview);
      setPreviewOpen(true);
    } catch (error) {
      toastError(error, 'Could not render preview.');
    }
  }

  async function handleDeleteConfirm() {
    if (!id || !template) return;

    try {
      const result = await remove.mutateAsync(id);
      toastSuccess(result.message);
      navigate('/dashboard/templates');
    } catch (error) {
      toastError(error, 'Could not delete template.');
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !template) {
    return (
      <DashboardLayout>
        <div className="border border-border bg-card p-8 text-[13px] text-destructive">
          Template not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/dashboard/templates"
          className="text-muted-foreground hover:text-foreground"
          data-testid="template-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          eyebrow="Templates"
          title={template.name}
          description={`${categoryLabel(template.category)} template · ${(template.sends_count ?? 0).toLocaleString()} sends`}
          actions={
            <>
              <Link
                to={`/dashboard/send?template=${template.id}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
              >
                <Send className="h-3 w-3" />
                Send with template
              </Link>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <div className="border border-border bg-card p-5">
            <h3 className="text-base font-medium">Settings</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Template metadata used in your library and marketplace listing.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="label-mono">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </label>
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="label-mono">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                  placeholder="Optional summary for marketplace listings"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as TemplateCategory)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                >
                  <option value="transactional">Transactional</option>
                  <option value="marketing">Marketing</option>
                </select>
              </label>
              <label className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-[13px]">Active (available in Send email)</span>
              </label>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={update.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
              >
                {update.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Save settings
              </button>
            </div>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusBadge
                status={template.is_active ? 'active' : 'inactive'}
                label={categoryLabel(template.category)}
              />
              <span className="text-[13px] text-muted-foreground font-mono">
                v{current?.version ?? 1} · slug {template.slug}
              </span>
              {viewingHistoricalVersion ? (
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Viewing older version
                </span>
              ) : null}
              {template.source_template_id ? (
                <span className="rounded border border-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                  From marketplace
                </span>
              ) : (
                <select
                  value={template.visibility}
                  onChange={(event) =>
                    handleVisibilityChange(event.target.value as 'public' | 'private')
                  }
                  disabled={update.isPending}
                  className="rounded-md border border-border bg-background px-2 py-1 text-[12px]"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              )}
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="label-mono">Subject</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">HTML body</span>
                <textarea
                  value={html}
                  onChange={(event) => setHtml(event.target.value)}
                  rows={14}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[12px]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Change notes</span>
                <input
                  value={changeNotes}
                  onChange={(event) => setChangeNotes(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                  placeholder="Optional note for this version"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePreview}
                disabled={preview.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
              >
                {preview.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                Preview
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishVersion.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                {publishVersion.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Publish version
              </button>
              {viewingHistoricalVersion && current ? (
                <button
                  type="button"
                  onClick={() => loadVersion(current)}
                  className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
                >
                  Reset to current (v{current.version})
                </button>
              ) : null}
            </div>
          </div>

          {(template.variables ?? []).length > 0 ? (
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-medium">Preview variables</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Sample values used when previewing this template.
              </p>
              <div className="mt-4 space-y-3">
                {(template.variables ?? []).map((variable) => (
                  <label key={variable.key} className="grid grid-cols-[120px_1fr] items-center gap-3">
                    <span className="font-mono text-[12px] text-muted-foreground">{`{{${variable.key}}}`}</span>
                    <input
                      value={variableValues[variable.key] ?? ''}
                      onChange={(event) =>
                        setVariableValues((currentValues) => ({
                          ...currentValues,
                          [variable.key]: event.target.value,
                        }))
                      }
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px]"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-base font-medium">Version history</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Click a version to load it in the editor.
            </p>
          </div>
          {versions.length === 0 ? (
            <div className="p-4 text-[13px] text-muted-foreground">No versions yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {versions.map((version) => {
                const isCurrent = version.id === current?.id;
                const isSelected = version.id === selectedVersionId;

                return (
                  <li key={version.id}>
                    <button
                      type="button"
                      onClick={() => loadVersion(version)}
                      className={`w-full p-4 text-left transition-colors hover:bg-accent/40 ${
                        isSelected ? 'bg-accent/60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[12px]">
                          v{version.version}
                          {isCurrent ? ' · current' : ''}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 text-[13px]">{version.subject}</div>
                      {version.change_notes ? (
                        <div className="mt-1 text-[12px] text-muted-foreground">{version.change_notes}</div>
                      ) : null}
                      {version.created_by?.name ? (
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          by {version.created_by.name}
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      {previewOpen && previewData ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="text-base font-medium">Template preview</h3>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{previewData.subject}</p>
              </div>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-auto p-4">
              <iframe
                title="Template preview"
                className="h-[60vh] w-full border border-border bg-white"
                srcDoc={previewData.html ?? ''}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resourceName={template.name}
        resourceLabel="template"
        title="Delete template"
        description="Sends already logged will keep their history. Type the template name below to confirm removal."
        onConfirm={handleDeleteConfirm}
        isPending={remove.isPending}
      />
    </DashboardLayout>
  );
}
