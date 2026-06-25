import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe, Inbox, Mail, Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useGlobalSearch } from '@/hooks/useSearch';
import type { SearchGroupType, SearchResultItem } from '@/types';

const GROUP_ICONS: Record<SearchGroupType, typeof Mail> = {
  sends: Mail,
  templates: FileText,
  domains: Globe,
  virtual_emails: Inbox,
};

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data, isFetching, isPending, isError } = useGlobalSearch(debouncedQuery, open);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [open]);

  function goTo(item: SearchResultItem) {
    onOpenChange(false);
    navigate(item.href);
  }

  const hasQuery = debouncedQuery.length >= 1;
  const showLoading = hasQuery && (isPending || isFetching);
  const groups = data?.groups ?? [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search logs, templates, domains, virtual emails…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!hasQuery ? (
          <CommandEmpty>Type to search your workspace.</CommandEmpty>
        ) : showLoading ? (
          <CommandEmpty>Searching…</CommandEmpty>
        ) : isError ? (
          <CommandEmpty>Search failed. Try again.</CommandEmpty>
        ) : groups.length === 0 ? (
          <CommandEmpty>No results for “{debouncedQuery}”.</CommandEmpty>
        ) : (
          groups.map((group) => (
            <CommandGroup key={group.type} heading={group.label}>
              {group.items.map((item) => {
                const Icon = GROUP_ICONS[group.type];
                return (
                  <CommandItem
                    key={`${group.type}-${item.id}`}
                    value={`${group.type}-${item.id}`}
                    onSelect={() => goTo(item)}
                  >
                    <Icon className="text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px]">{item.title}</div>
                      {item.subtitle ? (
                        <div className="truncate text-[11px] text-muted-foreground">{item.subtitle}</div>
                      ) : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))
        )}
      </CommandList>
    </CommandDialog>
  );
}

interface GlobalSearchTriggerProps {
  onOpen: () => void;
}

export function GlobalSearchTrigger({ onOpen }: GlobalSearchTriggerProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <button
        type="button"
        data-testid="global-search"
        onClick={onOpen}
        className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-16 text-left text-[13px] text-muted-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        Search logs, virtual emails, domains…
      </button>
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-flex">
        ⌘K
      </kbd>
    </div>
  );
}

export function useGlobalSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;

      if (
        target instanceof HTMLElement
        && (target.isContentEditable
          || target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.tagName === 'SELECT')
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpen();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpen]);
}
