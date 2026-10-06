import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PublicShell, publicButtonClass } from '@/components/newsletter/PublicShell';
import { fetchPublicConfirm, publicNewsletterAction, resendPublicConfirm } from '@/lib/api/newsletter-public';
import { getApiErrorMessage } from '@/lib/api';

export default function ConfirmPage() {
  const { token = '' } = useParams();
  const [notice, setNotice] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['public-confirm', token],
    queryFn: () => fetchPublicConfirm(token),
    enabled: Boolean(token),
    retry: false,
  });
  const resend = useMutation({ mutationFn: () => resendPublicConfirm(token) });
  const state = query.data;

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await resend.mutateAsync();
      setNotice(result.message);
    } catch (error) {
      setNotice(getApiErrorMessage(error, 'Could not send a new link.'));
    }
  }

  if (query.isLoading) {
    return <PublicShell tenantName="Mailvoidr"><p>Checking your link…</p></PublicShell>;
  }

  if (query.isError || !state) {
    return (
      <PublicShell tenantName="Mailvoidr">
        <h1 className="text-2xl font-medium tracking-tight">This link does not work</h1>
        <p className="mt-3 text-muted-foreground">Ask for a new confirmation email.</p>
      </PublicShell>
    );
  }

  const confirmed = state.outcome === 'confirmed' || state.outcome === 'already_confirmed';

  return (
    <PublicShell tenantName={state.tenant_name || 'Mailvoidr'} logoUrl={state.logo_url}>
      {confirmed ? (
        <>
          <h1 className="text-2xl font-medium tracking-tight">
            {state.outcome === 'already_confirmed' ? 'You are already confirmed' : 'You are confirmed'}
          </h1>
          <p className="mt-3">{state.message || 'Thanks. You will receive emails from this list.'}</p>
          {state.redirect_url ? (
            <a href={state.redirect_url} className={`${publicButtonClass} mt-6`}>
              Continue
            </a>
          ) : null}
        </>
      ) : null}
      {state.outcome === 'expired' ? (
        <>
          <h1 className="text-2xl font-medium tracking-tight">This link has expired</h1>
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
          {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
        </>
      ) : null}
      {state.outcome === 'pending' ? (
        <>
          <h1 className="text-2xl font-medium tracking-tight">Confirm from your email</h1>
          <p className="mt-3">{state.message || 'Open the confirmation link in the email we sent. This page does not confirm on its own.'}</p>
        </>
      ) : null}
    </PublicShell>
  );
}
