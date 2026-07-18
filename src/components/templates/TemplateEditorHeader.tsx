import { ArrowLeft, Eye, History, Loader2, Pencil, Save, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TemplateEditorHeaderProps {
  templateName: string;
  subject: string;
  viewingHistoricalVersion: boolean;
  showLegacyBanner: boolean;
  previewPending: boolean;
  savePending: boolean;
  primaryActionLabel: string;
  onEditSubject: () => void;
  onOpenDetails: () => void;
  onOpenVersions: () => void;
  onPreview: () => void;
  onPrimaryAction: () => void;
}

export function TemplateEditorHeader({
  templateName,
  subject,
  viewingHistoricalVersion,
  showLegacyBanner,
  previewPending,
  savePending,
  primaryActionLabel,
  onEditSubject,
  onOpenDetails,
  onOpenVersions,
  onPreview,
  onPrimaryAction,
}: TemplateEditorHeaderProps) {
  return (
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
          <h1 className="truncate text-[14px] font-medium tracking-tight">{templateName}</h1>
          <button
            type="button"
            onClick={onEditSubject}
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
            onClick={onOpenDetails}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] hover:bg-accent sm:text-[13px]"
          >
            <Settings2 className="h-3 w-3" />
            <span className="hidden sm:inline">Details</span>
          </button>
          <button
            type="button"
            onClick={onOpenVersions}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] hover:bg-accent sm:text-[13px]"
          >
            <History className="h-3 w-3" />
            <span className="hidden sm:inline">Versions</span>
          </button>
          <button
            type="button"
            onClick={onPreview}
            disabled={previewPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] hover:bg-accent sm:text-[13px]"
          >
            {previewPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={savePending}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:text-[13px]"
          >
            {savePending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {primaryActionLabel}
          </button>
        </div>
      </div>

      {showLegacyBanner ? (
        <div className="border-t border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-800 dark:text-amber-300 sm:px-4">
          This version was created before the visual editor. Rebuild it here and save to make it editable again.
        </div>
      ) : null}
    </header>
  );
}
