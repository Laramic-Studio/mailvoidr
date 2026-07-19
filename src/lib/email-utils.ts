export function parseEmailAddress(value: string | null | undefined): {
  name: string;
  email: string;
} {
  if (!value) {
    return { name: 'Unknown', email: '' };
  }

  const match = value.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, '') || match[2],
      email: match[2].trim(),
    };
  }

  return { name: value, email: value };
}

export function formatRelativeInboxTime(iso: string | null): string {
  if (!iso) return '—';

  const date = new Date(iso);
  const diffHours = (Date.now() - date.getTime()) / 3_600_000;

  if (diffHours < 24) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (diffHours < 48) return 'Yesterday';
  if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatMessageTime(iso: string | null): string {
  if (!iso) return '—';

  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const EMAIL_PREVIEW_SANDBOX = 'allow-popups allow-popups-to-escape-sandbox';

export function prepareEmailPreviewHtml(html: string): string {
  if (!html.trim() || typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc.querySelectorAll('base').forEach((el) => el.remove());
  const base = doc.createElement('base');
  base.setAttribute('target', '_blank');
  doc.head.prepend(base);

  doc.querySelectorAll('a[href], area[href]').forEach((el) => {
    el.setAttribute('target', '_blank');
    const rel = new Set((el.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    el.setAttribute('rel', [...rel].join(' '));
  });

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}
