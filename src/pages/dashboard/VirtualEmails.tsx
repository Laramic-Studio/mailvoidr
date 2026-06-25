import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { VirtualEmailCreateDialog } from '@/components/dashboard/VirtualEmailCreateDialog';
import { VirtualEmailsEmptyState } from '@/components/dashboard/VirtualEmailsEmptyState';
import { formatVirtualEmailDate, formatVirtualEmailTtl } from '@/constants/virtual-emails';
import { useVirtualEmails } from '@/hooks/useVirtualEmails';
import { toastSuccess } from '@/lib/toast';
import { Plus, Search, Copy, Mail, Clock, Loader2 } from 'lucide-react';

export default function VirtualEmails() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { data, isLoading, isError } = useVirtualEmails(search);

  const virtualEmails = data?.data ?? [];
  const isSearchEmpty =
    !isLoading && !isError && virtualEmails.length === 0 && Boolean(search);
  const isWorkspaceEmpty =
    !isLoading && !isError && virtualEmails.length === 0 && !search;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address);
    toastSuccess('Address copied.');
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Disposable addresses"
        title="Virtual emails"
        description="Create many throwaway addresses per workspace. Generate from CI and auto-expire when you're done."
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            data-testid="virtual-email-create-btn"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" />
            Create virtual email
          </button>
        }
      />

      <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search virtual emails…"
            className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-[13px]"
          />
        </div>
      </form>

      <div className="overflow-x-auto border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="p-8 text-sm text-destructive">Could not load virtual emails.</p>
        ) : isSearchEmpty ? (
          <VirtualEmailsEmptyState variant="search" onCreate={() => setShowCreate(true)} />
        ) : isWorkspaceEmpty ? (
          <VirtualEmailsEmptyState variant="empty" onCreate={() => setShowCreate(true)} />
        ) : (
          <table className="w-full min-w-[800px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono p-3 text-left">Address</th>
                <th className="label-mono p-3 text-left">Label</th>
                <th className="label-mono p-3 text-left">Messages</th>
                <th className="label-mono p-3 text-left">TTL</th>
                <th className="label-mono p-3 text-left">Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {virtualEmails.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-accent/30"
                >
                  <td className="p-3">
                    <Link
                      to={`/dashboard/virtual-emails/${item.id}`}
                      data-testid={`virtual-email-row-${item.id}`}
                      className="inline-flex items-center gap-2 font-mono text-foreground hover:text-primary"
                    >
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {item.email_address}
                    </Link>
                  </td>
                  <td className="p-3">
                    {item.label ?? <span className="text-muted-foreground/50">—</span>}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {item.messages_count}
                    {item.unread_count > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-primary">
                        · {item.unread_count} unread
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {formatVirtualEmailTtl(item.expires_at, item.is_expired)}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {formatVirtualEmailDate(item.created_at)}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      aria-label={`Copy ${item.email_address}`}
                      onClick={() => copyAddress(item.email_address)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <VirtualEmailCreateDialog open={showCreate} onOpenChange={setShowCreate} />
    </DashboardLayout>
  );
}
