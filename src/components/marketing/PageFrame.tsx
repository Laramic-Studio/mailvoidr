import type { ReactNode } from "react";

const RAIL_HANDLES = ["8%", "28%", "52%", "76%"] as const;

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="page-inset flex items-stretch gap-2">
      <aside
        className="page-left-rail relative hidden shrink-0 border-x border-t border-border sm:block"
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
      <div className="page-frame relative min-w-0 flex-1 border-x border-t border-border">
        <span className="page-frame-handle page-frame-handle-tl" aria-hidden />
        <span className="page-frame-handle page-frame-handle-tr" aria-hidden />
        {children}
      </div>
    </div>
  );
}
