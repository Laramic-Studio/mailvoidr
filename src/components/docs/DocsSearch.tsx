import { searchDocs } from '@/content/docs/search';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function DocsSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => searchDocs(query), [query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function go(href: string) {
    navigate(href);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        data-testid="docs-search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && results[0]) {
            event.preventDefault();
            go(results[0].href);
          }
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder="Search documentation…"
        className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
        aria-expanded={open && query.trim().length >= 2}
        aria-controls="docs-search-results"
        role="combobox"
        autoComplete="off"
      />

      {open && query.trim().length >= 2 ? (
        <div
          id="docs-search-results"
          data-testid="docs-search-results"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto border border-border bg-card shadow-lg"
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="px-3 py-2.5 text-[13px] text-muted-foreground">No results for “{query.trim()}”</div>
          ) : (
            results.map((hit) => (
              <button
                key={hit.href}
                type="button"
                role="option"
                data-testid={`docs-search-hit-${hit.href.replace(/[^\w-]+/g, '-')}`}
                onClick={() => go(hit.href)}
                className="block w-full border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent/40 transition-colors"
              >
                <div className="text-[13px] font-medium">{hit.title}</div>
                <div className="label-mono mt-0.5">{hit.breadcrumb}</div>
                <div className="mt-1 text-[12px] text-muted-foreground line-clamp-2">{hit.excerpt}</div>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Compact search link shown on small screens. */
export function DocsSearchMobileLink() {
  return (
    <Link
      to="/docs/quickstart"
      className="inline-flex md:hidden items-center justify-center h-8 w-8 border border-border rounded-md hover:bg-accent transition-colors"
      aria-label="Documentation"
    >
      <Search className="h-3.5 w-3.5" />
    </Link>
  );
}
