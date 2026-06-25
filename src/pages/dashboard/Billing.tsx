import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useCreditMutations, useCredits, useCreditTransactions } from '@/hooks/useCredits';
import { toastError, toastSuccess } from '@/lib/toast';
import { ArrowUpRight, CreditCard, Download, Loader2 } from 'lucide-react';

export default function Billing() {
  const [tab, setTab] = useState('overview');
  const [searchParams, setSearchParams] = useSearchParams();
  const confirmedSession = useRef<string | null>(null);

  const { data, isLoading } = useCredits();
  const { data: transactionsData, isLoading: transactionsLoading } = useCreditTransactions();
  const { enableSending, checkout, confirmCheckout } = useCreditMutations();

  const credits = data?.credits;
  const transactions = transactionsData?.data ?? [];

  useEffect(() => {
    const checkoutState = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');

    if (checkoutState === 'cancelled') {
      toastError('Checkout cancelled.');
      setSearchParams({}, { replace: true });
      return;
    }

    if (checkoutState !== 'success' || !sessionId || confirmedSession.current === sessionId) {
      return;
    }

    confirmedSession.current = sessionId;

    confirmCheckout
      .mutateAsync(sessionId)
      .then((result) => {
        toastSuccess(result.message);
        setSearchParams({}, { replace: true });
      })
      .catch((error) => {
        toastError(error, 'Could not confirm payment.');
        setSearchParams({}, { replace: true });
      });
  }, [searchParams, setSearchParams, confirmCheckout]);

  async function handleEnableSending() {
    try {
      const result = await enableSending.mutateAsync();
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not enable live sending.');
    }
  }

  async function handlePurchase(packSize: number) {
    try {
      const result = await checkout.mutateAsync(packSize);
      window.location.href = result.checkout_url;
    } catch (error) {
      toastError(error, 'Could not start checkout.');
    }
  }

  const freeUsedPercent = credits
    ? Math.min(100, Math.round((credits.free_used / Math.max(credits.free_allowance, 1)) * 100))
    : 0;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Billing"
        description="Send credits, usage, and payment. Subscription plans ship in a later module."
        actions={
          credits?.live_sending_enabled && credits.billing_enabled ? (
            <Link
              to="/dashboard/smtp"
              data-testid="billing-smtp-link"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              SMTP credentials
            </Link>
          ) : null
        }
      />

      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {[
          ['overview', 'Overview'],
          ['usage', 'Usage'],
          ['invoices', 'Invoices'],
          ['payment', 'Payment methods'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            data-testid={`billing-tab-${id}`}
            className={`px-3.5 py-2 text-[13px] transition-colors ${
              tab === id
                ? '-mb-px border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && tab === 'overview' ? (
        <div className="flex justify-center p-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : null}

      {tab === 'overview' && credits && !isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {!credits.live_sending_enabled ? (
              <div className="border border-dashed border-border bg-card p-8 text-center">
                <h3 className="text-lg font-medium">Enable live sending</h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Turn on outbound sending before purchasing credits. You can also enable from the SMTP
                  page to get credentials immediately.
                </p>
                <button
                  type="button"
                  data-testid="billing-enable-sending"
                  disabled={enableSending.isPending}
                  onClick={handleEnableSending}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {enableSending.isPending ? 'Enabling…' : 'Enable live sending'}
                </button>
              </div>
            ) : (
              <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
                <StatCard label="Free this month" value={`${credits.free_remaining} / ${credits.free_allowance}`} />
                <StatCard label="Purchased balance" value={credits.purchased_balance.toLocaleString()} />
                <StatCard label="Total available" value={credits.total_available.toLocaleString()} />
              </div>
            )}

            {credits.live_sending_enabled ? (
              <div>
                <h3 className="mb-3 text-sm font-medium">Credit packs</h3>
                {!credits.billing_enabled ? (
                  <p className="text-[13px] text-muted-foreground">
                    Stripe checkout is not configured in this environment. Contact support to add credits.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {credits.credit_packs.map((pack) => (
                      <div
                        key={pack.size}
                        className="flex items-center justify-between border border-border bg-card p-4"
                      >
                        <div>
                          <div className="font-mono text-sm">{pack.size.toLocaleString()} sends</div>
                          <div className="text-[12px] text-muted-foreground">{pack.price_label} one-time</div>
                        </div>
                        <button
                          type="button"
                          data-testid={`billing-buy-${pack.size}`}
                          disabled={checkout.isPending}
                          onClick={() => handlePurchase(pack.size)}
                          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          Buy
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="border border-border bg-card p-5">
            <span className="label-mono">Status</span>
            <div className="mt-3 space-y-3 text-[13px]">
              <Row
                k="Live sending"
                v={<StatusBadge status={credits.live_sending_enabled ? 'active' : 'pending'} />}
              />
              <Row k="Free allowance" v={`${credits.free_allowance} / month`} />
              <Row k="Billing" v={credits.billing_enabled ? 'Stripe ready' : 'Not configured'} />
            </div>
            <p className="mt-5 text-[12px] text-muted-foreground">
              Subscription plans and invoices are part of the full billing module (Module 19).
            </p>
          </div>
        </div>
      ) : null}

      {tab === 'usage' && credits ? (
        <div className="space-y-6">
          <div className="border border-border bg-card p-5">
            <h3 className="text-sm font-medium">Free tier usage</h3>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {credits.free_used} of {credits.free_allowance} free sends used this month
            </p>
            <div className="mt-4 h-2 overflow-hidden bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${freeUsedPercent}%` }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>{credits.free_remaining} remaining</span>
              <span>{freeUsedPercent}% used</span>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-medium">Recent credit activity</h3>
            </div>
            {transactionsLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="p-6 text-[13px] text-muted-foreground">No transactions yet.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="label-mono p-3 text-left">Date</th>
                    <th className="label-mono p-3 text-left">Type</th>
                    <th className="label-mono p-3 text-left">Amount</th>
                    <th className="label-mono p-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono text-muted-foreground">
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={tx.type} label={tx.type.replace('_', ' ')} />
                      </td>
                      <td className="p-3 font-mono">
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-muted-foreground">{tx.description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}

      {tab === 'invoices' && (
        <div className="border border-dashed border-border bg-card p-12 text-center text-[13px] text-muted-foreground">
          Invoice history ships with Module 19 — full billing.
        </div>
      )}

      {tab === 'payment' && (
        <div className="space-y-4">
          <div className="border border-dashed border-border bg-card p-12 text-center text-[13px] text-muted-foreground">
            Saved payment methods ship with Module 19. Credit purchases use Stripe Checkout today.
          </div>
          <div className="border border-border bg-card p-5 flex items-center gap-4 opacity-60">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-[14px] text-muted-foreground">Payment methods — coming soon</div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-right">{v}</span>
    </div>
  );
}
