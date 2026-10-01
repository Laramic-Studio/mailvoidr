import { useEffect, useState } from "react";
import { HOME_REVIEWS } from "@/content/marketing/home";
import { DottedBg } from "@/components/ui/dotted-bg";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const REVIEW_INTERVAL_MS = 5000;

const CORNER_CROSSES = [
  "-left-[7px] -top-[7px]",
  "-right-[7px] -top-[7px]",
  "-bottom-[7px] -left-[7px]",
  "-bottom-[7px] -right-[7px]",
] as const;

export function HomeReviews() {
  const reviewsRevealRef = useScrollReveal<HTMLElement>();
  const [index, setIndex] = useState(0);
  const review = HOME_REVIEWS[index];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HOME_REVIEWS.length);
    }, REVIEW_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <DottedBg as="section" className="border-b border-border">
      <div className="flex min-h-[36rem] items-center justify-center px-4 py-16 md:min-h-[42rem] md:py-20">
        <div className="relative w-full max-w-3xl border border-border bg-background">
          {CORNER_CROSSES.map((position) => (
            <span
              key={position}
              aria-hidden
              className={`pointer-events-none absolute z-20 h-3.5 w-3.5 text-foreground/70 ${position}`}
            >
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
            </span>
          ))}
          <ReviewCard key={review.name} review={review} revealRef={reviewsRevealRef} />
        </div>
      </div>
    </DottedBg>
  );
}

function ReviewCard({
  review,
  revealRef,
}: {
  review: (typeof HOME_REVIEWS)[number];
  revealRef: ReturnType<typeof useScrollReveal<HTMLElement>>;
}) {
  return (
    <figure ref={revealRef} aria-live="polite" className="flex min-h-[22rem] flex-col p-8 md:min-h-[26rem] md:p-12">
      <blockquote
        data-reveal
        className="font-code text-3xl text-center font-semibold leading-snug tracking-wider text-foreground/70 md:text-4xl"
      >
        “ {review.quote} ”
      </blockquote>
      <figcaption data-reveal className="mt-auto flex items-center gap-3 pt-8">
        <span aria-hidden className="text-lg leading-none text-muted-foreground">
          ~
        </span>
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {review.name}
          </span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {review.role} · {review.company}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
