import { NavLink, Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard, Send, FlaskConical, Inbox, Globe, BarChart3, ListChecks,
  FileCode2, KeyRound, Server, Webhook, Users, CreditCard, Settings, Search,
  Command, ChevronDown, Bell, BookOpen, Plus, ChevronsUpDown
} from "lucide-react";
import { WORKSPACES, USER } from "@/lib/dummyData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
      { to: "/dashboard/send", icon: Send, label: "Email Sending" },
      { to: "/dashboard/testing", icon: FlaskConical, label: "Email Testing" },
      { to: "/dashboard/inboxes", icon: Inbox, label: "Inboxes", badge: "126" },
    ],
  },
  {
    label: "Operate",
    items: [
      { to: "/dashboard/domains", icon: Globe, label: "Domains" },
      { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      { to: "/dashboard/logs", icon: ListChecks, label: "Email Logs" },
      { to: "/dashboard/templates", icon: FileCode2, label: "Templates" },
    ],
  },
  {
    label: "Developer",
    items: [
      { to: "/dashboard/api-keys", icon: KeyRound, label: "API Keys" },
      { to: "/dashboard/smtp", icon: Server, label: "SMTP" },
      { to: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/dashboard/teams", icon: Users, label: "Team" },
      { to: "/dashboard/billing", icon: CreditCard, label: "Billing" },
      { to: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function DashboardLayout({ children }) {
  const { pathname } = useLocation();
  const ws = WORKSPACES[0];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-card">
        <div className="h-14 px-4 flex items-center border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full" data-testid="workspace-switcher">
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center text-[10px] font-mono">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[13px] truncate">{ws.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono uppercase">{ws.plan} · {ws.region}</div>
                  </div>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[244px]" align="start">
              <DropdownMenuLabel className="label-mono">Workspaces</DropdownMenuLabel>
              {WORKSPACES.map((w) => (
                <DropdownMenuItem key={w.id} className="flex items-center gap-2" data-testid={`workspace-option-${w.slug}`}>
                  <div className="h-5 w-5 rounded bg-muted inline-flex items-center justify-center text-[10px] font-mono">{w.name.slice(0,2).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="text-[13px]">{w.name}</div>
                    <div className="text-[10.5px] text-muted-foreground font-mono">{w.plan}</div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem><Plus className="h-3.5 w-3.5 mr-2" />New workspace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-none px-2 py-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="label-mono px-2 mb-1.5">{group.label}</div>
              <ul className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, end, badge }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      data-testid={`side-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                          isActive
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </span>
                      {badge && (
                        <span className="font-mono text-[10px] text-muted-foreground border border-border px-1.5 rounded">{badge}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <Link to="/docs" data-testid="sidebar-docs-link" className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground px-1 py-1">
            <BookOpen className="h-3.5 w-3.5" /> Documentation
          </Link>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="label-mono mb-1">Plan usage</div>
            <div className="text-[12px] flex items-center justify-between">
              <span>1.2M / 5M</span>
              <span className="text-muted-foreground font-mono">24%</span>
            </div>
            <div className="mt-1.5 h-1 bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "24%" }} />
            </div>
            <Link to="/dashboard/billing" className="mt-3 inline-flex items-center text-[11.5px] text-primary hover:underline">
              Upgrade plan →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 flex items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                data-testid="global-search"
                type="text"
                placeholder="Search logs, inboxes, domains…"
                className="w-full bg-card border border-border rounded-md pl-8 pr-16 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 border border-border rounded font-mono text-[10px] text-muted-foreground">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/send" data-testid="topbar-send-btn" className="hidden md:inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-primary/90 transition-colors">
              <Send className="h-3.5 w-3.5" /> Send email
            </Link>
            <button data-testid="topbar-notifications" className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="user-menu-trigger">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="text-[11px] font-mono bg-card">{USER.avatar}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <div className="text-[13px]">{USER.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{USER.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard/settings">Profile settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dashboard/billing">Billing</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dashboard/teams">Team</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/workspaces">Switch workspace</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/login">Sign out</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 min-w-0" data-testid="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
