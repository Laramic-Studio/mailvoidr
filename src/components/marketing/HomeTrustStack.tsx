import type { ComponentType, SVGProps } from "react";
import {
  HOME_TRUST_INTRO,
  HOME_TRUST_SUB,
} from "@/content/marketing/home";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Laravel } from "@/components/ui/svgs/laravel";
import { Swagger } from "@/components/ui/svgs/swagger";
import { N8n } from "@/components/ui/svgs/n8n";
import { Html5 } from "@/components/ui/svgs/html5";
import { CodexDark } from "@/components/ui/svgs/codexDark";
import { CodexLight } from "@/components/ui/svgs/codexLight";

type StackIcon = ComponentType<SVGProps<SVGSVGElement>>;

const STACK: {
  label: string;
  Icon: StackIcon;
  IconDark?: StackIcon;
}[] = [
  { label: "Node.js", Icon: Nodejs },
  { label: "Python", Icon: Python },
  { label: "Go", Icon: Golang },
  { label: "Laravel", Icon: Laravel },
  { label: "REST API", Icon: Swagger },
  { label: "Sandbox", Icon: CodexLight, IconDark: CodexDark },
  { label: "Webhooks", Icon: N8n },
  { label: "Templates", Icon: Html5 },
];

const logoClass =
  "h-8 w-auto max-w-[4.5rem] shrink-0";

export function HomeTrustStack() {
  return (
    <section className="border-b border-border">
      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        <div className="col-span-2 row-span-2 flex flex-col justify-center gap-3 bg-background p-6 md:p-8">
          <p className="max-w-md text-xl font-medium leading-snug tracking-tight md:text-2xl">
            {HOME_TRUST_INTRO}
          </p>
          <p className="font-mono text-[13px] text-muted-foreground">
            {HOME_TRUST_SUB}
          </p>
        </div>

        {STACK.map(({ label, Icon, IconDark }) => (
          <div
            key={label}
            className="flex items-center gap-3 bg-background px-5 py-8 md:px-8"
          >
            {IconDark ? (
              <>
                <Icon
                  aria-hidden
                  className={`${logoClass} dark:hidden`}
                />
                <IconDark
                  aria-hidden
                  className={`${logoClass} hidden dark:block`}
                />
              </>
            ) : (
              <Icon
                aria-hidden
                className={`${logoClass} dark:grayscale dark:brightness-150 dark:opacity-55 ${
                  label === "Go" ? "text-foreground" : ""
                }`}
              />
            )}
            <span className="text-lg font-medium tracking-tight text-foreground/80 md:text-xl">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
