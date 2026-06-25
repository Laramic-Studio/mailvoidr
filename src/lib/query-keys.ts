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
} as const;
