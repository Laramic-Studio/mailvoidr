import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/newsletter/classes';
import { rememberNewsletterImport } from '@/components/newsletter/NewsletterImportWatcher';
import { useImportJob, useImportMutations } from '@/hooks/useNewsletter';
import { downloadImportErrors } from '@/lib/api/newsletter';
import { saveBlob } from '@/lib/newsletter/download';
import { doiImportCopy, formatBytes, formatCount } from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Audience, ImportColumn, ImportColumnRole, NewsletterImport, NewsletterSettings } from '@/types/newsletter';

const CONSENT =
  'I confirm everyone in this file agreed to receive email from us, and I can show proof if asked.';

const ROLES: { value: ImportColumnRole; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'tags', label: 'Tag(s)' },
  { value: 'custom_field', label: 'Custom field' },
  { value: 'skip', label: 'Skip' },
];

interface ImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audiences: Audience[];
  defaultAudienceId?: string;
  settings?: NewsletterSettings;
  onCreateAudience?: (name: string) => Promise<Audience>;
}

function guessRole(header: string): ImportColumnRole {
  const name = header.trim().toLowerCase();
  if (name.includes('email')) return 'email';
  if (name.includes('first')) return 'first_name';
  if (name.includes('last')) return 'last_name';
  if (name === 'tag' || name === 'tags') return 'tags';
  return 'skip';
}

