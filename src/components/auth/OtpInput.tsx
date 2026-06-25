import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
  id?: string;
  "data-testid"?: string;
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  length = 6,
  id,
  "data-testid": testId,
}: OtpInputProps) {
  return (
    <InputOTP
      id={id}
      data-testid={testId}
      maxLength={length}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      disabled={disabled}
      inputMode="numeric"
      autoComplete="one-time-code"
    >
      <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
        {Array.from({ length }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            data-testid={testId ? `${testId}-${index}` : undefined}
            className={cn(
              "aspect-square h-auto w-full flex-1 rounded-md border border-border bg-card text-xl font-mono shadow-none",
              "first:rounded-md last:rounded-md first:border-l",
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
