import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageTabsCodeBlock } from '@/components/ui/code-block';
import { buildSmtpTabs } from '@/lib/smtp-snippets';
import { toastError, toastSuccess } from '@/lib/toast';
import type { SandboxInbox } from '@/types';
import { ArrowRight, Check, Copy, Eye, EyeOff, Inbox as InboxIcon } from 'lucide-react';

const LANGUAGE_STORAGE_KEY = 'mailvoidr.smtpSnippetLanguage';

function readStoredLanguage(): string | undefined {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function storeLanguage(label: string) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, label);
  } catch {
    // Preference is a convenience only.
  }
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toastSuccess(`${label} copied.`);
  } catch (error) {
    toastError(error, `Could not copy ${label.toLowerCase()}.`);
  }
}

interface CredentialFieldProps {
  label: string;
  value: string;
  displayValue?: string;
  copyLabel: string;
  testId: string;
  extra?: React.ReactNode;
}

function CredentialField({ label, value, displayValue, copyLabel, testId, extra }: CredentialFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(value, copyLabel);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-w-0 rounded-md border border-border bg-card px-3 py-2.5">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <span data-testid={`${testId}-value`} className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">
          {displayValue ?? value}
        </span>
        {extra}
        <button
          type="button"
          onClick={handleCopy}
          data-testid={`${testId}-copy`}
          aria-label={`Copy ${copyLabel.toLowerCase()}`}
          className="transition-colors shrink-0 text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

interface SmtpConnectPanelProps {
  inbox: SandboxInbox;
}

/**
 * Shown in the inbox when no message is selected: sandbox SMTP credentials plus
 * copy-ready snippets so the first test email is a paste away.
 */
export function SmtpConnectPanel({ inbox }: SmtpConnectPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [defaultLanguage] = useState(readStoredLanguage);

  const tabs = useMemo(
    () =>
      buildSmtpTabs(
        {
          host: inbox.smtp_host,
          port: inbox.smtp_port,
          username: inbox.username,
          password: inbox.password,
        },
        showPassword,
      ),
    [inbox.smtp_host, inbox.smtp_port, inbox.username, inbox.password, showPassword],
  );

  return (
    <div data-testid="inbox-connect-panel" className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-full px-5 py-8 mx-auto space-y-6">
        <div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] text-muted-foreground">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full animate-ping bg-primary/60" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
            </span>
            Listening for messages
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CredentialField
            label="Host"
            value={inbox.smtp_host}
            copyLabel="Host"
            testId="inbox-connect-host"
          />
          <CredentialField
            label="Port"
            value={String(inbox.smtp_port)}
            copyLabel="Port"
            testId="inbox-connect-port"
          />
          <CredentialField
            label="Username"
            value={inbox.username}
            copyLabel="Username"
            testId="inbox-connect-username"
          />
          <CredentialField
            label="Password"
            value={inbox.password}
            displayValue={showPassword ? inbox.password : '••••••••••••'}
            copyLabel="Password"
            testId="inbox-connect-password"
            extra={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                data-testid="inbox-connect-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="transition-colors shrink-0 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            }
          />
        </div>

        <div className="space-y-2">
          <LanguageTabsCodeBlock
            tabs={tabs}
            defaultLabel={defaultLanguage}
            onTabChange={storeLanguage}
          />
      
        </div>
      </div>
    </div>
  );
}
