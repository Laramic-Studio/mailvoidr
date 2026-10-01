import { HOME_METRICS } from "@/content/marketing/home";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function HomeMetrics() {
  const metricsRevealRef = useScrollReveal();

  return (
    <section className="border-b border-border">
      <div
        ref={metricsRevealRef}
        className="grid gap-px bg-border sm:grid-cols-2 md:grid-cols-4"
      >
        {HOME_METRICS.map(([value, label]) => (
          <div key={label} data-reveal className="bg-background p-8 md:p-10">
            <div className="text-3xl font-medium tracking-tight">{value}</div>
            <div className="mt-2 label-mono">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
