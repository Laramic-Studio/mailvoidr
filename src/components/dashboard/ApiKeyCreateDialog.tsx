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
import { API_KEY_SCOPES, DEFAULT_API_KEY_SCOPES, type ApiKeyScope } from '@/constants/api-keys';
import { useApiKeyMutations } from '@/hooks/useApiKeys';
import { toastError } from '@/lib/toast';

interface ApiKeyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableScopes?: string[];
  onCreated: (result: { plainKey: string; name: string }) => void;
}

export function ApiKeyCreateDialog({
  open,
  onOpenChange,
  availableScopes = [...API_KEY_SCOPES],
  onCreated,
}: ApiKeyCreateDialogProps) {
  const { create } = useApiKeyMutations();
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<ApiKeyScope[]>([...DEFAULT_API_KEY_SCOPES]);

  useEffect(() => {
    if (!open) {
      setName('');
      setScopes([...DEFAULT_API_KEY_SCOPES]);
    }
  }, [open]);

  function toggleScope(scope: ApiKeyScope) {
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const result = await create.mutateAsync({
        name: name.trim(),
        scopes,
      });
      onOpenChange(false);
      onCreated({ plainKey: result.plain_key, name: result.api_key.name });
    } catch (error) {
      toastError(error, 'Could not create API key.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="apikey-create-modal" className="max-w-md border-border sm:rounded-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-medium">Create API key</DialogTitle>
            <DialogDescription className="text-[13px]">
              Choose a name and scopes. You will see the full key only once.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="label-mono mb-1.5 block">Name</label>
              <input
                data-testid="apikey-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production · web-app"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="label-mono mb-2 block">Scopes</label>
              <div className="space-y-1.5">
                {availableScopes.map((scope) => (
                  <label key={scope} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={scopes.includes(scope as ApiKeyScope)}
                      onChange={() => toggleScope(scope as ApiKeyScope)}
                      className="accent-primary"
                    />
                    <span className="font-mono">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
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
              data-testid="apikey-create-submit"
              loading={create.isPending}
              disabled={!name.trim() || scopes.length === 0}
              className="w-auto rounded-md px-3 py-1.5 text-[13px]"
            >
              Create key
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
