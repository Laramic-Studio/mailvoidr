import { Loader2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TemplateVersion } from '@/types';

interface TemplateVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: TemplateVersion[];
  currentVersionId?: string | null;
  selectedVersionId?: string | null;
  changeNotes: string;
  viewingHistoricalVersion: boolean;
  isPending: boolean;
  onChangeNotesChange: (value: string) => void;
  onSelectVersion: (version: TemplateVersion) => void;
  onResetToCurrent: () => void;
  onPublish: () => void;
}

export function TemplateVersionsDialog({
  open,
  onOpenChange,
  versions,
  currentVersionId,
  selectedVersionId,
  changeNotes,
  viewingHistoricalVersion,
  isPending,
  onChangeNotesChange,
  onSelectVersion,
  onResetToCurrent,
  onPublish,
}: TemplateVersionsDialogProps) {
  const current = versions.find((version) => version.id === currentVersionId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>Load a version or publish a new snapshot.</DialogDescription>
        </DialogHeader>

        {versions.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No versions yet. Save the template to create the first version.
          </p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-auto">
            {versions.map((version) => {
              const isCurrent = version.id === currentVersionId;
              const isSelected = version.id === selectedVersionId;

              return (
                <li key={version.id}>
                  <button
                    type="button"
                    onClick={() => onSelectVersion(version)}
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
            onChange={(event) => onChangeNotesChange(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
            placeholder="Optional note for a new version snapshot"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {viewingHistoricalVersion && current ? (
            <button
              type="button"
              onClick={onResetToCurrent}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Reset to current (v{current.version})
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Publish new version
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
