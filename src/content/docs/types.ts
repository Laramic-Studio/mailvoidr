export interface DocsTocItem {
  id: string;
  title: string;
}

export interface DocsCallout {
  title: string;
  body: string;
  link?: { to: string; label: string };
}

export interface DocsLinkItem {
  href: string;
  label: string;
}

export type DocsSection =
  | {
      id: string;
      title: string;
      kind: 'prose';
      paragraphs: string[];
      callout?: DocsCallout;
    }
  | {
      id: string;
      title: string;
      kind: 'code';
      body?: string;
      language: string;
      code: string;
    }
  | {
      id: string;
      title: string;
      kind: 'send-tabs';
      body?: string;
    }
  | {
      id: string;
      title: string;
      kind: 'links';
      body?: string;
      links: DocsLinkItem[];
    };

export interface DocsPage {
  title: string;
  description: string;
  sections: DocsSection[];
}
