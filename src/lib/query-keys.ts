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
      ["virtual-emails", inboxId, "messages", search ?? ""] as const,
    message: (inboxId: string, messageId: string) =>
      ["virtual-emails", inboxId, "messages", messageId] as const,
    messageRaw: (inboxId: string, messageId: string) =>
      ["virtual-emails", inboxId, "messages", messageId, "raw"] as const,
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
  apiKeys: {
    all: ['api-keys'] as const,
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
    list: (filters: Record<string, string | undefined>) =>
      ['sends', 'list', filters.status ?? 'all', filters.search ?? '', filters.domain ?? 'all', filters.period ?? ''] as const,
    detail: (id: string) => ['sends', 'detail', id] as const,
  },
  team: {
    members: (workspaceId: string) => ['team', workspaceId, 'members'] as const,
    invitations: (workspaceId: string) => ['team', workspaceId, 'invitations'] as const,
    activity: (workspaceId: string) => ['team', workspaceId, 'activity'] as const,
  },
} as const;
