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
} as const;
