import { mailSendUrl } from '@/content/marketing/home';
import {
  DOCS_SEND_ERROR_SAMPLE,
  DOCS_SEND_RESPONSE_SAMPLE,
} from '@/content/docs/samples';
import type { DocsPage, DocsSection, DocsTocItem } from '@/content/docs/types';

const SEND_URL = mailSendUrl();

function links(
  id: string,
  title: string,
  linksList: { href: string; label: string }[],
  body?: string,
): DocsSection {
  return { id, title, kind: 'links', body, links: linksList };
}

function prose(
  id: string,
  title: string,
  paragraphs: string[],
  callout?: { title: string; body: string; link?: { to: string; label: string } },
): DocsSection {
  return { id, title, kind: 'prose', paragraphs, callout };
}

function code(id: string, title: string, language: string, codeText: string, body?: string): DocsSection {
  return { id, title, kind: 'code', language, code: codeText, body };
}

const DOMAIN_CALLOUT = {
  title: 'Heads up',
  body: "You'll need a verified sending domain before live sending.",
  link: { to: '/docs/verify-domain', label: 'Verify a domain' },
};

const DEFAULT_NEXT = [
  { href: '/docs/quickstart', label: 'Quickstart guide' },
  { href: '/docs/api-reference', label: 'API reference' },
  { href: '/docs/webhooks', label: 'Webhooks' },
  { href: '/docs/testing-overview', label: 'Sandbox testing' },
];

