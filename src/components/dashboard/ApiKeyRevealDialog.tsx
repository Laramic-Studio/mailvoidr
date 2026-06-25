import { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toastSuccess } from '@/lib/toast';

interface ApiKeyRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  plainKey: string;
  title?: string;
}

export function ApiKeyRevealDialog({
  open,
  onOpenChange,
  name,
  plainKey,
  title = 'Copy your API key',
}: ApiKeyRevealDialogProps) {
  const [revealed, setRevealed] = useState(true);

  async function copyKey() {
    await navigator.clipboard.writeText(plainKey);
    toastSuccess('API key copied.');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setRevealed(true);
        onOpenChange(next);
      }}
    >
      <DialogContent data-testid="apikey-reveal-modal" className="max-w-md border-border sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          <DialogDescription className="text-[13px]">
            Store <span className="font-medium text-foreground">{name}</span> securely. This key will
            not be shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all font-mono text-[12px]">
              {revealed ? plainKey : `${plainKey.slice(0, 16)}••••••••••••••••••••`}
            </code>
            <button
              type="button"
              onClick={() => setRevealed((value) => !value)}
              className="text-muted-foreground hover:text-foreground"
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={copyKey}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
