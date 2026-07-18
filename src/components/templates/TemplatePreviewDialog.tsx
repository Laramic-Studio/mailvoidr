import type { TemplatePreview } from '@/types';

interface TemplatePreviewDialogProps {
  open: boolean;
  preview: TemplatePreview | null;
  onClose: () => void;
}

export function TemplatePreviewDialog({ open, preview, onClose }: TemplatePreviewDialogProps) {
  if (!open || !preview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-medium">Template preview</h3>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{preview.subject}</p>
          </div>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="overflow-auto p-4">
          <iframe
            title="Template preview"
            className="h-[60vh] w-full border border-border bg-white"
            srcDoc={preview.html ?? ''}
          />
        </div>
      </div>
    </div>
  );
}
