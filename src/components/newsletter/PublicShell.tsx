import type { ReactNode } from 'react';

interface PublicShellProps {
  tenantName: string;
  logoUrl?: string | null;
  children: ReactNode;
}

export function PublicShell({ tenantName, logoUrl, children }: PublicShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-base text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col">
        <header className="mb-8 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
              {tenantName.slice(0, 1).toUpperCase() || 'M'}
            </span>
          )}
          <p className="text-base font-medium">{tenantName}</p>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mt-10 text-center text-sm text-muted-foreground">
          <a href="/" className="underline underline-offset-4">Sent with Mailvoidr</a>
        </footer>
      </div>
    </main>
  );
}

export const publicControlClass =
  'min-h-11 w-full rounded-md border border-border bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const publicButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
