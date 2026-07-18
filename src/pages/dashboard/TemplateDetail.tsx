import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import type { TemplateEmailEditorHandle } from '@/components/templates/TemplateEmailEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormSelect } from '@/components/form/FormSelect';
import { useTemplate, useTemplateMutations } from '@/hooks/useTemplates';
import {
  cleanTemplateVariables,
  isLegacyTemplateVersion,
  renderTemplatePreview,
  variablesToRecord,
} from '@/lib/templates/editor';
import { toastError, toastSuccess } from '@/lib/toast';
import type {
  TemplateCategory,
  TemplateDesign,
  TemplatePreview,
  TemplateVariable,
  TemplateVersion,
  TemplateVisibility,
} from '@/types';
import {
  ArrowLeft,
  Eye,
  History,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings2,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const TemplateEmailEditor = lazy(() => import('@/components/templates/TemplateEmailEditor'));

const CATEGORY_OPTIONS = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
] as const;

type DraftVariable = TemplateVariable & { clientId: string };

function categoryLabel(category: TemplateCategory): string {
  return category === 'marketing' ? 'Marketing' : 'Transactional';
}

function toDraftVariables(variables: TemplateVariable[] | null | undefined): DraftVariable[] {
  return (variables ?? []).map((variable) => ({
    ...variable,
    clientId: crypto.randomUUID(),
  }));
}

function emptyVariable(): DraftVariable {
  return { clientId: crypto.randomUUID(), key: '', label: '', default: '' };
}

