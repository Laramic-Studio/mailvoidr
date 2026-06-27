export type PasswordStrength = "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  checks: { label: string; met: boolean }[];
}

export function scorePassword(password: string): PasswordStrengthResult {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Upper & lower case", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
    { label: "A symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = checks.filter((check) => check.met).length;

  if (!password) {
    return { strength: "empty", score: 0, checks };
  }

  if (password.length < 8) {
    return { strength: "weak", score: 1, checks };
  }

  if (metCount <= 2) {
    return { strength: "fair", score: 2, checks };
  }

  if (metCount === 3) {
    return { strength: "good", score: 3, checks };
  }

  return { strength: "strong", score: 4, checks };
}

export const STRENGTH_LABELS: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

export const STRENGTH_COLORS: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: "bg-destructive",
  fair: "bg-amber-500",
  good: "bg-primary",
  strong: "bg-emerald-500",
};
