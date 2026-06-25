import { Link } from "react-router-dom";

export function Logo({ small = false, className = "" }) {
  return (
    <Link
      to="/"
      data-testid="brand-logo"
      className={`inline-flex items-center gap-2 group ${className}`}
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l6 5 6-5" strokeLinecap="square" />
          <path d="M2 4v8h12V4" strokeLinecap="square" />
        </svg>
      </span>
      {!small && (
        <span className="font-medium text-[15px] tracking-tight">
          mailvoidr<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
