import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  scorePassword,
  STRENGTH_COLORS,
  STRENGTH_LABELS,
  type PasswordStrength,
} from "@/lib/password-strength";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { strength, score, checks } = scorePassword(password);
  const showStrength = strength !== "empty";

  return (
    <div className="mt-2 space-y-2">
      {showStrength ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((segment) => (
                <div
                  key={segment}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-border transition-colors",
                    segment <= score && STRENGTH_COLORS[strength as Exclude<PasswordStrength, "empty">],
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wide">
              {STRENGTH_LABELS[strength as Exclude<PasswordStrength, "empty">]}
            </span>
          </div>
        </div>
      ) : null}
      {/* <div className="text-[11.5px] text-muted-foreground space-y-0.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            <Check
              className={cn(
                "h-3 w-3 shrink-0",
                check.met ? "text-primary" : "text-muted-foreground/40",
              )}
            />
            {check.label}
          </div>
        ))}
      </div> */}
    </div>
  );
}
