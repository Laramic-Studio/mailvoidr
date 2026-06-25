import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { CodeBlock } from '@/components/CodeBlock';
import { useDomains } from '@/hooks/useDomains';
import { useSendHistory, useSendMutations } from '@/hooks/useSend';
import { toastError, toastSuccess } from '@/lib/toast';
import type { EmailPreview } from '@/types';
import { Send, Calendar, Eye, Loader2, X } from 'lucide-react';

const TABS = [
  { id: 'compose', label: 'Compose' },
  { id: 'templates', label: 'Templates' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'history', label: 'History' },
  { id: 'transactional', label: 'Transactional' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function parseEmails(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function SendEmail() {
  const [tab, setTab] = useState<TabId>('compose');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<p>Hello,</p>\n<p>Your message here.</p>');
  const [bodyMode, setBodyMode] = useState<'html' | 'text'>('html');
  const [text, setText] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<EmailPreview | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const { data: domainsData } = useDomains();
  const { data: historyData, isLoading: historyLoading } = useSendHistory();
  const { send, preview } = useSendMutations();

  const verifiedDomains = domainsData?.data.filter((d) => d.status === 'verified') ?? [];
  const history = historyData?.data ?? [];

  const suggestedFrom = useMemo(() => {
    if (verifiedDomains[0]) {
      return `hello@${verifiedDomains[0].domain}`;
    }
    return 'hello@app.mailvoidr.com';
  }, [verifiedDomains]);

  useEffect(() => {
    if (!from && suggestedFrom) {
      setFrom(suggestedFrom);
    }
  }, [from, suggestedFrom]);

  async function handlePreview() {
    try {
      const result = await preview.mutateAsync({
        from: from.trim() || undefined,
        subject: subject.trim() || undefined,
        html: bodyMode === 'html' ? html : undefined,
        text: bodyMode === 'text' ? text : undefined,
      });
      setPreviewData(result.preview);
      setPreviewOpen(true);
    } catch (error) {
      toastError(error, 'Could not render preview.');
    }
  }

  async function handleSend() {
    const recipients = parseEmails(to);
    if (!from.trim() || recipients.length === 0 || !subject.trim()) {
      toastError('From, at least one recipient, and subject are required.');
      return;
    }

    try {
      const result = await send.mutateAsync({
        from: from.trim(),
        to: recipients,
        subject: subject.trim(),
        reply_to: replyTo.trim() || undefined,
        html: bodyMode === 'html' ? html : undefined,
        text: bodyMode === 'text' ? text : undefined,
      });
      setCreditsRemaining(result.credits_remaining);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not send email.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Email sending"
        title="Send email"
        description="Compose and queue outbound email from the dashboard."
        actions={null}
      />

      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            data-testid={`send-tab-${t.id}`}
            className={`px-3.5 py-2 text-[13px] transition-colors ${
              tab === t.id
                ? '-mb-px border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'compose' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="border border-border bg-card">
            <div className="space-y-0 border-b border-border p-4">
              <FieldRow label="From" testid="send-from">
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder={suggestedFrom}
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </FieldRow>
              <FieldRow label="To" testid="send-to">
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="riya@example.com, team@example.com"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </FieldRow>
              <FieldRow label="Reply-to" testid="send-replyto">
                <input
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="support@yourcompany.com"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </FieldRow>
              <FieldRow label="Subject" testid="send-subject">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Welcome to your workspace"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </FieldRow>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <div className="flex items-center gap-1">
                  {(['html', 'text'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBodyMode(mode)}
                      className={`rounded px-2 py-1 text-[12px] uppercase ${
                        bodyMode === mode
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              {bodyMode === 'html' ? (
                <textarea
                  data-testid="send-html"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="min-h-[280px] w-full resize-y bg-background p-4 font-mono text-[13px] focus:outline-none"
                />
              ) : (
                <textarea
                  data-testid="send-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[280px] w-full resize-y bg-background p-4 text-[13px] focus:outline-none"
                  placeholder="Plain text body"
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border p-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={preview.isPending}
                  data-testid="send-preview-btn"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-50"
                >
                  {preview.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  Preview
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground"
                  title="Scheduled sends ship in a later module"
                >
                  <Calendar className="h-3 w-3" />
                  Schedule
                </button>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={send.isPending}
                data-testid="send-now-btn"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {send.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                {send.isPending ? 'Sending…' : 'Send now'}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border border-border bg-card p-4">
              <div className="label-mono">From addresses</div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                Use a verified domain or any <span className="font-mono">@*.mailvoidr.com</span>{' '}
                address.
              </p>
              {verifiedDomains.length > 0 ? (
                <ul className="mt-3 space-y-1 text-[12px] font-mono text-muted-foreground">
                  {verifiedDomains.slice(0, 4).map((domain) => (
                    <li key={domain.id}>
                      <button
                        type="button"
                        className="hover:text-primary"
                        onClick={() => setFrom(`hello@${domain.domain}`)}
                      >
                        hello@{domain.domain}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="border border-border bg-card p-4">
              <div className="label-mono">API send</div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                Same payload via HTTP API key auth.
              </p>
              <CodeBlock
                language="bash"
                className="mt-3"
                code={`curl -X POST $VITE_API_URL/mail/send \\
  -H "Authorization: Bearer $MV_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"from":"${from || suggestedFrom}","to":["recipient@example.com"],"subject":"Hello","html":"<p>Hi</p>"}'`}
              />
            </div>
            {creditsRemaining !== null ? (
              <div className="border border-border bg-card p-4">
                <div className="label-mono">Credits remaining</div>
                <div className="mt-2 font-mono text-xl">{creditsRemaining}</div>
              </div>
            ) : null}
          </aside>
        </div>
      )}

      {tab === 'history' && (
        <div className="border border-border bg-card">
          {historyLoading ? (
            <div className="flex justify-center p-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground">No sends yet for this workspace.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="label-mono p-3 text-left">Queued</th>
                  <th className="label-mono p-3 text-left">Recipient</th>
                  <th className="label-mono p-3 text-left">Subject</th>
                  <th className="label-mono p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="p-3 font-mono text-muted-foreground">
                      {entry.queued_at
                        ? new Date(entry.queued_at).toLocaleString()
                        : entry.created_at
                          ? new Date(entry.created_at).toLocaleString()
                          : '—'}
                    </td>
                    <td className="p-3 font-mono">{entry.recipient ?? '—'}</td>
                    <td className="max-w-[300px] truncate p-3">{entry.subject}</td>
                    <td className="p-3">
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab !== 'compose' && tab !== 'history' && (
        <div className="border border-dashed border-border bg-card/30 p-16 text-center">
          <h3 className="text-base font-medium">No {tab} emails yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'templates'
              ? 'Switch to the Templates page to manage them.'
              : "When you create one, it'll show up here."}
          </p>
        </div>
      )}

      {previewOpen && previewData ? (
        <PreviewModal preview={previewData} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </DashboardLayout>
  );
}

function FieldRow({
  label,
  testid,
  children,
}: {
  label: string;
  testid: string;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 grid grid-cols-[100px_1fr] items-center gap-3 border-b border-border px-4 pb-3 last:border-0 last:pb-0">
      <label className="label-mono">{label}</label>
      <div data-testid={testid}>{children}</div>
    </div>
  );
}

function PreviewModal({
  preview,
  onClose,
}: {
  preview: EmailPreview;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur"
      data-testid="preview-modal"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-medium">Preview</h3>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {preview.subject || 'No subject'}
              {preview.from ? ` · From ${preview.from}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border text-[12px]">
              {(['desktop', 'mobile'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`px-3 py-1 capitalize ${device === d ? 'bg-accent' : ''}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center border border-border hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-muted/30 p-8">
          <div
            className={`${device === 'mobile' ? 'max-w-sm' : 'max-w-2xl'} w-full border border-border bg-white p-8 text-zinc-900`}
          >
            {preview.html ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: preview.html }} />
            ) : (
              <p className="text-sm text-zinc-500">No HTML content.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
