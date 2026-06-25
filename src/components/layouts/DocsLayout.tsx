import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DOCS_NAV } from "@/lib/dummyData";
import { Search, Github, ChevronRight } from "lucide-react";

import type { ReactNode } from "react";

interface DocsLayoutProps {
  children: ReactNode;
  toc?: Array<{ id: string; label?: string; title?: string }>;
  title?: string;
}

export function DocsLayout({ children, toc = [], title }: DocsLayoutProps) {
  const { pathname } = useLocation();
  const current = pathname.split("/").pop();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto h-full max-w-[1400px] flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hidden md:inline-flex font-mono text-[11px] text-muted-foreground uppercase tracking-wider border-l border-border pl-6">Docs</span>
          </div>
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                data-testid="docs-search"
                placeholder="Search documentation…"
                className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Github className="h-3.5 w-3.5" /> GitHub</a>
            <ThemeToggle />
            <Link to="/login" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-2">Sign in</Link>
            <Link to="/register" className="inline-flex bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium">Get started</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_220px] gap-8 px-6 py-10">
        <aside className="hidden md:block">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 space-y-6">
            {DOCS_NAV.map((sec) => (
              <div key={sec.section}>
                <div className="label-mono mb-2">{sec.section}</div>
                <ul className="space-y-0.5 border-l border-border">
                  {sec.items.map((it) => (
                    <li key={it.slug}>
                      <NavLink
                        to={`/docs/${it.slug}`}
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
        </aside>

        <article className="min-w-0 max-w-3xl">
          {children}
          <div className="mt-16 pt-6 border-t border-border flex items-center justify-between text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground">← Previous</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Next →</a>
          </div>
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div className="label-mono mb-3">On this page</div>
              <ul className="space-y-1.5 text-[13px]">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-muted-foreground hover:text-foreground flex items-start gap-1.5">
                      <ChevronRight className="h-3 w-3 mt-1 shrink-0" />
                      {t.title}
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
