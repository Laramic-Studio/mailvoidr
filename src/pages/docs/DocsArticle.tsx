import { DocsLayout } from '@/components/layouts/DocsLayout';
import { CodeBlock } from '@/components/CodeBlock';
import { getDocsPage, getDocsToc } from '@/content/docs/pages';
import type { DocsSection } from '@/content/docs/types';
import {
  buildDocsCodeSamples,
  DOCS_CODE_LANGS,
  type DocsCodeSampleId,
} from '@/content/docs/samples';
import { mailSendUrl } from '@/content/marketing/home';
import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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
      <CodeBlock className="mt-4" language={section.language} code={section.code} />
    </section>
  );
}

function SendTabsSection({
  section,
  lang,
  onLangChange,
  codeSamples,
}: {
  section: Extract<DocsSection, { kind: 'send-tabs' }>;
  lang: DocsCodeSampleId;
  onLangChange: (id: DocsCodeSampleId) => void;
  codeSamples: Record<DocsCodeSampleId, string>;
}) {
  return (
    <section id={section.id}>
      <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
      {section.body ? (
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">{section.body}</p>
      ) : null}
      <div className="mt-4 border border-border bg-card">
        <div className="flex items-center gap-1 border-b border-border px-2">
          {DOCS_CODE_LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onLangChange(l.id)}
              data-testid={`docs-lang-${l.label.toLowerCase()}`}
              className={`px-3 py-2 text-[12.5px] font-mono transition-colors ${
                lang === l.id
                  ? 'text-foreground border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <CodeBlock code={codeSamples[lang]} language={lang.replace('send_', '')} />
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
  lang,
  onLangChange,
  codeSamples,
}: {
  section: DocsSection;
  lang: DocsCodeSampleId;
  onLangChange: (id: DocsCodeSampleId) => void;
  codeSamples: Record<DocsCodeSampleId, string>;
}) {
  switch (section.kind) {
    case 'prose':
      return <ProseSection section={section} />;
    case 'code':
      return <CodeSection section={section} />;
    case 'send-tabs':
      return (
        <SendTabsSection
          section={section}
          lang={lang}
          onLangChange={onLangChange}
          codeSamples={codeSamples}
        />
      );
    case 'links':
      return <LinksSection section={section} />;
    default:
      return null;
  }
}

export default function DocsArticle() {
  const { slug = 'quickstart' } = useParams();
  const page = getDocsPage(slug);
  const toc = getDocsToc(slug);
  const [lang, setLang] = useState<DocsCodeSampleId>('send_node');
  const sendUrl = mailSendUrl();
  const codeSamples = useMemo(() => buildDocsCodeSamples(sendUrl), [sendUrl]);

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
          <DocsSectionView
            key={section.id}
            section={section}
            lang={lang}
            onLangChange={setLang}
            codeSamples={codeSamples}
          />
        ))}
      </article>
    </DocsLayout>
  );
}
