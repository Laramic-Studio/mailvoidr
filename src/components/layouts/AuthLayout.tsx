import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  side?: "left" | "right";
}

export function AuthLayout({ children, side = "right" }: AuthLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className={`flex flex-col px-6 py-8 lg:px-12 ${side === "right" ? "" : "order-2"}`}>
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-sm mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-[12px] text-muted-foreground flex items-center justify-between">
          <span>© 2026 Mailvoidr</span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <Link to="/docs" className="hover:text-foreground">Docs</Link>
            <Link to="/status" className="hover:text-foreground">Status</Link>
            <Link to="/contact" className="hover:text-foreground">Help</Link>
          </div>
        </div>
      </div>

      <div className={`hidden lg:flex relative border-l border-border bg-card overflow-hidden ${side === "right" ? "order-2" : ""}`}>
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 gradient-radial-primary" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Trusted by 12,400+ developers
          </div>
          <div className="space-y-6">
            <blockquote className="text-2xl tracking-tight font-medium text-balance leading-snug">
              &quot;We replaced three tools — SendGrid, Mailtrap, and Postmark — with Mailvoidr in a weekend. Our p99 send latency dropped from 1.8s to 240ms.&quot;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 inline-flex items-center justify-center font-mono text-sm">JK</div>
              <div>
                <div className="text-sm">Jordan Kowalski</div>
                <div className="text-xs text-muted-foreground">Staff Engineer, Northwind Labs</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border border border-border">
            {[
              ["99.99%", "API uptime"],
              ["240ms", "p99 send"],
              ["12.4k+", "teams"],
            ].map(([v, l]) => (
              <div key={l} className="bg-card p-4">
                <div className="text-lg tracking-tight">{v}</div>
                <div className="label-mono mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
