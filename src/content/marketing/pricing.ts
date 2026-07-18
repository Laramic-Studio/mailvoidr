export const PRICING_HERO = {
  eyebrow: 'Pricing',
  title: 'Simple pricing that grows with your business.',
  subtitle:
    'Production sending, sandbox testing, and virtual inboxes — one platform, one bill. Drag the slider to your volume or pick a plan.',
};

export const OVERAGE_PER_10K = 8;
export const ANNUAL_MONTHS_CHARGED = 10;
export const FREE_VOLUME_LIMIT = 3_000;
export const ENTERPRISE_VOLUME_THRESHOLD = 1_000_000;

export const VOLUME_STEPS = [
  3_000,
  10_000,
  30_000,
  50_000,
  75_000,
  100_000,
  250_000,
  300_000,
  500_000,
  750_000,
  1_000_000,
] as const;

/** Default slider step — 50K / Starter anchor. */
export const DEFAULT_VOLUME_STEP_INDEX = 3;

export type PlanSlug = 'free' | 'starter' | 'growth' | 'scale' | 'enterprise';

export interface PricingTier {
  slug: PlanSlug;
  name: string;
  blurb: string;
  includedEmails: number;
  priceMonthly: number | null;
  popular?: boolean;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    slug: 'free',
    name: 'Free',
    blurb: 'Students, personal projects, and prototypes.',
    includedEmails: 3_000,
    priceMonthly: 0,
    features: [
      '3,000 emails / month',
      '1 verified domain',
      '5 virtual inboxes',
      'Sandbox inbox + spam/HTML checks',
      '3,000 sandbox tests / month',
      'SMTP + REST API',
      '7-day email logs',
    ],
  },
  {
    slug: 'starter',
    name: 'Starter',
    blurb: 'Production apps and early-stage startups.',
    includedEmails: 50_000,
    priceMonthly: 20,
    popular: true,
    features: [
      '50,000 emails / month',
      '10 verified domains',
      '100 virtual inboxes',
      '3,000 sandbox tests / month',
      'Templates + marketplace',
      'Webhooks + replay',
      'Advanced analytics + geo',
      'Email search',
      '30-day log retention',
      '5 team members',
      'Priority email support',
    ],
  },
  {
    slug: 'growth',
    name: 'Growth',
    blurb: 'Growing SaaS teams and agencies.',
    includedEmails: 250_000,
    priceMonthly: 89,
    features: [
      '250,000 emails / month',
      '100 verified domains',
      'Unlimited virtual inboxes',
      'Unlimited sandbox testing',
      'Team workspaces + roles',
      'Deliverability insights',
      'API usage analytics',
      '90-day log retention',
      '25 team members',
      'Optional dedicated IP',
      'Priority support',
    ],
  },
  {
    slug: 'scale',
    name: 'Scale',
    blurb: 'High-volume production systems.',
    includedEmails: 750_000,
    priceMonthly: 199,
    features: [
      '750,000 emails / month',
      'Unlimited domains + inboxes',
      'Dedicated IP included',
      'Audit logs',
      'SAML SSO',
      '180-day log retention',
      'Unlimited team members',
      '99.9% SLA',
      'Slack support',
    ],
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    blurb: 'Regulated industries and custom infrastructure.',
    includedEmails: 1_000_000,
    priceMonthly: null,
    features: [
      '1M+ emails / month',
      'Private SMTP clusters',
      'Multi-region routing',
      'SCIM + enterprise SSO',
      'Custom SLAs + compliance',
      'Dedicated success manager',
      '24/7 support',
      'Custom onboarding',
    ],
  },
];

const STARTER_ANCHOR = { volume: 50_000, price: 20 };
const GROWTH_ANCHOR = { volume: 250_000, price: 89 };
const SCALE_ANCHOR = { volume: 750_000, price: 199 };

/** Starter band step prices (volume → monthly USD). */
export const STARTER_STEP_PRICES: ReadonlyArray<{ volume: number; price: number }> = [
  { volume: 10_000, price: 10 },
  { volume: 30_000, price: 15 },
  { volume: 50_000, price: 20 },
];

/** Exact-volume package prices that beat formula/overage quotes. */
export const VOLUME_STEP_OVERRIDES: ReadonlyArray<{
  volume: number;
  price: number;
  tier: PlanSlug;
}> = [{ volume: 500_000, price: 150, tier: 'growth' }];

export interface PricingQuote {
  price: number | null;
  tier: PlanSlug;
}

function starterBandPrice(volume: number): number {
  for (const step of STARTER_STEP_PRICES) {
    if (volume <= step.volume) return step.price;
  }
  return STARTER_ANCHOR.price;
}

function overagePrice(base: number, fromVolume: number, volume: number): number {
  return base + Math.ceil((volume - fromVolume) / 10_000) * OVERAGE_PER_10K;
}

