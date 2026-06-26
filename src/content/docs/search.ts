import { getDocsPage } from '@/content/docs/pages';
import { DOCS_NAV } from '@/content/docs/nav';
import type { DocsSection } from '@/content/docs/types';

export interface DocsSearchHit {
  href: string;
  title: string;
  breadcrumb: string;
  excerpt: string;
}

function sectionText(section: DocsSection): string {
  switch (section.kind) {
    case 'prose':
      return section.paragraphs.join(' ');
    case 'code':
      return [section.body, section.code].filter(Boolean).join(' ');
    case 'send-tabs':
      return section.body ?? '';
    case 'links':
      return [section.body, ...section.links.map((l) => l.label)].filter(Boolean).join(' ');
    default:
      return '';
  }
}

function pageSearchBlob(slug: string, navSection: string, navTitle: string): string {
  const page = getDocsPage(slug);
  const parts = [
    navSection,
    navTitle,
    page.title,
    page.description,
    ...page.sections.flatMap((s) => [s.title, sectionText(s)]),
  ];
  return parts.join(' ').toLowerCase();
}

function excerptFor(pageDescription: string, sectionTitle?: string): string {
  if (sectionTitle) {
    return `${pageDescription} · ${sectionTitle}`;
  }
  return pageDescription;
}

export function searchDocs(query: string): DocsSearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return [];
  }

  const hits: DocsSearchHit[] = [];
  const seen = new Set<string>();

  for (const group of DOCS_NAV) {
    for (const item of group.items) {
      const page = getDocsPage(item.slug);
      const pageBlob = pageSearchBlob(item.slug, group.section, item.title);

      if (pageBlob.includes(q) && !seen.has(`/docs/${item.slug}`)) {
        seen.add(`/docs/${item.slug}`);
        hits.push({
          href: `/docs/${item.slug}`,
          title: page.title,
          breadcrumb: group.section,
          excerpt: excerptFor(page.description),
        });
      }

      for (const section of page.sections) {
        const sectionBlob = `${section.title} ${sectionText(section)}`.toLowerCase();
        const href = `/docs/${item.slug}#${section.id}`;
        if (sectionBlob.includes(q) && !seen.has(href)) {
          seen.add(href);
          hits.push({
            href,
            title: section.title,
            breadcrumb: page.title,
            excerpt: excerptFor(page.description, section.title),
          });
        }
      }
    }
  }

  return hits.slice(0, 10);
}
