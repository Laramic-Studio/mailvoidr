import { useState, useEffect, useRef } from "react";

const LOGS = [
  { delay: 0,    text: "Connecting to smtp.mailvoidr.com:587…",        type: "info"    },
  { delay: 500,  text: "220 smtp.mailvoidr.com ESMTP ready",            type: "server"  },
  { delay: 900,  text: "EHLO mailvoidr.com",                            type: "client"  },
  { delay: 1300, text: "250-smtp.mailvoidr.com Hello",                  type: "server"  },
  { delay: 1600, text: "250-STARTTLS",                                   type: "server"  },
  { delay: 1900, text: "250 AUTH LOGIN PLAIN",                           type: "server"  },
  { delay: 2200, text: "AUTH LOGIN ••••••••••••",                        type: "client"  },
  { delay: 2600, text: "235 2.7.0 Authentication successful",            type: "server"  },
  { delay: 3000, text: "MAIL FROM:<hello@mailvoidr.com>",               type: "client"  },
  { delay: 3400, text: "250 2.1.0 Sender OK",                           type: "server"  },
  { delay: 3700, text: null,                                             type: "rcpt"    }, // filled dynamically
  { delay: 4100, text: "250 2.1.5 Recipient OK",                        type: "server"  },
  { delay: 4400, text: "DATA",                                           type: "client"  },
  { delay: 4700, text: "354 Start mail input; end with <CRLF>.<CRLF>",  type: "server"  },
  { delay: 5000, text: "Sending headers + body…",                       type: "info"    },
  { delay: 5500, text: "DKIM-Signature: v=1; a=rsa-sha256; …",         type: "info"    },
  { delay: 5900, text: "250 2.0.0 Message queued as a3f9c2b",           type: "server"  },
  { delay: 6300, text: "QUIT",                                           type: "client"  },
  { delay: 6600, text: "221 2.0.0 Bye",                                  type: "server"  },
  { delay: 7000, text: "✓ Delivered in 7.0s",                           type: "success" },
];

const typeColor = {
  info:    "text-zinc-400 dark:text-zinc-500",
  client:  "text-[#3ecf8e]",
  server:  "text-sky-400",
  success: "text-[#3ecf8e] font-semibold",
};

const typePrefix = {
  info:    "   ",
  client:  "→  ",
  server:  "←  ",
  success: "   ",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LiveEmailTester() {
  const [email, setEmail]       = useState("");
  const [phase, setPhase]       = useState("idle"); // idle | running | done
  const [visibleLogs, setVisible] = useState([]);
  const logRef = useRef(null);
  const timers = useRef([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function startTest() {
    if (!isValidEmail(email) || phase === "running") return;
    clearTimers();
    setVisible([]);
    setPhase("running");

    LOGS.forEach((entry, i) => {
      const t = setTimeout(() => {
        setVisible((prev) => [
          ...prev,
          {
            text: entry.type === "rcpt"
              ? `RCPT TO:<${email}>`
              : entry.text,
            type: entry.type === "rcpt" ? "client" : entry.type,
          },
        ]);
        if (i === LOGS.length - 1) setPhase("done");
      }, entry.delay);
      timers.current.push(t);
    });
  }

  function reset() {
    clearTimers();
    setVisible([]);
    setPhase("idle");
    setEmail("");
  }

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  const canSend = isValidEmail(email) && phase !== "running";

  return (
    <div className="
      w-full max-w-md rounded-2xl border
      bg-white dark:bg-zinc-900
      border-zinc-200 dark:border-zinc-800
      shadow-xl shadow-zinc-200/60 dark:shadow-black/40
      overflow-hidden font-mono text-sm
    ">
      {/* Title bar */}
      <div className="
        flex items-center gap-2 px-4 py-3
        border-b border-zinc-200 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-950
      ">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-[#3ecf8e]" />
        <span className="ml-3 text-xs text-zinc-400 dark:text-zinc-500 tracking-wide">
          mailvoidr — smtp tester
        </span>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-zinc-400 dark:text-zinc-500 shrink-0 text-xs">TO:</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSend && startTest()}
          placeholder="you@example.com"
          disabled={phase === "running"}
          className="
            flex-1 bg-transparent outline-none
            text-zinc-800 dark:text-zinc-100
            placeholder:text-zinc-300 dark:placeholder:text-zinc-600
            disabled:opacity-50 text-sm
          "
        />
        {phase === "done" ? (
          <button
            onClick={reset}
            className="
              text-xs px-3 py-1.5 rounded-lg
              text-zinc-500 dark:text-zinc-400
              hover:text-zinc-800 dark:hover:text-zinc-100
              border border-zinc-200 dark:border-zinc-700
              transition-colors
            "
          >
            Reset
          </button>
        ) : (
          <button
            onClick={startTest}
            disabled={!canSend}
            className="
              text-xs px-3 py-1.5 rounded-lg font-sans font-medium
              bg-[#3ecf8e] text-zinc-900
              hover:bg-[#2ebd7e]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {phase === "running" ? "Sending…" : "Send test"}
          </button>
        )}
      </div>

      {/* Log window */}
      <div
        ref={logRef}
        className="
          h-64 overflow-y-auto px-4 py-3 space-y-1
          bg-zinc-50 dark:bg-zinc-950
          scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800
        "
      >
        {visibleLogs.length === 0 && phase === "idle" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 select-none">
            <div className="text-3xl opacity-20">✉</div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Enter an email and hit Send test
            </p>
          </div>
        )}

        {visibleLogs.map((log, i) => (
          <div
            key={i}
            className={`flex gap-1 leading-relaxed animate-fade-in ${typeColor[log.type]}`}
          >
            <span className="opacity-50 shrink-0">{typePrefix[log.type]}</span>
            <span>{log.text}</span>
          </div>
        ))}

        {phase === "running" && (
          <div className="flex gap-1 text-zinc-300 dark:text-zinc-700">
            <span className="opacity-50">   </span>
            <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="
        px-4 py-2.5 flex items-center justify-between
        border-t border-zinc-200 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-950
      ">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${
            phase === "done"    ? "bg-[#3ecf8e]" :
            phase === "running" ? "bg-yellow-400 animate-pulse" :
                                  "bg-zinc-300 dark:bg-zinc-700"
          }`} />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {phase === "done"    ? "Delivered"  :
             phase === "running" ? "Sending…"   :
                                   "Idle"}
          </span>
        </div>
        <span className="text-xs text-zinc-300 dark:text-zinc-700">
          smtp.mailvoidr.com:587
        </span>
      </div>
    </div>
  );
}