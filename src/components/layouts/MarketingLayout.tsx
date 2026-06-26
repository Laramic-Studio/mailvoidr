import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useHealth } from "@/hooks/useHealth";
import { ArrowRight, Github, Twitter } from "lucide-react";

const NAV = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  // { to: "/enterprise", label: "Enterprise" },
  // { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/status", label: "Status" },
];

export function MarketingLayout({ children }) {
  const { pathname } = useLocation();
  const { data: apiHealthy, isLoading: healthLoading } = useHealth();
  const statusLabel = healthLoading
    ? "Checking API…"
    : apiHealthy
      ? "API operational"
      : "API unreachable";
  const statusClass = apiHealthy ? "bg-primary" : healthLoading ? "bg-muted-foreground" : "bg-destructive";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => (
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
            <ThemeToggle />
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
              <a href="#" aria-label="GitHub" className="inline-flex h-8 w-8 items-center justify-center border border-border hover:bg-accent transition-colors">
                <Github className="h-3.5 w-3.5" />
              </a>
              <a href="#" aria-label="Twitter" className="inline-flex h-8 w-8 items-center justify-center border border-border hover:bg-accent transition-colors">
                <Twitter className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <FooterCol title="Product" links={[["Features","/features"],["Pricing","/pricing"],/* ["Enterprise","/enterprise"], ["Changelog","/blog"], */["Status","/status"]]} />
          <FooterCol title="Developers" links={[["Documentation","/docs"],["API reference","/docs/api-reference"],["Webhooks","/docs/webhooks"],["Quickstart","/docs/quickstart"]]} />
          <FooterCol title="Company" links={[["About","/about"],/* ["Blog","/blog"], */["Contact","/contact"]]} />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12.5px] text-muted-foreground">
            <span>© 2026 Mailvoidr, Inc. — Made with restraint in San Francisco & Bengaluru.</span>
            <div className="flex items-center gap-5 font-mono text-[11px]">
              <Link to="/status" className="inline-flex items-center gap-1.5 hover:text-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${statusClass} ${apiHealthy ? "animate-pulse" : ""}`} />
                {statusLabel}
              </Link>
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }) {
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