/** Pick the cheapest valid plan quote — snaps up when the next tier is cheaper than overage. */
export function resolvePricingQuote(volume: number): PricingQuote {
  if (volume <= FREE_VOLUME_LIMIT) return { price: 0, tier: 'free' };

  const options: PricingQuote[] = [];

  if (volume <= STARTER_ANCHOR.volume) {
    options.push({ tier: 'starter', price: starterBandPrice(volume) });
  } else {
    options.push({
      tier: 'starter',
      price: overagePrice(STARTER_ANCHOR.price, STARTER_ANCHOR.volume, volume),
    });
  }

  if (volume >= STARTER_ANCHOR.volume) {
    if (volume <= GROWTH_ANCHOR.volume) {
      options.push({ tier: 'growth', price: GROWTH_ANCHOR.price });
    } else {
      options.push({
        tier: 'growth',
        price: overagePrice(GROWTH_ANCHOR.price, GROWTH_ANCHOR.volume, volume),
      });
    }
  }

  if (volume >= GROWTH_ANCHOR.volume && volume <= SCALE_ANCHOR.volume) {
    options.push({ tier: 'scale', price: SCALE_ANCHOR.price });
  } else if (volume > SCALE_ANCHOR.volume) {
    options.push({
      tier: 'scale',
      price: overagePrice(SCALE_ANCHOR.price, SCALE_ANCHOR.volume, volume),
    });
  }

  for (const override of VOLUME_STEP_OVERRIDES) {
    if (override.volume === volume) {
      options.push({ tier: override.tier, price: override.price });
    }
  }

  return options.reduce((best, option) =>
    option.price !== null && best.price !== null && option.price < best.price ? option : best,
  );
}

export function priceForVolume(volume: number): number | null {
  return resolvePricingQuote(volume).price;
}

export function tierForVolume(volume: number): PlanSlug {
  return resolvePricingQuote(volume).tier;
}

export function formatVolume(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export function formatVolumeLabel(n: number): string {
  if (n >= ENTERPRISE_VOLUME_THRESHOLD) return '1M+';
  return formatVolume(n);
}

export function displayPrice(monthly: number | null, annual: boolean): string {
  if (monthly === null) return 'Custom';
  if (monthly === 0) return '$0';
  const amount = annual ? monthly * ANNUAL_MONTHS_CHARGED : monthly;
  return `$${amount}`;
}

export const PRICING_COMPARE = [
  {
    group: 'Platform',
    rows: [
      ['Production send (API + SMTP)', true, true, true, true, true],
      ['Sandbox inbox + spam/HTML checks', true, true, true, true, true],
      ['Sandbox tests / month', '3K', '3K', 'Unlimited', 'Unlimited', 'Unlimited'],
      ['Virtual inboxes', true, true, true, true, true],
      ['Domain verification', true, true, true, true, true],
      ['Templates + marketplace', false, true, true, true, true],
      ['Webhooks', false, true, true, true, true],
    ],
  },
  {
    group: 'Sending',
    rows: [
      ['Monthly email volume', '3K', '50K', '250K', '750K', '1M+'],
      ['Verified domains', '1', '10', '100', 'Unlimited', 'Custom'],
      ['Virtual inbox limit', '5', '100', 'Unlimited', 'Unlimited', 'Unlimited'],
      ['Dedicated IP', false, 'Add-on', 'Add-on', true, true],
    ],
  },
  {
    group: 'Team & ops',
    rows: [
      ['Team members', '1', '5', '25', 'Unlimited', 'Unlimited'],
      ['Roles & permissions', false, false, true, true, true],
      ['Webhook replay', false, true, true, true, true],
      ['Email search', false, true, true, true, true],
      ['Audit logs', false, false, false, true, true],
    ],
  },
  {
    group: 'Reliability',
    rows: [
      ['Log retention', '7 days', '30 days', '90 days', '180 days', 'Custom'],
      ['Analytics', false, 'Advanced', 'Advanced', 'Advanced', 'Advanced'],
      ['SLA', false, false, false, '99.9%', 'Custom'],
      ['SAML SSO', false, false, false, true, true],
    ],
  },
] as const;

export const PRICING_FAQ = [
  [
    'Why one pricing page instead of separate send / sandbox tabs?',
    'Mailvoidr bundles production delivery, sandbox testing, and virtual inboxes. Competitors like Mailtrap split those into separate products — we include sandbox and virtual inboxes so you do not pay twice.',
  ],
  [
    'What counts as an email?',
    'Each unique recipient counts as one email. A message to three recipients counts as three.',
  ],
  [
    'How does the volume slider work?',
    'Pick your monthly send volume. 3K is Free. Starter steps are 10K ($10), 30K ($15), and 50K ($20). Package steps like 500K ($150) beat overage math when cheaper. Otherwise overage is $8 per 10K, with snap-up to the next tier when that wins.',
  ],
  [
    'Can I pick a volume between plan anchors?',
    'Yes. The slider quotes an exact monthly price for every step — including overage volumes. Enterprise features (private clusters, custom SLAs) are still via sales.',
  ],
  [
    'Is sandbox testing metered separately?',
    'Yes on Free and Starter — each plan includes 3,000 sandbox captures per month (API test sends and SMTP test inbox). Growth and above are unlimited. Production sends still drive the volume slider.',
  ],
  [
    'What about marketing / broadcast email?',
    'Broadcast campaigns are on the roadmap as a separate meter when they ship. Transactional and sandbox stay on this page.',
  ],
  [
    'Annual discount?',
    'Pay annually and get two months free on paid plans.',
  ],
] as const;

export const PRICING_ADDONS = [
  '10,000 extra emails — $8',
  '50,000 extra emails — $30',
  'Dedicated IP — $35/mo',
  'Extra team member — $8/mo',
  '25 extra domains — $10/mo',
  '365-day log retention — $15/mo',
] as const;