export default function TemplateDetail() {
  const { id } = useParams();
  const editorRef = useRef<TemplateEmailEditorHandle>(null);
  const loadedVersionIdRef = useRef<string | null>(null);

  const { data, isLoading, isError } = useTemplate(id);
  const { saveCurrentVersion, publishVersion, update } = useTemplateMutations();

  const template = data?.template;
  const current = template?.current_version;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('transactional');
  const [isActive, setIsActive] = useState(true);
  const [variables, setVariables] = useState<DraftVariable[]>([]);
  const [editorVariables, setEditorVariables] = useState<TemplateVariable[]>([]);
  const [subject, setSubject] = useState('');
  const [subjectDraft, setSubjectDraft] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editorDesign, setEditorDesign] = useState<TemplateDesign | null | undefined>(undefined);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [previewPending, setPreviewPending] = useState(false);

  useEffect(() => {
    if (!template) return;

    setName(template.name);
    setDescription(template.description ?? '');
    setCategory(template.category);
    setIsActive(template.is_active);
    setVariables(toDraftVariables(template.variables));
    setEditorVariables(template.variables ?? []);
  }, [template]);

  const versions = useMemo(() => template?.versions ?? [], [template?.versions]);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) ?? current ?? null,
    [versions, selectedVersionId, current],
  );

  const viewingHistoricalVersion = Boolean(
    selectedVersionId && current?.id && selectedVersionId !== current.id,
  );

  const showLegacyBanner = isLegacyTemplateVersion(selectedVersion);

  useEffect(() => {
    if (!selectedVersion) return;

    // Only hydrate editor/subject when switching versions — never wipe unsaved canvas work.
    if (loadedVersionIdRef.current === selectedVersion.id) return;

    loadedVersionIdRef.current = selectedVersion.id;
    setSubject(selectedVersion.subject);
    setEditorDesign(selectedVersion.design_json ?? null);
  }, [selectedVersion]);

  useEffect(() => {
    if (!current?.id) return;
    setSelectedVersionId(current.id);
  }, [current?.id]);

  function loadVersion(version: TemplateVersion) {
    loadedVersionIdRef.current = null;
    setSelectedVersionId(version.id);
    setVersionsOpen(false);
  }

  async function exportEditorContent() {
    if (!editorRef.current?.isReady()) {
      throw new Error('Editor is still loading.');
    }

    return editorRef.current.exportDesign();
  }

  async function preserveEditorWork() {
    if (!editorRef.current?.isReady()) return null;

    const exported = await exportEditorContent();
    setEditorDesign(exported.design);
    return exported;
  }

  function cleanedVariablesFromDraft() {
    return cleanTemplateVariables(variables);
  }

  async function handleSave() {
    if (!id || !subject.trim()) {
      toastError('Subject is required.');
      return;
    }

    try {
      const exported = await exportEditorContent();
      const cleaned = cleanedVariablesFromDraft();
      const result = await saveCurrentVersion.mutateAsync({
        id,
        payload: {
          subject: subject.trim(),
          html: exported.html,
          design_json: exported.design,
          variables: cleaned,
        },
      });
      setEditorDesign(exported.design);
      setVariables(toDraftVariables(cleaned));
      setEditorVariables(cleaned);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not save template.');
    }
  }

  async function handlePublishNewVersion() {
    if (!id || !subject.trim()) {
      toastError('Subject is required.');
      return;
    }

    try {
      const exported = await exportEditorContent();
      const cleaned = cleanedVariablesFromDraft();
      const result = await publishVersion.mutateAsync({
        id,
        payload: {
          subject: subject.trim(),
          html: exported.html,
          design_json: exported.design,
          variables: cleaned,
          change_notes: changeNotes.trim() || undefined,
        },
      });
      setChangeNotes('');
      setEditorDesign(exported.design);
      setVariables(toDraftVariables(cleaned));
      setEditorVariables(cleaned);
      loadedVersionIdRef.current = null;
      setSelectedVersionId(result.template.current_version?.id ?? null);
      toastSuccess(result.message);
      setVersionsOpen(false);
    } catch (error) {
      toastError(error, 'Could not publish new version.');
    }
  }

  async function handlePreview() {
    if (!subject.trim()) {
      toastError('Subject is required.');
      return;
    }

    setPreviewPending(true);

    try {
      const previewVariables = variablesToRecord(editorVariables);

      if (viewingHistoricalVersion && selectedVersion) {
        const rendered = renderTemplatePreview(
          selectedVersion.subject,
          selectedVersion.html_body ?? null,
          previewVariables,
        );
        setPreviewData({
          subject: rendered.subject,
          html: rendered.html,
          text: selectedVersion.text_body ?? null,
          variables: previewVariables,
          template_version_id: selectedVersion.id,
        });
      } else {
        const exported = await exportEditorContent();
        const rendered = renderTemplatePreview(subject.trim(), exported.html, previewVariables);
        setPreviewData({
          subject: rendered.subject,
          html: rendered.html,
          text: null,
          variables: previewVariables,
          template_version_id: current?.id ?? '',
        });
      }

      setPreviewOpen(true);
    } catch (error) {
      toastError(error, 'Could not render preview.');
    } finally {
      setPreviewPending(false);
    }
  }

  async function handleSaveSettings() {
    if (!id || !name.trim()) {
      toastError('Template name is required.');
      return;
    }

    const cleaned = cleanedVariablesFromDraft();

    try {
      // Keep canvas work in local state so a details refetch can't wipe it.
      await preserveEditorWork();

      await update.mutateAsync({
        id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
          category,
          is_active: isActive,
          variables: cleaned,
        },
      });
      setVariables(toDraftVariables(cleaned));
      setEditorVariables(cleaned);
      toastSuccess('Template details saved.');
      setSettingsOpen(false);
    } catch (error) {
      toastError(error, 'Could not save template details.');
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

  function openSubjectEditor() {
    setSubjectDraft(subject);
    setSubjectOpen(true);
  }

  function saveSubject() {
    if (!subjectDraft.trim()) {
      toastError('Subject is required.');
      return;
    }

    setSubject(subjectDraft.trim());
    setSubjectOpen(false);
  }

  if (isLoading) {
    return (
      <DashboardLayout chrome="editor">
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !template) {
    return (
      <DashboardLayout chrome="editor">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p className="text-[13px] text-destructive">Template not found.</p>
          <Link
            to="/dashboard/templates"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to templates
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout chrome="editor">
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="z-20 shrink-0 border-b border-border bg-background">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
            <Link
              to="/dashboard/templates"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </Link>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="group min-w-0 flex-1">
              <h1 className="truncate text-[14px] font-medium tracking-tight">{template.name}</h1>
              <button
                type="button"
                onClick={openSubjectEditor}
                className="mt-0.5 flex max-w-full items-center gap-1.5 text-left text-[11px] text-muted-foreground hover:text-foreground"
              >
                <span className="truncate">
                  Subject: {subject || 'Untitled subject'}
                  {viewingHistoricalVersion ? ' · viewing older version' : ''}
                </span>
                <Pencil className="h-3 w-3 shrink-0 opacity-70 transition-opacity group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] hover:bg-accent sm:text-[13px]"
              >
                <Settings2 className="h-3 w-3" />
                <span className="hidden sm:inline">Details</span>
              </button>
              <button
                type="button"
                onClick={() => setVersionsOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] hover:bg-accent sm:text-[13px]"
              >
                <History className="h-3 w-3" />
                <span className="hidden sm:inline">Versions</span>
              </button>
              <button
                type="button"
                onClick={handlePreview}
                disabled={previewPending}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] hover:bg-accent sm:text-[13px]"
              >
                {previewPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                type="button"
                onClick={viewingHistoricalVersion ? handlePublishNewVersion : handleSave}
                disabled={saveCurrentVersion.isPending || publishVersion.isPending}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:text-[13px]"
              >
                {saveCurrentVersion.isPending || publishVersion.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {viewingHistoricalVersion ? 'Publish' : 'Save'}
              </button>
            </div>
          </div>

          {showLegacyBanner ? (
            <div className="border-t border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-800 dark:text-amber-300 sm:px-4">
              This version was created before the visual editor. Rebuild it here and save to make it editable again.
            </div>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 overflow-hidden bg-card">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center p-16 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            }
          >
            <TemplateEmailEditor
              key={selectedVersionId ?? template.id}
              ref={editorRef}
              design={editorDesign}
              variables={editorVariables}
            />
          </Suspense>
        </div>
      </div>

      <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit subject</DialogTitle>
            <DialogDescription>
              Use merge tags like {'{{name}}'} for dynamic values.
            </DialogDescription>
          </DialogHeader>
          <label className="block space-y-1.5">
            <span className="label-mono">Subject</span>
            <input
              value={subjectDraft}
              onChange={(event) => setSubjectDraft(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
              placeholder="Reset your password, {{name}}"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  saveSubject();
                }
              }}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubjectOpen(false)}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveSubject}
              className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              Update subject
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>Template details</DialogTitle>
            <DialogDescription>
              Name, visibility, and merge variables for this template.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <label className="block space-y-1.5">
              <span className="label-mono">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="label-mono">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                placeholder="Optional summary for marketplace listings"
              />
            </label>
            <FormSelect
              label="Category"
              value={category}
              onValueChange={(value) => setCategory(value as TemplateCategory)}
              options={CATEGORY_OPTIONS}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="rounded border-border"
              />
              <span className="text-[13px]">Active (available in Send email)</span>
            </label>
            {!template.source_template_id ? (
              <FormSelect
                label="Visibility"
                value={template.visibility}
                onValueChange={(value) =>
                  handleVisibilityChange(value as TemplateVisibility)
                }
                options={VISIBILITY_OPTIONS}
                disabled={update.isPending}
              />
            ) : null}

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">Variables</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Defaults are used when previewing merge tags like {'{{name}}'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVariables((current) => [...current, emptyVariable()])}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[12px] hover:bg-accent"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
              {variables.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">
                  No variables yet. Add one to insert dynamic content.
                </p>
              ) : (
                variables.map((variable) => (
                  <div key={variable.clientId} className="grid gap-2 rounded-md border border-border p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={variable.key}
                        onChange={(event) =>
                          setVariables((current) =>
                            current.map((item) =>
                              item.clientId === variable.clientId
                                ? { ...item, key: event.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="key"
                        className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-[12px]"
                      />
                      <input
                        value={variable.label ?? ''}
                        onChange={(event) =>
                          setVariables((current) =>
                            current.map((item) =>
                              item.clientId === variable.clientId
                                ? { ...item, label: event.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Label"
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px]"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={variable.default ?? ''}
                        onChange={(event) =>
                          setVariables((current) =>
                            current.map((item) =>
                              item.clientId === variable.clientId
                                ? { ...item, default: event.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Default value"
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setVariables((current) =>
                            current.filter((item) => item.clientId !== variable.clientId),
                          )
                        }
                        className="rounded-md border border-border px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex shrink-0 justify-end border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={update.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
            >
              {update.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save details
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>Load a version or publish a new snapshot.</DialogDescription>
          </DialogHeader>

          {versions.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No versions yet.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-auto">
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
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <label className="block space-y-1.5">
            <span className="label-mono">Version notes</span>
            <input
              value={changeNotes}
              onChange={(event) => setChangeNotes(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
              placeholder="Optional note for a new version snapshot"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {viewingHistoricalVersion && current ? (
              <button
                type="button"
                onClick={() => loadVersion(current)}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
              >
                Reset to current (v{current.version})
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePublishNewVersion}
              disabled={publishVersion.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
            >
              {publishVersion.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Publish new version
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
    </DashboardLayout>
  );
}
