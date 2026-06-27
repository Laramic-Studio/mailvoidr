import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import type { LegalDocumentContent } from "@/content/marketing/legal";

interface LegalDocumentProps {
  document: LegalDocumentContent;
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <MarketingLayout>
      <article className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
          <span className="label-mono">{document.eyebrow}</span>
          <h1 className="mt-2 text-4xl md:text-5xl tracking-tight font-medium leading-[1.05]">
            {document.title}
          </h1>
          <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
            {document.summary}
          </p>
          <p className="mt-3 text-[12.5px] font-mono text-muted-foreground">
            Last updated {document.lastUpdated}
          </p>

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-border bg-card p-5"
          >
            <p className="label-mono mb-3">On this page</p>
            <ol className="space-y-2 text-[13.5px] text-muted-foreground">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:text-foreground transition-colors">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-14 space-y-14">
            {document.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl tracking-tight font-medium">{section.title}</h2>
                <div className="mt-4 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[14.5px] text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-2 text-[14.5px] text-muted-foreground leading-relaxed list-disc pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <p className="mt-16 pt-8 border-t border-border text-[13px] text-muted-foreground">
            Questions? See our{" "}
            <Link to="/contact" className="text-foreground hover:underline">
              contact page
            </Link>{" "}
            or email{" "}
            <a href={`mailto:${document.contactEmail}`} className="text-foreground hover:underline">
              {document.contactEmail}
            </a>
            .
          </p>
        </div>
      </article>
    </MarketingLayout>
  );
}
