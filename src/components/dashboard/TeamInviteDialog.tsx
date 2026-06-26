import { type FormEvent, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormSelect } from '@/components/form/FormSelect';
import { SubmitButton } from '@/components/SubmitButton';
import type { WorkspaceRoleOption } from '@/types';

interface TeamInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: WorkspaceRoleOption[];
  defaultRole?: string;
  lockRole?: boolean;
  onInvite: (payload: { emails: string[]; role: string }) => Promise<void>;
  isPending?: boolean;
}

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function TeamInviteDialog({
  open,
  onOpenChange,
  roles,
  defaultRole = 'developer',
  lockRole = false,
  onInvite,
  isPending = false,
}: TeamInviteDialogProps) {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState(defaultRole);

  useEffect(() => {
    if (open) {
      setRole(defaultRole);
    }
  }, [open, defaultRole]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseEmails(emails);
    if (parsed.length === 0) return;
    await onInvite({ emails: parsed, role });
    setEmails('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="team-invite-modal" className="max-w-md border-border sm:rounded-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-medium">Invite team members</DialogTitle>
            <DialogDescription className="text-[13px]">
              We&apos;ll email each address a link to join. New users can create an account from the invite.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="team-invite-emails" className="label-mono mb-1.5 block">
                Email addresses
              </label>
              <textarea
                id="team-invite-emails"
                data-testid="team-invite-emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={4}
                placeholder="dev@company.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <FormSelect
              label="Role"
              value={role}
              onValueChange={setRole}
              options={roles}
              disabled={lockRole || roles.length <= 1}
              data-testid="team-invite-role"
            />
            {roles.length <= 1 ? (
              <p className="text-[12px] text-muted-foreground">
                Custom roles are available on the Growth plan and above.
              </p>
            ) : null}
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Cancel
            </button>
            <SubmitButton
              type="submit"
              loading={isPending}
              disabled={parseEmails(emails).length === 0}
              data-testid="team-invite-submit"
              className="w-auto rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              Send invitations
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
