import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CodeBlock } from '@/components/CodeBlock';
import { SubmitButton } from '@/components/SubmitButton';
import type { ApiKeyEnvironment } from '@/constants/api-keys';
import { useApiKeyMutations } from '@/hooks/useApiKeys';
import { toastError, toastSuccess } from '@/lib/toast';

interface ApiKeyRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  environment: ApiKeyEnvironment;
  /** Full key when just created or rotated — skips password step. */
  plainKey?: string | null;
  /** Existing key — user must enter password to reveal. */
  apiKeyId?: string | null;
  title?: string;
}

export function ApiKeyRevealDialog({
  open,
  onOpenChange,
  name,
  environment,
  plainKey: plainKeyProp,
  apiKeyId,
  title = 'View API key',
}: ApiKeyRevealDialogProps) {
  const { reveal } = useApiKeyMutations(environment);
  const [password, setPassword] = useState('');
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const plainKey = plainKeyProp ?? resolvedKey;
  const needsPassword = !plainKeyProp && Boolean(apiKeyId);
  const envVar = environment === 'test' ? 'MAILVOIDR_TEST_API_KEY' : 'MAILVOIDR_API_KEY';
  const docsHref = environment === 'test' ? '/docs/testing-overview' : '/docs/quickstart';

  useEffect(() => {
    if (!open) {
      setPassword('');
      setResolvedKey(null);
      setVisible(false);
      return;
    }

    if (plainKeyProp) {
      setVisible(true);
    }
  }, [open, plainKeyProp]);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!apiKeyId) return;

    try {
      const result = await reveal.mutateAsync({ id: apiKeyId, password });
      setResolvedKey(result.plain_key);
      setVisible(true);
      setPassword('');
    } catch (error) {
      toastError(error, 'Could not reveal API key.');
    }
  }

  async function copyKey() {
    if (!plainKey) return;
    await navigator.clipboard.writeText(plainKey);
    toastSuccess('API key copied.');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="apikey-reveal-modal"
        className="max-w-lg border-border sm:rounded-none"
      >
        {needsPassword && !plainKey ? (
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-medium">{title}</DialogTitle>
              <DialogDescription className="text-[13px]">
                Enter your account password to view{' '}
                <span className="font-medium text-foreground">{name}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <label className="label-mono mb-1.5 block">Password</label>
              <input
                type="password"
                data-testid="apikey-reveal-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
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
                data-testid="apikey-reveal-submit"
                loading={reveal.isPending}
                disabled={!password}
                className="w-auto rounded-md px-3 py-1.5 text-[13px]"
              >
                View key
              </SubmitButton>
            </DialogFooter>
          </form>
        ) : (
          <div className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-medium">{title}</DialogTitle>
              <DialogDescription className="text-[13px]">
                {plainKeyProp
                  ? 'Your key is ready. You can view it again anytime with your account password.'
                  : 'Copy this key into your app or CI secrets.'}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              
              {plainKey ? (
                <div className="space-y-4">
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="label-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                        {name} · {environment === 'test' ? 'Test' : 'Live'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setVisible((value) => !value)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                          title={visible ? 'Hide key' : 'Show key'}
                        >
                          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={copyKey}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Copy key"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <code className="block break-all font-mono text-[12px] leading-relaxed">
                      {visible
                        ? plainKey
                        : `${plainKey.slice(0, 12)}${'•'.repeat(24)}`}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <p className="label-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      Quick start
                    </p>
                    <CodeBlock
                      language="bash"
                      code={`export ${envVar}="${plainKey}"`}
                    />
                    <p className="text-[12px] text-muted-foreground">
                      Integration examples are in the{' '}
                      <Link to={docsHref} className="font-medium text-foreground hover:underline">
                        docs
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading key…
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
    
        )}
      </DialogContent>
    </Dialog>
  );
}
