import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import {
  SIDEBAR_EASE,
  SIDEBAR_TRANSITION_MS,
} from '@/components/dashboard/sidebar-constants';
import {
  GlobalSearchDialog,
  GlobalSearchTrigger,
  useGlobalSearchShortcut,
} from '@/components/dashboard/GlobalSearchDialog';
import { DashboardHeaderBreadcrumb } from '@/components/dashboard/DashboardHeaderBreadcrumb';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { Send, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useEmailSearchEnabled } from '@/hooks/useBilling';
import { workspaceInitials } from '@/hooks/useWorkspaces';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { WorkspaceTwoFactorBanner } from '@/components/dashboard/WorkspaceTwoFactorBanner';

export function DashboardLayout({
  children,
  flush = false,
}: {
  children: ReactNode;
  flush?: boolean;
}) {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const emailSearchEnabled = useEmailSearchEnabled();
  const hydrated = useUiStore((s) => s.hydrated);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const hydrate = useUiStore((s) => s.hydrate);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => {
    if (emailSearchEnabled) {
      setSearchOpen(true);
    }
  }, [emailSearchEnabled]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useGlobalSearchShortcut(openSearch, emailSearchEnabled);

  async function handleLogout() {
    await logout();
    nav('/login');
  }

  const collapsed = !hydrated || sidebarCollapsed;
  const expanded = !collapsed;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        <aside
          className={cn(
            'hidden h-full shrink-0 flex-col overflow-hidden border-r border-border bg-card lg:flex',
            'transition-[width] ease-[var(--sidebar-ease)] will-change-[width]',
            expanded ? 'w-[240px]' : 'w-[52px]',
          )}
          style={{
            ['--sidebar-ease' as string]: SIDEBAR_EASE,
            transitionDuration: `${SIDEBAR_TRANSITION_MS}ms`,
          }}
        >
          <DashboardSidebar expanded={expanded} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
            <div className="flex max-w-md flex-1 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    data-testid="mobile-nav-toggle"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <DashboardSidebar
                    expanded
                    showCollapseToggle={false}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {emailSearchEnabled ? (
                <GlobalSearchTrigger onOpen={openSearch} />
              ) : (
                <DashboardHeaderBreadcrumb />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/send"
                data-testid="topbar-send-btn"
                className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
              >
                <Send className="h-3.5 w-3.5" />
                Send email
              </Link>
              <NotificationBell />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="user-menu-trigger">
                  <Avatar className="h-8 w-8 border border-border">
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-card font-mono text-[11px]">
                      {user ? workspaceInitials(user.name) : '—'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <div className="text-[13px]">{user?.name ?? 'Account'}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">Profile settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/billing">Billing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/teams">Team</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/workspaces">Switch workspace</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main
            className={cn(
              'min-h-0 flex-1 overflow-y-auto',
              flush ? 'flex flex-col p-0' : 'px-4 py-6 lg:px-8 lg:py-8',
            )}
            data-testid="dashboard-main"
          >
            <div className={flush ? 'px-4 pt-4' : undefined}>
              <WorkspaceTwoFactorBanner />
            </div>
            {children}
          </main>
        </div>
      </div>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  );
}
