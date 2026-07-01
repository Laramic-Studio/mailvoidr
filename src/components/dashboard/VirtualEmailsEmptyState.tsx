import { Mail, Plus } from 'lucide-react';

interface VirtualEmailsEmptyStateProps {
  variant: 'empty' | 'search';
  onCreate?: () => void;
}

export function VirtualEmailsEmptyState({ variant, onCreate }: VirtualEmailsEmptyStateProps) {
  if (variant === 'search') {
    return (
      <div
        data-testid="virtual-emails-empty-search"
        className="flex flex-col items-center justify-center px-6 py-16 text-center"
      >
      
        <h3 className="text-base font-medium tracking-tight">No matching virtual emails</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try a different search term, or create a new address for this workspace.
        </p>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" />
            Create virtual email
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="virtual-emails-empty"
      className="relative overflow-hidden px-6 py-14 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-lg">
        

        <span className="label-mono">Virtual emails</span>
        <h3 className="mt-2 text-xl font-medium tracking-tight">Create your first address</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Disposable addresses for signup flows, OTPs, and staging emails. Mail is captured in
          Mailvoidr — use a label so your team knows what each address is for.
        </p>

        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            data-testid="virtual-email-empty-create"
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Create virtual email
          </button>
        )}
      </div>
    </div>
  );
}
