import { DocsLayout } from '@/components/layouts/DocsLayout';
import { CodeBlock } from '@/components/CodeBlock';
import {
  DOCS_LANDING,
  DOCS_LANDING_TILES,
  DOCS_QUICKSTART_CURL,
} from '@/content/docs/landing';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

export default function DocsLanding() {
  return (
    <DocsLayout>
      <div>
        <span className="label-mono">Documentation</span>
        <h1 className="mt-3 text-5xl tracking-tight font-medium leading-[1]">{DOCS_LANDING.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">{DOCS_LANDING.subtitle}</p>

        <div className="mt-10 border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span className="label-mono">{DOCS_LANDING.quickstartLabel}</span>
          </div>
          <CodeBlock language="bash" className="mt-3" code={DOCS_QUICKSTART_CURL} />
          <p className="mt-3 text-[12.5px] text-muted-foreground">{DOCS_LANDING.quickstartNote}</p>
        </div>

        {/*
        SDK install card — restore when packages publish.
        <div className="mt-10 border border-border bg-card p-6">...</div>
        <div className="mt-16 grid sm:grid-cols-3 ...">SDK language grid</div>
        */}

        <h2 className="mt-16 text-2xl tracking-tight font-medium">Pick your starting point</h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-px bg-border border border-border">
          {DOCS_LANDING_TILES.map((t) => (
            <Link key={t.title} to={t.to} className="bg-card p-5 hover:bg-accent/30 transition-colors group">
              <t.icon className="h-4 w-4 text-primary" />
              <h3 className="mt-3 text-[15px] font-medium tracking-tight">{t.title}</h3>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{t.desc}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Read more <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DocsLayout>
  );
}
