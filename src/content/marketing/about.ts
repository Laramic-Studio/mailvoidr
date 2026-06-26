import { FREE_SENDS_PER_MONTH } from '@/content/marketing/home';

export const ABOUT_HERO = {
  title: "We're building email",
  titleMuted: 'for developers who ship.',
  paragraphs: [
    'Mailvoidr started from a simple frustration: sending mail meant juggling a relay, a test inbox, DNS scripts, and a webhook debugger — none of them shared the same logs.',
    'We are building one workspace where you send from an API or SMTP, capture test mail in a sandbox, verify domains, and trace every delivery with logs, analytics, and signed webhooks.',
    'The product is early. What ships today is real — REST + SMTP sending, virtual inboxes, templates, teams, and lifecycle webhooks — and we are expanding it in the open.',
  ],
};

export const ABOUT_METRICS = [
  [`${FREE_SENDS_PER_MONTH}`, 'free sends / month'],
  ['REST + SMTP', 'two send paths'],
  ['8 events', 'webhook lifecycle'],
  ['One workspace', 'send · test · trace'],
] as const;

export const ABOUT_FOCUS = [
  {
    title: 'Developer-first',
    body: 'HTTP API, scoped keys, honest docs, and a dashboard that shows raw send timelines — not just green checkmarks.',
  },
  {
    title: 'Test before live',
    body: 'Sandbox SMTP on :2525 and disposable virtual inboxes so staging never hits real inboxes or spends credits by accident.',
  },
  {
    title: 'Observable by default',
    body: 'Every send gets a lifecycle timeline. Webhooks push the same events to your app with signatures you can verify.',
  },
] as const;

export const ABOUT_CTA = {
  title: 'Try it in your workspace',
  body: 'Create an account, verify a domain, and send your first message — or read the docs if you prefer cURL first.',
  primaryHref: '/register',
  primaryLabel: 'Get started',
  secondaryHref: '/docs/quickstart',
  secondaryLabel: 'Read the quickstart',
  contactHref: '/contact',
  contactLabel: 'Contact us',
};
