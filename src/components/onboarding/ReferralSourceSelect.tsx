import { FormSelect } from "@/components/form/FormSelect";
import { REFERRAL_SOURCES } from "@/constants/onboarding";

interface ReferralSourceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function ReferralSourceSelect({
  value,
  onValueChange,
  disabled,
}: ReferralSourceSelectProps) {
  return (
    <FormSelect
      label="How did you hear about us?"
      placeholder="Select one…"
      value={value}
      onValueChange={onValueChange}
      options={REFERRAL_SOURCES}
      disabled={disabled}
      hint="Helps us understand what's working."
      data-testid="onb-referral-source"
    />
  );
}
