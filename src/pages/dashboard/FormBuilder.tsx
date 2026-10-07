import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { QueryErrorState } from '@/components/QueryErrorState';
import { CodeBlock } from '@/components/CodeBlock';
import { Switch } from '@/components/ui/switch';
import { fieldClass, primaryButtonClass, secondaryButtonClass, textButtonClass } from '@/components/newsletter/classes';
import { useForm, useFormMutations, useNewsletterSettings } from '@/hooks/useNewsletter';
import { toastError, toastSuccess } from '@/lib/toast';
import type { NewsletterForm } from '@/types/newsletter';

const TABS = [
  ['form', 'Form'],
  ['email', 'Confirmation email'],
  ['page', 'Confirmation page'],
  ['share', 'Share'],
] as const;

export default function FormBuilder() {
  const { id = '' } = useParams();
  const query = useForm(id);
  const settings = useNewsletterSettings();
  const { update, uploadLogo } = useFormMutations();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('form');
  const [draft, setDraft] = useState<NewsletterForm | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (query.data?.form && !hydrated.current) {
      hydrated.current = true;
      setDraft(query.data.form);
    }
  }, [query.data?.form]);

  async function save(partial: Parameters<typeof update.mutateAsync>[0]['payload']) {
    try {
      const result = await update.mutateAsync({ id, payload: partial });
      setDraft(result.form);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not save the form.');
    }
  }

  async function handleLogo(file: File | undefined, placement: 'confirmation_email' | 'confirmation_page') {
    if (!file) return;
    try {
      const result = await uploadLogo.mutateAsync({ id, file, placement });
      setDraft(result.form);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not upload the logo.');
    }
  }

  if (query.isError) {
    return (
      <DashboardLayout>
        <QueryErrorState error={query.error} subject="this form" onRetry={() => void query.refetch()} framed />
      </DashboardLayout>
    );
  }
  if (query.isLoading || !draft) {
    return <DashboardLayout><p className="text-[13px] text-muted-foreground">Loading form…</p></DashboardLayout>;
  }

  const hosted = draft.public_url || `${window.location.origin}/subscribe/${draft.slug}`;
  const embed = draft.embed_html || `<iframe src="${hosted}" title="Subscribe" style="width:100%;max-width:480px;height:420px;border:0"></iframe>`;
  const freePlan = settings.data?.plan === 'free' || settings.data?.doi_imports_editable === false;

  return (
    <DashboardLayout>
      <PageHeader eyebrow="Newsletters" title={draft.name} description={draft.audience_name ?? 'Signup form'} breadcrumbs={['Forms', draft.name]} />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 text-[13px] ${tab === key ? '-mb-px border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {tab === 'form' ? (
            <>
              <div className="border border-border bg-muted/40 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {freePlan ? <Lock className="h-4 w-4" aria-hidden /> : null}
                  Double opt-in is on.
                </p>
                {freePlan ? (
                  <p className="mt-1 text-[13px] text-muted-foreground">Required on the free plan.</p>
                ) : (
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Form signups always confirm.{' '}
                    <Link to="/dashboard/settings?section=newsletters" className={textButtonClass}>API and import policy</Link>
                  </p>
                )}
              </div>
              <label className="flex items-center justify-between gap-3 text-[13px]">
                First name field
                <Switch checked={draft.first_name_enabled} onCheckedChange={(checked) => setDraft({ ...draft, first_name_enabled: checked })} />
              </label>
              <p className="text-[13px] text-muted-foreground">Email is required and locked.</p>
              <label className="block text-[13px]">Button label<input className={`${fieldClass} mt-1.5`} value={draft.button_label} onChange={(event) => setDraft({ ...draft, button_label: event.target.value })} /></label>
              <label className="block text-[13px]">
                Consent text
                <textarea className={`${fieldClass} mt-1.5 min-h-24`} value={draft.consent_text} onChange={(event) => setDraft({ ...draft, consent_text: event.target.value })} />
              </label>
              <p className="text-[12px] text-muted-foreground">Saving a change stores a new consent version{draft.consent_version ? ` (current v${draft.consent_version})` : ''}.</p>
              <label className="block text-[13px]">Redirect after submit<input className={`${fieldClass} mt-1.5`} value={draft.redirect_url ?? ''} onChange={(event) => setDraft({ ...draft, redirect_url: event.target.value || null })} /></label>
              <label className="flex items-center justify-between gap-3 text-[13px]">
                Honeypot is always on
                <Switch checked disabled aria-label="Honeypot is always on" />
              </label>
              <label className="flex items-center justify-between gap-3 text-[13px]">
                Captcha
                <Switch checked={draft.captcha_enabled} onCheckedChange={(checked) => setDraft({ ...draft, captcha_enabled: checked })} />
              </label>
              <button
                type="button"
                className={primaryButtonClass}
                disabled={update.isPending}
                onClick={() => void save({
                  first_name_enabled: draft.first_name_enabled,
                  button_label: draft.button_label,
                  consent_text: draft.consent_text,
                  redirect_url: draft.redirect_url,
                  captcha_enabled: draft.captcha_enabled,
                })}
              >
                Save form
              </button>
            </>
          ) : null}

          {tab === 'email' ? (
            <>
              <label className="block text-[13px]">From name<input className={`${fieldClass} mt-1.5`} value={draft.confirmation_email.from_name} onChange={(event) => setDraft({ ...draft, confirmation_email: { ...draft.confirmation_email, from_name: event.target.value } })} /></label>
              <label className="block text-[13px]">Subject<input className={`${fieldClass} mt-1.5`} value={draft.confirmation_email.subject} onChange={(event) => setDraft({ ...draft, confirmation_email: { ...draft.confirmation_email, subject: event.target.value } })} /></label>
              <label className="block text-[13px]">
                Logo
                <input type="file" accept="image/*" className="mt-1.5 block text-[13px]" onChange={(event) => void handleLogo(event.target.files?.[0], 'confirmation_email')} />
              </label>
              <label className="block text-[13px]">Body<textarea className={`${fieldClass} mt-1.5 min-h-28`} value={draft.confirmation_email.body} onChange={(event) => setDraft({ ...draft, confirmation_email: { ...draft.confirmation_email, body: event.target.value } })} /></label>
              <label className="block text-[13px]">Button label<input className={`${fieldClass} mt-1.5`} value={draft.confirmation_email.button_label} onChange={(event) => setDraft({ ...draft, confirmation_email: { ...draft.confirmation_email, button_label: event.target.value } })} /></label>
              <p className="text-[13px] text-muted-foreground">If they don&apos;t confirm, we send one reminder after 24 hours. That&apos;s the only reminder.</p>
              <button type="button" className={primaryButtonClass} disabled={update.isPending} onClick={() => void save({ confirmation_email: draft.confirmation_email })}>
                Save confirmation email
              </button>
            </>
          ) : null}

          {tab === 'page' ? (
            <>
              <label className="block text-[13px]">
                Logo
                <input type="file" accept="image/*" className="mt-1.5 block text-[13px]" onChange={(event) => void handleLogo(event.target.files?.[0], 'confirmation_page')} />
              </label>
              <label className="block text-[13px]">Message<textarea className={`${fieldClass} mt-1.5 min-h-28`} value={draft.confirmation_page.message} onChange={(event) => setDraft({ ...draft, confirmation_page: { ...draft.confirmation_page, message: event.target.value } })} /></label>
              <label className="block text-[13px]">Redirect URL<input className={`${fieldClass} mt-1.5`} value={draft.confirmation_page.redirect_url ?? ''} onChange={(event) => setDraft({ ...draft, confirmation_page: { ...draft.confirmation_page, redirect_url: event.target.value || null } })} /></label>
              <button type="button" className={primaryButtonClass} disabled={update.isPending} onClick={() => void save({ confirmation_page: draft.confirmation_page })}>
                Save confirmation page
              </button>
            </>
          ) : null}

          {tab === 'share' ? (
            <div className="space-y-4">
              <label className="block text-[13px]">
                Hosted URL
                <input className={`${fieldClass} mt-1.5`} readOnly value={hosted} />
              </label>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => void navigator.clipboard.writeText(hosted).then(() => toastSuccess('Link copied.'))}
              >
                Copy link
              </button>
              <CodeBlock language="html" code={embed} />
            </div>
          ) : null}
        </div>

        <aside className="border border-border bg-card p-4 lg:sticky lg:top-4">
          <p className="label-mono mb-3">Preview</p>
          {tab === 'email' ? <EmailPreview form={draft} /> : null}
          {tab === 'page' ? <PagePreview form={draft} /> : null}
          {tab !== 'email' && tab !== 'page' ? <FormPreview form={draft} /> : null}
        </aside>
      </div>
    </DashboardLayout>
  );
}

