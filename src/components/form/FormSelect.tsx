import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly FormSelectOption[];
  disabled?: boolean;
  hint?: string;
  className?: string;
  triggerClassName?: string;
  "data-testid"?: string;
}

export function FormSelect({
  label,
  placeholder = "Select…",
  value,
  onValueChange,
  options,
  disabled = false,
  hint,
  className,
  triggerClassName,
  "data-testid": testId,
}: FormSelectProps) {
  return (
    <div className={className}>
      {label && <label className="label-mono block mb-1.5">{label}</label>}
      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          data-testid={testId}
          className={cn("bg-card border-border shadow-none", triggerClassName)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <p className="mt-1.5 text-[11.5px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
