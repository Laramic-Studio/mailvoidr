import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { TemplateDetailsDialog } from '@/components/templates/TemplateDetailsDialog';
import { TemplateEditorHeader } from '@/components/templates/TemplateEditorHeader';
import { TemplatePreviewDialog } from '@/components/templates/TemplatePreviewDialog';
import { TemplateSubjectDialog } from '@/components/templates/TemplateSubjectDialog';
import { TemplateVersionsDialog } from '@/components/templates/TemplateVersionsDialog';
import { useTemplateEditor } from '@/hooks/useTemplateEditor';

const TemplateEmailEditor = lazy(() => import('@/components/templates/TemplateEmailEditor'));

export default function TemplateDetail() {
  const { id } = useParams();
  const editor = useTemplateEditor(id);

  if (editor.isLoading) {
    return (
      <DashboardLayout chrome="editor">
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (editor.isError || !editor.template) {
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

  const { template } = editor;

  return (
    <DashboardLayout chrome="editor">
      <div className="flex min-h-0 flex-1 flex-col">
        <TemplateEditorHeader
          templateName={template.name}
          subject={editor.subject}
          viewingHistoricalVersion={editor.viewingHistoricalVersion}
          showLegacyBanner={editor.showLegacyBanner}
          previewPending={editor.previewPending}
          savePending={editor.savePending}
          primaryActionLabel={editor.viewingHistoricalVersion ? 'Publish' : 'Save'}
          onEditSubject={editor.openSubjectEditor}
          onOpenDetails={() => editor.setSettingsOpen(true)}
          onOpenVersions={() => editor.setVersionsOpen(true)}
          onPreview={editor.handlePreview}
          onPrimaryAction={
            editor.viewingHistoricalVersion
              ? editor.handlePublishNewVersion
              : editor.handleSave
          }
        />

        <div className="min-h-0 flex-1 overflow-hidden bg-card">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center p-16 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            }
          >
            <TemplateEmailEditor
              key={editor.selectedVersionId ?? template.id}
              ref={editor.editorRef}
              design={editor.editorDesign}
              variables={editor.editorVariables}
            />
          </Suspense>
        </div>
      </div>

      <TemplateSubjectDialog
        open={editor.subjectOpen}
        onOpenChange={editor.setSubjectOpen}
        value={editor.subjectDraft}
        onChange={editor.setSubjectDraft}
        onSave={editor.saveSubject}
      />

      <TemplateDetailsDialog
        open={editor.settingsOpen}
        onOpenChange={editor.setSettingsOpen}
        name={editor.name}
        description={editor.description}
        category={editor.category}
        isActive={editor.isActive}
        visibility={template.visibility}
        showVisibility={!template.source_template_id}
        variables={editor.variables}
        isPending={editor.detailsPending}
        onNameChange={editor.setName}
        onDescriptionChange={editor.setDescription}
        onCategoryChange={editor.setCategory}
        onIsActiveChange={editor.setIsActive}
        onVisibilityChange={editor.handleVisibilityChange}
        onVariablesChange={editor.setVariables}
        onSave={editor.handleSaveSettings}
      />

      <TemplateVersionsDialog
        open={editor.versionsOpen}
        onOpenChange={editor.setVersionsOpen}
        versions={editor.versions}
        currentVersionId={editor.current?.id}
        selectedVersionId={editor.selectedVersionId}
        changeNotes={editor.changeNotes}
        viewingHistoricalVersion={editor.viewingHistoricalVersion}
        isPending={editor.savePending}
        onChangeNotesChange={editor.setChangeNotes}
        onSelectVersion={editor.loadVersion}
        onResetToCurrent={editor.resetToCurrentVersion}
        onPublish={editor.handlePublishNewVersion}
      />

      <TemplatePreviewDialog
        open={editor.previewOpen}
        preview={editor.previewData}
        onClose={() => editor.setPreviewOpen(false)}
      />
    </DashboardLayout>
  );
}
