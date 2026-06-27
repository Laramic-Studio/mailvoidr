import { Plus, ChevronsUpDown, Check } from 'lucide-react';
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
  const { workspaces, currentWorkspace } = useWorkspaces();
  const { switchWorkspace } = useWorkspaceMutations();
  const active = currentWorkspace;

  async function handleSwitch(workspaceId: string) {
    if (workspaceId === active?.id) return;

    try {
      await switchWorkspace.mutateAsync(workspaceId);
    } catch (err) {
      toastError(err, 'Could not switch workspace');
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="workspace-switcher"
          title={expanded ? undefined : active?.name}
          className={cn(
            'group flex items-center rounded-md text-left transition-colors',
            'hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            expanded ? 'w-full gap-2 px-2 py-1.5' : 'h-9 w-9 justify-center',
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-[10px] text-primary-foreground">
            {active ? workspaceInitials(active.name) : '—'}
          </div>

          {!expanded ? null : (
            <>
              <div className="min-w-0 flex-1">
                {active ? (
                  <WorkspaceMeta workspace={active} />
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
        {workspaces.map((workspace) => {
          const isActive = workspace.id === active?.id;

          return (
            <DropdownMenuItem
              key={workspace.id}
              className="flex items-center gap-2.5 py-2"
              data-testid={`workspace-option-${workspace.slug}`}
              onClick={() => handleSwitch(workspace.id)}
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
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => nav('/workspaces')} className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
