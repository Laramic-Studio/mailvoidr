import { useState, type ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DocsSearch, DocsSearchMobileLink } from "@/components/docs/DocsSearch";
import { DOCS_NAV, getDocsPagination } from "@/content/docs/nav";
import { MARKETING_SOCIAL } from "@/content/marketing/nav";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight, LayoutDashboard, Menu } from "lucide-react";
import { GitHubLight } from "developer-icons";

interface DocsLayoutProps {
  children: ReactNode;
  toc?: Array<{ id: string; label?: string; title?: string }>;
  title?: string;
}

function DocsSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {DOCS_NAV.map((sec) => (
        <div key={sec.section}>
          <div className="label-mono mb-2">{sec.section}</div>
          <ul className="space-y-0.5 border-l border-border">
            {sec.items.map((it) => (
              <li key={it.slug}>
                <NavLink
                  to={`/docs/${it.slug}`}
                  onClick={onNavigate}
                  data-testid={`docs-nav-${it.slug}`}
                  className={({ isActive }) =>
                    `block -ml-px pl-3 py-1 text-[13px] border-l transition-colors ${
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`
                  }
                >
                  {it.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsLayout({ children, toc = [] }: DocsLayoutProps) {
  const { slug } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { prev, next } = getDocsPagination(slug);
  const showAuthenticatedNav = isAuthenticated && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
                aria-label="Open docs navigation"
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(88vw,300px)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <DocsSidebarNav onNavigate={() => setMobileNavOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <Logo />
            <Link
              to="/docs"
              className="hidden font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground md:inline-flex border-l border-border pl-6"
            >
              Docs
            </Link>
          </div>

          <div className="hidden max-w-md flex-1 px-6 md:flex">
            <DocsSearch />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <DocsSearchMobileLink />
            <a
              href={MARKETING_SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              <GitHubLight className="h-4 w-4" />
            </a>
            <ThemeToggle />
            {showAuthenticatedNav ? (
              <Link
                to="/dashboard"
                className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden px-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_220px]">
        <aside className="hidden md:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <DocsSidebarNav />
          </div>
        </aside>

        <div className="min-w-0 max-w-3xl">
          {children}
          {(prev || next) && (
            <div className="mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-6 text-sm">
              {prev ? (
                <Link
                  to={`/docs/${prev.slug}`}
                  className="group min-w-0 flex-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="block text-[11px] uppercase tracking-wider">Previous</span>
                  <span className="mt-1 block truncate font-medium">← {prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={`/docs/${next.slug}`}
                  className="group min-w-0 flex-1 text-right text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="block text-[11px] uppercase tracking-wider">Next</span>
                  <span className="mt-1 block truncate font-medium">{next.title} →</span>
                </Link>
              ) : null}
            </div>
          )}
        </div>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div className="label-mono mb-3">On this page</div>
              <ul className="space-y-1.5 text-[13px]">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="flex items-start gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronRight className="mt-1 h-3 w-3 shrink-0" />
                      {t.title ?? t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