export const DOCS_PAGES: Record<string, DocsPage> = {
  introduction: {
    title: 'Introduction',
    description: 'What Mailvoidr is, who it is for, and how the pieces fit together.',
    sections: [
      prose('overview', 'Overview', [
        'Mailvoidr is an email workspace for developers: send transactional mail from a REST API or SMTP relay, capture test traffic in a sandbox inbox, and trace every delivery with logs, analytics, and webhooks.',
        'Each team works inside a workspace with shared domains, templates, API keys, and SMTP credentials.',
      ]),
      prose('pieces', 'Core pieces', [
        'Send — POST /api/v1/mail/send or SMTP on port 2525 for live mail.',
        'Sandbox — SMTP on port 587 captures test messages without spending credits.',
        'Virtual inboxes — disposable addresses with TTL for QA flows.',
        'Domains — verify SPF and DKIM before you send from your own domain.',
        'Webhooks — signed callbacks for queued, sent, delivered, bounced, opened, and clicked events.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/quickstart', label: 'Send your first email' },
        { href: '/docs/authentication', label: 'Create an API key' },
        { href: '/docs/testing-overview', label: 'Set up sandbox testing' },
        { href: '/docs/verify-domain', label: 'Verify a sending domain' },
      ]),
    ],
  },

  quickstart: {
    title: 'Quickstart',
    description: 'Send a verified email from your domain using the HTTP API — with logs and webhooks ready in the dashboard.',
    sections: [
      prose(
        'intro',
        'Introduction',
        [
          'Mailvoidr exposes POST /api/v1/mail/send for production traffic and a sandbox SMTP listener on port 587 for test mail. Every outbound send is logged; verified domains get DKIM signing.',
        ],
        DOMAIN_CALLOUT,
      ),
      code(
        'auth',
        'Authenticate',
        'bash',
        'export MAILVOIDR_API_KEY="mv_live_your_key_here"',
        'Every request uses Authorization: Bearer with a scoped API key from the dashboard.',
      ),
      {
        id: 'send',
        title: 'Send your first email',
        kind: 'send-tabs',
        body: 'Pick a language tab — each example calls POST /api/v1/mail/send with the same JSON body.',
      },
      code(
        'response',
        'Inspect the response',
        'json',
        JSON.stringify(DOCS_SEND_RESPONSE_SAMPLE, null, 2),
        'A successful send returns 202 Accepted with the send ID and queued status. Look it up in Email logs.',
      ),
      code(
        'errors',
        'Handle errors',
        'json',
        JSON.stringify(DOCS_SEND_ERROR_SAMPLE, null, 2),
        'Errors return JSON with success: false, an error string, and optional field-level errors.',
      ),
      links('next', 'Next steps', DEFAULT_NEXT),
    ],
  },

  authentication: {
    title: 'Authentication',
    description: 'API keys for the send API and JWT sessions for the dashboard.',
    sections: [
      prose('intro', 'Two auth paths', [
        'The dashboard SPA uses JWT bearer tokens obtained from POST /api/v1/auth/login. Tokens refresh silently while you work.',
        'The public mail API uses workspace API keys — create them under Dashboard → API keys. Pass Authorization: Bearer mv_live_… on every send request.',
      ]),
      prose('scopes', 'Scopes and rotation', [
        'Keys can be scoped to send mail, read logs, manage domains, templates, and more. Rotate or revoke a key instantly if it leaks — the old token stops working immediately.',
      ]),
      code('example', 'Example header', 'bash', 'curl -H "Authorization: Bearer $MAILVOIDR_API_KEY" ...'),
      links('next', 'Next steps', [
        { href: '/docs/send-first-email', label: 'Send your first email' },
        { href: '/docs/smtp', label: 'SMTP credentials' },
        { href: '/docs/errors', label: 'Errors and rate limits' },
        { href: '/docs/api-reference', label: 'API reference' },
      ]),
    ],
  },

  'send-first-email': {
    title: 'Send your first email',
    description: 'Request body, headers, and response fields for POST /api/v1/mail/send.',
    sections: [
      prose('intro', 'Endpoint', [`POST ${SEND_URL}`, 'Requires a send-scoped API key. Returns 202 when the message is accepted into the queue.'], DOMAIN_CALLOUT),
      prose('fields', 'Required fields', [
        'from — verified sending address on your domain.',
        'to — array of recipient addresses (max 50).',
        'subject — up to 998 characters.',
        'html or text — at least one body part is required.',
      ]),
      prose('optional', 'Optional fields', [
        'cc, bcc — additional recipient arrays.',
        'reply_to — override the Reply-To header.',
        'track_opens, track_clicks — enable engagement tracking on HTML sends.',
      ]),
      { id: 'example', title: 'Example request', kind: 'send-tabs' },
      code('response', 'Response', 'json', JSON.stringify(DOCS_SEND_RESPONSE_SAMPLE, null, 2)),
      links('next', 'Next steps', [
        { href: '/docs/templates', label: 'Use a template' },
        { href: '/docs/webhooks', label: 'Subscribe to events' },
        { href: '/docs/smtp', label: 'Send over SMTP instead' },
      ]),
    ],
  },

  templates: {
    title: 'Templates',
    description: 'Versioned HTML templates with variables in your workspace library.',
    sections: [
      prose('intro', 'Workspace library', [
        'Create templates in Dashboard → Templates. Each template keeps a version history so you can roll back HTML changes.',
        'Use {{variable}} placeholders in HTML and pass values when sending from the dashboard compose form.',
      ]),
      prose('marketplace', 'Marketplace', [
        'Browse free starter designs under Template marketplace. Copy a template into your workspace and customize from there.',
      ]),
      code('preview', 'Preview from the API', 'bash', `# Dashboard JWT routes
GET  /api/v1/templates
POST /api/v1/templates/{id}/preview`),
      links('next', 'Next steps', [
        { href: '/docs/send-first-email', label: 'Send with a template' },
        { href: '/docs/testing-overview', label: 'Test HTML in sandbox first' },
      ]),
    ],
  },

  batching: {
    title: 'Batching',
    description: 'Sending to many recipients.',
    sections: [
      prose('today', 'Per-request limits', [
        'Each API request accepts up to 50 addresses in to, cc, and bcc combined. For larger lists, loop in your application or use a queue that calls the API once per recipient.',
        'Credits deduct per recipient. Suppression lists automatically skip hard-bounced addresses.',
      ]),
      prose('pattern', 'Bulk pattern', [
        'Push recipients into your job queue. Each worker sends one message (or a small batch under the limit). Record message IDs so you can reconcile delivery in Email logs.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/send-first-email', label: 'Send API' },
        { href: '/docs/errors', label: 'Rate limits' },
      ]),
    ],
  },

  'testing-overview': {
    title: 'Testing overview',
    description: 'Capture mail locally before enabling live sending.',
    sections: [
      prose('sandbox', 'Sandbox inbox', [
        'Each workspace gets a sandbox inbox. Point your app at SMTP port 587 with the credentials shown in Dashboard → SMTP → Test.',
        'Messages appear in the dashboard instantly — no credits consumed, no external delivery.',
      ]),
      prose('checks', 'What you can inspect', [
        'Full HTML and text bodies, headers, and raw source.',
        'Spam scoring and render previews on captured mail.',
        'Use this path in CI before flipping live sending on.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/temporary-inboxes', label: 'Virtual inboxes for CI' },
        { href: '/docs/spam-checker', label: 'Spam checker' },
        { href: '/docs/quickstart', label: 'Switch to live sending' },
      ]),
    ],
  },

  'temporary-inboxes': {
    title: 'Temporary inboxes',
    description: 'Disposable virtual email addresses with TTL and optional forwarding.',
    sections: [
      prose('intro', 'Virtual emails', [
        'Create addresses under Dashboard → Virtual emails. Each inbox can expire after a TTL or accept mail until you delete it.',
        'Optional forwarding sends a copy to a real address — useful when a test needs both capture and notification.',
      ]),
      code('api', 'API routes', 'bash', `GET    /api/v1/virtual-emails
POST   /api/v1/virtual-emails
GET    /api/v1/virtual-emails/{id}/messages`),
      links('next', 'Next steps', [
        { href: '/docs/testing-overview', label: 'Sandbox vs virtual inboxes' },
        { href: '/docs/quickstart', label: 'Live sending' },
      ]),
    ],
  },

  'spam-checker': {
    title: 'Spam checker',
    description: 'Run spam and render checks on captured sandbox mail.',
    sections: [
      prose('intro', 'When to use it', [
        'After your app delivers mail to the sandbox inbox, open a message in the dashboard to view spam score breakdown.',
        'Rules cover DKIM alignment, HTML ratio, unsubscribe headers, and common spam triggers — fix issues before you send to customers.',
      ]),
      prose('workflow', 'Workflow', [
        '1. Point staging at SMTP :587.',
        '2. Trigger the email from your app or test suite.',
        '3. Open the message in Dashboard → Sandbox and review the spam report.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/testing-overview', label: 'Testing overview' },
        { href: '/docs/verify-domain', label: 'Verify production domain' },
      ]),
    ],
  },

  'verify-domain': {
    title: 'Verify a domain',
    description: 'Add DNS records for SPF and DKIM, then verify from the dashboard.',
    sections: [
      prose('steps', 'Steps', [
        '1. Dashboard → Domains → Add domain (e.g. mail.yourdomain.com).',
        '2. Copy the SPF TXT and DKIM CNAME records into your DNS provider.',
        '3. Wait for propagation, then click Verify.',
        '4. Send from any address on that domain once status is verified.',
      ]),
      code('dns', 'Example records', 'text', `TXT  @           v=spf1 include:mailvoidr.com ~all
CNAME mailvoidr._domainkey  dkim.mailvoidr.com`),
      links('next', 'Next steps', [
        { href: '/docs/spf-dkim-dmarc', label: 'SPF, DKIM, DMARC explained' },
        { href: '/docs/send-first-email', label: 'Send from the domain' },
      ]),
    ],
  },

  'spf-dkim-dmarc': {
    title: 'SPF, DKIM, DMARC',
    description: 'How authentication records protect your domain reputation.',
    sections: [
      prose('spf', 'SPF', [
        'SPF tells receiving servers which IPs may send mail for your domain. Mailvoidr publishes the include target you add as a TXT record.',
      ]),
      prose('dkim', 'DKIM', [
        'DKIM signs each message with a private key. Recipients verify the signature using the public key in your DNS CNAME. Mailvoidr rotates signing keys per verified domain.',
      ]),
      prose('dmarc', 'DMARC', [
        'DMARC builds on SPF and DKIM. Start with p=none to collect reports, then tighten to quarantine or reject once alignment is stable.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/verify-domain', label: 'Verify your domain' },
        { href: '/docs/errors', label: 'Fix auth failures' },
      ]),
    ],
  },

  subdomains: {
    title: 'Subdomains',
    description: 'Sending from mail.example.com vs example.com.',
    sections: [
      prose('intro', 'Best practice', [
        'Verify the exact subdomain you send from — e.g. notifications.acme.com — rather than only the apex domain.',
        'Each verified domain gets its own SPF and DKIM records. You can verify multiple subdomains in one workspace.',
      ]),
      prose('from', 'From addresses', [
        'The from field must use an address on a verified domain. Subdomains do not inherit verification from the parent unless you verify them separately.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/verify-domain', label: 'Add a domain' },
        { href: '/docs/send-first-email', label: 'Send API' },
      ]),
    ],
  },

  'api-reference': {
    title: 'API reference',
    description: 'Key HTTP routes grouped by area.',
    sections: [
      prose('base', 'Base URL', [
        `All routes are under ${SEND_URL.replace('/mail/send', '')}.`,
        'Dashboard routes require Authorization: Bearer {jwt}. The mail send route uses API keys.',
      ]),
      code('send', 'Mail (API key)', 'text', `POST   /api/v1/mail/send
GET    /api/v1/mail/sends/{id}`),
      code('workspace', 'Workspace (JWT)', 'text', `GET    /api/v1/workspaces
GET    /api/v1/domains
POST   /api/v1/send
GET    /api/v1/sends
GET    /api/v1/webhooks
GET    /api/v1/analytics/overview
GET    /api/v1/virtual-emails
GET    /api/v1/sandbox/messages`),
      links('next', 'Next steps', [
        { href: '/docs/quickstart', label: 'Quickstart' },
        { href: '/docs/authentication', label: 'Authentication' },
        { href: '/docs/errors', label: 'Errors and rate limits' },
      ]),
    ],
  },

  smtp: {
    title: 'SMTP',
    description: 'Send through the same relay as the HTTP API using workspace credentials.',
    sections: [
      prose('intro', 'Credentials', [
        'Generate live SMTP username and password in Dashboard → SMTP → Live. Use port 2525 with plain SMTP (no TLS).',
        'Sandbox capture uses port 587 — do not point production traffic there.',
      ]),
      code('swaks', 'Quick test with swaks', 'bash', `swaks --to you@example.com \\
  --from hello@mail.yourdomain.com \\
  --server app.mailvoidr.com:2525 \\
  --auth-user YOUR_LIVE_SMTP_USER \\
  --auth-password YOUR_LIVE_SMTP_PASSWORD`),
      links('next', 'Next steps', [
        { href: '/docs/verify-domain', label: 'Verify a domain first' },
        { href: '/docs/send-first-email', label: 'REST API alternative' },
        { href: '/docs/webhooks', label: 'Delivery webhooks' },
      ]),
    ],
  },

  webhooks: {
    title: 'Webhooks',
    description: 'Signed POST callbacks for send and engagement events.',
    sections: [
      prose('intro', 'Register an endpoint', [
        'Dashboard → Webhooks → Add endpoint. Choose events or subscribe to all with the * wildcard.',
        'Mailvoidr signs each delivery with HMAC-SHA256 in the Mailvoidr-Signature header. Failed deliveries can be replayed from the UI.',
      ]),
      code('events', 'Event types', 'text', `email.queued
email.sent
email.delivered
email.opened
email.clicked
email.bounced
email.deferred
email.failed
email.complained`),
      code('payload', 'Example payload', 'json', JSON.stringify({
        id: 'whd_abc123',
        event: 'email.delivered',
        created_at: '2026-06-25T12:00:00Z',
        data: {
          email_send_id: 1842,
          message_id: '<...@mail.yourdomain.com>',
          to: ['riya@example.com'],
        },
      }, null, 2)),
      links('next', 'Next steps', [
        { href: '/docs/send-first-email', label: 'Send mail that triggers events' },
        { href: '/docs/errors', label: 'Handle failed deliveries' },
      ]),
    ],
  },

  errors: {
    title: 'Errors & rate limits',
    description: 'HTTP status codes and common failure responses.',
    sections: [
      prose('codes', 'HTTP status codes', [
        '202 — send accepted and queued.',
        '401 — missing or invalid API key / JWT.',
        '402 — plan email limit reached.',
        '403 — live sending disabled for the workspace.',
        '422 — validation error (check the errors object).',
        '429 — rate limit exceeded — back off and retry.',
      ]),
      code('example', 'Validation error', 'json', JSON.stringify(DOCS_SEND_ERROR_SAMPLE, null, 2)),
      prose('limits', 'Rate limits', [
        'POST /api/v1/mail/send is throttled per API key (120 requests per minute by default).',
        'Contact support if you need higher throughput on a dedicated deployment.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/verify-domain', label: 'Fix domain errors' },
        { href: '/docs/authentication', label: 'Rotate compromised keys' },
      ]),
    ],
  },
};

function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function getDocsPage(slug: string): DocsPage {
  const page = DOCS_PAGES[slug];
  if (page) {
    return page;
  }

  return {
    title: titleFromSlug(slug),
    description: `Documentation for ${titleFromSlug(slug).toLowerCase()}.`,
    sections: [
      prose('intro', 'Coming soon', [
        'This page is not written yet. Check the quickstart and API reference for what is available today.',
      ]),
      links('next', 'Start here', DEFAULT_NEXT),
    ],
  };
}

export function getDocsToc(slug: string): DocsTocItem[] {
  return getDocsPage(slug).sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));
}
