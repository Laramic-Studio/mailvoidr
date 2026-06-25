import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      className={cn("w-full", className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {loading ? (loadingText ?? children) : children}
    </Button>
  );
}
