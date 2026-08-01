import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from 'next-themes';

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';

export function isRecaptchaEnabled(): boolean {
  return RECAPTCHA_SITE_KEY.length > 0;
}

export type RecaptchaFieldHandle = {
  reset: () => void;
  getValue: () => string | null;
};

type RecaptchaFieldProps = {
  onChange?: (token: string | null) => void;
  className?: string;
};

export const RecaptchaField = forwardRef<RecaptchaFieldHandle, RecaptchaFieldProps>(
  function RecaptchaField({ onChange, className }, ref) {
    const captchaRef = useRef<ReCAPTCHA>(null);
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme === 'dark' ? 'dark' : 'light';

    useImperativeHandle(ref, () => ({
      reset: () => captchaRef.current?.reset(),
      getValue: () => captchaRef.current?.getValue() ?? null,
    }));

    if (!isRecaptchaEnabled()) {
      return null;
    }

    return (
      <div className={className} data-testid="recaptcha">
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          theme={theme}
          onChange={onChange}
          onExpired={() => onChange?.(null)}
        />
      </div>
    );
  },
);
