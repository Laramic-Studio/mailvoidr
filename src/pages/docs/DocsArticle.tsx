import { DocsLayout } from '@/components/layouts/DocsLayout';
import { CodeBlock, LanguageTabsCodeBlock } from '@/components/ui/code-block';
import { getDocsPage, getDocsToc } from '@/content/docs/pages';
import type { DocsSection } from '@/content/docs/types';
import { buildDocsLanguageTabs } from '@/content/docs/samples';
import { mailSendUrl } from '@/content/marketing/home';
import { Info } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

const SHIKI_LANG: Record<string, string> = {
  bash: 'bash',
  json: 'json',
  javascript: 'javascript',
  typescript: 'typescript',
  text: 'text',
  php: 'php',
  go: 'go',
  python: 'python',
};

function ProseSection({ section }: { section: Extract<DocsSection, { kind: 'prose' }> }) {
  return (
    <section id={section.id}>
      <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
      <div className="mt-3 space-y-3">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-[14.5px] text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
      {section.callout ? (
        <div className="mt-4 border border-primary/30 bg-primary/5 rounded-md p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-[13.5px]">
            <strong className="block">{section.callout.title}</strong>
            <span className="text-muted-foreground">
              {section.callout.body}
              {section.callout.link ? (
                <>
                  {' '}
                  <Link className="text-primary hover:underline" to={section.callout.link.to}>
                    {section.callout.link.label}
                  </Link>
                  .
                </>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CodeSection({ section }: { section: Extract<DocsSection, { kind: 'code' }> }) {
  return (
    <section id={section.id}>
      <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
      {section.body ? (
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">{section.body}</p>
      ) : null}
      <CodeBlock
        className="mt-4"
        language={SHIKI_LANG[section.language] ?? section.language}
        code={section.code}
        scrollable
        maxHeight={480}
      />
    </section>
  );
}

function SendTabsSection({
  section,
  languageTabs,
}: {
  section: Extract<DocsSection, { kind: 'send-tabs' }>;
  languageTabs: ReturnType<typeof buildDocsLanguageTabs>;
}) {
  return (
    <section id={section.id}>
      <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
      {section.body ? (
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">{section.body}</p>
      ) : null}
      <LanguageTabsCodeBlock className="mt-4" tabs={languageTabs} scrollable maxHeight={480} />
    </section>
  );
}

function TableSection({ section }: { section: Extract<DocsSection, { kind: 'table' }> }) {
  return (
    <section id={section.id}>
      <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
      {section.body ? (
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">{section.body}</p>
      ) : null}
      <div className="mt-4 overflow-x-auto border border-border rounded-md">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {section.columns.map((column) => (
                <th key={column} className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.join('|')} className="border-b border-border last:border-0">
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${index}`}
                    className={`px-4 py-2.5 align-top ${
                      index === 0 ? 'font-mono text-[12.5px] text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LinksSection({ section }: { section: Extract<DocsSection, { kind: 'links' }> }) {
  return (
    <section id={section.id}>
      <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
      {section.body ? (
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">{section.body}</p>
      ) : null}
      <ul className="mt-3 space-y-2 text-[14.5px]">
        {section.links.map((item) => (
          <li key={item.href}>
            →{' '}
            <Link className="text-primary hover:underline" to={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DocsSectionView({
  section,
  languageTabs,
}: {
  section: DocsSection;
  languageTabs: ReturnType<typeof buildDocsLanguageTabs>;
}) {
  switch (section.kind) {
    case 'prose':
      return <ProseSection section={section} />;
    case 'code':
      return <CodeSection section={section} />;
    case 'send-tabs':
      return <SendTabsSection section={section} languageTabs={languageTabs} />;
    case 'links':
      return <LinksSection section={section} />;
    case 'table':
      return <TableSection section={section} />;
    default:
      return null;
  }
}

export default function DocsArticle() {
  const { slug = 'quickstart' } = useParams();
  const page = getDocsPage(slug);
  const toc = getDocsToc(slug);
  const sendUrl = mailSendUrl();
  const languageTabs = useMemo(() => buildDocsLanguageTabs(sendUrl), [sendUrl]);

  return (
    <DocsLayout toc={toc} title={page.title}>
      <article key={slug} className="space-y-8">
        <header>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Docs / {page.title}
          </div>
          <h1 className="mt-3 text-4xl tracking-tight font-medium leading-[1.05]">{page.title}</h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">{page.description}</p>
        </header>

        {page.sections.map((section) => (
          <DocsSectionView key={section.id} section={section} languageTabs={languageTabs} />
        ))}
      </article>
    </DocsLayout>
  );
}
