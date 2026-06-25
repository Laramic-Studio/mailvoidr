import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { CodeBlock } from '@/components/CodeBlock';
import { StatusBadge } from '@/components/StatusBadge';
import { formatVirtualEmailTtl } from '@/constants/virtual-emails';
import {
  useVirtualEmail,
  useVirtualEmailMessage,
  useVirtualEmailMessageMutations,
  useVirtualEmailMessageRaw,
  useVirtualEmailMessages,
  useVirtualEmailMutations,
} from '@/hooks/useVirtualEmails';
import { downloadAttachment } from '@/lib/api/virtual-emails';
import { formatMessageTime, parseEmailAddress } from '@/lib/email-utils';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  ArrowLeft,
  Copy,
  Trash2,
  RefreshCw,
  Search,
  Paperclip,
  Loader2,
  Mail,
} from 'lucide-react';

const TABS = [
  { id: 'preview', label: 'Preview' },
  { id: 'html', label: 'HTML' },
  { id: 'raw', label: 'Raw source' },
  { id: 'headers', label: 'Headers' },
  { id: 'attachments', label: 'Attachments' },
] as const;

type DetailTab = (typeof TABS)[number]['id'];

export default function VirtualEmailDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const virtualEmailId = id ?? '';

  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>('preview');
  const [messageSearch, setMessageSearch] = useState('');
  const [messageSearchInput, setMessageSearchInput] = useState('');

  const { data: inboxData, isLoading: inboxLoading, isError: inboxError, refetch: refetchInbox } =
    useVirtualEmail(virtualEmailId);
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } =
    useVirtualEmailMessages(virtualEmailId, messageSearch);
  const { data: message, isLoading: messageLoading, refetch: refetchMessage } =
    useVirtualEmailMessage(virtualEmailId, activeMessageId ?? undefined);
  const { data: rawSource, isLoading: rawLoading } = useVirtualEmailMessageRaw(
    virtualEmailId,
    activeMessageId ?? undefined,
    tab === 'raw',
  );

  const { remove: deleteInbox } = useVirtualEmailMutations();
  const { remove: deleteMessage } = useVirtualEmailMessageMutations(virtualEmailId);

  const inbox = inboxData?.virtual_email;
  const messages = messagesData?.data ?? [];

  useEffect(() => {
    if (messages.length === 0) {
      setActiveMessageId(null);
      return;
    }

    if (!activeMessageId || !messages.some((m) => m.id === activeMessageId)) {
      setActiveMessageId(messages[0].id);
    }
  }, [messages, activeMessageId]);

  async function copyAddress() {
    if (!inbox?.email_address) return;
    await navigator.clipboard.writeText(inbox.email_address);
    toastSuccess('Address copied.');
  }

  async function handleRefresh() {
    await Promise.all([refetchInbox(), refetchMessages(), refetchMessage()]);
  }

  async function handleDeleteVirtualEmail() {
    if (!virtualEmailId || !window.confirm('Delete this virtual email and all captured messages?')) return;

    try {
      await deleteInbox.mutateAsync(virtualEmailId);
      toastSuccess('Virtual email deleted.');
      nav('/dashboard/virtual-emails');
    } catch (err) {
      toastError(err, 'Could not delete virtual email');
    }
  }

  async function handleDeleteMessage() {
    if (!activeMessageId || !window.confirm('Delete this message?')) return;

    try {
      await deleteMessage.mutateAsync(activeMessageId);
      toastSuccess('Message deleted.');
      setActiveMessageId(null);
    } catch (err) {
      toastError(err, 'Could not delete message');
    }
  }

  async function handleDownloadAttachment(attachmentId: string, filename: string) {
    try {
      await downloadAttachment(attachmentId, filename);
    } catch (err) {
      toastError(err, 'Could not download attachment');
    }
  }

  if (inboxLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (inboxError || !inbox) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <h1 className="text-lg font-medium">Virtual email not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This address may have been deleted or you don&apos;t have access.
          </p>
          <Link to="/dashboard/virtual-emails" className="mt-4 inline-block text-sm text-primary hover:underline">
            Back to virtual emails
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const from = message ? parseEmailAddress(message.from) : null;
  const displayTitle = inbox.label || inbox.email_address;

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/virtual-emails"
            className="text-muted-foreground hover:text-foreground"
            data-testid="virtual-email-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-medium tracking-tight">{displayTitle}</h1>
              <StatusBadge status={inbox.is_expired ? 'warning' : 'active'} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[12.5px] text-muted-foreground">
              <span className="text-foreground">{inbox.email_address}</span>
              <button type="button" onClick={copyAddress} className="hover:text-foreground">
                <Copy className="h-3 w-3" />
              </button>
              <span>·</span>
              <span>{inbox.messages_count} messages</span>
              <span>·</span>
              <span>TTL {formatVirtualEmailTtl(inbox.expires_at, inbox.is_expired)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleDeleteVirtualEmail}
            data-testid="virtual-email-delete"
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-card px-3 py-1.5 text-[13px] text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
            Delete address
          </button>
        </div>
      </div>

      <div className="grid min-h-[600px] gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="flex flex-col overflow-hidden border border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMessageSearch(messageSearchInput.trim());
            }}
            className="border-b border-border p-2.5"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={messageSearchInput}
                onChange={(e) => setMessageSearchInput(e.target.value)}
                placeholder="Search messages…"
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-[12.5px]"
              />
            </div>
          </form>

          {messagesLoading ? (
            <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="mt-1 max-w-[240px] text-[12.5px] text-muted-foreground">
                Send mail to{' '}
                <span className="font-mono text-foreground">{inbox.email_address}</span> to see it
                here.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {messages.map((m) => {
                const sender = parseEmailAddress(m.from);

                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setActiveMessageId(m.id)}
                      data-testid={`message-row-${m.id}`}
                      className={`w-full p-3 text-left transition-colors ${
                        activeMessageId === m.id ? 'bg-accent/60' : 'hover:bg-accent/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-[13px] ${
                            !m.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {sender.name}
                        </span>
                        <span className="whitespace-nowrap font-mono text-[10.5px] text-muted-foreground">
                          {formatMessageTime(m.created_at)}
                        </span>
                      </div>
                      <div
                        className={`mt-0.5 truncate text-[12.5px] ${
                          !m.is_read ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {m.subject || '(no subject)'}
                      </div>
                      {m.preview && (
                        <div className="mt-1 truncate text-[11.5px] text-muted-foreground">
                          {m.preview}
                        </div>
                      )}
                      {m.attachments_count > 0 && (
                        <div className="mt-1.5 inline-flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground">
                          <Paperclip className="h-2.5 w-2.5" />
                          {m.attachments_count} attachment{m.attachments_count === 1 ? '' : 's'}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="flex flex-col overflow-hidden border border-border bg-card">
          {!activeMessageId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
              Select a message to read
            </div>
          ) : messageLoading || !message ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <div className="border-b border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[18px] font-medium tracking-tight">
                      {message.subject || '(no subject)'}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[12.5px]">
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted font-mono text-[10px]">
                        {from?.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span>
                        {from?.name}{' '}
                        {from?.email && (
                          <span className="text-muted-foreground">&lt;{from.email}&gt;</span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11.5px] text-muted-foreground">
                      to {inbox.email_address} · {formatMessageTime(message.created_at)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteMessage}
                    data-testid="message-delete"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>

                <div className="-mx-5 mt-4 flex items-center gap-1 border-b border-border px-5">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      data-testid={`detail-tab-${t.id}`}
                      className={`px-3 py-2 text-[12.5px] transition-colors ${
                        tab === t.id
                          ? '-mb-px border-b-2 border-primary text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {tab === 'preview' && (
                  <div className="min-h-full bg-muted/30 p-6">
                    {message.html_body ? (
                      <iframe
                        title="Email preview"
                        sandbox=""
                        srcDoc={message.html_body}
                        className="mx-auto min-h-[480px] w-full max-w-2xl border border-border bg-white"
                      />
                    ) : (
                      <pre className="mx-auto max-w-2xl whitespace-pre-wrap rounded-lg border border-border bg-background p-6 text-sm text-foreground">
                        {message.text_body || 'No message body.'}
                      </pre>
                    )}
                  </div>
                )}

                {tab === 'html' && (
                  <div className="p-4">
                    <CodeBlock
                      language="html"
                      code={message.html_body || '<!-- No HTML body -->'}
                    />
                  </div>
                )}

                {tab === 'raw' && (
                  <div className="p-4">
                    {rawLoading ? (
                      <div className="flex justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <CodeBlock language="text" code={rawSource || '(empty)'} showLineNumbers />
                    )}
                  </div>
                )}

                {tab === 'headers' && (
                  <div className="p-4">
                    {message.headers && message.headers.length > 0 ? (
                      <table className="w-full font-mono text-[12.5px]">
                        <tbody>
                          {message.headers.map((header) => (
                            <tr key={`${header.key}-${header.value}`} className="border-b border-border last:border-0">
                              <td className="w-44 whitespace-nowrap py-2 pr-4 align-top text-muted-foreground">
                                {header.key}
                              </td>
                              <td className="break-all py-2">{header.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">No headers stored.</p>
                    )}
                  </div>
                )}

                {tab === 'attachments' && (
                  <div className="p-6">
                    {message.attachments && message.attachments.length > 0 ? (
                      <div className="space-y-3">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-3 border border-border bg-background p-4"
                          >
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded bg-muted">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{attachment.filename}</div>
                              <div className="font-mono text-[11.5px] text-muted-foreground">
                                {attachment.content_type} · {attachment.formatted_size}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadAttachment(attachment.id, attachment.filename)
                              }
                              className="rounded border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        No attachments in this message.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
