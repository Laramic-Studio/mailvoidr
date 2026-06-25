import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { ApiKeyCreateDialog } from '@/components/dashboard/ApiKeyCreateDialog';
import { ApiKeyRevealDialog } from '@/components/dashboard/ApiKeyRevealDialog';
import { useApiKeyMutations, useApiKeys } from '@/hooks/useApiKeys';
import { toastError, toastSuccess } from '@/lib/toast';
import type { ApiKey } from '@/types';
import { Plus, Copy, Eye, EyeOff, KeyRound, RotateCw, Ban, Loader2 } from 'lucide-react';

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString();
}

function maskPrefix(prefix: string, revealed: boolean): string {
  return revealed ? prefix : `${prefix.slice(0, 8)}••••••••`;
}

export default function APIKeys() {
  const [showCreate, setShowCreate] = useState(false);
  const [revealedPrefixes, setRevealedPrefixes] = useState<Record<string, boolean>>({});
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revealedKey, setRevealedKey] = useState<{ name: string; plainKey: string } | null>(null);

  const { data, isLoading, isError } = useApiKeys();
  const { rotate, revoke } = useApiKeyMutations();

  const apiKeys = data?.data ?? [];
  const availableScopes = data?.meta.available_scopes ?? [];

  const activeCount = apiKeys.filter((key) => !key.is_revoked).length;
  const revokedCount = apiKeys.filter((key) => key.is_revoked).length;
  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests_count, 0);

  async function handleRotate(key: ApiKey) {
    if (!window.confirm(`Rotate "${key.name}"? The current key will stop working immediately.`)) {
      return;
    }

    try {
      const result = await rotate.mutateAsync(key.id);
      setRevealedKey({ name: result.api_key.name, plainKey: result.plain_key });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not rotate API key.');
    }
  }

  async function handleRevokeConfirm() {
    if (!keyToRevoke) return;

    try {
      const result = await revoke.mutateAsync(keyToRevoke.id);
      setKeyToRevoke(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not revoke API key.');
    }
  }

  async function copyPrefix(prefix: string) {
    await navigator.clipboard.writeText(prefix);
    toastSuccess('Key prefix copied.');
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="API keys"
        description="Scoped tokens for the Mailvoidr API. Rotate or revoke at any time."
        actions={
          <button
            type="button"
            data-testid="apikey-create"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" /> Create API key
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3">
        {[
          ['Active keys', activeCount],
          ['Revoked', revokedCount],
          ['Total requests', totalRequests.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-5">
            <div className="label-mono">{label}</div>
            <div className="mt-2 text-xl font-medium">{value}</div>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="p-8 text-sm text-destructive">Could not load API keys.</p>
        ) : apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No API keys yet. Enable live sending, then create your first key.
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono p-3 text-left">Name</th>
                <th className="label-mono p-3 text-left">Token</th>
                <th className="label-mono p-3 text-left">Scopes</th>
                <th className="label-mono p-3 text-left">Created</th>
                <th className="label-mono p-3 text-left">Last used</th>
                <th className="label-mono p-3 text-left">Requests</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr
                  key={key.id}
                  data-testid={`apikey-row-${key.id}`}
                  className={`border-b border-border last:border-0 hover:bg-accent/30 ${
                    key.is_revoked ? 'opacity-50' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="inline-flex items-center gap-2">
                      <KeyRound className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{key.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[12px]">
                      <span>{maskPrefix(key.key_prefix, revealedPrefixes[key.id] ?? false)}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedPrefixes((current) => ({
                            ...current,
                            [key.id]: !current[key.id],
                          }))
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {revealedPrefixes[key.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyPrefix(key.key_prefix)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="border border-border px-1.5 py-0.5 font-mono text-[10.5px]"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {formatDate(key.last_used_at)}
                  </td>
                  <td className="p-3 font-mono">{key.requests_count.toLocaleString()}</td>
                  <td className="p-3">
                    {key.is_revoked ? (
                      <StatusBadge status="revoked" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRotate(key)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
                          title="Rotate"
                        >
                          <RotateCw className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setKeyToRevoke(key)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
                          title="Revoke"
                        >
                          <Ban className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ApiKeyCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        availableScopes={availableScopes}
        onCreated={({ plainKey, name }) => setRevealedKey({ plainKey, name })}
      />

      <ApiKeyRevealDialog
        open={Boolean(revealedKey)}
        onOpenChange={(open) => {
          if (!open) setRevealedKey(null);
        }}
        name={revealedKey?.name ?? ''}
        plainKey={revealedKey?.plainKey ?? ''}
      />

      <ConfirmDeleteDialog
        open={Boolean(keyToRevoke)}
        onOpenChange={(open) => {
          if (!open) setKeyToRevoke(null);
        }}
        resourceName={keyToRevoke?.name ?? ''}
        resourceLabel="API key"
        title="Revoke API key"
        description={
          keyToRevoke
            ? `Requests using "${keyToRevoke.name}" will fail immediately. Type the key name below to confirm.`
            : undefined
        }
        confirmLabel="Revoke key"
        onConfirm={handleRevokeConfirm}
        isPending={revoke.isPending}
        testId="apikey-revoke-dialog"
      />
    </DashboardLayout>
  );
}
