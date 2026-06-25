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
import type { TeamMember, WorkspaceRoleOption } from '@/types';

interface TeamMemberManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  roles: WorkspaceRoleOption[];
  onSave: (userId: string, role: string) => Promise<void>;
  onRemove: (member: TeamMember) => void;
  isPending?: boolean;
}

export function TeamMemberManageDialog({
  open,
  onOpenChange,
  member,
  roles,
  onSave,
  onRemove,
  isPending = false,
}: TeamMemberManageDialogProps) {
  const [role, setRole] = useState(member?.role ?? 'developer');
  const isOwner = member?.role === 'owner';

  useEffect(() => {
    if (member) {
      setRole(member.role);
    }
  }, [member]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!member || isOwner) return;
    await onSave(member.id, role);
    onOpenChange(false);
  }

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="team-manage-modal" className="max-w-md border-border sm:rounded-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-medium">Manage member</DialogTitle>
            <DialogDescription className="text-[13px] font-mono">{member.email}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <FormSelect
              label="Role"
              value={role}
              onValueChange={setRole}
              options={isOwner ? [{ value: 'owner', label: 'Owner' }] : roles}
              disabled={isOwner}
              data-testid="team-manage-role"
            />
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-2">
            {!isOwner && (
              <button
                type="button"
                onClick={() => onRemove(member)}
                className="mr-auto text-[13px] text-destructive hover:underline"
              >
                Remove from workspace
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Cancel
            </button>
            {!isOwner && (
              <SubmitButton
                type="submit"
                loading={isPending}
                data-testid="team-manage-submit"
                className="w-auto rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save role
              </SubmitButton>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
