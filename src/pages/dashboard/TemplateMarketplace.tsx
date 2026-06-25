import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import {
  useTemplateMarketplace,
  useTemplateMarketplaceMutations,
} from '@/hooks/useTemplateMarketplace';
import { toastError, toastSuccess } from '@/lib/toast';
import type { TemplateCategory, TemplateMarketplaceItem, TemplatePreview } from '@/types';
import { Download, Eye, Loader2, Search, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

function categoryLabel(category: TemplateCategory): string {
  return category === 'marketing' ? 'Marketing' : 'Transactional';
}

export default function TemplateMarketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [previewItem, setPreviewItem] = useState<TemplateMarketplaceItem | null>(null);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useTemplateMarketplace(
    search.trim() || undefined,
    category || undefined,
  );
  const { addToLibrary, preview } = useTemplateMarketplaceMutations();

  const listings = useMemo(() => data?.data ?? [], [data?.data]);

  async function handleAdd(item: TemplateMarketplaceItem) {
    if (item.in_library) {
      toastSuccess('Already in your library.');
      return;
    }

    setAddingId(item.id);
    try {
      const result = await addToLibrary.mutateAsync(item.id);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not add template.');
    } finally {
      setAddingId(null);
    }
  }

  async function handlePreview(item: TemplateMarketplaceItem) {
    try {
      const defaults: Record<string, string> = {};
      for (const variable of item.variables ?? []) {
        defaults[variable.key] = variable.default ?? '';
      }
      const result = await preview.mutateAsync({ id: item.id, variables: defaults });
      setPreviewItem(item);
      setPreviewData(result.preview);
    } catch (error) {
      toastError(error, 'Could not render preview.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Templates"
        title="Marketplace"
        description="Browse free public templates from the community. Add any template to your workspace library."
        actions={
          <Link
            to="/dashboard/templates"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent"
          >
            My templates
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="marketplace-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search marketplace…"
            className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-[13px]"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px]"
        >
          <option value="">All categories</option>
          <option value="transactional">Transactional</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : isError ? (
        <div className="border border-border bg-card p-8 text-[13px] text-destructive">
          Could not load marketplace.
        </div>
      ) : listings.length === 0 ? (
        <div className="border border-dashed border-border bg-card/30 p-16 text-center">
          <Store className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-base font-medium">No public templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a template and keep it public to share it here.
          </p>
          <Link
            to="/dashboard/templates"
            className="mt-4 inline-flex text-[13px] text-primary hover:underline"
          >
            Go to My templates
          </Link>
        </div>
      ) : (
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <div
              key={item.id}
              data-testid={`marketplace-card-${item.id}`}
              className="flex flex-col bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[14.5px] font-medium tracking-tight">{item.name}</h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    by {item.author?.name ?? 'Unknown'}
                  </p>
                </div>
                <StatusBadge
                  status="active"
                  label={categoryLabel(item.category)}
                  tone={item.category === 'marketing' ? 'info' : 'success'}
                />
              </div>

              <p className="mt-3 line-clamp-2 text-[13px] text-muted-foreground">
                {item.description || item.subject || 'No description'}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <div className="label-mono">Added</div>
                  <div className="mt-1 font-mono">{(item.installs_count ?? 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="label-mono">Subject</div>
                  <div className="mt-1 truncate text-muted-foreground">{item.subject ?? '—'}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => handlePreview(item)}
                  disabled={preview.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-accent"
                >
                  <Eye className="h-3 w-3" /> Preview
                </button>
                <button
                  type="button"
                  data-testid={`marketplace-add-${item.id}`}
                  onClick={() => handleAdd(item)}
                  disabled={addingId === item.id || item.in_library}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {addingId === item.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  {item.in_library ? 'In library' : 'Add to library'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewItem && previewData ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="text-base font-medium">{previewItem.name}</h3>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{previewData.subject}</p>
              </div>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
                onClick={() => {
                  setPreviewItem(null);
                  setPreviewData(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="overflow-auto p-4">
              <iframe
                title="Marketplace template preview"
                className="h-[60vh] w-full border border-border bg-white"
                srcDoc={previewData.html ?? ''}
              />
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
