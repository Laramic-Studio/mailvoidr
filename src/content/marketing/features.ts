export type FeatureIcon =
  | 'send'
  | 'flask-conical'
  | 'inbox'
  | 'shield-check'
  | 'line-chart'
  | 'webhook'
  | 'key-round'
  | 'server'
  | 'layout-template'
  | 'list-checks'
  | 'users'
  | 'scan-eye';

export interface MarketingFeature {
  icon: FeatureIcon;
  title: string;
  desc: string;
  docHref: string;
}

export const FEATURES_HERO = {
  title: 'Everything in one email workspace.',
  subtitle:
    'Send production mail, capture test traffic, verify domains, and watch deliveries — without gluing together a relay, an inbox tool, and a webhook debugger.',
};

export const FEATURES_LIST: MarketingFeature[] = [
  {
    icon: 'send',
    title: 'Send',
    desc: 'Queue mail from the dashboard or `POST /api/v1/mail/send`. Credits, suppression checks, and async relay built in.',
    docHref: '/docs/send-first-email',
  },
  {
    icon: 'flask-conical',
    title: 'Sandbox inbox',
    desc: 'Capture mail on SMTP :2525, inspect HTML, and run spam and render checks before you enable live sending.',
    docHref: '/docs/testing-overview',
  },
  {
    icon: 'inbox',
    title: 'Virtual inboxes',
    desc: 'Create disposable addresses with TTL and optional forwarding — ideal for QA flows and integration tests.',
    docHref: '/docs/temporary-inboxes',
  },
  {
    icon: 'shield-check',
    title: 'Domain verification',
    desc: 'Add a sending domain, copy DNS records for SPF and DKIM, and verify from the dashboard.',
    docHref: '/docs/verify-domain',
  },
  {
    icon: 'line-chart',
    title: 'Analytics',
    desc: 'Volume, deliverability, opens, and clicks broken down by domain and template inside each workspace.',
    docHref: '/docs/api-reference',
  },
  {
    icon: 'webhook',
    title: 'Webhooks',
    desc: 'Subscribe to lifecycle events — queued, sent, delivered, bounced, opened, clicked — with signed payloads and replay.',
    docHref: '/docs/webhooks',
  },
  {
    icon: 'key-round',
    title: 'API keys',
    desc: 'Issue scoped keys for send, logs, domains, and templates. Revoke instantly when a credential leaks.',
    docHref: '/docs/authentication',
  },
  {
    icon: 'server',
    title: 'Live SMTP',
    desc: 'Connect your app over SMTP on port 2525 with workspace credentials — same deliverability path as the HTTP API.',
    docHref: '/docs/smtp',
  },
  {
    icon: 'layout-template',
    title: 'Templates',
    desc: 'Versioned HTML templates with variables, a workspace library, and a free marketplace to copy starter designs.',
    docHref: '/docs/templates',
  },
  {
    icon: 'list-checks',
    title: 'Email logs',
    desc: 'Filter outbound sends, open a full lifecycle timeline, inspect payloads, and retry failed messages.',
    docHref: '/docs/api-reference',
  },
  {
    icon: 'users',
    title: 'Teams',
    desc: 'Invite developers with role-based access — owner, admin, developer, billing, viewer — inside shared workspaces.',
    docHref: '/docs/authentication',
  },
  {
    icon: 'scan-eye',
    title: 'Open & click tracking',
    desc: 'Optional pixel and link wrapping on HTML sends. Events flow to analytics and webhook subscribers.',
    docHref: '/docs/send-first-email',
  },
];

export const FEATURES_PILLARS = [
  {
    kicker: 'Deliverability',
    title: 'Verified sending, parsed bounces',
    body:
      'Verify domains before you send, sign with DKIM, route bounces back through VERP addresses, and suppress hard-bounced recipients automatically.',
    stats: [
      ['SPF · DKIM', 'DNS guided setup'],
      ['VERP', 'bounce routing'],
    ] as const,
  },
  {
    kicker: 'Observability',
    title: 'Logs, analytics, and webhooks',
    body:
      'Every send gets a lifecycle timeline. Dashboard analytics summarize volume and engagement. Webhooks push the same events to your app with HMAC signatures.',
    stats: [
      ['8 events', 'lifecycle + engagement'],
      ['Replay', 'failed deliveries'],
    ] as const,
  },
  {
    kicker: 'Developer workflow',
    title: 'Test locally, ship confidently',
    body:
      'Point staging at a sandbox inbox or virtual address, iterate on templates, then flip on live sending with the same domain and credentials.',
    stats: [
      ['REST + SMTP', 'two send paths'],
      [':587', 'sandbox capture'],
    ] as const,
  },
] as const;

export const FEATURES_CTA = {
  title: 'See it in your workspace',
  body: 'Create an account, verify a domain, and send your first message in minutes.',
  primaryHref: '/register',
  primaryLabel: 'Start for free',
  secondaryHref: '/docs/quickstart',
  secondaryLabel: 'Read the quickstart',
};
