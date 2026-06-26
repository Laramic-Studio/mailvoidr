import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Slider } from '@/components/ui/slider';
import { useBilling, useBillingMutations } from '@/hooks/useBilling';
import { useCreditMutations } from '@/hooks/useCredits';
import { usePlans } from '@/hooks/usePlans';
import {
  billingPriceIsCustom,
  formatBillingPrice,
  formatVolumeLabel,
} from '@/lib/billing-display';
import type { PricingCurrency } from '@/types';
import { VOLUME_STEPS } from '@/content/marketing/pricing';
import { toastError, toastSuccess } from '@/lib/toast';
import { ArrowUpRight, Loader2 } from 'lucide-react';

function defaultStepIndex(volume: number | null | undefined): number {
  if (!volume) return 4;
  const idx = VOLUME_STEPS.findIndex((step) => step === volume);
  if (idx >= 0) return idx;
  const closest = VOLUME_STEPS.reduce((best, step, index) => {
    const bestDiff = Math.abs(VOLUME_STEPS[best] - volume);
    const stepDiff = Math.abs(step - volume);
    return stepDiff < bestDiff ? index : best;
  }, 0);
  return closest;
}

export default function Billing() {
  const [tab, setTab] = useState('overview');
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState<PricingCurrency>('USD');
  const [searchParams, setSearchParams] = useSearchParams();
  const confirmedRef = useRef<string | null>(null);

  const { data: billing, isLoading: billingLoading } = useBilling();
  const { enableSending } = useCreditMutations();
  const { checkout, confirmCheckout } = useBillingMutations();

  const [stepIndex, setStepIndex] = useState(4);
  const volume = VOLUME_STEPS[stepIndex];

  const { data: plansData, isLoading: plansLoading } = usePlans(currency, volume);

  const quote = plansData?.quote;
  const quotedPlan = useMemo(
    () => plansData?.plans.find((plan) => plan.quoted) ?? null,
    [plansData?.plans],
  );
  const liveSendingEnabled = billing?.live_sending_enabled ?? false;

  useEffect(() => {
    if (billing?.subscription?.monthly_volume) {
      setStepIndex(defaultStepIndex(billing.subscription.monthly_volume));
    }
  }, [billing?.subscription?.monthly_volume]);

  useEffect(() => {
    const checkoutState = searchParams.get('checkout');
    const reference = searchParams.get('reference') ?? searchParams.get('trxref');

    if (checkoutState === 'cancelled') {
      toastError('Checkout cancelled.');
      setSearchParams({}, { replace: true });
      return;
    }

    if (checkoutState === 'paystack' && reference && confirmedRef.current !== reference) {
      confirmedRef.current = reference;
      confirmCheckout
        .mutateAsync({ reference })
        .then((result) => {
          toastSuccess(result.message);
          setSearchParams({}, { replace: true });
        })
        .catch((error) => {
          toastError(error, 'Could not confirm Paystack payment.');
          setSearchParams({}, { replace: true });
        });
    }
  }, [searchParams, setSearchParams, confirmCheckout]);

  async function handleEnableSending() {
    try {
      const result = await enableSending.mutateAsync();
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not enable live sending.');
    }
  }

  async function handleSubscribe() {
    if (!quotedPlan || billingPriceIsCustom(quotedPlan.price)) {
      return;
    }

    try {
      const result = await checkout.mutateAsync({
        plan_id: quotedPlan.id,
        volume,
        currency,
        annual,
      });
      window.location.href = result.checkout_url;
    } catch (error) {
      toastError(error, 'Could not start checkout.');
    }
  }

  const paymentOptions = billing?.payment_options ?? [
    { provider: 'paystack' as const, currency: 'USD' as const, label: 'Pay in USD', usd_ngn_rate: 1300 },
    { provider: 'paystack' as const, currency: 'NGN' as const, label: 'Pay in NGN', usd_ngn_rate: 1300 },
  ];

  const currentPlan = billing?.plan;
  const isLoading = billingLoading || plansLoading;
  const subscription = billing?.subscription;
  const needsRenewal = subscription?.needs_renewal ?? false;
  const subscriptionExpired = Boolean(subscription && subscription.is_active === false);
  const subscribeLabel = quotedPlan?.slug === 'enterprise'
    ? 'Contact sales'
    : needsRenewal || subscriptionExpired
      ? 'Renew plan'
      : currentPlan?.slug === 'free'
        ? 'Subscribe'
        : 'Change plan';

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Billing"
        description="Manage your workspace plan, volume, and payment."
        actions={
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent"
          >
            Compare plans
          </Link>
        }
      />

      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {[
          ['overview', 'Overview'],
          ['usage', 'Usage'],
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

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {needsRenewal && (
              <div
                className={`border p-5 ${
                  subscriptionExpired
                    ? 'border-destructive/40 bg-destructive/5'
                    : 'border-amber-500/40 bg-amber-500/5'
                }`}
              >
                <h3 className="text-sm font-medium">
                  {subscriptionExpired ? 'Subscription expired' : 'Renewal due soon'}
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {subscriptionExpired
                    ? 'Your paid plan has ended. Renew below to restore your volume and features. Auto-renew is not enabled yet — checkout again each billing period.'
                    : `Your plan ends on ${
                        subscription?.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : 'soon'
                      }. Renew now to avoid dropping back to the free tier.`}
                </p>
              </div>
            )}

            {!liveSendingEnabled && (
              <div className="border border-dashed border-border bg-card p-6">
                <h3 className="text-base font-medium">Enable live sending</h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Turn on outbound sending before subscribing to a paid plan.
                </p>
                <button
                  type="button"
                  data-testid="billing-enable-sending"
                  disabled={enableSending.isPending}
                  onClick={handleEnableSending}
                  className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {enableSending.isPending ? 'Enabling…' : 'Enable live sending'}
                </button>
              </div>
            )}

            <div className="border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="label-mono">Current plan</span>
                  <h3 className="mt-2 text-2xl font-medium tracking-tight">
                    {isLoading ? '…' : currentPlan?.name ?? 'Free'}
                  </h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {currentPlan?.description ?? 'Upgrade for higher volume and team features.'}
                  </p>
                </div>
                {subscription && (
                  <StatusBadge
                    status={
                      subscription.is_active === false
                        ? 'expired'
                        : subscription.status
                    }
                  />
                )}
              </div>

              {billing?.subscription && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[13px]">
                  <Row
                    k="Volume"
                    v={formatVolumeLabel(billing.subscription.monthly_volume ?? 0)}
                  />
                  <Row k="Provider" v={billing.subscription.provider ?? '—'} />
                  <Row
                    k={subscriptionExpired ? 'Expired' : 'Renews'}
                    v={
                      billing.subscription.current_period_end
                        ? new Date(billing.subscription.current_period_end).toLocaleDateString()
                        : '—'
                    }
                  />
                </div>
              )}
            </div>

            <div className="border border-border bg-card p-6">
              <h3 className="text-base font-medium">Choose volume & plan</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Slide to your monthly production send volume. Price updates automatically.
              </p>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="label-mono text-muted-foreground">Monthly sends</p>
                  <p className="mt-1 text-2xl font-medium">{formatVolumeLabel(volume)}</p>
                </div>
                <div className="text-right">
                  <p className="label-mono text-muted-foreground">Quoted plan</p>
                  <p className="mt-1 text-2xl font-medium text-primary">
                    {isLoading ? '…' : quotedPlan?.name ?? '—'}
                  </p>
                </div>
              </div>

              <Slider
                className="mt-6"
                min={0}
                max={VOLUME_STEPS.length - 1}
                step={1}
                value={[stepIndex]}
                onValueChange={([value]) => setStepIndex(value)}
                data-testid="billing-volume-slider"
              />

              <div className="mt-8">
                <p className="label-mono text-muted-foreground">Checkout currency</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  All payments are processed securely via Paystack.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.currency}
                      type="button"
                      data-testid={`billing-currency-${option.currency.toLowerCase()}`}
                      onClick={() => setCurrency(option.currency)}
                      className={`rounded-md border p-4 text-left transition-colors ${
                        currency === option.currency
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        Paystack · {option.currency}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div>
                  <p className="label-mono text-muted-foreground">Total</p>
                  <p className="mt-1 text-3xl font-medium">
                    {isLoading
                      ? '…'
                      : formatBillingPrice(quote?.price ?? quotedPlan?.price, annual)}
                    {!isLoading && quote?.price && quote.price.amount && quote.price.amount > 0 && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        /{annual ? 'yr' : 'mo'}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnual(false)}
                    className={`rounded-md px-3 py-1.5 text-[12px] ${!annual ? 'bg-accent' : 'text-muted-foreground'}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnual(true)}
                    className={`rounded-md px-3 py-1.5 text-[12px] ${annual ? 'bg-accent' : 'text-muted-foreground'}`}
                  >
                    Annual
                  </button>
                </div>
              </div>

              <button
                type="button"
                data-testid="billing-subscribe"
                disabled={
                  checkout.isPending
                  || isLoading
                  || !quotedPlan
                  || billingPriceIsCustom(quotedPlan.price)
                  || !liveSendingEnabled
                }
                onClick={handleSubscribe}
                className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
              >
                {checkout.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                {quotedPlan?.slug === 'enterprise' ? 'Contact sales' : subscribeLabel}
              </button>
            </div>
          </div>

          <div className="border border-border bg-card p-5 h-fit">
            <span className="label-mono">Summary</span>
            <div className="mt-3 space-y-3 text-[13px]">
              <Row
                k="Live sending"
                v={<StatusBadge status={liveSendingEnabled ? 'active' : 'pending'} />}
              />
              <Row k="Quoted tier" v={quotedPlan?.name ?? '—'} />
              <Row k="Payment" v="Paystack" />
              <Row k="Currency" v={currency} />
              {billing?.usage?.emails && (
                <Row
                  k="Emails this month"
                  v={
                    billing.usage.emails.limit === null
                      ? `${billing.usage.emails.used.toLocaleString()} sent`
                      : `${billing.usage.emails.used.toLocaleString()} / ${billing.usage.emails.limit.toLocaleString()}`
                  }
                />
              )}
            </div>
            <p className="mt-5 text-[12px] text-muted-foreground">
              Payments via Paystack. Plans renew manually each period until auto-renew ships.
            </p>
          </div>
        </div>
      )}

      {tab === 'usage' && billing?.usage && (
        <div className="border border-border bg-card p-6">
          <h3 className="text-sm font-medium">Plan usage</h3>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Monthly limits for your current workspace plan.
          </p>
          <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <UsageStat
              label="Emails"
              used={billing.usage.emails.used}
              limit={billing.usage.emails.limit}
            />
            <UsageStat
              label="Domains"
              used={billing.usage.domains.used}
              limit={billing.usage.domains.limit}
            />
            <UsageStat
              label="Virtual inboxes"
              used={billing.usage.virtual_inboxes.used}
              limit={billing.usage.virtual_inboxes.limit}
            />
            <UsageStat
              label="Team members"
              used={billing.usage.team_members.used}
              limit={billing.usage.team_members.limit}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function UsageStat({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const value =
    limit === null
      ? `${used.toLocaleString()} used`
      : `${used.toLocaleString()} / ${limit.toLocaleString()}`;

  return <StatCard label={label} value={value} />;
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
