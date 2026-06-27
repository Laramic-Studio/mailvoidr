import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import { Slider } from '@/components/ui/slider';
import { usePlans } from '@/hooks/usePlans';
import type { PricingCurrency } from '@/lib/api/plans';
import {
  billingPriceIsCustom,
  billingPriceIsFree,
  formatBillingPrice,
  readPricingCurrency,
  writePricingCurrency,
} from '@/lib/billing-display';
import type { BillingPlan } from '@/types';
import {
  formatVolumeLabel,
  isCustomVolume,
  PRICING_ADDONS,
  PRICING_COMPARE,
  PRICING_FAQ,
  PRICING_HERO,
  PRICING_TIERS,
  VOLUME_STEPS,
} from '@/content/marketing/pricing';

const FEATURES_BY_SLUG = Object.fromEntries(
  PRICING_TIERS.map((tier) => [tier.slug, tier.features]),
);

const INCLUDED_BY_SLUG = Object.fromEntries(
  PRICING_TIERS.map((tier) => [tier.slug, tier.includedEmails]),
);

function planCardPrice(plan: BillingPlan, annual: boolean) {
  return formatBillingPrice(plan.price, annual);
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [stepIndex, setStepIndex] = useState(2);
  const [currency, setCurrency] = useState<PricingCurrency>(() => readPricingCurrency());

  const volume = VOLUME_STEPS[stepIndex];
  const { data, isLoading } = usePlans(currency, volume);

  const activeSlug = data?.quote?.tier_slug;
  const quotePrice = data?.quote?.price;
  const custom = isCustomVolume(volume);
  const plans = data?.plans ?? [];

  const sliderLabels = useMemo(
    () => VOLUME_STEPS.map((v) => formatVolumeLabel(v)),
    [],
  );

  function handleCurrencyPreview(next: PricingCurrency) {
    setCurrency(next);
    writePricingCurrency(next);
  }

  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <span className="label-mono">{PRICING_HERO.eyebrow}</span>
          <h1 className="mt-2 max-w-3xl mx-auto text-5xl md:text-6xl tracking-tight font-medium leading-[1.02] text-balance">
            {PRICING_HERO.title}
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto">
            {PRICING_HERO.subtitle}
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="inline-flex border border-border rounded-md p-0.5 bg-card">
              <button
                type="button"
                onClick={() => handleCurrencyPreview('USD')}
                data-testid="pricing-currency-usd"
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  currency === 'USD' ? 'bg-accent text-foreground' : 'text-muted-foreground'
                }`}
              >
                Show USD
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyPreview('NGN')}
                data-testid="pricing-currency-ngn"
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  currency === 'NGN' ? 'bg-accent text-foreground' : 'text-muted-foreground'
                }`}
              >
                Show NGN
              </button>
            </div>

            <div className="inline-flex border border-border rounded-md p-0.5 bg-card">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                data-testid="billing-toggle-monthly"
                className={`px-4 py-1.5 rounded text-sm transition-colors ${!annual ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                data-testid="billing-toggle-annual"
                className={`px-4 py-1.5 rounded text-sm transition-colors ${annual ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
              >
                Annual{' '}
                <span className="ml-1 font-mono text-[10.5px] text-primary">2 mo free</span>
              </button>
            </div>
          </div>

       

          <div className="mx-auto mt-12 max-w-2xl text-left">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label-mono text-muted-foreground">Monthly production sends</p>
                <p className="mt-1 text-3xl font-medium tracking-tight" data-testid="volume-display">
                  {formatVolumeLabel(volume)}
                </p>
              </div>
              <div className="text-right">
                <p className="label-mono text-muted-foreground">Estimated price</p>
                <p className="mt-1 text-3xl font-medium tracking-tight text-primary" data-testid="price-display">
                  {isLoading
                    ? '…'
                    : formatBillingPrice(quotePrice, annual)}
                  {!isLoading && quotePrice && !billingPriceIsCustom(quotePrice) && !billingPriceIsFree(quotePrice) && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      /{annual ? 'yr' : 'mo'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Slider
              className="mt-6"
              min={0}
              max={VOLUME_STEPS.length - 1}
              step={1}
              value={[stepIndex]}
              onValueChange={([v]) => setStepIndex(v)}
              data-testid="volume-slider"
            />
            <div
              className="mt-2 grid font-mono text-[9px] text-muted-foreground sm:text-[10px]"
              style={{ gridTemplateColumns: `repeat(${VOLUME_STEPS.length}, minmax(0, 1fr))` }}
            >
              {sliderLabels.map((label, i) => (
                <span key={`${label}-${i}`} className="truncate text-center">
                  {label}
                </span>
              ))}
            </div>

            {custom && (
              <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[13px] text-muted-foreground">
                Custom volume — tier base plus $8 per extra 10,000 emails above included quota.
              </p>
            )}

            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Sandbox testing and virtual inboxes are included on every plan. Only production sends affect this slider.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-px bg-border border border-border">
            {(plans.length ? plans : PRICING_TIERS.map((tier) => ({
              id: tier.slug,
              slug: tier.slug,
              name: tier.name,
              description: tier.blurb,
              included_emails: tier.includedEmails,
              limits: null,
              popular: Boolean(tier.popular),
              price: {
                currency: currency,
                amount: tier.priceMonthly,
                amount_minor: null,
                formatted: tier.priceMonthly === null ? 'Custom' : `$${tier.priceMonthly}`,
                usd_amount: tier.priceMonthly,
              },
              quoted: false,
            }))).map((plan) => {
              const active = plan.slug === activeSlug;
              const features = FEATURES_BY_SLUG[plan.slug] ?? [];
              const includedEmails = plan.included_emails ?? INCLUDED_BY_SLUG[plan.slug] ?? 0;
              const priceLabel = isLoading && plans.length === 0
                ? '…'
                : planCardPrice(plan as BillingPlan, annual);
              const isCustom = billingPriceIsCustom(plan.price);
              const isFree = billingPriceIsFree(plan.price);

              return (
                <div
                  key={plan.slug}
                  data-testid={`plan-${plan.slug}`}
                  className={`bg-card p-6 flex flex-col transition-shadow ${
                    active ? 'relative ring-2 ring-primary -m-px z-10' : ''
                  } ${plan.popular && !active ? 'relative ring-1 ring-primary/40 -m-px' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-px left-6 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                      Recommended
                    </div>
                  )}
                  {active && (
                    <div className="absolute -top-px right-6 -translate-y-1/2 border border-primary bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      Your volume
                    </div>
                  )}
                  <h3 className="text-lg font-medium tracking-tight">{plan.name}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">{plan.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    {isCustom ? (
                      <span className="text-3xl font-medium">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-medium tracking-tight">{priceLabel}</span>
                        {!isFree && (
                          <span className="text-[12.5px] text-muted-foreground">
                            /{annual ? 'yr' : 'mo'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[10.5px] text-muted-foreground">
                    {active
                      ? `${formatVolumeLabel(volume)} selected`
                      : `${formatVolumeLabel(includedEmails)} included`}
                  </p>
                  <Link
                    to={
                      isCustom
                        ? '/contact'
                        : `/register?plan=${plan.slug}&volume=${volume}${annual ? '&annual=1' : ''}`
                    }
                    data-testid={`plan-cta-${plan.slug}`}
                    className={`mt-5 inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      active || plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border bg-background hover:bg-accent'
                    }`}
                  >
                    {isCustom ? 'Contact sales' : isFree ? 'Start free' : 'Get started'}
                  </Link>
                  <ul className="mt-6 space-y-2.5 text-[13px] flex-1">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="text-xl tracking-tight font-medium">Add-ons</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stack on any paid plan at checkout.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRICING_ADDONS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-[13px]"
              >
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium">Compare plans</h2>
          <div className="mt-8 border border-border bg-card overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium w-1/4">Features</th>
                  {PRICING_TIERS.map((p) => (
                    <th key={p.slug} className="text-left p-4 font-medium">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICING_COMPARE.map((g) => (
                  <Fragment key={g.group}>
                    <tr className="bg-background">
                      <td colSpan={6} className="label-mono px-4 py-2">
                        {g.group}
                      </td>
                    </tr>
                    {g.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-border last:border-0">
                        {row.map((cell, j) => (
                          <td
                            key={`${row[0]}-${j}`}
                            className={`px-4 py-3 ${j === 0 ? 'text-muted-foreground' : ''}`}
                          >
                            {cell === true ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : cell === false ? (
                              <X className="h-4 w-4 text-muted-foreground/40" />
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl tracking-tight font-medium text-center">Frequently asked</h2>
          <div className="mt-10 border-t border-border">
            {PRICING_FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-border py-5">
                <summary className="flex items-center justify-between cursor-pointer text-[15px] font-medium list-none">
                  {q}
                  <span className="font-mono text-muted-foreground group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
