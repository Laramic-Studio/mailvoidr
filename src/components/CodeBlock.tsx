import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  className = "",
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const lines = String(code).split("\n");
  return (
    <div data-testid="code-block" className={`group relative overflow-hidden border border-[#222] bg-[#0A0A0A] text-zinc-100 ${className}`}>
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-[#222] px-3 py-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            {filename && <span className="text-zinc-300">{filename}</span>}
            {!filename && <span className="uppercase tracking-wider">{language}</span>}
          </div>
          <button
            onClick={onCopy}
            data-testid="code-copy-btn"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-[1.65] font-mono">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            {showLineNumbers && (
              <span className="select-none pr-4 text-zinc-600 text-right w-8">{i + 1}</span>
            )}
            <code className="whitespace-pre">{line || " "}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}
