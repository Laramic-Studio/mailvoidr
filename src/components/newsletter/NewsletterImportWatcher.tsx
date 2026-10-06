import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchAudienceImport } from '@/lib/api/newsletter';
import { formatCount } from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';

const STORAGE_KEY = 'mailvoidr_newsletter_import_id';
const EVENT = 'mailvoidr-newsletter-import';

export function rememberNewsletterImport(id: string) {
  sessionStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new Event(EVENT));
}

export function NewsletterImportWatcher() {
  const queryClient = useQueryClient();
  const [importId, setImportId] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    const sync = () => setImportId(sessionStorage.getItem(STORAGE_KEY));
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  useEffect(() => {
    if (!importId) return undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        const { import: job } = await fetchAudienceImport(importId);
        if (cancelled) return;
        if (job.status !== 'completed' && job.status !== 'failed') return;
        sessionStorage.removeItem(STORAGE_KEY);
        setImportId(null);
        queryClient.invalidateQueries({ queryKey: ['newsletter', 'audiences'] });
        if (job.status === 'failed') {
          toastError(null, job.message ?? 'Import failed.');
          return;
        }
        toastSuccess(
          `Import finished. ${formatCount(job.added_count)} added, ${formatCount(job.updated_count)} updated, ${formatCount(job.rejected_count)} rejected.`,
        );
      } catch (error) {
        if (!cancelled) toastError(error, 'Could not check the import.');
      }
    };
    const timer = window.setInterval(() => void tick(), 4000);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [importId, queryClient]);

  return null;
}
