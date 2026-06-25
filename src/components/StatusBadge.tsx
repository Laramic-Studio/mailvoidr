const TONE = {
  success: "border-primary/30 text-primary bg-primary/10",
  warn: "border-amber-500/30 text-amber-500 bg-amber-500/10",
  error: "border-destructive/30 text-destructive bg-destructive/10",
  info: "border-blue-500/30 text-blue-500 bg-blue-500/10",
  neutral: "border-border text-muted-foreground bg-muted/40",
};

const MAP = {
  delivered: "success", verified: "success", active: "success", operational: "success", pass: "success", paid: "success", complete: "success", up: "success",
  opened: "info", clicked: "info", scheduled: "info",
  warning: "warn", deferred: "warn", warn: "warn", pending: "warn", degraded: "warn", monitoring: "warn",
  bounced: "error", complained: "error", failed: "error", fail: "error", paused: "error", down: "error", revoked: "error",
};

type ToneKey = keyof typeof TONE;

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: ToneKey;
  withDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, tone, withDot = true, className = "" }: StatusBadgeProps) {
  const computedTone = tone || MAP[String(status).toLowerCase()] || "neutral";
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider ${TONE[computedTone]} ${className}`}
    >
      {withDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label || status}
    </span>
  );
}
