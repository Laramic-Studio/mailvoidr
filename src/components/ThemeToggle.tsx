import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!mounted) {
    return <div className={`h-10 w-10 ${className}`} />;
  }

  const themes = [
    {
      value: "light",
      icon: Sun,
      label: "Light",
    },
    {
      value: "dark",
      icon: Moon,
      label: "Dark",
    },
    {
      value: "system",
      icon: Monitor,
      label: "System",
    },
  ];

  const ActiveIcon =
    themes.find((item) => item.value === theme)?.icon ?? Monitor;

  return (
    <div className={className}>
      {/* Trigger wrapper */}
      <div ref={containerRef} className="relative z-50 inline-flex">
        {/* Trigger */}
        <motion.button
          type="button"
          aria-label="Change theme"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          whileTap={{ scale: 0.92 }}
          className="flex items-center justify-center w-10 h-10 transition-colors border rounded-md border-border bg-background text-foreground hover:bg-muted"
        >
          <motion.div
            key={theme}
            initial={{
              rotate: -30,
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              rotate: 0,
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <ActiveIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>

        {/* Popup */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: -6,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: -6,
              }}
              transition={{
                duration: 0.15,
                ease: "easeOut",
              }}
              className="
                absolute
                left-1/2
                top-[calc(100%+12px)]
                z-[999999]
                translate-x-1/2
                rounded-md
                border
                border-border
                bg-background
                p-1
                shadow-lg
              "
            >
              {/* Arrow */}
              <div
                className="
                  absolute
                  -top-1.5
                  left-1/2
                  h-3
                  w-3
                  -translate-x-1/2
                  rotate-45
                  border-l
                  border-t
                  border-border
                  bg-background
                "
              />

              {/* Theme buttons */}
              <div className="relative z-10 flex items-center gap-1">
                {themes.map((item) => {
                  const Icon = item.icon;
                  const active = theme === item.value;

                  return (
                    <motion.button
                      key={item.value}
                      type="button"
                      aria-label={`Use ${item.label} theme`}
                      title={item.label}
                      onClick={() => {
                        setTheme(item.value);
                        setOpen(false);
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                      className={`
                        relative
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-md
                        transition-colors
                        ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />

                      {active && (
                        <motion.span
                          layoutId="active-theme"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="absolute inset-0 rounded-md ring-2 ring-primary/30"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