export function ImportWizard({
  open,
  onOpenChange,
  audiences,
  defaultAudienceId,
  settings,
  onCreateAudience,
}: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [audienceId, setAudienceId] = useState(defaultAudienceId ?? audiences[0]?.id ?? '');
  const [newAudienceName, setNewAudienceName] = useState('');
  const [tags, setTags] = useState('');
  const [columns, setColumns] = useState<ImportColumn[]>([]);
  const [consent, setConsent] = useState(false);
  const [job, setJob] = useState<NewsletterImport | null>(null);
  const [creating, setCreating] = useState(false);
  const { upload, commit } = useImportMutations();
  const poll = useImportJob(job?.id ?? null, open && step === 4 && job?.status === 'processing');
  const current = poll.data?.import ?? job;
  useEffect(() => {
    if (!open) return;
    setAudienceId(defaultAudienceId || audiences[0]?.id || '');
    // Reset the target only when the sheet opens or the caller picks an audience.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultAudienceId]);

  const tagList = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  const emailMapped = columns.some((column) => column.role === 'email');
  const sizeLimit = current?.max_csv_bytes ?? settings?.max_csv_bytes ?? null;

  const previewHeaders = current?.headers ?? [];
  const columnByHeader = useMemo(
    () => new Map(columns.map((column) => [column.header, column])),
    [columns],
  );

  function reset() {
    setStep(1);
    setConsent(false);
    setJob(null);
    setColumns([]);
    setTags('');
  }

  async function handleCreateAudience() {
    if (!onCreateAudience || !newAudienceName.trim()) return;
    setCreating(true);
    try {
      const audience = await onCreateAudience(newAudienceName.trim());
      setAudienceId(audience.id);
      setNewAudienceName('');
      toastSuccess('Audience created.');
    } catch (error) {
      toastError(error, 'Could not create the audience.');
    } finally {
      setCreating(false);
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file || !audienceId) return;
    try {
      const result = await upload.mutateAsync({ audienceId, file, tags: tagList });
      const nextColumns = result.import.headers.map((header) => ({
        header,
        role: guessRole(header),
        field_name: null,
      }));
      setJob(result.import);
      setColumns(nextColumns);
      setStep(2);
    } catch (error) {
      toastError(error, 'Could not read that CSV.');
    }
  }

  async function handleCommit() {
    if (!job || !emailMapped || !consent) return;
    try {
      const result = await commit.mutateAsync({ importId: job.id, columns });
      setJob(result.import);
      setStep(4);
      if (result.import.status === 'processing') {
        rememberNewsletterImport(result.import.id);
        toastSuccess('Import started. You can leave this page.');
      } else if (result.import.status === 'completed') {
        toastSuccess('Import finished.');
      }
    } catch (error) {
      toastError(error, 'Could not start the import.');
    }
  }

  async function handleErrors() {
    if (!current) return;
    try {
      if (current.error_report_url?.startsWith('http')) {
        window.open(current.error_report_url, '_blank', 'noopener');
        return;
      }
      const blob = await downloadImportErrors(current.id);
      saveBlob(blob, 'import-errors.csv');
    } catch (error) {
      toastError(error, 'Could not download the error report.');
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Import CSV</SheetTitle>
          <SheetDescription>
            <span className="label-mono" aria-live="polite">Step {step} of 4</span>
          </SheetDescription>
        </SheetHeader>

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <p className="text-[13px] text-muted-foreground">
              UTF-8 CSV. Comma or semicolon is detected automatically.
              {sizeLimit ? ` Up to ${formatBytes(sizeLimit)}.` : ''}
            </p>
            {audiences.length === 0 ? (
              <div className="space-y-2">
                <label className="block text-[13px]" htmlFor="import-new-audience">
                  New audience
                  <input
                    id="import-new-audience"
                    className={`${fieldClass} mt-1.5`}
                    value={newAudienceName}
                    onChange={(event) => setNewAudienceName(event.target.value)}
                  />
                </label>
                <button type="button" className={secondaryButtonClass} disabled={creating} onClick={() => void handleCreateAudience()}>
                  Create audience
                </button>
              </div>
            ) : (
              <label className="block text-[13px]">
                Audience
                <Select value={audienceId || undefined} onValueChange={setAudienceId}>
                  <SelectTrigger className="mt-1.5" aria-label="Target audience">
                    <SelectValue placeholder="Choose an audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id}>{audience.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            )}
            <label className="block text-[13px]" htmlFor="import-tags">
              Tags to apply (optional)
              <input
                id="import-tags"
                className={`${fieldClass} mt-1.5`}
                value={tags}
                placeholder="customers, launch"
                onChange={(event) => setTags(event.target.value)}
              />
            </label>
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-border px-4 py-8 text-center text-[13px]">
              <span>{upload.isPending ? 'Reading file…' : 'Drop a CSV here, or click to choose one'}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                disabled={!audienceId || upload.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  void handleFile(file);
                }}
              />
            </label>
          </div>
        ) : null}

        {step === 2 && current ? (
          <div className="mt-6 space-y-4">
            <p className="text-[13px] text-muted-foreground">Map each column. Email is required before you continue.</p>
            <div className="space-y-3">
              {previewHeaders.map((header) => {
                const column = columnByHeader.get(header);
                return (
                  <div key={header} className="grid gap-2 border border-border p-3 sm:grid-cols-[1fr_180px]">
                    <div>
                      <div className="text-[13px] font-medium">{header}</div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {(current.preview_rows.map((row) => row[previewHeaders.indexOf(header)]).filter(Boolean).slice(0, 5).join(' · ')) || '—'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Select
                        value={column?.role ?? 'skip'}
                        onValueChange={(role) => {
                          setColumns((existing) => existing.map((item) => (
                            item.header === header ? { ...item, role: role as ImportColumnRole } : item
                          )));
                        }}
                      >
                        <SelectTrigger aria-label={`Map ${header}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {column?.role === 'custom_field' ? (
                        <input
                          className={fieldClass}
                          aria-label={`Field name for ${header}`}
                          placeholder="Field name"
                          value={column.field_name ?? ''}
                          onChange={(event) => {
                            const fieldName = event.target.value;
                            setColumns((existing) => existing.map((item) => (
                              item.header === header ? { ...item, field_name: fieldName } : item
                            )));
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(1)}>Back</button>
              <button type="button" className={primaryButtonClass} disabled={!emailMapped} onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 text-[13px] leading-relaxed">
              <Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} className="mt-0.5" />
              <span>{CONSENT}</span>
            </label>
            <p className="text-[13px] text-muted-foreground">{doiImportCopy(settings)}</p>
            <div className="flex justify-between gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(2)}>Back</button>
              <button type="button" className={primaryButtonClass} disabled={!consent || commit.isPending} onClick={() => void handleCommit()}>
                {commit.isPending ? 'Starting…' : 'Import'}
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 && current ? (
          <div className="mt-6 space-y-4">
            {current.status === 'processing' ? (
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Import is running. You can leave this page.
              </p>
            ) : null}
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <Count label="Uploaded" value={current.uploaded_count} />
              <Count label="Added" value={current.added_count} />
              <Count label="Updated" value={current.updated_count} />
              <Count label="Rejected" value={current.rejected_count} />
            </dl>
            <p className="text-[13px]">
              Skipped because already unsubscribed, bounced or complained:{' '}
              <span className="font-medium">{formatCount(current.skipped_suppressed_count)}</span>
            </p>
            <button type="button" className={secondaryButtonClass} onClick={() => void handleErrors()}>
              Download error report
            </button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Count({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-border p-3">
      <dt className="label-mono">{label}</dt>
      <dd className="mt-1 text-lg">{formatCount(value)}</dd>
    </div>
  );
}
