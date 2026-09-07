import { useEffect, useState, type ReactNode } from "react";
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
import {
  ArrowRight,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import {
  GitHubLight,
  GitHubDark,
  XDark,
  XLight,
} from "developer-icons";
import { useTheme } from "next-themes";
import Footer from "./footer";

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const GithubIcon = !isDark ? GitHubDark : GitHubLight;
  const XIcon = !isDark ? XDark : XLight;
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { data: apiHealthy, isLoading: healthLoading } = useHealth();
  const statusLabel = healthLoading
    ? "Checking API…"
    : apiHealthy
      ? "API operational"
      : "API unreachable";
  const statusClass = apiHealthy
    ? "bg-primary"
    : healthLoading
      ? "bg-muted-foreground"
      : "bg-destructive";

  async function handleLogout() {
    await logout();
    nav("/");
  }

  const showAuthenticatedNav = isAuthenticated && !isLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "border-b border-transparent"
        }`}
      >
        <div className={
          `
          flex items-center justify-between mx-auto max-w-7xl
          ${ scrolled ? 'my-3' : 'mt-7'}
          `
        }>
          
          <div className="flex items-center gap-4 md:gap-8">
            <Logo className="text-lg" />
            <nav className="items-center hidden gap-1 md:flex">
              {MARKETING_NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  data-testid={`nav-${n.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-base transition-colors ${
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
                className="inline-flex items-center justify-center transition-colors border rounded-md cursor-pointer h-9 w-9 border-border text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(88vw,320px)]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-8">
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
                <div className="flex flex-col gap-2 pt-6 mt-8 border-t border-border">
                  {showAuthenticatedNav ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex items-center justify-center gap-1.5 rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                        className="rounded border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors bg-accent hover:text-foreground"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="rounded h-10 bg-muted px-4 py-2.5 text-center text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                  className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded hover:bg-primary/90 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger data-testid="nav-user-menu">
                    <Avatar className="w-8 h-8 border border-border">
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
                      <div className="text-[13px]">
                        {user?.name ?? "Account"}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-link"
                  className="hidden h-9 border border-accent sm:inline-flex items-center rounded px-4 py-1.5 text-sm text-muted-foreground bg-accent hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  data-testid="nav-get-started-btn"
                  className="inline-flex h-9 items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded hover:bg-primary/90"
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer MARKETING_SOCIAL={MARKETING_SOCIAL} statusClass={statusClass} statusLabel={statusLabel} MARKETING_NAV={MARKETING_NAV} apiHealthy={apiHealthy}/>
    </div>
  );
}
