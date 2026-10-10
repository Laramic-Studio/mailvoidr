import type { ReactNode } from "react";

const RAIL_HANDLES = ["8%", "28%", "52%", "76%"] as const;

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-stretch gap-2 page-inset">
      <aside
        className="relative hidden border-t page-left-rail shrink-0 border-x border-border sm:block"
        aria-hidden
      >
        <span className="page-frame-handle page-frame-handle-tl" />
        <span className="page-frame-handle page-frame-handle-tr" />
        {RAIL_HANDLES.map((top) => (
          <span
            key={top}
            className="page-frame-handle page-frame-handle-left"
            style={{ top }}
          />
        ))}
      </aside>
      <div className="relative flex-1 min-w-0 border-t page-frame border-x border-border">
        <span className="page-frame-handle page-frame-handle-tl" aria-hidden />
        <span className="page-frame-handle page-frame-handle-tr" aria-hidden />
        {children}
      </div>
    </div>
  );
}
