export interface DocsNavItem {
  slug: string;
  title: string;
}

export interface DocsNavSection {
  section: string;
  items: DocsNavItem[];
}

/** Sidebar navigation — slugs map to DocsArticle routes. */
export const DOCS_NAV: DocsNavSection[] = [
  {
    section: 'Getting Started',
    items: [
      { slug: 'introduction', title: 'Introduction' },
      { slug: 'quickstart', title: 'Quickstart' },
      { slug: 'authentication', title: 'Authentication' },
    ],
  },
  {
    section: 'Sending Email',
    items: [
      { slug: 'send-first-email', title: 'Send your first email' },
      { slug: 'templates', title: 'Templates' },
      { slug: 'batching', title: 'Batching' },
    ],
  },
  {
    section: 'Testing & Inboxes',
    items: [
      { slug: 'testing-overview', title: 'Testing overview' },
      { slug: 'temporary-inboxes', title: 'Temporary inboxes' },
      { slug: 'spam-checker', title: 'Spam checker' },
    ],
  },
  {
    section: 'Domains',
    items: [
      { slug: 'verify-domain', title: 'Verify a domain' },
      { slug: 'spf-dkim-dmarc', title: 'SPF, DKIM, DMARC' },
      { slug: 'subdomains', title: 'Subdomains' },
    ],
  },
  {
    section: 'Developer',
    items: [
      { slug: 'api-reference', title: 'API reference' },
      { slug: 'smtp', title: 'SMTP' },
      { slug: 'webhooks', title: 'Webhooks' },
      // { slug: 'sdks', title: 'SDKs' }, // uncomment when official SDKs publish
      { slug: 'errors', title: 'Errors & rate limits' },
    ],
  },
];
