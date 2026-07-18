import { useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateEmailEditorHandle } from '@/components/templates/TemplateEmailEditor';
import { useTemplate, useTemplateMutations } from '@/hooks/useTemplates';
import {
  toDraftVariables,
  type DraftVariable,
} from '@/lib/templates/draft-variables';
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

export function useTemplateEditor(templateId: string | undefined) {
  const editorRef = useRef<TemplateEmailEditorHandle>(null);
  const loadedVersionIdRef = useRef<string | null>(null);

  const { data, isLoading, isError } = useTemplate(templateId);
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

  useEffect(() => {
    if (!template || template.current_version) return;
    setSubject((currentSubject) => (currentSubject.trim() ? currentSubject : template.name));
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

  function cleanedVariablesFromDraft() {
    return cleanTemplateVariables(variables);
  }

  async function persistCanvas(cleaned: TemplateVariable[]) {
    if (!templateId) throw new Error('Missing template id.');

    const exported = await exportEditorContent();
    const result = await saveCurrentVersion.mutateAsync({
      id: templateId,
      payload: {
        subject: subject.trim() || name.trim() || 'Untitled',
        html: exported.html,
        design_json: exported.design,
        variables: cleaned,
      },
    });

    setEditorDesign(exported.design);
    setVariables(toDraftVariables(cleaned));
    setEditorVariables(cleaned);
    loadedVersionIdRef.current = null;
    setSelectedVersionId(result.template.current_version?.id ?? null);

    return result;
  }

  async function handleSave() {
    if (!subject.trim()) {
      toastError('Subject is required. Click the subject line to set it.');
      return;
    }

    try {
      const result = await persistCanvas(cleanedVariablesFromDraft());
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not save template.');
    }
  }

  async function handlePublishNewVersion() {
    if (!templateId || !subject.trim()) {
      toastError('Subject is required.');
      return;
    }

    if (!current) {
      await handleSave();
      setVersionsOpen(false);
      return;
    }

    try {
      const exported = await exportEditorContent();
      const cleaned = cleanedVariablesFromDraft();
      const result = await publishVersion.mutateAsync({
        id: templateId,
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
    if (!templateId || !name.trim()) {
      toastError('Template name is required.');
      return;
    }

    const cleaned = cleanedVariablesFromDraft();

    try {
      await update.mutateAsync({
        id: templateId,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
          category,
          is_active: isActive,
          variables: cleaned,
        },
      });

      if (editorRef.current?.isReady()) {
        await persistCanvas(cleaned);
      } else {
        setVariables(toDraftVariables(cleaned));
        setEditorVariables(cleaned);
      }

      toastSuccess('Template details saved.');
      setSettingsOpen(false);
    } catch (error) {
      toastError(error, 'Could not save template details.');
    }
  }

  async function handleVisibilityChange(visibility: 'public' | 'private') {
    if (!templateId || !template || template.source_template_id) return;

    try {
      await update.mutateAsync({
        id: templateId,
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
    setSubjectDraft(subject || name);
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

  return {
    editorRef,
    template,
    current,
    isLoading,
    isError,
    name,
    setName,
    description,
    setDescription,
    category,
    setCategory,
    isActive,
    setIsActive,
    variables,
    setVariables,
    editorVariables,
    subject,
    subjectDraft,
    setSubjectDraft,
    changeNotes,
    setChangeNotes,
    selectedVersionId,
    editorDesign,
    previewData,
    previewOpen,
    setPreviewOpen,
    settingsOpen,
    setSettingsOpen,
    versionsOpen,
    setVersionsOpen,
    subjectOpen,
    setSubjectOpen,
    previewPending,
    versions,
    viewingHistoricalVersion,
    showLegacyBanner,
    savePending: saveCurrentVersion.isPending || publishVersion.isPending,
    detailsPending: update.isPending || saveCurrentVersion.isPending,
    loadVersion,
    handleSave,
    handlePublishNewVersion,
    handlePreview,
    handleSaveSettings,
    handleVisibilityChange,
    openSubjectEditor,
    saveSubject,
    resetToCurrentVersion: () => {
      if (current) loadVersion(current);
    },
  };
}
