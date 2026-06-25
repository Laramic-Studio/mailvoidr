import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { BLOG_POSTS } from "@/lib/dummyData";
import { Link } from "react-router-dom";

export default function Blog() {
  const [featured, ...rest] = BLOG_POSTS;
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <span className="label-mono">Blog</span>
          <h1 className="mt-2 text-5xl md:text-6xl tracking-tight font-medium leading-[1.02] max-w-3xl">
            Field notes from the email layer.
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl">Engineering, deliverability research, and product launches.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-16 space-y-16">
          <Link to={`/blog/${featured.slug}`} className="block group">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-[4/3] border border-border bg-card overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="absolute inset-0 gradient-radial-primary" />
                <div className="relative h-full flex flex-col justify-end p-8">
                  <span className="label-mono">{featured.category}</span>
                  <div className="mt-2 font-mono text-[42px] tracking-tight leading-none text-balance">{featured.title.split(" ").slice(0, 5).join(" ")}…</div>
                </div>
              </div>
              <div>
                <span className="label-mono">{featured.category} · {featured.date}</span>
                <h2 className="mt-3 text-3xl md:text-4xl tracking-tight font-medium leading-tight group-hover:text-primary transition-colors">{featured.title}</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 inline-flex items-center justify-center font-mono text-[11px]">{featured.author.split(" ").map((s) => s[0]).join("")}</div>
                  <div className="text-sm">
                    <div>{featured.author}</div>
                    <div className="text-muted-foreground text-[12px]">{featured.role} · {featured.read}</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((p) => (
              <Link to={`/blog/${p.slug}`} key={p.slug} className="group border border-border bg-card hover:bg-accent/40 transition-colors flex flex-col">
                <div className="relative aspect-[5/3] overflow-hidden border-b border-border">
                  <div className="absolute inset-0 dotted-bg opacity-50" />
                  <div className="absolute inset-0 gradient-radial-primary" />
                  <div className="relative h-full p-6 flex items-end">
                    <div className="font-mono text-[10.5px] uppercase tracking-wider text-primary">{p.category}</div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="label-mono">{p.date} · {p.read}</span>
                  <h3 className="mt-2 text-[17px] tracking-tight font-medium leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed flex-1">{p.excerpt}</p>
                  <div className="mt-4 flex items-center gap-2 text-[12.5px]">
                    <div className="h-6 w-6 rounded-full bg-muted inline-flex items-center justify-center font-mono text-[10px]">{p.author.split(" ").map((s) => s[0]).join("")}</div>
                    <span>{p.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
