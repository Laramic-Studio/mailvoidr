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

function table(
  id: string,
  title: string,
  columns: string[],
  rows: string[][],
  body?: string,
): DocsSection {
  return { id, title, kind: 'table', columns, rows, body };
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
        'export MAILVOIDR_API_KEY="mvdr_live_your_key_here"',
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
        'The public mail API uses workspace API keys. Create them under Dashboard → API keys. Pass Authorization: Bearer mvdr_live_… or mvdr_test_… on every request.',
      ]),
      prose('environments', 'Live vs test keys', [
        'Live keys (mvdr_live_…) send real mail and require a verified domain. Test keys (mvdr_test_…) route POST /api/v1/mail/send to your sandbox inbox — same endpoint, no credits consumed.',
        'Use test keys in CI and staging. Swap to a live key only when you are ready for production delivery.',
      ]),
      table('scopes', 'API key scopes', ['Scope', 'Environment', 'Grants'], [
        ['send.write', 'Live', 'Queue mail via POST /api/v1/mail/send'],
        ['logs.read', 'Live', 'Read send status via GET /api/v1/mail/sends/{id}'],
        ['domains.read', 'Live', 'List verified domains (read-only)'],
        ['templates.read', 'Live', 'List workspace templates (read-only)'],
        ['analytics.read', 'Live', 'Read delivery analytics (read-only)'],
        ['sandbox.send', 'Test', 'Capture mail via POST /api/v1/mail/send'],
        ['sandbox.messages.read', 'Test', 'Read captured sandbox messages'],
        ['sandbox.messages.write', 'Test', 'Delete or mutate sandbox messages'],
      ]),
      prose('rotation', 'Rotation and security', [
        'Keys are shown once at creation — store them in a secrets manager. Revoke a compromised key immediately; the token stops working on the next request.',
        'Scope keys to the minimum permissions your service needs. A worker that only sends mail needs send.write, not analytics.read.',
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
      prose('intro', 'Endpoint', [`POST ${SEND_URL}`, 'Requires a send-scoped API key (send.write for live, sandbox.send for test). Returns 202 when the message is accepted into the queue.'], DOMAIN_CALLOUT),
      table('headers', 'Headers', ['Header', 'Required', 'Value'], [
        ['Authorization', 'Yes', 'Bearer {api_key}'],
        ['Content-Type', 'Yes', 'application/json'],
      ]),
      table('body', 'Request body', ['Field', 'Type', 'Required', 'Description'], [
        ['from', 'string', 'Yes', 'Sender email on a verified domain (live) or any address (test). Max 255 chars.'],
        ['from_name', 'string', 'No', 'Display name shown to recipients. Max 255 chars.'],
        ['to', 'string[]', 'Yes', 'Recipient addresses. Min 1, max 50.'],
        ['cc', 'string[]', 'No', 'Carbon-copy recipients. Max 50 combined with to and bcc.'],
        ['bcc', 'string[]', 'No', 'Blind carbon-copy recipients. Max 50 combined.'],
        ['subject', 'string', 'Yes*', 'Email subject. Optional when template_id is set — uses rendered template subject.'],
        ['html', 'string', 'One of html/text', 'HTML body. Required if text is omitted.'],
        ['text', 'string', 'One of html/text', 'Plain-text body. Required if html is omitted.'],
        ['reply_to', 'string', 'No', 'Reply-To header override. Valid email, max 255 chars.'],
        ['template_id', 'string', 'One of body/template', 'Workspace template ID — renders HTML instead of html/text.'],
        ['template_version_id', 'string', 'No', 'Pin a template version. Defaults to current.'],
        ['variables', 'object', 'No', 'Values for {{placeholders}} when using template_id.'],
        ['track_opens', 'boolean', 'No', 'Embed a tracking pixel in HTML sends. Default false.'],
        ['track_clicks', 'boolean', 'No', 'Rewrite links for click tracking in HTML sends. Default false.'],
      ]),
      { id: 'example', title: 'Example request', kind: 'send-tabs' },
      table('response-fields', 'Response fields', ['Field', 'Type', 'Description'], [
        ['success', 'boolean', 'true on acceptance.'],
        ['id', 'integer', 'Send ID — use with GET /api/v1/mail/sends/{id} or webhooks.'],
        ['message_id', 'string', 'RFC Message-ID assigned to the outbound message.'],
        ['status', 'string', 'Initial status, typically queued.'],
        ['email_usage', 'object', 'used, limit, and remaining counts for the workspace plan (live only).'],
      ]),
      code('response', 'Example response', 'json', JSON.stringify(DOCS_SEND_RESPONSE_SAMPLE, null, 2)),
      links('next', 'Next steps', [
        { href: '/docs/templates', label: 'Use a template' },
        { href: '/docs/webhooks', label: 'Subscribe to events' },
        { href: '/docs/smtp', label: 'Send over SMTP instead' },
      ]),
    ],
  },

  templates: {
    title: 'Templates',
    description: 'Send versioned HTML templates with dynamic variables through POST /api/v1/mail/send.',
    sections: [
      prose('intro', 'Overview', [
        'Templates are reusable HTML designs stored in your workspace. Each template has a version history — publish a new version without breaking sends that pin an older one.',
        'Create and edit templates in Dashboard → Templates, or copy a starter from the Template marketplace. Send them with your API key on the same endpoint as regular mail.',
      ]),
      prose('variables', 'Variables', [
        'Use {{variable_name}} placeholders in the subject and HTML body. Define defaults when creating the template in the dashboard; override per send with the variables object.',
        'Unknown placeholders are left as-is. Required variables without a default must be supplied at send time or validation fails.',
      ]),
      table('send-fields', 'Send with a template', ['Field', 'Type', 'Required', 'Description'], [
        ['template_id', 'string', 'Yes', 'Template ID from Dashboard → Templates.'],
        ['variables', 'object', 'No', 'Key/value pairs merged into {{placeholders}}. Keys match variable names.'],
        ['template_version_id', 'string', 'No', 'Pin a specific version. Omit to use the current published version.'],
        ['subject', 'string', 'No', 'Override the template subject. Defaults to the rendered template subject.'],
        ['from', 'string', 'Yes', 'Sender on a verified domain (same as a normal send).'],
        ['to', 'string[]', 'Yes', 'Recipients — up to 50.'],
        ['html / text', '—', 'No', 'Do not send body fields when using template_id.'],
      ]),
      code('example', 'Example request', 'json', JSON.stringify({
        from: 'hello@mail.yourdomain.com',
        to: ['riya@example.com'],
        template_id: '01HXYZ…',
        variables: {
          name: 'Riya',
          reset_url: 'https://app.acme.com/reset/abc123',
        },
        track_opens: true,
      }, null, 2), `POST ${SEND_URL} with Authorization: Bearer {api_key}. Returns 202 with the same response shape as a regular send.`),
      prose('versions', 'Versioning', [
        'Every HTML edit publishes a new version. Sends without template_version_id always use the latest current version.',
        'Pin template_version_id when you need a stable render — for example during a gradual rollout or A/B test.',
      ]),
      prose('marketplace', 'Marketplace', [
        'Browse starter designs under Dashboard → Template marketplace. Adding one copies it into your workspace library where you can customize HTML and variables before sending.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/send-first-email', label: 'Send API reference' },
        { href: '/docs/testing-overview', label: 'Test in sandbox first' },
        { href: '/docs/webhooks', label: 'Track delivery events' },
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
      prose('api-test', 'Test via the HTTP API', [
        'Create a test API key (mvdr_test_…) under Dashboard → API keys → Test. POST to the same /api/v1/mail/send endpoint — mail lands in your sandbox inbox instead of being delivered.',
        'No verified domain is required when using a test key. Use this path in CI pipelines where SMTP is unavailable.',
      ]),
      prose('checks', 'What you can inspect', [
        'Full HTML and text bodies, headers, and raw source.',
        'Spam scoring and render previews on captured mail.',
        'Use this path in CI before flipping live sending on.',
      ]),
      links('next', 'Next steps', [
        { href: '/docs/temporary-inboxes', label: 'Virtual inboxes for CI' },
        { href: '/docs/spam-checker', label: 'Spam checker' },
        { href: '/docs/authentication', label: 'Test API keys' },
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
        `Production: ${SEND_URL.replace('/mail/send', '')}`,
        'Dashboard routes require Authorization: Bearer {jwt}. Mail routes use API keys.',
      ]),
      table('auth-summary', 'Authentication by route group', ['Route group', 'Auth', 'Notes'], [
        ['POST /api/v1/mail/send', 'API key', 'Live (send.write) or test (sandbox.send) key'],
        ['GET /api/v1/mail/sends/{id}', 'API key', 'Live key with logs.read scope'],
        ['Dashboard routes below', 'JWT', 'Obtained from POST /api/v1/auth/login'],
      ]),
      code('send', 'Mail (API key)', 'text', `POST   /api/v1/mail/send          Queue or capture a message
GET    /api/v1/mail/sends/{id}    Retrieve send status and timestamps`),
      code('workspace', 'Workspace (JWT)', 'text', `GET    /api/v1/workspaces
GET    /api/v1/domains
POST   /api/v1/domains
GET    /api/v1/api-keys
POST   /api/v1/api-keys
GET    /api/v1/templates
POST   /api/v1/templates/{id}/preview
GET    /api/v1/sends
GET    /api/v1/webhooks
POST   /api/v1/webhooks
GET    /api/v1/analytics/overview
GET    /api/v1/virtual-emails
GET    /api/v1/sandbox/messages
GET    /api/v1/smtp-credentials`),
      links('next', 'Next steps', [
        { href: '/docs/send-first-email', label: 'Send API parameters' },
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
        'Mailvoidr signs each delivery with HMAC-SHA256. Failed deliveries can be replayed from the UI.',
      ]),
      table('headers', 'Delivery headers', ['Header', 'Description'], [
        ['Mailvoidr-Signature', 't={unix_ts},v1={hex_hmac} — verify before processing'],
        ['Mailvoidr-Event', 'Event type, e.g. email.delivered'],
        ['Mailvoidr-Delivery-Id', 'Unique delivery ID for idempotency'],
        ['Content-Type', 'application/json'],
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
      code('verify', 'Verify signatures', 'javascript', `import crypto from 'node:crypto';

function verifyWebhook(rawBody, signatureHeader, secret, toleranceSec = 300) {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => p.trim().split('=')),
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;

  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}`,
        'Use the raw request body (not re-serialized JSON). The signed payload is {timestamp}.{body}.',
      ),
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
      table('codes', 'HTTP status codes', ['Status', 'Meaning', 'Action'], [
        ['202', 'Send accepted and queued', 'Store id for status lookups and webhooks'],
        ['401', 'Missing or invalid API key / JWT', 'Check Authorization header and key prefix'],
        ['402', 'Plan email limit reached', 'Upgrade plan or wait for quota reset'],
        ['403', 'Live sending disabled', 'Enable live sending in Dashboard → Settings'],
        ['422', 'Validation error', 'Inspect the errors object for field details'],
        ['429', 'Rate limit exceeded', 'Back off and retry with exponential delay'],
      ]),
      code('example', 'Validation error', 'json', JSON.stringify(DOCS_SEND_ERROR_SAMPLE, null, 2)),
      table('limits', 'Rate limits', ['Key type', 'Limit', 'Window'], [
        ['Live API key', '120 requests', 'Per minute per key'],
        ['Test API key', '300 requests', 'Per minute per key'],
      ], 'Contact support if you need higher throughput on a dedicated deployment.'),
      links('next', 'Next steps', [
        { href: '/docs/verify-domain', label: 'Fix domain errors' },
        { href: '/docs/authentication', label: 'Rotate compromised keys' },
      ]),
    ],
  },

  sdks: {
    title: 'SDKs',
    description: 'Official client libraries for common runtimes.',
    sections: [
      prose('intro', 'Official SDKs', [
        'SDKs wrap POST /api/v1/mail/send with typed request/response objects, automatic retries on transient failures, and environment-aware defaults.',
        'All SDKs read MAILVOIDR_API_KEY from the environment. Live and test keys use the same client — routing is determined by the key prefix.',
      ]),
      table('packages', 'Available packages', ['Runtime', 'Package', 'Install'], [
        ['Node.js', '@mailvoidr/node', 'npm install @mailvoidr/node'],
        ['NestJS', '@mailvoidr/nestjs', 'npm install @mailvoidr/nestjs'],
        ['Laravel', 'mailvoidr/laravel', 'composer require mailvoidr/laravel'],
        ['Spring Boot', 'com.mailvoidr:springboot', 'See GitHub for Maven coordinates'],
      ]),
      code('node', 'Node.js', 'typescript', `import { MailvoidrClient } from '@mailvoidr/node';

const mailvoidr = new MailvoidrClient(process.env.MAILVOIDR_API_KEY!);

const { id, status } = await mailvoidr.send({
  to: ['riya@example.com'],
  subject: 'Welcome to Acme',
  html: '<h1>Hey Riya</h1>',
  track_opens: true,
});`),
      code('laravel', 'Laravel', 'php', `// .env
MAIL_MAILER=mailvoidr
MAILVOIDR_API_KEY=mvdr_live_your_key_here

// Anywhere in your app
Mail::to('riya@example.com')->send(new WelcomeMail());`,
        'The Laravel mail transport sends via the HTTP API. Swap to a test key in phpunit.xml to capture mail in sandbox.',
      ),
      links('next', 'Next steps', [
        { href: '/docs/quickstart', label: 'Quickstart without an SDK' },
        { href: '/docs/send-first-email', label: 'Raw API parameters' },
        { href: '/docs/testing-overview', label: 'Test keys in CI' },
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
