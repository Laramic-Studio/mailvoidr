import { Link } from "react-router-dom";

export function Logo({ small = false, className = "" }) {
  return (
    <Link
      to="/"
      data-testid="brand-logo"
      className={`inline-flex items-center gap-2 group ${className}`}
    >
      <img src="/logo/favicon-32x32.png" alt="Mailvoidr" className="h-6 w-6" />
      {!small && (
        <span className="font-medium text-[15px] tracking-tight tracking-[0.03em]">
          Mailvoidr<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
