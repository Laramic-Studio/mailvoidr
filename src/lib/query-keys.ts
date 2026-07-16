export const queryKeys = {
  health: ["health"] as const,
  me: ["auth", "me"] as const,
  onboarding: {
    status: ["onboarding", "status"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    invitation: (workspaceId: string) => ["invitations", workspaceId] as const,
  },
  invitationToken: (token: string) => ["invitations", "token", token] as const,
  invitations: {
    pending: ["invitations", "pending"] as const,
  },
  virtualEmails: {
    all: (search?: string) => ["virtual-emails", search ?? ""] as const,
    detail: (id: string) => ["virtual-emails", id] as const,
    messages: (inboxId: string, search?: string) =>
      ["virtual-emails", inboxId, "messages", "list", search ?? ""] as const,
    message: (inboxId: string, messageId: string) =>
      ["virtual-emails", inboxId, "messages", "detail", messageId] as const,
    messageRaw: (inboxId: string, messageId: string) =>
      ["virtual-emails", inboxId, "messages", "detail", messageId, "raw"] as const,
  },
  sandbox: {
    all: ['sandbox'] as const,
    messages: (search?: string, unreadOnly?: boolean) =>
      ['sandbox', 'messages', search ?? '', unreadOnly ? 'unread' : 'all'] as const,
    message: (messageId: string) => ['sandbox', 'message', messageId] as const,
    messageRaw: (messageId: string) => ['sandbox', 'message', messageId, 'raw'] as const,
  },
  domains: {
    all: ['domains'] as const,
  },
  whitelistedIps: {
    all: ['whitelisted-ips'] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
    list: (environment: 'live' | 'test') => ['api-keys', environment] as const,
  },
  smtpCredentials: {
    all: ['smtp-credentials'] as const,
  },
  send: {
    history: ['send', 'history'] as const,
  },
  credits: {
    summary: ['credits', 'summary'] as const,
    transactions: ['credits', 'transactions'] as const,
  },
  settings: {
    all: (workspaceId?: string) => ['settings', workspaceId ?? ''] as const,
    twoFactor: ['settings', 'two-factor'] as const,
  },
  sends: {
    list: (filters: {
      status?: string | string[];
      search?: string;
      domain?: string;
      period?: string;
      page?: number;
    }) =>
      [
        'sends',
        'list',
        Array.isArray(filters.status)
          ? [...filters.status].sort().join(',')
          : (filters.status ?? 'all'),
        filters.search ?? '',
        filters.domain ?? 'all',
        filters.period ?? '',
        filters.page ?? 1,
      ] as const,
    detail: (id: string) => ['sends', 'detail', id] as const,
  },
  team: {
    members: (workspaceId: string) => ['team', workspaceId, 'members'] as const,
    invitations: (workspaceId: string) => ['team', workspaceId, 'invitations'] as const,
    activity: (workspaceId: string) => ['team', workspaceId, 'activity'] as const,
  },
  templates: {
    list: (search?: string) => ['templates', 'list', search ?? ''] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
  },
  templateMarketplace: {
    list: (search?: string, category?: string) =>
      ['template-marketplace', 'list', search ?? '', category ?? ''] as const,
    detail: (id: string) => ['template-marketplace', 'detail', id] as const,
  },
  webhooks: {
    all: ['webhooks'] as const,
    deliveries: (webhookId?: string) => ['webhooks', 'deliveries', webhookId ?? 'all'] as const,
  },
  dashboard: {
    overview: (period: string) => ['dashboard', 'overview', period] as const,
    activity: ['dashboard', 'activity'] as const,
  },
  analytics: {
    overview: (period: string) => ['analytics', 'overview', period] as const,
    engagement: (period: string) => ['analytics', 'engagement', period] as const,
    domains: (period: string) => ['analytics', 'domains', period] as const,
    templates: (period: string) => ['analytics', 'templates', period] as const,
  },
  notifications: {
    list: ['notifications', 'list'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  search: {
    global: (query: string) => ['search', query] as const,
  },
  plans: {
    list: (currency: string, volume: number) =>
      ['plans', currency, volume] as const,
  },
  billing: {
    context: (workspaceId?: string) => ['billing', workspaceId ?? ''] as const,
  },
} as const;
