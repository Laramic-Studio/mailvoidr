import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useHealth } from "@/hooks/useHealth";
import { workspaceInitials } from "@/hooks/useWorkspaces";
import { MARKETING_NAV, MARKETING_SOCIAL } from "@/content/marketing/nav";
import { ArrowRight, Github, LayoutDashboard, Menu, Twitter } from "lucide-react";
import { GitHubLight, LinkedIn, GitHubDark, XDark, XLight } from "developer-icons";
import { useTheme } from "next-themes";

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const GithubIcon = !isDark ? GitHubDark : GitHubLight;
  const XIcon = !isDark ? XDark : XLight;
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { data: apiHealthy, isLoading: healthLoading } = useHealth();
  const statusLabel = healthLoading
    ? "Checking API…"
    : apiHealthy
      ? "API operational"
      : "API unreachable";
  const statusClass = apiHealthy ? "bg-primary" : healthLoading ? "bg-muted-foreground" : "bg-destructive";

  async function handleLogout() {
    await logout();
    nav("/");
  }

  const showAuthenticatedNav = isAuthenticated && !isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4 md:gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {MARKETING_NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  data-testid={`nav-${n.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm transition-colors ${
                      isActive || pathname.startsWith(n.to)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                data-testid="nav-mobile-menu"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(88vw,320px)]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1">
                  {MARKETING_NAV.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-md px-3 py-2.5 text-sm transition-colors ${
                          isActive || pathname.startsWith(n.to)
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`
                      }
                    >
                      {n.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6">
                  {showAuthenticatedNav ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogout();
                        }}
                        className="rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md border border-border px-4 py-2.5 text-center text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Get started <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <ThemeToggle />
            {showAuthenticatedNav ? (
              <>
                <Link
                  to="/dashboard"
                  data-testid="nav-dashboard-btn"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-1.5 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger data-testid="nav-user-menu">
                    <Avatar className="h-8 w-8 border border-border">
                      {user?.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-card font-mono text-[11px]">
                        {user ? workspaceInitials(user.name) : "—"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <div className="text-[13px]">{user?.name ?? "Account"}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{user?.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-link"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  data-testid="nav-get-started-btn"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-1.5 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Email infrastructure for developers. Send, test, and inspect — without leaving your terminal.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={MARKETING_SOCIAL.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex rounded-full h-8 w-8 cursor-pointer items-center justify-center border border-border transition-colors hover:bg-accent"
              >
                <GithubIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={MARKETING_SOCIAL.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="inline-flex rounded-full h-8 w-8 cursor-pointer items-center justify-center border border-border transition-colors hover:bg-accent"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={MARKETING_SOCIAL.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="inline-flex rounded-full h-8 w-8 cursor-pointer items-center justify-center border border-border transition-colors hover:bg-accent"
              >
                <LinkedIn className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <FooterCol title="Product" links={[["Features","/features"],["Pricing","/pricing"],["Status","/status"]]} />
          <FooterCol title="Developers" links={[["Documentation","/docs"],["API reference","/docs/api-reference"],["Webhooks","/docs/webhooks"],["Quickstart","/docs/quickstart"]]} />
          <FooterCol title="Company" links={[["About","/about"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]]} />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12.5px] text-muted-foreground">
            <span>© 2026 Mailvoidr, Inc. — By developers, for developers.</span>

            <div className="flex items-center gap-5 font-mono text-[11px]">
              <Link to="/status" className="inline-flex items-center gap-1.5 hover:text-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${statusClass} ${apiHealthy ? "animate-pulse" : ""}`} />
                {statusLabel}
              </Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="label-mono mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
