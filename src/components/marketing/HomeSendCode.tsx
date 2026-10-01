import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { codeToHtml } from "shiki";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import {
  buildCodeSamples,
  CODE_SAMPLE_LANGS,
  mailSendUrl,
  type CodeSampleId,
} from "@/content/marketing/home";
import { cn } from "@/lib/utils";

function CurlIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M5 8.5 11 12l-6 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 16.5h7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TAB_ICONS: Record<
  CodeSampleId,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  send_node: Nodejs,
  send_python: Python,
  send_go: Golang,
  send_curl: CurlIcon,
};

const SHIKI_TRANSFORM = {
  pre(node: { properties?: { style?: unknown } }) {
    if (node.properties?.style) {
      node.properties.style = String(node.properties.style)
        .replace(/background-color:\s*[^;]+;?\s*/gi, "")
        .replace(/--shiki-dark-bg:\s*[^;]+;?\s*/gi, "");
    }
  },
};

export function HomeSendCode() {
  const [lang, setLang] = useState<CodeSampleId>("send_node");
  const sendUrl = mailSendUrl();
  const samples = useMemo(() => buildCodeSamples(sendUrl), [sendUrl]);
  const active = CODE_SAMPLE_LANGS.find((tab) => tab.id === lang) ?? CODE_SAMPLE_LANGS[0];
  const [htmlByLang, setHtmlByLang] = useState<Partial<Record<CodeSampleId, string>>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CODE_SAMPLE_LANGS.map((tab) =>
        codeToHtml(samples[tab.id], {
          lang: tab.language,
          theme: "github-dark-default",
          tabindex: false,
          transformers: [SHIKI_TRANSFORM],
        }).then((html) => [tab.id, html] as const),
      ),
    ).then((entries) => {
      if (cancelled) return;
      setHtmlByLang(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [samples]);

  const ready = CODE_SAMPLE_LANGS.every((tab) => htmlByLang[tab.id]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1c1c1c] font-display text-zinc-100">
      <div
        className="grid border-b border-white/10"
        style={{ gridTemplateColumns: `repeat(${CODE_SAMPLE_LANGS.length}, minmax(0, 1fr))` }}
      >
        {CODE_SAMPLE_LANGS.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id];
          const selected = tab.id === lang;
          return (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              aria-pressed={selected}
              onClick={() => setLang(tab.id)}
              className={cn(
                "flex h-12 items-center justify-center transition-colors",
                index > 0 && "border-l border-white/10",
                selected
                  ? "bg-white/5 text-white"
                  : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-auto max-w-[1.75rem] transition-opacity",
                  tab.id === "send_go" && "max-w-[2.75rem]",
                  tab.id === "send_curl" && "h-5 w-5",
                  selected ? "opacity-100" : "opacity-40 grayscale",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="relative min-h-0 flex-1 px-5 pb-14 pt-6">
        <div className="grid">
          {ready
            ? CODE_SAMPLE_LANGS.map((tab) => (
                <div
                  key={tab.id}
                  aria-hidden={tab.id !== lang}
                  className={cn(
                    "col-start-1 row-start-1 overflow-x-auto text-[13px] leading-[1.7] [&_code]:font-display [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:font-display",
                    tab.id === lang ? "visible" : "invisible pointer-events-none",
                  )}
                  dangerouslySetInnerHTML={{ __html: htmlByLang[tab.id] ?? "" }}
                />
              ))
            : (
              <div className="flex h-48 items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
              </div>
            )}
        </div>

        <Link
          to="/docs"
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#1c1c1c] px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-200"
        >
          Read docs for {active.label}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
