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
import { FormSelect } from '@/components/form/FormSelect';
import { VIRTUAL_EMAIL_TTL_OPTIONS, type VirtualEmailTtl } from '@/constants/virtual-emails';
import { useVirtualEmailMutations } from '@/hooks/useVirtualEmails';
import { toastError, toastSuccess } from '@/lib/toast';

interface VirtualEmailCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function VirtualEmailCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: VirtualEmailCreateDialogProps) {
  const { create } = useVirtualEmailMutations();
  const [label, setLabel] = useState('');
  const [ttl, setTtl] = useState<VirtualEmailTtl>('24h');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setLabel('');
      setTtl('24h');
      setSubmitting(false);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await create.mutateAsync({
        label: label.trim() || undefined,
        ttl,
      });
      toastSuccess('Virtual email created.');
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      toastError(err, 'Could not create virtual email');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md gap-0 border-border bg-card p-0"
        data-testid="virtual-email-create-modal"
      >
        <DialogHeader className="border-b border-border p-4 text-left">
          <DialogTitle className="text-base font-medium">Create virtual email</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Spin up a disposable address for testing in this workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={submitting} className="space-y-4 p-4">
            <div>
              <label className="label-mono mb-1.5 block" htmlFor="virtual-email-label">
                Label (optional)
              </label>
              <input
                id="virtual-email-label"
                data-testid="virtual-email-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. QA · signup-flow"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <FormSelect
              data-testid="virtual-email-ttl"
              label="TTL"
              value={ttl}
              onValueChange={(value) => setTtl(value as VirtualEmailTtl)}
              options={VIRTUAL_EMAIL_TTL_OPTIONS}
            />
          </fieldset>

          <DialogFooter className="border-t border-border p-4 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
            >
              Cancel
            </button>
            <SubmitButton
              data-testid="virtual-email-create-submit"
              loading={submitting}
              loadingText="Creating…"
              className="w-auto"
            >
              Create
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
