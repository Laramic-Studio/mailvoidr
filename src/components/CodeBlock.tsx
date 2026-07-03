import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";

export type CodeBlockTab = { id: string; label: string };

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
  showWindowChrome?: boolean;
  elevated?: boolean;
  tabs?: CodeBlockTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

const KEYWORDS: Record<string, Set<string>> = {
  typescript: new Set([
    "const",
    "await",
    "fetch",
    "method",
    "headers",
    "body",
    "JSON",
    "stringify",
    "process",
    "env",
    "response",
    "json",
  ]),
  node: new Set([
    "const",
    "await",
    "fetch",
    "method",
    "headers",
    "body",
    "JSON",
    "stringify",
    "process",
    "env",
    "response",
    "json",
  ]),
  python: new Set(["import", "os", "requests", "post", "headers", "json", "True", "False", "timeout"]),
  bash: new Set(["curl", "-X", "POST", "-H", "-d"]),
};

function tokenClass(type: string): string {
  if (type === "string") return "text-emerald-400";
  if (type === "comment") return "text-zinc-500 italic";
  if (type === "keyword") return "text-violet-400";
  if (type === "number") return "text-amber-400";
  if (type === "property") return "text-sky-400";
  return "text-zinc-100";
}

function highlightLine(line: string, language: string): ReactNode {
  if (!line) return " ";

  const lang = language === "node" ? "typescript" : language;
  const keywords = KEYWORDS[lang] ?? KEYWORDS.bash;
  const tokens: { type: string; value: string }[] = [];
  const pattern =
    /(\/\/.*$|#.*$|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b[A-Za-z_][\w]*\b|\b\d+(?:\.\d+)?\b)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", value: line.slice(lastIndex, match.index) });
    }

    const value = match[0];
    if (value.startsWith("//") || value.startsWith("#")) {
      tokens.push({ type: "comment", value });
    } else if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("`") && value.endsWith("`"))
    ) {
      tokens.push({ type: "string", value });
    } else if (/^\d/.test(value)) {
      tokens.push({ type: "number", value });
    } else if (keywords.has(value)) {
      tokens.push({ type: "keyword", value });
    } else if (/^[A-Za-z_][\w]*$/.test(value)) {
      tokens.push({ type: "property", value });
    } else {
      tokens.push({ type: "plain", value });
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: "plain", value: line.slice(lastIndex) });
  }

  if (tokens.length === 0) return line;

  return tokens.map((token, index) => (
    <span key={`${index}-${token.value}`} className={tokenClass(token.type)}>
      {token.value}
    </span>
  ));
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  className = "",
  showLineNumbers = false,
  showWindowChrome = false,
  elevated = false,
  tabs,
  activeTab,
  onTabChange,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const hasTabs = tabs && tabs.length > 0;
  const showHeader = showWindowChrome || hasTabs || filename || language;

  const onCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const lines = String(code).split("\n");

  return (
    <div
      data-testid="code-block"
      className={`group relative overflow-hidden border border-[#1f1f1f] bg-[#0A0A0A] text-zinc-100 ${
        elevated ? "rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/50" : ""
      } ${className}`}
    >
      {showHeader ? (
        <div className="flex items-center gap-3 border-b border-[#1f1f1f] bg-[#111111] px-3 py-2">
          {showWindowChrome ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
          ) : null}

          {hasTabs ? (
            <div className="flex min-w-0 items-center gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  data-testid={`code-lang-${tab.label.toLowerCase()}`}
                  className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11.5px] transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#1a1a1a] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-zinc-400">
              {filename ? <span className="truncate text-zinc-300">{filename}</span> : null}
              {!filename && language ? (
                <span className="uppercase tracking-wider">{language}</span>
              ) : null}
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {hasTabs && filename ? (
              <span className="hidden font-mono text-[11px] text-zinc-500 sm:inline">{filename}</span>
            ) : null}
            <button
              type="button"
              onClick={onCopy}
              data-testid="code-copy-btn"
              className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-zinc-500 transition-colors hover:text-zinc-100"
            >
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}

      <pre className="overflow-x-auto p-4 text-[12.5px] leading-[1.7] font-mono">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            {showLineNumbers ? (
              <span className="select-none w-8 shrink-0 pr-4 text-right text-zinc-600">{index + 1}</span>
            ) : null}
            <code className="whitespace-pre">{highlightLine(line, language)}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}
