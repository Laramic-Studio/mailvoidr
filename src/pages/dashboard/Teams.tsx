import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { DisabledWithTooltip } from '@/components/DisabledWithTooltip';
import { TeamInviteDialog } from '@/components/dashboard/TeamInviteDialog';
import { TeamMemberManageDialog } from '@/components/dashboard/TeamMemberManageDialog';
import {
  useTeamActivity,
  useTeamInvitations,
  useTeamMembers,
  useTeamMutations,
} from '@/hooks/useTeam';
import { useWorkspaces, workspaceInitials } from '@/hooks/useWorkspaces';
import { toastError, toastSuccess } from '@/lib/toast';
import type { TeamInvitation, TeamMember } from '@/types';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_STYLES: Record<string, string> = {
  Owner: 'border-primary/40 text-primary bg-primary/10',
  Admin: 'border-blue-500/40 text-blue-500 bg-blue-500/10',
  Developer: 'border-border text-foreground',
  'Billing Manager': 'border-amber-500/40 text-amber-500 bg-amber-500/10',
  Viewer: 'border-border text-muted-foreground',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelative(value: string | null): string {
  if (!value) return '—';
  const target = new Date(value).getTime();
  const diffMs = target - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export default function Teams() {
  const [tab, setTab] = useState('members');
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [memberToManage, setMemberToManage] = useState<TeamMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [invitationToRevoke, setInvitationToRevoke] = useState<TeamInvitation | null>(null);
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null);

  const { activeWorkspaceId, isLoading: workspacesLoading, isError: workspacesError } = useWorkspaces();
  const workspaceId = activeWorkspaceId;

  const membersQuery = useTeamMembers(workspaceId);
  const membersLoaded = membersQuery.isSuccess;
  const canManage = membersQuery.data?.meta.can_manage ?? false;
  const canInvite = membersQuery.data?.meta.can_invite ?? false;
  const inviteBlockedReason = membersQuery.data?.meta.invite_blocked_reason;
  const showInviteButton = membersLoaded && (canManage || canInvite);
  const defaultMemberRole = membersQuery.data?.meta.default_member_role ?? 'developer';
  const invitationsQuery = useTeamInvitations(
    membersQuery.isSuccess && canManage ? workspaceId : null,
  );
  const activityQuery = useTeamActivity(workspaceId);
  const { invite, updateRole, removeMember, revokeInvitation, resendInvitation } = useTeamMutations(workspaceId);

  const members = membersQuery.data?.data ?? [];
  const rolesEnabled = membersQuery.data?.meta.roles_enabled ?? false;
  const assignableRoles = membersQuery.data?.meta.assignable_roles ?? [];
  const invitations = invitationsQuery.data?.data ?? [];
  const activities = activityQuery.data?.data ?? [];

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  async function handleInvite(payload: { emails: string[]; role: string }) {
    if (!canInvite) {
      toastError(null, inviteBlockedReason ?? 'Inviting members is not available on your current plan.');
      return;
    }

    try {
      const result = await invite.mutateAsync(payload);
      toastSuccess(result.message);
      if (result.skipped.length > 0) {
        toastError(null, `Skipped ${result.skipped.length} address(es) — already invited or a workspace member.`);
      }
    } catch (error) {
      toastError(error, 'Could not send invitations.');
      throw error;
    }
  }

  async function handleSaveRole(userId: string, role: string) {
    try {
      const result = await updateRole.mutateAsync({ userId, role });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not update role.');
      throw error;
    }
  }

  async function handleRemoveConfirm() {
    if (!memberToRemove) return;
    try {
      const result = await removeMember.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
      setMemberToManage(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not remove member.');
    }
  }

  async function handleRevokeConfirm() {
    if (!invitationToRevoke) return;
    try {
      const result = await revokeInvitation.mutateAsync(invitationToRevoke.id);
      setInvitationToRevoke(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not revoke invitation.');
    }
  }

  async function handleResend(invitation: TeamInvitation) {
    setResendingInvitationId(invitation.id);
    try {
      const result = await resendInvitation.mutateAsync(invitation.id);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not resend invitation.');
    } finally {
      setResendingInvitationId(null);
    }
  }

  const tabs = [
    ['members', `Members · ${members.length}`],
    ['invitations', `Invitations · ${invitations.length}`],
    ...(rolesEnabled ? [['roles', 'Roles'] as const] : []),
    ['activity', 'Activity'],
  ] as const;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Team"
        description="Invite collaborators. Assign granular roles. Track activity."
        actions={
          !membersLoaded ? null : showInviteButton ? (
            canInvite ? (
              <button
                type="button"
                data-testid="team-invite"
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="h-3 w-3" /> Invite member
              </button>
            ) : (
              <DisabledWithTooltip
                tooltip={inviteBlockedReason ?? 'Inviting members is not available on your current plan.'}
              >
                <button
                  type="button"
                  data-testid="team-invite"
                  disabled
                  aria-disabled="true"
                  title={inviteBlockedReason ?? undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground',
                    'cursor-not-allowed opacity-60',
                  )}
                >
                  <UserPlus className="h-3 w-3" /> Invite member
                </button>
              </DisabledWithTooltip>
            )
          ) : null
        }
      />

      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            data-testid={`team-tab-${id}`}
            className={`px-3.5 py-2 text-[13px] transition-colors ${
              tab === id
                ? '-mb-px border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members…"
                className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-[13px]"
              />
            </div>
          </div>

          <div className="border border-border bg-card">
            {!workspaceId ? (
              workspacesLoading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-[13px] text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading workspace…
                </div>
              ) : workspacesError ? (
                <div className="p-8 text-center text-[13px] text-destructive">
                  Could not load your workspace. Refresh the page or switch workspace from the sidebar.
                </div>
              ) : (
                <div className="p-8 text-center text-[13px] text-muted-foreground">
                  No workspace selected. Choose one from the sidebar switcher.
                </div>
              )
            ) : membersQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
              </div>
            ) : membersQuery.isError ? (
              <div className="p-8 text-center text-[13px] text-destructive">Could not load team members.</div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left label-mono">Member</th>
                    <th className="p-3 text-left label-mono">Role</th>
                    <th className="p-3 text-left label-mono">Joined</th>
                    <th className="p-3 text-left label-mono">Last active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 font-mono text-[10.5px]">
                            {workspaceInitials(member.name)}
                          </div>
                          <div>
                            <div className="text-[13px]">{member.name}</div>
                            <div className="font-mono text-[11.5px] text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider ${
                            ROLE_STYLES[member.role_label] ?? 'border-border text-foreground'
                          }`}
                        >
                          {member.role_label}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{formatDate(member.joined_at)}</td>
                      <td className="p-3 font-mono text-muted-foreground">{formatDate(member.last_active_at)}</td>
                      <td className="p-3 text-right">
                        {canManage && member.role !== 'owner' ? (
                          <button
                            type="button"
                            onClick={() => setMemberToManage(member)}
                            className="text-[12px] text-muted-foreground hover:text-foreground"
                          >
                            Manage
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'invitations' && (
        <div className="border border-border bg-card">
          {!canManage ? (
            <div className="p-8 text-center text-[13px] text-muted-foreground">
              Only workspace owners and admins can view pending invitations.
            </div>
          ) : invitationsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading invitations…
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-muted-foreground">No pending invitations.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left label-mono">Email</th>
                  <th className="p-3 text-left label-mono">Role</th>
                  <th className="p-3 text-left label-mono">Sent</th>
                  <th className="p-3 text-left label-mono">Expires in</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="p-3 font-mono">{invitation.email}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10.5px] uppercase ${
                          ROLE_STYLES[invitation.role_label] ?? 'border-border'
                        }`}
                      >
                        {invitation.role_label}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{formatDate(invitation.invited_at)}</td>
                    <td className="p-3 font-mono text-muted-foreground">{formatRelative(invitation.expires_at)}</td>
                    <td className="space-x-3 p-3 text-right">
                      <button
                        type="button"
                        disabled={resendingInvitationId === invitation.id}
                        onClick={() => handleResend(invitation)}
                        className="text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-60"
                      >
                        {resendingInvitationId === invitation.id ? 'Sending…' : 'Resend'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvitationToRevoke(invitation)}
                        className="text-[12px] text-destructive hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'roles' && (
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Owner', 'Full access. Cannot be removed unless ownership transfers.'],
            ['Admin', 'Manage members, billing, and all resources.'],
            ['Developer', 'Create and manage API keys, domains, templates. No billing.'],
            ['Billing Manager', 'Billing, invoices, and plan management only.'],
            ['Viewer', 'Read-only access to logs and analytics.'],
          ].map(([role, desc]) => (
            <div key={role} className="bg-card p-5">
              <span
                className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10.5px] uppercase ${
                  ROLE_STYLES[role] ?? 'border-border'
                }`}
              >
                {role}
              </span>
              <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'activity' && (
        <div className="divide-y divide-border border border-border bg-card">
          {activityQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-muted-foreground">No team activity yet.</div>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted font-mono text-[10.5px]">
                  {workspaceInitials(item.actor?.name ?? 'S')}
                </div>
                <div className="flex-1 text-[12.5px]">{item.summary}</div>
                <span className="font-mono text-[11.5px] text-muted-foreground">
                  {formatDate(item.occurred_at)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <TeamInviteDialog
        open={showInvite && canInvite}
        onOpenChange={setShowInvite}
        roles={assignableRoles}
        defaultRole={defaultMemberRole}
        lockRole={canInvite && !canManage}
        onInvite={handleInvite}
        isPending={invite.isPending}
      />

      <TeamMemberManageDialog
        open={Boolean(memberToManage)}
        onOpenChange={(open) => !open && setMemberToManage(null)}
        member={memberToManage}
        roles={assignableRoles}
        onSave={handleSaveRole}
        onRemove={setMemberToRemove}
        isPending={updateRole.isPending}
      />

      <ConfirmDeleteDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        resourceName={memberToRemove?.email ?? ''}
        resourceLabel="member email"
        title="Remove team member"
        description={
          memberToRemove
            ? `Remove ${memberToRemove.email} from this workspace? Type their email below to confirm.`
            : undefined
        }
        confirmLabel="Remove member"
        onConfirm={handleRemoveConfirm}
        isPending={removeMember.isPending}
        testId="team-remove-dialog"
      />

      <ConfirmDeleteDialog
        open={Boolean(invitationToRevoke)}
        onOpenChange={(open) => !open && setInvitationToRevoke(null)}
        resourceName={invitationToRevoke?.email ?? ''}
        resourceLabel="invitation email"
        title="Revoke invitation"
        description={
          invitationToRevoke
            ? `Revoke the invitation for ${invitationToRevoke.email}? Type their email below to confirm.`
            : undefined
        }
        confirmLabel="Revoke invitation"
        onConfirm={handleRevokeConfirm}
        isPending={revokeInvitation.isPending}
        testId="team-revoke-dialog"
      />
    </DashboardLayout>
  );
}
