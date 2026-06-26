import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  FlaskConical,
  Globe,
  Inbox,
  KeyRound,
  Server,
  Terminal,
  Webhook,
} from 'lucide-react';
import { buildDocsCodeSamples } from '@/content/docs/samples';

export const DOCS_LANDING = {
  title: 'Build with Mailvoidr.',
  subtitle:
    'Send from the REST API or SMTP relay, capture test mail in a sandbox inbox, and trace every delivery with logs and webhooks.',
  quickstartLabel: 'Send in 30 seconds',
  quickstartNote: 'Use cURL or any HTTP client — create an API key in the dashboard first.',
};

/** cURL example for the landing install card. */
export const DOCS_QUICKSTART_CURL = buildDocsCodeSamples().send_curl;

export interface DocsLandingTile {
  icon: LucideIcon;
  title: string;
  desc: string;
  to: string;
}

export const DOCS_LANDING_TILES: DocsLandingTile[] = [
  { icon: Terminal, title: 'Quickstart', desc: 'Send your first email in 5 minutes.', to: '/docs/quickstart' },
  { icon: Code2, title: 'API reference', desc: 'Every endpoint, every parameter.', to: '/docs/api-reference' },
  { icon: Server, title: 'SMTP guide', desc: 'Drop-in SMTP relay.', to: '/docs/smtp' },
  { icon: Webhook, title: 'Webhooks', desc: 'Signed, retried, replayable.', to: '/docs/webhooks' },
  { icon: KeyRound, title: 'Authentication', desc: 'API keys, scopes, rotation.', to: '/docs/authentication' },
  { icon: Globe, title: 'Domains', desc: 'SPF, DKIM, DMARC.', to: '/docs/verify-domain' },
  { icon: FlaskConical, title: 'Testing', desc: 'Sandbox, render previews, spam checks.', to: '/docs/testing-overview' },
  { icon: Inbox, title: 'Temporary inboxes', desc: 'Disposable inboxes from CI.', to: '/docs/temporary-inboxes' },
];

/*
 * SDK install card — uncomment when packages publish.
 *
 * export const DOCS_SDK_INSTALL_CODE = `# Node
 * npm install @mailvoidr/node
 *
 * # Python
 * pip install mailvoidr
 *
 * # Go
 * go get github.com/mailvoidr/go`;
 *
 * export const DOCS_SDK_PACKAGES: readonly [label: string, pkg: string][] = [
 *   ['Node.js', '@mailvoidr/node'],
 *   ['Python', 'mailvoidr'],
 *   ['Go', 'github.com/mailvoidr/go'],
 *   ['Ruby', 'mailvoidr'],
 *   ['PHP', 'mailvoidr/sdk'],
 *   ['Rust', 'mailvoidr-rs'],
 * ];
 */
