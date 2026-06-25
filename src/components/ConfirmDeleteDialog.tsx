import { type FormEvent, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubmitButton } from '@/components/SubmitButton';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName: string;
  resourceLabel?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  testId?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  resourceName,
  resourceLabel = 'resource',
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  isPending = false,
  testId = 'confirm-delete-dialog',
}: ConfirmDeleteDialogProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const matches = confirmInput === resourceName;

  useEffect(() => {
    if (!open) {
      setConfirmInput('');
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!matches || isPending) return;
    await onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid={testId} className="max-w-md border-border sm:rounded-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-destructive">
              {title ?? `Delete ${resourceLabel}`}
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              {description ?? (
                <>
                  This action cannot be undone. Type{' '}
                  <span className="font-mono text-foreground">{resourceName}</span> below to confirm.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label htmlFor="confirm-delete-input" className="label-mono mb-1.5 block">
              {resourceLabel.charAt(0).toUpperCase() + resourceLabel.slice(1)} name
            </label>
            <input
              id="confirm-delete-input"
              data-testid="confirm-delete-input"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={resourceName}
              autoComplete="off"
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
            />
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Cancel
            </button>
            <SubmitButton
              type="submit"
              loading={isPending}
              disabled={!matches}
              data-testid="confirm-delete-submit"
              className="w-auto rounded-md bg-destructive px-3 py-1.5 text-[13px] font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {confirmLabel}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
