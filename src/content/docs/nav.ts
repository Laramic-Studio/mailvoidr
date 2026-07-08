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
      { slug: 'sdks', title: 'SDKs' },
      { slug: 'errors', title: 'Errors & rate limits' },
    ],
  },
];

export const DOCS_NAV_FLAT: DocsNavItem[] = DOCS_NAV.flatMap((section) => section.items);

export function getDocsPagination(slug?: string): {
  prev: DocsNavItem | null;
  next: DocsNavItem | null;
} {
  const flat = DOCS_NAV_FLAT;

  if (!slug) {
    return { prev: null, next: flat[0] ?? null };
  }

  const index = flat.findIndex((item) => item.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}
