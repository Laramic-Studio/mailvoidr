import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { CodeBlock } from '@/components/CodeBlock';
import { HtmlCheckPanel, SpamPanel } from '@/components/email/EmailAnalysisPanels';
import { StatusBadge } from '@/components/StatusBadge';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import { formatVirtualEmailTtl } from '@/constants/virtual-emails';
import { useAuth } from '@/hooks/useAuth';
import {
  useVirtualEmail,
  useVirtualEmailMessage,
  useVirtualEmailMessageMutations,
  useVirtualEmailMessageRaw,
  useVirtualEmailMessages,
  useVirtualEmailMutations,
} from '@/hooks/useVirtualEmails';
import { useVirtualEmailRealtime } from '@/hooks/useVirtualEmailRealtime';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { downloadAttachment } from '@/lib/api/virtual-emails';
import { formatRelativeInboxTime } from '@/lib/email-utils';
import { toastError, toastSuccess } from '@/lib/toast';
import type { EmailMessage, EmailMessageSummary } from '@/types';
import {
  ArrowLeft,
  Copy,
  Trash2,
  RefreshCw,
  Search,
  Paperclip,
  Loader2,
  Inbox as InboxIcon,
  Laptop,
  Smartphone,
} from 'lucide-react';

const DETAIL_TABS = [
  { id: 'html', label: 'HTML' },
  { id: 'html-source', label: 'HTML Source' },
  { id: 'text', label: 'Text' },
  { id: 'raw', label: 'Raw' },
  { id: 'spam', label: 'Spam Analysis' },
  { id: 'html-check', label: 'HTML Check' },
  { id: 'headers', label: 'Tech Info' },
  { id: 'attachments', label: 'Attachments' },
] as const;

type DetailTab = (typeof DETAIL_TABS)[number]['id'];
type PreviewMode = 'desktop' | 'mobile';

