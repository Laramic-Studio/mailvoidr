export const FREE_SENDS_PER_MONTH = 100;

export function mailSendUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? 'https://app.mailvoidr.com/api/v1';
  const origin = base.replace(/\/api\/v1\/?$/, '');
  return `${origin}/api/v1/mail/send`;
}

export const HOME_HERO = {
  eyebrow: {
    label: 'New',
    text: 'Open and click tracking on every HTML send',
    href: '/features',
  },
  title: 'Email infrastructure',
  titleMuted: 'for developers who ship.',
  subtitle:
    'Send transactional mail from a REST API or SMTP relay, test in a sandbox inbox, and trace every delivery — webhooks, logs, and analytics in one dashboard.',
  bullets: ['No credit card', `${FREE_SENDS_PER_MONTH} sends free every month`, 'API keys in under a minute'],
};

export const HOME_STACK = ['REST API', 'Live SMTP', 'Sandbox capture', 'Webhooks', 'Templates', 'Analytics'];

export const HOME_SEND_FEATURES = [
  'HTTP API with scoped keys — or connect over SMTP on port 587',
  'Verified domains with SPF, DKIM, and DMARC guidance',
  'Signed webhooks for queued, sent, delivered, bounced, opened, and clicked',
  'Virtual inboxes and a workspace sandbox for local testing',
];

export const HOME_METRICS = [
  [`${FREE_SENDS_PER_MONTH}`, 'free sends / month'],
  ['REST + SMTP', 'two ways to send'],
  ['202', 'async accept on API send'],
  ['Real-time', 'logs & webhooks'],
] as const;

export const HOME_BENTO = {
  send: {
    title: 'Sending',
    desc: 'Queue mail from the dashboard or your backend. Credits, suppression, and bounce parsing built in.',
  },
  testing: {
    title: 'Sandbox testing',
    desc: 'Capture mail on :2525, run spam and HTML checks, and debug before you flip live sending on.',
  },
  inboxes: {
    title: 'Virtual inboxes',
    desc: 'Spin up disposable addresses with TTL and forwarding for QA and integration tests.',
  },
  analytics: {
    title: 'Analytics',
    desc: 'Volume, deliverability, opens, and clicks — by domain and template in your workspace.',
  },
} as const;

export const HOME_PLATFORM = [
  { title: 'SPF / DKIM / DMARC', desc: 'DNS records generated for every verified domain.' },
  { title: 'Webhooks', desc: 'Signed payloads with delivery history and replay.' },
  { title: 'Scoped API keys', desc: 'Per-environment keys you can revoke instantly.' },
  { title: 'Team workspaces', desc: 'Invite developers, share domains and templates.' },
] as const;

/** Demo chart for the marketing bento — illustrative, not live data. */
export const HOME_CHART_PREVIEW = Array.from({ length: 14 }, (_, index) => ({
  date: `Day ${index + 1}`,
  sent: 40 + Math.round(Math.sin(index / 2) * 12) + index * 2,
}));

export type CodeSampleId = 'send_curl' | 'send_node' | 'send_python';

export const CODE_SAMPLE_LANGS: { id: CodeSampleId; label: string }[] = [
  { id: 'send_node', label: 'Node.js' },
  { id: 'send_python', label: 'Python' },
  { id: 'send_curl', label: 'cURL' },
];

export function buildCodeSamples(sendUrl: string): Record<CodeSampleId, string> {
  return {
    send_curl: `curl ${sendUrl} \\
  -X POST \\
  -H "Authorization: Bearer $MAILVOIDR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@mail.yourdomain.com",
    "to": ["riya@example.com"],
    "subject": "Welcome to Acme",
    "html": "<h1>Hey Riya</h1><p>Glad you are here.</p>",
    "track_opens": true,
    "track_clicks": true
  }'`,
    send_node: `const response = await fetch("${sendUrl}", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.MAILVOIDR_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "hello@mail.yourdomain.com",
    to: ["riya@example.com"],
    subject: "Welcome to Acme",
    html: "<h1>Hey Riya</h1><p>Glad you are here.</p>",
    track_opens: true,
    track_clicks: true,
  }),
});

const { id, status, message_id } = await response.json();
// → 202 Accepted · status=queued`,
    send_python: `import os
import requests

response = requests.post(
    "${sendUrl}",
    headers={
        "Authorization": f"Bearer {os.environ['MAILVOIDR_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "from": "hello@mail.yourdomain.com",
        "to": ["riya@example.com"],
        "subject": "Welcome to Acme",
        "html": "<h1>Hey Riya</h1><p>Glad you are here.</p>",
        "track_opens": True,
        "track_clicks": True,
    },
    timeout=30,
)

data = response.json()
# → 202 Accepted · status=queued`,
  };
}
