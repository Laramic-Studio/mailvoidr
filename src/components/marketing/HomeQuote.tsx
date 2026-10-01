import { HOME_QUOTE } from "@/content/marketing/home";

export function HomeQuote() {
  return (
    <section className="border-b border-border">
      <blockquote className="page-band py-7 md:py-9">
        <p className="max-w-5xl font-sora text-lg leading-snug tracking-tight text-foreground/90 md:text-3xl">
          <span className="mr-3 font-mono text-muted-foreground">“</span>
          {HOME_QUOTE.text}
        </p>
        <footer className="mt-4 font-mono text-[12px] text-muted-foreground">
          {HOME_QUOTE.attribution}
        </footer>
      </blockquote>
    </section>
  );
}
