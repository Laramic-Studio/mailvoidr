import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PublicShell, publicButtonClass } from '@/components/newsletter/PublicShell';
import {
  fetchPublicUnsubscribe,
  publicNewsletterAction,
  submitPublicResubscribe,
  submitPublicUnsubscribe,
} from '@/lib/api/newsletter-public';
import { maskEmail } from '@/lib/newsletter/format';
import { getApiErrorMessage } from '@/lib/api';

interface UnsubscribePageProps {
  preference?: boolean;
}

export default function UnsubscribePage({ preference = false }: UnsubscribePageProps) {
  const { token = '' } = useParams();
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [resubscribed, setResubscribed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['public-unsubscribe', token],
    queryFn: () => fetchPublicUnsubscribe(token),
    enabled: Boolean(token),
    retry: false,
  });
  const unsubscribe = useMutation({ mutationFn: () => submitPublicUnsubscribe(token) });
  const resubscribe = useMutation({ mutationFn: () => submitPublicResubscribe(token) });
  const state = query.data;
  const status = localStatus ?? state?.status;

  async function handleUnsubscribe(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await unsubscribe.mutateAsync();
      setLocalStatus(result.status || 'unsubscribed');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not unsubscribe.'));
    }
  }

  async function handleResubscribe(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await resubscribe.mutateAsync();
      setResubscribed(maskEmail(result.masked_email || state?.masked_email));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not start a resubscribe.'));
    }
  }

  if (query.isLoading) {
    return <PublicShell tenantName="Mailvoidr"><p>Loading…</p></PublicShell>;
  }

  if (query.isError || !state) {
    return (
      <PublicShell tenantName="Mailvoidr">
        <h1 className="text-2xl font-medium tracking-tight">This link does not work</h1>
      </PublicShell>
    );
  }

  const tenant = state.tenant_name || 'this sender';
  const email = maskEmail(state.masked_email);

  if (resubscribed) {
    return (
      <PublicShell tenantName={tenant} logoUrl={state.logo_url}>
        <h1 className="text-2xl font-medium tracking-tight">Check your inbox to confirm.</h1>
        <p className="mt-3">We sent a confirmation link to {resubscribed}.</p>
      </PublicShell>
    );
  }

  if (status === 'unsubscribed') {
    return (
      <PublicShell tenantName={tenant} logoUrl={state.logo_url}>
        <h1 className="text-2xl font-medium tracking-tight">You&apos;re unsubscribed.</h1>
        <p className="mt-3">You won&apos;t get more emails from {tenant}.</p>
        {state.can_resubscribe ? (
          <form
            className="mt-6"
            method="post"
            action={publicNewsletterAction(`/public/newsletter/unsubscribe/${token}/resubscribe`)}
            onSubmit={(event) => void handleResubscribe(event)}
          >
            <button type="submit" className={publicButtonClass} disabled={resubscribe.isPending}>
              Resubscribe
            </button>
          </form>
        ) : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </PublicShell>
    );
  }

  return (
    <PublicShell tenantName={tenant} logoUrl={state.logo_url}>
      <h1 className="text-2xl font-medium tracking-tight">
        {preference ? 'Email preferences' : `Unsubscribe ${email} from ${tenant}?`}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {preference
          ? `Unsubscribe ${email} from all emails from ${tenant}.`
          : 'This page does not unsubscribe you until you press the button.'}
      </p>
      <form
        className="mt-6 space-y-4"
        method="post"
        action={publicNewsletterAction(`/public/newsletter/unsubscribe/${token}`)}
        onSubmit={(event) => void handleUnsubscribe(event)}
      >
        <button type="submit" className={publicButtonClass} disabled={unsubscribe.isPending}>
          {unsubscribe.isPending ? 'Working…' : 'Unsubscribe'}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </PublicShell>
  );
}
