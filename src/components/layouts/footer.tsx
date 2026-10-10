import { LEGAL_CONTACT } from "@/content/marketing/legal";
import {
  GitHubLight,
  GitHubDark,
  XDark,
  XLight,
  LinkedIn,
} from "developer-icons";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";

const Footer = ({
  MARKETING_SOCIAL,
  MARKETING_NAV,
  statusClass,
  statusLabel,
  apiHealthy,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const GithubIcon = !isDark ? GitHubDark : GitHubLight;
  const XIcon = !isDark ? XDark : XLight;

  return (
    <footer className="relative overflow-hidden ">
      <div
        aria-hidden="true"
        className="
        pointer-events-none absolute
        inset-x-0 bottom-[-8%]
        select-none text-center
        font-introvert font-medium
        leading-none tracking-wider
        text-foreground/[0.045]
        text-[18vw]
        whitespace-nowrap
      "
      >
        Mailvoidr
      </div>

      <div className="flex items-center justify-between pt-6 page-band">
        {/* Left */}
        <div className="">
          <div className="flex items-center gap-3">
            <a
              href={MARKETING_SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center justify-center transition-colors border h-9 w-9 border-border hover:bg-accent"
            >
              <GithubIcon className="h-3.5 w-3.5" />
            </a>

            <a
              href={MARKETING_SOCIAL.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="inline-flex items-center justify-center transition-colors border h-9 w-9 border-border hover:bg-accent"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>

            <a
              href={MARKETING_SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center transition-colors border h-9 w-9 border-border hover:bg-accent"
            >
              <LinkedIn className="h-3.5 w-3.5" />
            </a>
          </div>

          <a
            href={`mailto:${LEGAL_CONTACT.support}`}
            className="block mt-6 text-lg transition-colors text-foreground hover:text-primary"
          >
            {LEGAL_CONTACT.support}
          </a>

          <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-muted-foreground">
            Email infrastructure for developers. Send, test, and inspect —
            without leaving your terminal.
          </p>
        </div>

        {/* Right navigation */}
        <ul className="flex flex-col items-start gap-4 text-sm md:items-end">
          {MARKETING_NAV.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="transition-colors text-foreground hover:text-primary"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10">
        <div
          className="
        page-band flex
        flex-col gap-3
        text-[12.5px]
        text-muted-foreground
        md:flex-row
        md:items-center
        md:justify-between
      "
        >
          <Link
            to="/terms"
            className="underline transition-colors underline-offset-2 hover:text-foreground"
          >
            Terms and conditions
          </Link>

          <span>© 2026 Mailvoidr, Inc. — All rights reserved.</span>

          <div className="flex items-center gap-5">
            <Link
              to="/status"
              className="hidden items-center gap-1.5 font-mono text-[11px] hover:text-foreground md:inline-flex"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusClass} ${
                  apiHealthy ? "animate-pulse" : ""
                }`}
              />
              {statusLabel}
            </Link>

            <Link
              to="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
