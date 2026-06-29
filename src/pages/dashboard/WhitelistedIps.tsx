import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useSmtpCredentials } from '@/hooks/useSmtpCredentials';
import { useWhitelistedIpMutations, useWhitelistedIps } from '@/hooks/useWhitelistedIps';
import { toastError, toastSuccess } from '@/lib/toast';
import type { WhitelistedSendingIp } from '@/types';
import { ArrowRight, Globe, Loader2, Plus, Shield, Trash2 } from 'lucide-react';

export default function WhitelistedIps() {
  const [ipAddress, setIpAddress] = useState('');
  const [label, setLabel] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<WhitelistedSendingIp | null>(null);

  const { data: smtpData } = useSmtpCredentials();
  const { data, isLoading, isError } = useWhitelistedIps();
  const { create, remove } = useWhitelistedIpMutations();

  const liveSendingEnabled = smtpData?.live_sending_enabled ?? false;
  const entries = data?.data ?? [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const ip = ipAddress.trim();
    if (!ip) return;

    try {
      const result = await create.mutateAsync({
        ip_address: ip,
        label: label.trim() || null,
      });
      setIpAddress('');
      setLabel('');
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not whitelist IP address.');
    }
  }

  async function handleDeleteConfirm() {
    if (!entryToDelete) return;

    try {
      const result = await remove.mutateAsync(entryToDelete.id);
      setEntryToDelete(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not remove IP address.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="IP whitelist"
        description="Send from any From address without domain verification when your app connects from a whitelisted server IP."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1 text-[12.5px] text-muted-foreground">
              <p>
                Whitelist your app server&apos;s public IP, then use your live SMTP credentials with any{' '}
                <span className="text-foreground">From</span> address and name — no DNS setup required.
              </p>
              <p>
                Recipients see your address{' '}
                <span className="font-mono text-foreground">via mailvoidr.com</span>. For branded DKIM/SPF,
                verify a domain instead.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/smtp"
            className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-foreground hover:underline"
          >
            SMTP credentials
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!liveSendingEnabled ? (
          <div className="border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Enable live sending on the{' '}
              <Link to="/dashboard/smtp" className="text-foreground underline">
                SMTP page
              </Link>{' '}
              before whitelisting IPs.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="space-y-2">
              <label htmlFor="ip_address" className="label-mono">
                Server IP address
              </label>
              <input
                id="ip_address"
                data-testid="ip-whitelist-input"
                value={ipAddress}
                onChange={(event) => setIpAddress(event.target.value)}
                placeholder="203.0.113.10"
                required
                className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ip_label" className="label-mono">
                Label (optional)
              </label>
              <input
                id="ip_label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Production app server"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              data-testid="ip-whitelist-add"
              disabled={create.isPending}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add IP
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Could not load whitelisted IPs.</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No whitelisted IPs yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                data-testid={`ip-whitelist-row-${entry.id}`}
                className="flex items-center justify-between gap-4 border border-border bg-card p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Globe className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[13px]">{entry.ip_address}</p>
                    {entry.label ? (
                      <p className="truncate text-[12px] text-muted-foreground">{entry.label}</p>
                    ) : null}
                  </div>
                  <StatusBadge status="active" />
                </div>
                <button
                  type="button"
                  data-testid={`ip-whitelist-delete-${entry.id}`}
                  onClick={() => setEntryToDelete(entry)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                  aria-label={`Remove ${entry.ip_address}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={entryToDelete !== null}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
        resourceName={entryToDelete?.ip_address ?? ''}
        resourceLabel="IP address"
        title="Remove whitelisted IP"
        description="Apps connecting from this IP will no longer be able to send from unverified domains."
        confirmLabel="Remove IP"
        onConfirm={handleDeleteConfirm}
        isPending={remove.isPending}
        testId="ip-whitelist-delete-dialog"
      />
    </DashboardLayout>
  );
}
