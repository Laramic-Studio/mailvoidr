import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { CodeBlock } from '@/components/CodeBlock';
import { HtmlCheckPanel, SpamPanel } from '@/components/email/EmailAnalysisPanels';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import {
  useSandbox,
  useSandboxMessage,
  useSandboxMessageRaw,
  useSandboxMessages,
  useSandboxMutations,
} from '@/hooks/useSandbox';
import { useSandboxRealtime } from '@/hooks/useSandboxRealtime';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { formatRelativeInboxTime, parseEmailAddress } from '@/lib/email-utils';
import { toastError, toastSuccess } from '@/lib/toast';
import type { EmailMessage, EmailMessageSummary } from '@/types';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Inbox as InboxIcon,
  Laptop,
  Loader2,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Settings,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const DETAIL_TABS = [
  { id: 'html', label: 'HTML' },
  { id: 'html-source', label: 'HTML Source' },
  { id: 'text', label: 'Text' },
  { id: 'raw', label: 'Raw' },
  { id: 'spam', label: 'Spam Analysis' },
  { id: 'html-check', label: 'HTML Check' },
  { id: 'headers', label: 'Tech Info' },
] as const;

type DetailTab = (typeof DETAIL_TABS)[number]['id'];
type PreviewMode = 'desktop' | 'mobile';

const SESSION_KEY = 'sandboxSelectedEmailId';

