import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TemplateSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function TemplateSubjectDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSave,
}: TemplateSubjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
            placeholder="Reset your password, {{name}}"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSave();
              }
            }}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Update subject
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