export default function VirtualEmailDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaces();
  const virtualEmailId = id ?? '';

  const [detailTab, setDetailTab] = useState<DetailTab>('html');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [messageSearch, setMessageSearch] = useState('');
  const [messageSearchInput, setMessageSearchInput] = useState('');
  const [mobilePane, setMobilePane] = useState<'list' | 'detail'>('list');
  const [deleteAddressOpen, setDeleteAddressOpen] = useState(false);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<EmailMessageSummary | null>(null);
  const selectedIdRef = useRef(selectedMessageId);
  selectedIdRef.current = selectedMessageId;

  const {
    data: inboxData,
    isLoading: inboxLoading,
    isError: inboxError,
    refetch: refetchInbox,
  } = useVirtualEmail(virtualEmailId);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
    refetch: refetchMessages,
  } = useVirtualEmailMessages(virtualEmailId, messageSearch);
  const {
    data: message,
    isLoading: messageLoading,
    isError: messageError,
    refetch: refetchMessage,
  } = useVirtualEmailMessage(virtualEmailId, selectedMessageId ?? undefined);
  const { data: rawSource, isLoading: rawLoading } = useVirtualEmailMessageRaw(
    virtualEmailId,
    selectedMessageId ?? undefined,
    detailTab === 'raw',
  );

  const { remove: deleteInbox } = useVirtualEmailMutations();
  const { remove: deleteMessage } = useVirtualEmailMessageMutations(virtualEmailId);

  const inbox = inboxData?.virtual_email;
  const messages = messagesData?.data ?? [];

  const handleRealtimeMessage = useCallback(() => {
    if (!selectedIdRef.current) {
      setMobilePane('list');
    }
  }, []);

  useVirtualEmailRealtime({
    userId: user?.id,
    virtualEmailId,
    enabled: Boolean(inbox && user?.onboarding_completed),
    onNewMessage: handleRealtimeMessage,
  });

  useEffect(() => {
    if (messages.length === 0) {
      setSelectedMessageId(null);
      setSelectedSummary(null);
      setMobilePane('list');
      return;
    }

    const currentId = selectedIdRef.current;
    if (currentId && messages.some((m) => m.id === currentId)) {
      setSelectedSummary((prev) => messages.find((m) => m.id === currentId) ?? prev);
      return;
    }

    const summary = messages[0] ?? null;
    setSelectedMessageId(summary?.id ?? null);
    setSelectedSummary(summary);
  }, [messages]);

  async function copyAddress() {
    if (!inbox?.email_address) return;
    await navigator.clipboard.writeText(inbox.email_address);
    toastSuccess('Address copied.');
  }

  async function handleRefresh() {
    await Promise.all([refetchInbox(), refetchMessages(), refetchMessage()]);
  }

  async function handleDeleteVirtualEmail() {
    if (!virtualEmailId) return;

    try {
      await deleteInbox.mutateAsync(virtualEmailId);
      toastSuccess('Virtual email deleted.');
      nav('/dashboard/virtual-emails');
    } catch (err) {
      toastError(err, 'Could not delete virtual email');
    }
  }

  async function handleDeleteMessage() {
    if (!selectedMessageId || !window.confirm('Delete this message?')) return;

    const deletedId = selectedMessageId;
    const remaining = messages.filter((m) => m.id !== deletedId);
    const nextSummary = remaining[0] ?? null;

    try {
      await deleteMessage.mutateAsync(deletedId);
      toastSuccess('Message deleted.');
      setSelectedMessageId(nextSummary?.id ?? null);
      setSelectedSummary(nextSummary);
      if (!nextSummary) setMobilePane('list');
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

  function handleSelectMessage(summary: EmailMessageSummary) {
    setSelectedSummary(summary);
    setSelectedMessageId(summary.id);
    setMobilePane('detail');
  }

  if (inboxLoading) {
    return (
      <DashboardLayout flush>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
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
          <Link
            to="/dashboard/virtual-emails"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Back to virtual emails
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const displayMessage: EmailMessage | EmailMessageSummary | null = message ?? selectedSummary;
  const analysis = message?.analysis;
  const unreadCount = messages.filter((m) => !m.is_read).length;
  const displayTitle = inbox.label || inbox.email_address;

  return (
    <DashboardLayout flush>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border bg-card px-4 py-3 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-sm font-semibold">{displayTitle}</h1>
              <StatusBadge status={inbox.is_expired ? 'warning' : 'active'} />
              <span className="text-[12px] text-muted-foreground">·</span>
              <span className="font-mono text-[12px] text-muted-foreground">
                {inbox.messages_count} messages
              </span>
              <span className="text-[12px] text-muted-foreground">·</span>
              <span className="font-mono text-[12px] text-muted-foreground">
                TTL {formatVirtualEmailTtl(inbox.expires_at, inbox.is_expired)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconTooltip side='top' label="Copy address">
                <button
                  type="button"
                  onClick={copyAddress}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </IconTooltip>
              <IconTooltip side='top' label="Delete address">
                <button
                  type="button"
                  onClick={() => setDeleteAddressOpen(true)}
                  data-testid="virtual-email-delete"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </IconTooltip>
            </div>
          </div>
        </div>
   

        <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_1fr]">
          <aside
            className={`min-h-0 flex-col border-b border-border bg-card lg:border-b-0 lg:border-r ${
              mobilePane === 'detail' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="space-y-3 border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Messages</span>
                  {unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1.5 font-mono text-[10px] font-semibold text-primary">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <IconTooltip side='top' label="Refresh">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={messagesFetching}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${messagesFetching ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </IconTooltip>
                  {selectedMessageId && (
                    <IconTooltip side='top' label="Delete message">
                      <button
                        type="button"
                        onClick={handleDeleteMessage}
                        data-testid="message-delete"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </IconTooltip>
                  )}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessageSearch(messageSearchInput.trim());
                }}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={messageSearchInput}
                    onChange={(e) => setMessageSearchInput(e.target.value)}
                    placeholder="Search messages..."
                    className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs"
                  />
                </div>
              </form>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <InboxIcon className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs text-muted-foreground">No messages yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Send mail to{' '}
                    <span className="font-mono text-foreground">{inbox.email_address}</span>
                  </p>
                </div>
              ) : (
                <ul>
                  {messages.map((m) => {
                    const isActive = m.id === selectedMessageId;

                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectMessage(m)}
                          data-testid={`message-row-${m.id}`}
                          className={`group relative flex w-full flex-col gap-1.5 border-b border-border px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted/40 ${
                            isActive ? 'bg-primary/5' : ''
                          }`}
                        >
                          {isActive && (
                            <div className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-primary" />
                          )}
                          <div className="flex w-full items-center justify-between gap-2">
                            <span
                              className={`truncate text-xs font-medium ${
                                m.is_read ? 'text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {(m.from ?? '').slice(0, 28)}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                              {formatRelativeInboxTime(m.created_at)}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 truncate text-xs ${
                              m.is_read
                                ? 'font-normal text-muted-foreground'
                                : 'font-semibold text-foreground'
                            }`}
                          >
                            {!m.is_read && (
                              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            )}
                            <span className="truncate">{m.subject || '(No Subject)'}</span>
                          </div>
                          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/60">
                            {m.preview || 'No preview available'}
                          </p>
                          {m.attachments_count > 0 && (
                            <div className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                              <Paperclip className="h-2.5 w-2.5" />
                              {m.attachments_count}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <section
            className={`min-h-0 min-w-0 flex-1 flex-col bg-background ${
              mobilePane === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {!selectedMessageId || !displayMessage ? (
              <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
                Choose a message from the sidebar to inspect its rendered HTML, plain text, and raw
                source.
              </div>
            ) : (
              <>
                <div className="border-b border-border bg-card text-foreground">
                  <div className="px-5 py-4">
                    <div className="mb-3 lg:hidden">
                      <IconTooltip side='top' label="Back to message list">
                        <button
                          type="button"
                          onClick={() => setMobilePane('list')}
                          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Messages
                        </button>
                      </IconTooltip>
                    </div>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                          {displayMessage.subject || '(No Subject)'}
                        </h1>
                        <div className="space-y-2 text-sm">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                            <span className="min-w-14 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              From
                            </span>
                            <span className="break-all">{displayMessage.from}</span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                            <span className="min-w-14 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              To
                            </span>
                            <span className="break-all">{displayMessage.to ?? inbox.email_address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                          {displayMessage.created_at
                            ? new Date(displayMessage.created_at).toLocaleString()
                            : '—'}
                        </span>
                        {'formatted_size' in displayMessage && displayMessage.formatted_size && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {displayMessage.formatted_size}
                          </span>
                        )}
                        {analysis?.html_support_score != null && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10.5px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Market support: {analysis.html_support_score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border px-5">
                    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                      {DETAIL_TABS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDetailTab(t.id)}
                          data-testid={`detail-tab-${t.id}`}
                          className={`whitespace-nowrap border-b-2 px-3 py-3 font-mono text-xs transition-colors ${
                            detailTab === t.id
                              ? 'border-primary text-primary'
                              : 'border-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t.label}
                          {t.id === 'html-check' && (analysis?.html_issues_count ?? 0) > 0 && (
                            <span className="ml-1.5 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] text-destructive">
                              {analysis?.html_issues_count}
                            </span>
                          )}
                          {t.id === 'attachments' &&
                            'attachments_count' in displayMessage &&
                            displayMessage.attachments_count > 0 && (
                              <span className="ml-1.5 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                                {displayMessage.attachments_count}
                              </span>
                            )}
                        </button>
                      ))}
                    </div>
                    {detailTab === 'html' && (
                      <div className="flex shrink-0 items-center rounded-lg border border-border bg-background p-1">
                        {(
                          [
                            ['desktop', Laptop, 'Desktop'],
                            ['mobile', Smartphone, 'Mobile'],
                          ] as const
                        ).map(([mode, Icon, label]) => (
                          <IconTooltip side='top' key={mode} label={`${label} preview`}>
                            <button
                              type="button"
                              onClick={() => setPreviewMode(mode)}
                              className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium ${
                                previewMode === mode
                                  ? 'bg-accent text-foreground'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{label}</span>
                            </button>
                          </IconTooltip>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {messageLoading && !message && !messageError ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : messageError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                      <p className="text-sm text-muted-foreground">Could not load this message.</p>
                      <button
                        type="button"
                        onClick={() => refetchMessage()}
                        className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      {detailTab === 'html' && (
                        <div className="min-h-full bg-muted/20 p-6">
                          {message?.html_body ? (
                            <iframe
                              title="Email HTML preview"
                              sandbox=""
                              srcDoc={message.html_body}
                              className={`mx-auto min-h-[720px] w-full border border-border bg-white shadow-lg ${
                                previewMode === 'mobile' ? 'max-w-[420px]' : 'max-w-none'
                              }`}
                            />
                          ) : (
                            <pre className="mx-auto max-w-3xl whitespace-pre-wrap rounded-lg border border-border bg-card p-6 text-sm">
                              {message?.text_body || 'No HTML content'}
                            </pre>
                          )}
                        </div>
                      )}

                      {detailTab === 'html-source' && (
                        <div className="p-4">
                          <CodeBlock
                            language="html"
                            code={message?.html_body || '<!-- No HTML body -->'}
                          />
                        </div>
                      )}

                      {detailTab === 'text' && (
                        <div className="p-4">
                          <pre className="min-h-[400px] whitespace-pre-wrap p-5 font-mono text-sm">
                            {message?.text_body || 'No text content'}
                          </pre>
                        </div>
                      )}

                      {detailTab === 'raw' && (
                        <div className="p-4">
                          {rawLoading ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            <CodeBlock language="text" code={rawSource || '(empty)'} showLineNumbers />
                          )}
                        </div>
                      )}

                      {detailTab === 'spam' && <SpamPanel analysis={analysis} />}
                      {detailTab === 'html-check' && <HtmlCheckPanel analysis={analysis} />}

                      {detailTab === 'headers' && (
                        <div className="p-4">
                          {message?.headers && message.headers.length > 0 ? (
                            <table className="w-full font-mono text-[12.5px]">
                              <tbody>
                                {message.headers.map((header) => (
                                  <tr
                                    key={`${header.key}-${header.value}`}
                                    className="border-b border-border last:border-0"
                                  >
                                    <td className="w-44 whitespace-nowrap py-2 pr-4 align-top text-muted-foreground">
                                      {header.key}
                                    </td>
                                    <td className="break-all py-2">{header.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                              No headers stored.
                            </p>
                          )}
                        </div>
                      )}

                      {detailTab === 'attachments' && (
                        <div className="p-6">
                          {message?.attachments && message.attachments.length > 0 ? (
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
                                    <div className="truncate text-sm font-medium">
                                      {attachment.filename}
                                    </div>
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
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {deleteAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-lg">
            <h3 className="text-base font-medium">Delete virtual email?</h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              This permanently deletes{' '}
              <span className="font-mono text-foreground">{inbox.email_address}</span> and all
              captured messages.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteAddressOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteAddressOpen(false);
                  void handleDeleteVirtualEmail();
                }}
                disabled={deleteInbox.isPending}
                className="rounded-md bg-destructive px-3 py-1.5 text-[13px] text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteInbox.isPending ? 'Deleting…' : 'Delete address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
