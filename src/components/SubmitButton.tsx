import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode
  disabled?: boolean
  className?: string 
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
