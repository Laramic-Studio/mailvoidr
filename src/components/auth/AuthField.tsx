import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightLabel?: ReactNode;
}

export function AuthField({
  label,
  rightLabel,
  disabled,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label-mono">{label}</label>
        {rightLabel}
      </div>
      <input
        disabled={disabled}
        className={cn(
          "w-full bg-card border border-border rounded-md px-3 py-2 text-sm transition-opacity focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    </div>
  );
}
