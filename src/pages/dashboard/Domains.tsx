import { Fragment, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import { useDomainMutations, useDomains } from '@/hooks/useDomains';
import { toastError, toastFailure, toastSuccess } from '@/lib/toast';
import type { DomainDnsRecord, VerifiedDomain } from '@/types';
import {
  Plus,
  Globe,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';

function displayStatus(status: VerifiedDomain['status']): string {
  if (status === 'failed') return 'warning';
  return status;
}

function recordClass(status: string): string {
  if (status === 'pass') return 'border-primary/40 text-primary';
  if (status === 'fail') return 'border-destructive/40 text-destructive';
  return 'border-border text-muted-foreground';
}

function CopyFieldButton({
  label,
  value,
  field,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (value: string, field: string, label: string) => void;
}) {
  const copied = copiedField === field;
  const tooltipLabel = copied ? label.replace(/^Copy /, 'Copied ') : label;

  return (
    <IconTooltip label={tooltipLabel}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={() => onCopy(value, field, label)}
      >
        {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      </button>
    </IconTooltip>
  );
}

function DnsRecordRow({
  record,
  domainId,
  copiedField,
  onCopy,
}: {
  record: DomainDnsRecord;
  domainId: string;
  copiedField: string | null;
  onCopy: (value: string, field: string, label: string) => void;
}) {
  const nameField = `${domainId}-${record.purpose}-name`;
  const valueField = `${domainId}-${record.purpose}-value`;

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
          {record.type}
        </span>
        <span className="label-mono">{record.purpose}</span>
      </div>
      {record.note ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{record.note}</p>
      ) : null}
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <div className="label-mono mb-1">Name</div>
          {'host' in record && record.host && record.host !== record.name ? (
            <p className="mb-1 font-mono text-[11px] text-muted-foreground">
              DNS host: {record.host}
            </p>
          ) : null}
          <div className="flex items-start justify-between gap-2">
            <code className="min-w-0 break-all font-mono text-[12.5px]">{record.name}</code>
            <CopyFieldButton
              label="Copy name"
              value={record.name}
              field={nameField}
              copiedField={copiedField}
              onCopy={onCopy}
            />
          </div>
        </div>
        <div className="min-w-0">
          <div className="label-mono mb-1">Value</div>
          <div className="flex items-start justify-between gap-2">
            <code className="min-w-0 break-all font-mono text-[12px] text-muted-foreground">
              {record.value}
            </code>
            <CopyFieldButton
              label="Copy value"
              value={record.value}
              field={valueField}
              copiedField={copiedField}
              onCopy={onCopy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Domains() {
  const [showAdd, setShowAdd] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<VerifiedDomain | null>(null);

  const { data, isLoading, isError } = useDomains();
  const { create, verify, remove } = useDomainMutations();

  const domains = data?.data ?? [];

  const verifiedCount = domains.filter((d) => d.status === 'verified').length;
  const warningCount = domains.filter((d) => d.status === 'failed').length;
  const pendingCount = domains.filter((d) => d.status === 'pending').length;

  async function handleAdd() {
    const domain = domainInput.trim();
    if (!domain) return;

    try {
      const result = await create.mutateAsync(domain);
      setShowAdd(false);
      setDomainInput('');
      setExpandedId(result.domain.id);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not add domain.');
    }
  }

  async function handleVerify(id: string) {
    setVerifyingId(id);
    try {
      const result = await verify.mutateAsync(id);
      if (result.diagnostics) {
        const hints = Object.entries(result.diagnostics)
          .filter(([, detail]) => !detail.verified && detail.hint)
          .map(([purpose, detail]) => `${purpose.toUpperCase()}: ${detail.hint}`);
        toastFailure(hints.length > 0 ? hints.join(' ') : result.message);
      } else {
        toastSuccess(result.message);
      }
    } catch (error) {
      toastError(error, 'Could not verify domain.');
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!domainToDelete) return;

    try {
      const result = await remove.mutateAsync(domainToDelete.id);
      if (expandedId === domainToDelete.id) setExpandedId(null);
      setDomainToDelete(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not remove domain.');
    }
  }

  async function copyValue(value: string, field: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toastSuccess(label.replace(/^Copy /, 'Copied '));
    window.setTimeout(() => setCopiedField(null), 1500);
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operate"
        title="Domains"
        description="Verify custom sending domains with SPF, DKIM, and ownership DNS records."
        actions={
          <button
            type="button"
            data-testid="domain-add-btn"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" /> Add domain
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3">
        {[
          ['Verified', verifiedCount, 'primary'],
          ['Needs attention', warningCount, 'warn'],
          ['Pending', pendingCount, 'info'],
        ].map(([label, value, tone]) => (
          <div key={label} className="bg-card p-5">
            <div className="label-mono">{label}</div>
            <div
              className={`mt-2 text-2xl font-medium tracking-tight ${
                tone === 'primary' ? 'text-foreground' : ''
              }`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="p-8 text-sm text-destructive">Could not load domains.</p>
        ) : domains.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No domains yet. Use @*.mailvoidr.com without verification, or add a custom domain.
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono p-3 text-left">Domain</th>
                <th className="label-mono p-3 text-left">Status</th>
                <th className="label-mono p-3 text-left">Records</th>
                <th className="label-mono p-3 text-left">Added</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <Fragment key={domain.id}>
                  <tr
                    data-testid={`domain-row-${domain.id}`}
                    className="border-b border-border hover:bg-accent/30"
                  >
                    <td className="p-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left"
                        onClick={() =>
                          setExpandedId(expandedId === domain.id ? null : domain.id)
                        }
                      >
                        {expandedId === domain.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{domain.domain}</span>
                      </button>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={displayStatus(domain.status)} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        {(['ownership', 'spf', 'dkim'] as const).map((key) => (
                          <span
                            key={key}
                            className={`border px-1.5 py-0.5 ${recordClass(domain.records[key])}`}
                          >
                            {key.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {domain.created_at
                        ? new Date(domain.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={verifyingId === domain.id}
                          onClick={() => handleVerify(domain.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[12px] hover:bg-accent"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${
                              verifyingId === domain.id ? 'animate-spin' : ''
                            }`}
                          />
                          Verify
                        </button>
                        <button
                          type="button"
                          disabled={remove.isPending}
                          onClick={() => setDomainToDelete(domain)}
                          className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === domain.id ? (
                    <tr key={`${domain.id}-dns`} className="border-b border-border bg-muted/20">
                      <td colSpan={5} className="p-0">
                        <div className="border-t border-border px-5 py-4">
                          <h3 className="text-sm font-medium">
                            DNS records for{' '}
                            <span className="font-mono">{domain.domain}</span>
                          </h3>
                          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                            Add these records at your DNS provider, then click Verify.
                          </p>
                          <div className="mt-4 divide-y divide-border border border-border bg-card">
                            {domain.dns_records.map((record) => (
                              <DnsRecordRow
                                key={record.purpose}
                                record={record}
                                domainId={domain.id}
                                copiedField={copiedField}
                                onCopy={copyValue}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div
            data-testid="domain-add-modal"
            className="w-full max-w-md border border-border bg-card"
          >
            <div className="border-b border-border p-4">
              <h3 className="text-base font-medium">Add a domain</h3>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                We recommend a subdomain like{' '}
                <span className="font-mono">mail.yourcompany.com</span>.
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label-mono mb-1.5 block">Domain</label>
                <input
                  data-testid="domain-add-input"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="mail.yourcompany.com"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border p-4">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setDomainInput('');
                }}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={create.isPending || !domainInput.trim()}
                onClick={handleAdd}
                className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {create.isPending ? 'Adding…' : 'Add domain'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(domainToDelete)}
        onOpenChange={(open) => {
          if (!open) setDomainToDelete(null);
        }}
        resourceName={domainToDelete?.domain ?? ''}
        resourceLabel="domain"
        title="Remove domain"
        description={
          domainToDelete
            ? `Sending from ${domainToDelete.domain} will stop working. Type the domain name below to confirm removal.`
            : undefined
        }
        confirmLabel="Remove domain"
        onConfirm={handleDeleteConfirm}
        isPending={remove.isPending}
        testId="domain-delete-dialog"
      />
    </DashboardLayout>
  );
}
