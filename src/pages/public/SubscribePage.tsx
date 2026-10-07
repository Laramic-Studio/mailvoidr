import { useRef, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RecaptchaField, isRecaptchaEnabled, type RecaptchaFieldHandle } from '@/components/auth/RecaptchaField';
import { PublicShell, publicButtonClass, publicControlClass } from '@/components/newsletter/PublicShell';
import { fetchPublicForm, publicNewsletterAction, submitPublicSubscribe } from '@/lib/api/newsletter-public';
import { maskEmail } from '@/lib/newsletter/format';
import { getApiErrorMessage } from '@/lib/api';

export default function SubscribePage() {
  const { slug = '' } = useParams();
  const recaptchaRef = useRef<RecaptchaFieldHandle>(null);
  const [doneEmail, setDoneEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formQuery = useQuery({
    queryKey: ['public-form', slug],
    queryFn: () => fetchPublicForm(slug),
    enabled: Boolean(slug),
    retry: false,
  });
  const submit = useMutation({
    mutationFn: (payload: {
      email: string;
      first_name?: string;
      company_website?: string;
      recaptcha_token?: string;
    }) => submitPublicSubscribe(slug, payload),
  });
  const form = formQuery.data;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const company = String(data.get('company_website') ?? '');
    if (company) return;
    const token = recaptchaRef.current?.getValue();
    if (form?.captcha_enabled && isRecaptchaEnabled() && !token) {
      setError('Complete the captcha first.');
      return;
    }
    setError(null);
    try {
      const result = await submit.mutateAsync({
        email: String(data.get('email') ?? ''),
        first_name: String(data.get('first_name') ?? '') || undefined,
        company_website: company,
        recaptcha_token: token ?? undefined,
      });
      setDoneEmail(maskEmail(result.masked_email));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not subscribe.'));
      recaptchaRef.current?.reset();
    }
  }

  if (formQuery.isLoading) {
    return (
      <PublicShell tenantName="Mailvoidr">
        <p>Loading the form…</p>
      </PublicShell>
    );
  }

  if (formQuery.isError || !form) {
    return (
      <PublicShell tenantName="Mailvoidr">
        <h1 className="text-2xl font-medium tracking-tight">This form is unavailable</h1>
        <p className="mt-3 text-muted-foreground">The signup link may have been removed.</p>
      </PublicShell>
    );
  }

  if (doneEmail) {
    return (
      <PublicShell tenantName={form.tenant_name} logoUrl={form.logo_url}>
        <h1 className="text-2xl font-medium tracking-tight">Check your inbox to confirm.</h1>
        <p className="mt-3">We sent a confirmation link to {doneEmail}.</p>
        <button type="button" className={`${publicButtonClass} mt-6`} onClick={() => setDoneEmail(null)}>
          Wrong address?
        </button>
      </PublicShell>
    );
  }

  return (
    <PublicShell tenantName={form.tenant_name} logoUrl={form.logo_url}>
      <h1 className="text-2xl font-medium tracking-tight">{form.name}</h1>
      <form
        className="mt-6 space-y-4"
        method="post"
        action={publicNewsletterAction(`/public/newsletter/forms/${slug}/subscribe`)}
        onSubmit={(event) => void handleSubmit(event)}
      >
        {form.first_name_enabled ? (
          <label className="block">
            Name
            <input name="first_name" autoComplete="given-name" className={`${publicControlClass} mt-1.5`} />
          </label>
        ) : null}
        <label className="block">
          Email
          <input name="email" type="email" required autoComplete="email" className={`${publicControlClass} mt-1.5`} />
        </label>
        {form.honeypot_enabled ? (
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Company website
              <input name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        ) : null}
        {form.consent_text ? <p className="text-sm leading-relaxed text-muted-foreground">{form.consent_text}</p> : null}
        {form.captcha_enabled ? <RecaptchaField ref={recaptchaRef} /> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={publicButtonClass} disabled={submit.isPending}>
          {submit.isPending ? 'Sending…' : form.button_label}
        </button>
      </form>
    </PublicShell>
  );
}
