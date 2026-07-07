import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { ApiKeyCreateDialog } from '@/components/dashboard/ApiKeyCreateDialog';
import { ApiKeyRevealDialog } from '@/components/dashboard/ApiKeyRevealDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiKeyMutations, useApiKeys } from '@/hooks/useApiKeys';
import type { ApiKeyEnvironment } from '@/constants/api-keys';
import { toastError, toastSuccess } from '@/lib/toast';
import type { ApiKey } from '@/types';
import { Plus, KeyRound, RotateCw, Ban, Loader2, FlaskConical, Zap, Eye } from 'lucide-react';

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString();
}

function maskPrefix(prefix: string): string {
  return `${prefix.slice(0, 8)}••••••••`;
}

type KeyDialogMode = 'created' | 'rotated' | 'view';

interface KeyDialogState {
  name: string;
  environment: ApiKeyEnvironment;
  mode: KeyDialogMode;
  plainKey?: string;
  apiKeyId?: string;
}

const PANEL_COPY: Record<
  ApiKeyEnvironment,
  { summary?: string; empty: string; emptyHint?: string }
> = {
  live: {
    empty: 'No live keys yet. Enable live sending, then create your first production key.',
    emptyHint: 'Need staging first? Switch to the Test tab — no live sending required.',
  },
  test: {
    empty: 'No test keys yet. Create one for CI, staging, or local automation.',
  },
};

function revealTitle(mode: KeyDialogMode): string {
  if (mode === 'created') return 'API key created';
  if (mode === 'rotated') return 'API key rotated';
  return 'View API key';
}

interface ApiKeysPanelProps {
  environment: ApiKeyEnvironment;
  showCreate: boolean;
  onShowCreateChange: (open: boolean) => void;
}

function ApiKeysPanel({ environment, showCreate, onShowCreateChange }: ApiKeysPanelProps) {
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [keyToRotate, setKeyToRotate] = useState<ApiKey | null>(null);
  const [keyDialog, setKeyDialog] = useState<KeyDialogState | null>(null);

  const { data, isLoading, isError } = useApiKeys(environment);
  const { rotate, revoke } = useApiKeyMutations(environment);

  const apiKeys = data?.data ?? [];
  const availableScopes = data?.meta.available_scopes?.[environment] ?? [];
  const copy = PANEL_COPY[environment];

  const activeCount = apiKeys.filter((key) => !key.is_revoked).length;
  const revokedCount = apiKeys.filter((key) => key.is_revoked).length;
  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests_count, 0);

  async function handleRotateConfirm() {
    if (!keyToRotate) return;

    try {
      const result = await rotate.mutateAsync(keyToRotate.id);
      setKeyToRotate(null);
      setKeyDialog({
        name: result.api_key.name,
        plainKey: result.plain_key,
        environment: result.api_key.environment,
        mode: 'rotated',
      });
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

  function openViewDialog(key: ApiKey) {
    setKeyDialog({
      name: key.name,
      environment: key.environment,
      apiKeyId: key.id,
      mode: 'view',
    });
  }

  return (
    <>
      <p className="mb-4 text-[13px] text-muted-foreground">{copy.summary}</p>

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
            <p className="mt-3 text-sm text-muted-foreground">{copy.empty}</p>
            {copy.emptyHint ? (
              <p className="mt-2 text-[12px] text-muted-foreground">{copy.emptyHint}</p>
            ) : null}
            {environment === 'live' && data?.meta.can_create_live === false ? (
              <Link
                to="/dashboard/smtp"
                className="mt-4 inline-block text-[13px] font-medium text-primary hover:underline"
              >
                Enable live sending →
              </Link>
            ) : null}
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
                  <td className="p-3 font-mono text-[12px] text-muted-foreground">
                    {maskPrefix(key.key_prefix)}
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
                          onClick={() => openViewDialog(key)}
                          disabled={!key.can_reveal}
                          title={
                            key.can_reveal
                              ? 'View key'
                              : 'Rotate this key to enable viewing'
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setKeyToRotate(key)}
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
        onOpenChange={onShowCreateChange}
        environment={environment}
        availableScopes={availableScopes}
        onCreated={({ plainKey, name, environment: keyEnv }) =>
          setKeyDialog({
            plainKey,
            name,
            environment: keyEnv,
            mode: 'created',
          })
        }
      />

      <ApiKeyRevealDialog
        open={Boolean(keyDialog)}
        onOpenChange={(open) => {
          if (!open) setKeyDialog(null);
        }}
        name={keyDialog?.name ?? ''}
        environment={keyDialog?.environment ?? environment}
        plainKey={keyDialog?.plainKey}
        apiKeyId={keyDialog?.plainKey ? undefined : keyDialog?.apiKeyId}
        title={keyDialog ? revealTitle(keyDialog.mode) : 'View API key'}
      />

      <ConfirmDeleteDialog
        open={Boolean(keyToRotate)}
        onOpenChange={(open) => {
          if (!open) setKeyToRotate(null);
        }}
        resourceName={keyToRotate?.name ?? ''}
        resourceLabel="API key"
        title="Rotate API key"
        description={
          keyToRotate
            ? `The current token for "${keyToRotate.name}" will stop working immediately. Type the key name below to confirm.`
            : undefined
        }
        confirmLabel="Rotate key"
        onConfirm={handleRotateConfirm}
        isPending={rotate.isPending}
        testId="apikey-rotate-dialog"
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
    </>
  );
}

function tabCount(keys: ApiKey[] | undefined): number {
  return keys?.filter((key) => !key.is_revoked).length ?? 0;
}

export default function APIKeys() {
  const [tab, setTab] = useState<ApiKeyEnvironment>('live');
  const [showCreate, setShowCreate] = useState(false);

  const liveQuery = useApiKeys('live');
  const testQuery = useApiKeys('test');
  const activeMeta = tab === 'live' ? liveQuery.data?.meta : testQuery.data?.meta;
  const canCreate =
    tab === 'test'
      ? (activeMeta?.can_create_test ?? true)
      : (activeMeta?.can_create_live ?? false);

  const liveActive = tabCount(liveQuery.data?.data);
  const testActive = tabCount(testQuery.data?.data);

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="API keys"
        description="Scoped tokens for production and staging. View anytime with your account password."
        actions={
          <button
            type="button"
            data-testid={`apikey-create-${tab}`}
            onClick={() => setShowCreate(true)}
            disabled={!canCreate}
            title={
              canCreate
                ? undefined
                : tab === 'live'
                  ? 'Enable live sending first'
                  : 'Select a workspace first'
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Create {tab} key
          </button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as ApiKeyEnvironment);
          setShowCreate(false);
        }}
        className="space-y-6"
      >
        <TabsList className="h-10 w-auto shrink-0 grid grid-cols-2">
          <TabsTrigger value="live" data-testid="apikey-tab-live" className="gap-2 px-4">
            <Zap className="h-3.5 w-3.5" />
            Live
          </TabsTrigger>
          <TabsTrigger value="test" data-testid="apikey-tab-test" className="gap-2 px-4">
            <FlaskConical className="h-3.5 w-3.5" />
            Test
          </TabsTrigger>
        </TabsList>

        <ApiKeysPanel
          key={tab}
          environment={tab}
          showCreate={showCreate}
          onShowCreateChange={setShowCreate}
        />
      </Tabs>
    </DashboardLayout>
  );
}
