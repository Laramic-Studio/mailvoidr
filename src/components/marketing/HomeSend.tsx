import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HOME_SEND_FEATURES } from "@/content/marketing/home";
import { HomeSendCode } from "@/components/marketing/HomeSendCode";
import { SheetKicker } from "@/components/marketing/SheetKicker";

gsap.registerPlugin(ScrollTrigger);

export function HomeSend() {
  const timelineRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = timelineRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const steps = Array.from(
      root.querySelectorAll<HTMLElement>("[data-timeline-step]"),
    );
    const ctx = gsap.context(() => {
      steps.forEach((step) => {
        gsap.from(step, {
          opacity: 0,
          y: 28,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: step,
            start: "top 90%",
            once: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="border-b border-border">
      <div className="grid lg:grid-cols-2">
        <ol
          ref={timelineRef}
          className="grid grid-rows-4 border-b border-border lg:border-b-0 lg:border-r"
        >
          {HOME_SEND_FEATURES.map((feature, index) => (
            <li
              key={feature.title}
              data-timeline-step
              className="flex items-center group gap-5 border-b border-border px-6  last:border-b-0 md:gap-6 md:px-8 "
            >
              <span className="shrink-0 font-mono group-hover:text-primary transition-colors text-2xl tabular-nums text-neutral-500 font-bold md:text-5xl">
                {String(index + 1).padStart(2, "0")}.
              </span>
              <p className="min-w-0 text-2xl font-medium leading-snug tracking-tight">
                <span className="text-foreground underline">{feature.title}</span>{" "}
                <span className="font-normal text-muted-foreground">
                  {feature.desc}
                </span>
              </p>
            </li>
          ))}
        </ol>

        <div className="grid min-h-[28rem] grid-rows-[1fr_3fr] border-t border-border lg:min-h-0 lg:border-t-0">
          <div className="flex items-center border-b border-border px-6 py-6 md:px-8">
            <div className="max-w-md">
              <SheetKicker>Send</SheetKicker>
              <h2 className="mt-2 text-xl font-medium leading-snug tracking-tight md:text-2xl">
                Receipts. Invites. Password resets.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                API or SMTP — same send. Your customers just get the email.
              </p>
            </div>
          </div>
          <div className="h-full min-h-0 p-0">
            <HomeSendCode />
          </div>
        </div>
      </div>
    </section>
  );
}