function FormPreview({ form }: { form: NewsletterForm }) {
  return (
    <div className="space-y-3 text-[13px]">
      <p className="font-medium">{form.name}</p>
      {form.first_name_enabled ? <div className="rounded-md border border-border px-3 py-2 text-muted-foreground">Name</div> : null}
      <div className="rounded-md border border-border px-3 py-2">Email</div>
      {form.consent_text ? <p className="text-[12px] text-muted-foreground">{form.consent_text}</p> : null}
      <div className="rounded-md bg-primary px-3 py-2 text-center text-primary-foreground">{form.button_label || 'Subscribe'}</div>
    </div>
  );
}

function EmailPreview({ form }: { form: NewsletterForm }) {
  const email = form.confirmation_email;
  return (
    <div className="space-y-3 text-[13px]">
      {email.logo_url ? <img src={email.logo_url} alt="" className="h-10 object-contain" /> : null}
      <p className="font-medium">{email.subject || 'Confirm your subscription'}</p>
      <p className="whitespace-pre-wrap text-muted-foreground">{email.body || 'Thanks for signing up. Confirm to finish.'}</p>
      <div className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-primary-foreground">
        {email.button_label || 'Confirm subscription'}
        <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-1.5 py-0.5 text-[10px]">
          <Lock className="h-3 w-3" aria-hidden /> Locked
        </span>
      </div>
      <p className="text-[12px] text-muted-foreground">The confirm button cannot be removed.</p>
    </div>
  );
}

function PagePreview({ form }: { form: NewsletterForm }) {
  const page = form.confirmation_page;
  return (
    <div className="mx-auto max-w-[280px] border border-border p-4 text-[13px]">
      {page.logo_url ? <img src={page.logo_url} alt="" className="mb-3 h-8 object-contain" /> : null}
      <p>{page.message || 'You are confirmed.'}</p>
      {page.redirect_url ? <p className="mt-2 text-[12px] text-muted-foreground">Redirects to {page.redirect_url}</p> : null}
    </div>
  );
}
