import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { PublicShell, publicButtonClass } from '@/components/newsletter/PublicShell';
import { publicNewsletterAction, resendPublicConfirm, submitPublicConfirm } from '@/lib/api/newsletter-public';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api';
import type { PublicConfirmState } from '@/types/newsletter';

/** The API redirects broken or expired signed links to /confirm/invalid?error=… */
export const INVALID_CONFIRM_TOKEN = 'invalid';

type Phase =
  | { kind: 'loading' }
  | { kind: 'result'; state: PublicConfirmState }
  | { kind: 'expired' }
  | { kind: 'broken' }
  | { kind: 'error'; message: string };

/** Only http(s) redirect targets are rendered; anything else (javascript:, data:) is dropped. */
export function safeRedirectUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function initialPhase(hasToken: boolean, errorParam: string | null): Phase {
  if (hasToken) return { kind: 'loading' };
  return errorParam === 'expired' ? { kind: 'expired' } : { kind: 'broken' };
}

export default function ConfirmPage() {
  const { token: rawToken = '' } = useParams();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  // /confirm/invalid is the API's error landing route, never a real token.
  const token = rawToken && rawToken !== INVALID_CONFIRM_TOKEN ? rawToken : '';
  const [phase, setPhase] = useState<Phase>(() => initialPhase(Boolean(token), errorParam));
  const [notice, setNotice] = useState<string | null>(null);
  const postedFor = useRef<string | null>(null);
  const resend = useMutation({ mutationFn: () => resendPublicConfirm(token) });

  useEffect(() => {
    if (!token) {
      setPhase(initialPhase(false, errorParam));
      return;
    }
    // Confirm exactly once per token. StrictMode runs effects twice in dev; the ref stops the second POST.
    // No cleanup flag on purpose: the first (only) request must still be allowed to set state.
    if (postedFor.current === token) return;
    postedFor.current = token;
    setPhase({ kind: 'loading' });
    submitPublicConfirm(token)
      .then((state) => {
        setPhase(state.outcome === 'expired' ? { kind: 'expired' } : { kind: 'result', state });
      })
      .catch((error: unknown) => {
        const status = getApiErrorStatus(error);
        if (status === 404) {
          setPhase({ kind: 'broken' });
          return;
        }
        const message = getApiErrorMessage(error, 'We could not confirm this link. Try again in a moment.');
        setPhase(/expired/i.test(message) ? { kind: 'expired' } : { kind: 'error', message });
      });
  }, [token, errorParam]);

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await resend.mutateAsync();
      setNotice(result.message);
    } catch (error) {
      setNotice(getApiErrorMessage(error, 'Could not send a new link.'));
    }
  }

  if (phase.kind === 'loading') {
    return <PublicShell tenantName="Mailvoidr"><p>Confirming your subscription…</p></PublicShell>;
  }

  if (phase.kind === 'broken') {
    return (
      <PublicShell tenantName="Mailvoidr">
        <h1 className="text-2xl font-medium tracking-tight">This link does not work</h1>
        <p className="mt-3 text-muted-foreground">Ask for a new confirmation email.</p>
      </PublicShell>
    );
  }

  if (phase.kind === 'expired') {
    return (
      <PublicShell tenantName="Mailvoidr">
        <h1 className="text-2xl font-medium tracking-tight">This link has expired</h1>
        {token ? (
          <>
            <p className="mt-3">Send a new confirmation link to the same address.</p>
            <form
              className="mt-6"
              method="post"
              action={publicNewsletterAction(`/public/newsletter/confirm/${token}/resend`)}
              onSubmit={(event) => void handleResend(event)}
            >
              <button type="submit" className={publicButtonClass} disabled={resend.isPending}>
                {resend.isPending ? 'Sending…' : 'Send a new link'}
              </button>
            </form>
            {notice ? <p className="mt-3 text-sm" role="status">{notice}</p> : null}
          </>
        ) : (
          <p className="mt-3">Open the newest confirmation email, or sign up again to get a new link.</p>
        )}
      </PublicShell>
    );
  }

  if (phase.kind === 'error') {
    return (
      <PublicShell tenantName="Mailvoidr">
        <h1 className="text-2xl font-medium tracking-tight">We could not confirm this link</h1>
        <p className="mt-3" role="alert">{phase.message}</p>
      </PublicShell>
    );
  }

  const { state } = phase;
  const confirmed = state.outcome === 'confirmed' || state.outcome === 'already_confirmed';
  const redirectUrl = safeRedirectUrl(state.redirect_url);

  return (
    <PublicShell tenantName={state.tenant_name || 'Mailvoidr'} logoUrl={state.logo_url}>
      {confirmed ? (
        <>
          <h1 className="text-2xl font-medium tracking-tight">
            {state.outcome === 'already_confirmed' ? 'You are already confirmed' : 'You are confirmed'}
          </h1>
          <p className="mt-3">{state.message || 'Thanks. You will receive emails from this list.'}</p>
          {redirectUrl ? (
            <a href={redirectUrl} rel="noopener noreferrer" className={`${publicButtonClass} mt-6`}>
              Continue
            </a>
          ) : null}
        </>
      ) : (
        <>
          {/* POST returned pending: the API could not confirm (e.g. a race). Offer a fresh link. */}
          <h1 className="text-2xl font-medium tracking-tight">We could not confirm this link</h1>
          <p className="mt-3">Send a new confirmation link and open the newest email.</p>
          <form
            className="mt-6"
            method="post"
            action={publicNewsletterAction(`/public/newsletter/confirm/${token}/resend`)}
            onSubmit={(event) => void handleResend(event)}
          >
            <button type="submit" className={publicButtonClass} disabled={resend.isPending}>
              {resend.isPending ? 'Sending…' : 'Send a new link'}
            </button>
          </form>
          {notice ? <p className="mt-3 text-sm" role="status">{notice}</p> : null}
        </>
      )}
    </PublicShell>
  );
}
