import { type ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Send, Search, Command, Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { workspaceInitials } from '@/hooks/useWorkspaces';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export function DashboardLayout({
  children,
  flush = false,
}: {
  children: ReactNode;
  flush?: boolean;
}) {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const hydrated = useUiStore((s) => s.hydrated);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const hydrate = useUiStore((s) => s.hydrate);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function handleLogout() {
    await logout();
    nav('/login');
  }

  const collapsed = hydrated && sidebarCollapsed;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background">
        <aside
          className={cn(
            'hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out lg:flex',
            collapsed ? 'w-[72px]' : 'w-[260px]',
          )}
        >
          <DashboardSidebar collapsed={collapsed} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
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
                    collapsed={false}
                    showCollapseToggle={false}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  data-testid="global-search"
                  type="text"
                  placeholder="Search logs, virtual emails, domains…"
                  className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-16 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-flex">
                  <Command className="h-2.5 w-2.5" />
                  K
                </kbd>
              </div>
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
              <button
                type="button"
                data-testid="topbar-notifications"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
              >
                <Bell className="h-3.5 w-3.5" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="user-menu-trigger">
                  <Avatar className="h-8 w-8 border border-border">
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
              'min-w-0 flex-1',
              flush ? 'flex flex-col overflow-hidden p-0' : 'px-4 py-6 lg:px-8 lg:py-8',
            )}
            data-testid="dashboard-main"
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
