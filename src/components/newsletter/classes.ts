export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const primaryButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const secondaryButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const dangerButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-[13px] font-medium text-destructive-foreground hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const fieldClass =
  'w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const textButtonClass = `text-[13px] text-primary underline-offset-4 hover:underline ${focusRing} rounded-sm`;
