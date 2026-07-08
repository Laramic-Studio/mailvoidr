import { Plus, ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useWorkspaceMutations,
  useWorkspaces,
  workspaceInitials,
} from '@/hooks/useWorkspaces';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { Workspace } from '@/types';

interface WorkspaceSwitcherProps {
  expanded?: boolean;
}

function WorkspaceMeta({ workspace }: { workspace: Workspace }) {
  const subtitle = [workspace.plan, workspace.region].filter(Boolean).join(' · ')
    || workspace.role;

  return (
    <>
      <p className="truncate text-[13px] font-medium leading-tight capitalize">{workspace.name}</p>
      {subtitle && (
        <p className="truncate text-[11px] text-muted-foreground font-heading uppercase leading-tight mt-0.5">
          {subtitle}
        </p>
      )}
    </>
  );
}

export function WorkspaceSwitcher({ expanded = false }: WorkspaceSwitcherProps) {
  const nav = useNavigate();
  const {
    workspaces,
    currentWorkspace,
    activeWorkspaceId,
    data,
    isLoading,
    isError,
    refetch,
  } = useWorkspaces();
  const workspaceQuota = data?.meta?.owned_workspaces;
  const quotaLoaded = !isLoading && Boolean(data);
  const createBlocked = quotaLoaded && workspaceQuota?.can_create === false;
  const workspaceBlockedReason = workspaceQuota?.blocked_reason
    ?? 'You cannot create another workspace on your current plan.';
  const { switchWorkspace } = useWorkspaceMutations();
  const active = currentWorkspace;
  const activeLabel = active?.name ?? (activeWorkspaceId ? 'Workspace' : null);

  async function handleSwitch(workspaceId: string) {
    if (workspaceId === active?.id) return;

    try {
      await switchWorkspace.mutateAsync(workspaceId);
    } catch (err) {
      toastError(err, 'Could not switch workspace');
    }
  }

  function handleCreateWorkspace() {
    if (createBlocked) {
      toastError(null, workspaceBlockedReason);
      return;
    }

    nav('/workspaces');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="workspace-switcher"
          title={expanded ? undefined : activeLabel ?? undefined}
          className={cn(
            'group flex items-center rounded-md text-left transition-colors',
            'hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            expanded ? 'w-full gap-2 px-2 py-1.5' : 'h-9 w-9 justify-center',
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-[10px] text-primary-foreground">
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : active ? (
              workspaceInitials(active.name)
            ) : (
              '—'
            )}
          </div>

          {!expanded ? null : (
            <>
              <div className="min-w-0 flex-1">
                {isLoading ? (
                  <p className="text-[13px] font-medium text-muted-foreground">Loading workspaces…</p>
                ) : active ? (
                  <WorkspaceMeta workspace={active} />
                ) : isError ? (
                  <p className="text-[13px] font-medium text-destructive">Could not load workspaces</p>
                ) : (
                  <p className="text-[13px] font-medium text-muted-foreground">Select workspace</p>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px]"
        align="start"
        side={expanded ? 'bottom' : 'right'}
        sideOffset={expanded ? 4 : 8}
      >
        <DropdownMenuLabel className="label-heading">Workspaces</DropdownMenuLabel>
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-3 text-[12px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading workspaces…
          </div>
        ) : isError ? (
          <div className="space-y-2 px-2 py-3">
            <p className="text-[12px] text-destructive">Could not load workspaces.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-[12px] text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : workspaces.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-muted-foreground">No workspaces found.</p>
        ) : (
          workspaces.map((workspace) => {
          const isActive = workspace.id === active?.id;

          return (
            <DropdownMenuItem
              key={workspace.id}
              className="flex items-center gap-2.5 py-2"
              data-testid={`workspace-option-${workspace.slug}`}
              onSelect={() => {
                void handleSwitch(workspace.id);
              }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted font-heading text-[10px]">
                {workspaceInitials(workspace.name)}
              </div>
              <div className="min-w-0 flex-1">
                <WorkspaceMeta workspace={workspace} />
              </div>
              {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => handleCreateWorkspace()}
          className={cn('gap-2', createBlocked && 'opacity-60')}
          title={createBlocked ? workspaceBlockedReason : undefined}
        >
          <Plus className="h-3.5 w-3.5" />
          New workspace
        </DropdownMenuItem>
     
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