export default function Inbox() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaces();

  const [detailTab, setDetailTab] = useState<DetailTab>('html');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'list' | 'detail'>('list');

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_KEY);
  });
  const [selectedSummary, setSelectedSummary] = useState<EmailMessageSummary | null>(null);

  const filters = useMemo(() => ({ search, unread: unreadOnly }), [search, unreadOnly]);
  const { data: sandboxData, isLoading: sandboxLoading, refetch: refetchSandbox } = useSandbox();
  const inbox = sandboxData?.inbox;
  const { enable, markAllRead, clearAll } = useSandboxMutations(filters);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchMessages,
  } = useSandboxMessages(filters, Boolean(inbox));

  const { data: message, isLoading: messageLoading, isError: messageError, refetch: refetchMessage } =
    useSandboxMessage(selectedMessageId ?? undefined);
  const { data: rawSource, isLoading: rawLoading } = useSandboxMessageRaw(
    selectedMessageId ?? undefined,
    detailTab === 'raw',
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(
    () => messagesData?.pages.flatMap((page) => page.data) ?? [],
    [messagesData?.pages],
  );
  const selectedIdRef = useRef(selectedMessageId);
  selectedIdRef.current = selectedMessageId;

  useEffect(() => {
    if (messages.length === 0) {
      setSelectedMessageId(null);
      setSelectedSummary(null);
      sessionStorage.removeItem(SESSION_KEY);
      setMobilePane('list');
      return;
    }

    const currentId = selectedIdRef.current;
    if (currentId && messages.some((m) => m.id === currentId)) {
      setSelectedSummary((prev) => messages.find((m) => m.id === currentId) ?? prev);
      return;
    }

    const storedId = sessionStorage.getItem(SESSION_KEY);
    const nextId =
      storedId && messages.some((m) => m.id === storedId) ? storedId : messages[0].id;
    const summary = messages.find((m) => m.id === nextId) ?? null;
    setSelectedMessageId(nextId);
    setSelectedSummary(summary);
    sessionStorage.setItem(SESSION_KEY, nextId);
  }, [messages]);

  const handleRealtimeMessage = useCallback((incoming: EmailMessageSummary) => {
    if (!selectedIdRef.current) {
      setSelectedMessageId(incoming.id);
      setSelectedSummary(incoming);
      sessionStorage.setItem(SESSION_KEY, incoming.id);
    }
  }, []);

  useSandboxRealtime({
    userId: user?.id,
    enabled: Boolean(inbox && user?.onboarding_completed),
    search,
    unreadOnly,
    onNewMessage: handleRealtimeMessage,
  });

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, messages.length]);

  function handleSelectMessage(summary: EmailMessageSummary) {
    setSelectedSummary(summary);
    setSelectedMessageId(summary.id);
    sessionStorage.setItem(SESSION_KEY, summary.id);
    setMobilePane('detail');
  }

  async function handleEnable() {
    try {
      await enable.mutateAsync();
      toastSuccess('Sandbox inbox enabled.');
    } catch (err) {
      toastError(err, 'Could not enable inbox');
    }
  }

  async function handleRefresh() {
    await Promise.all([refetchSandbox(), refetchMessages(), refetchMessage()]);
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toastSuccess('All messages marked as read.');
    } catch (err) {
      toastError(err, 'Could not mark messages as read');
    }
  }

  async function handleClearAll() {
    try {
      await clearAll.mutateAsync();
      setSelectedMessageId(null);
      setSelectedSummary(null);
      sessionStorage.removeItem(SESSION_KEY);
      setClearDialogOpen(false);
      toastSuccess('Inbox cleared.');
    } catch (err) {
      toastError(err, 'Could not clear inbox');
    }
  }

  async function copyEnvSnippet() {
    if (!inbox) return;
    const snippet = `SMTP_HOST=${inbox.smtp_host}\nSMTP_PORT=${inbox.smtp_port}\nSMTP_USER=${inbox.username}\nSMTP_PASS=${inbox.password}`;
    await navigator.clipboard.writeText(snippet);
    toastSuccess('SMTP credentials copied.');
  }

  if (sandboxLoading) {
    return (
      <DashboardLayout flush>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!inbox) {
    return (
      <DashboardLayout>
        <div className="mx-auto mt-16 max-w-lg border border-border bg-card p-10 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 text-xl font-medium">Enable your sandbox inbox</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Connect your app via SMTP to capture test emails in this workspace.
          </p>
          <button
            onClick={handleEnable}
            disabled={enable.isPending}
            data-testid="inbox-enable"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {enable.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Enable inbox
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const displayMessage: EmailMessage | EmailMessageSummary | null = message ?? selectedSummary;
  const from = displayMessage ? parseEmailAddress(displayMessage.from) : null;
  const analysis = message?.analysis;
  const unreadCount = inbox?.unread_count ?? messages.filter((m) => !m.is_read).length;

  return (
    <DashboardLayout flush>
      <div className="flex min-h-0 flex-1 flex-col">
       
        <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_1fr]">
          <aside
            className={`min-h-0 flex-col border-b border-border bg-card lg:border-b-0 lg:border-r ${
              mobilePane === 'detail' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="space-y-3 border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Inbox</span>
                  {unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1.5 font-mono text-[10px] font-semibold text-primary">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <IconTooltip side="top" label="Mark all as read">
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
                    >
                      <MailOpen className="h-3.5 w-3.5" />
                    </button>
                  </IconTooltip>
                  <IconTooltip side="top" label="Refresh">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={messagesFetching}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${messagesFetching ? 'animate-spin' : ''}`} />
                    </button>
                  </IconTooltip>
                  <IconTooltip side="top" label="Clear all emails">
                    <button
                      type="button"
                      onClick={() => setClearDialogOpen(true)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </IconTooltip>
                  <IconTooltip side="top" label="SMTP credentials" side="right">
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary lg:inline-flex"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </IconTooltip>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(searchInput.trim());
                }}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search emails..."
                    className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs"
                  />
                </div>
              </form>

              <label className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Unread only</span>
                <Switch
                  checked={unreadOnly}
                  onCheckedChange={setUnreadOnly}
                  className="scale-90"
                />
              </label>
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
                  <p className="text-xs text-muted-foreground">No emails yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Emails will appear here in real-time
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
                          data-testid={`inbox-message-${m.id}`}
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
                              {(m.subject || '(No Subject)').slice(0, 28)}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                              {formatRelativeInboxTime(m.created_at)}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 truncate text-xs ${
                              m.is_read ? 'font-normal text-muted-foreground' : 'font-semibold text-foreground'
                            }`}
                          >
                            {!m.is_read && (
                              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            )}
                            <span className="truncate">{m.from ?? ''}</span>
                          </div>
                         
                        </button>
                      </li>
                    );
                  })}
                </ul>
           
              )}
              {hasNextPage ? (
                <div ref={loadMoreRef} className="flex items-center justify-center py-4 text-muted-foreground">
                  {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                </div>
              ) : null}
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
                      <IconTooltip side="top" label="Back to message list">
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
                            <span className="break-all">{displayMessage.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {displayMessage.created_at
                            ? formatRelativeInboxTime(displayMessage.created_at)
                            : '—'}
                        </span>
                        {'formatted_size' in displayMessage && displayMessage.formatted_size && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {displayMessage.formatted_size}
                          </span>
                        )}
                        {analysis?.html_support_score != null && (
                          <span className="font-mono text-[10.5px] text-muted-foreground  mt-2">
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
                          data-testid={`inbox-detail-tab-${t.id}`}
                          className={`whitespace-nowrap border-b-2 px-3 pt-2 pb-1 font-display font-semibold text-xs transition-colors ${
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
                        </button>
                      ))}
                    </div>
                    {detailTab === 'html' && (
                      <div className="flex shrink-0 items-center border-l border-r border-border bg-background ">
                        {(
                          [
                            ['desktop', Laptop, 'Desktop'],
                            ['mobile', Smartphone, 'Mobile'],
                          ] as const
                        ).map(([mode, Icon, label]) => (
                            <button
                              type="button"
                              onClick={() => setPreviewMode(mode)}
                              className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${
                                previewMode === mode
                                  ? 'bg-accent text-foreground'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{label}</span>
                            </button>
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
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {clearDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-lg">
            <h3 className="text-base font-medium">Clear all emails?</h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              This permanently deletes all messages in your sandbox inbox.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClearDialogOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearAll.isPending}
                className="rounded-md bg-destructive px-3 py-1.5 text-[13px] text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {clearAll.isPending ? 'Clearing…' : 'Clear all'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-medium">Sandbox SMTP credentials</h3>
              <IconTooltip label="Close">
                <button type="button" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </IconTooltip>
            </div>
            <div className="space-y-0.5 p-4 font-mono text-[12px]">
              <SettingsRow label="Host" value={inbox.smtp_host} />
              <SettingsRow label="Port" value={String(inbox.smtp_port)} />
              <SettingsRow label="Username" value={inbox.username} />
              <div className="grid grid-cols-[88px_1fr] gap-3 py-2">
                <span className="text-muted-foreground">Password</span>
                <IconTooltip label={showPassword ? 'Hide password' : 'Show password'}>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex items-center gap-1.5 break-all text-left hover:text-foreground"
                  >
                    {showPassword ? inbox.password : '••••••••••••••••'}
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </IconTooltip>
              </div>
            </div>
            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={copyEnvSnippet}
                className="w-full rounded-md border border-border py-2 text-[12.5px] hover:bg-accent"
              >
                Copy .env snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
