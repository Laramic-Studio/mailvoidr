import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { CodeBlock } from '@/components/CodeBlock';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useSmtpCredentialMutations, useSmtpCredentials } from '@/hooks/useSmtpCredentials';
import { toastError, toastSuccess } from '@/lib/toast';
import type { SmtpCredential } from '@/types';
import { Server, Copy, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';

const COMING_SOON_CREDENTIALS = [
  { id: 'eu', name: 'EU SMTP', region: 'eu-west-1' },
  { id: 'staging', name: 'Staging SMTP', region: 'us-east-1' },
] as const;

export default function SMTP() {
  const [revealed, setRevealed] = useState(false);
  const [ephemeralPassword, setEphemeralPassword] = useState<string | null>(null);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const { data, isLoading, isError } = useSmtpCredentials();
  const { enable, rotatePassword } = useSmtpCredentialMutations();

  const credential = data?.credential ?? null;
  const liveSendingEnabled = data?.live_sending_enabled ?? false;
  const password = ephemeralPassword ?? '••••••••••••••';

  const nodemailerSnippet = useMemo(() => {
    if (!credential) {
      return `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "${import.meta.env.VITE_LIVE_SMTP_HOST ?? 'app.mailvoidr.com'}",
  port: 587,
  secure: false,
  auth: { user: "YOUR_SMTP_USERNAME", pass: process.env.MV_SMTP_PASS },
});`;
    }

    return `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "${credential.host}",
  port: ${credential.port},
  secure: false,
  auth: { user: "${credential.username}", pass: process.env.MV_SMTP_PASS },
});

await transporter.sendMail({
  from: "hello@your-verified-domain.com",
  to: "recipient@example.com",
  subject: "Welcome",
  html: "<h1>Hello from Mailvoidr</h1>",
});`;
  }, [credential]);

  async function handleEnable() {
    try {
      const result = await enable.mutateAsync();
      setEphemeralPassword(result.password);
      setRevealed(true);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not enable live sending.');
    }
  }

  async function handleRotateConfirm() {
    if (!credential) return;

    try {
      const result = await rotatePassword.mutateAsync(credential.id);
      setEphemeralPassword(result.password);
      setRevealed(true);
      setShowRotateConfirm(false);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not rotate SMTP password.');
    }
  }

  async function copyValue(value: string, label: string) {
    await navigator.clipboard.writeText(String(value));
    toastSuccess(`${label} copied.`);
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="SMTP credentials"
        description="Drop-in SMTP relay for live sending. Use on port 587 with STARTTLS."
        actions={
          !liveSendingEnabled ? (
            <button
              type="button"
              data-testid="smtp-enable"
              disabled={enable.isPending}
              onClick={handleEnable}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {enable.isPending ? 'Enabling…' : 'Enable live sending'}
            </button>
          ) : credential ? (
            <button
              type="button"
              data-testid="smtp-rotate"
              onClick={() => setShowRotateConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              <RefreshCw className="h-3 w-3" /> Rotate password
            </button>
          ) : null
        }
      />

      {isLoading ? (
        <div className="flex justify-center p-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Could not load SMTP credentials.</p>
      ) : (
        <div className="mb-8 space-y-4">
          {!liveSendingEnabled ? (
            <div className="border border-dashed border-border bg-card p-12 text-center">
              <Server className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Live sending is not enabled yet. Turn it on to get SMTP credentials for outbound
                mail.
              </p>
            </div>
          ) : credential ? (
            <CredentialCard
              credential={credential}
              password={password}
              revealed={revealed}
              canReveal={Boolean(ephemeralPassword)}
              onToggleReveal={() => setRevealed((value) => !value)}
              onCopy={copyValue}
            />
          ) : null}

        
        </div>
      )}

      <div className="border border-border bg-card p-5">
        <h3 className="text-base font-medium">Connect via SMTP</h3>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Example using Node.js + nodemailer. Store the password in an env var — it is only shown once
          after enable or rotate.
        </p>
        <CodeBlock language="js" code={nodemailerSnippet} className="mt-3" />
      </div>

      <ConfirmDeleteDialog
        open={showRotateConfirm}
        onOpenChange={setShowRotateConfirm}
        resourceName={credential?.username ?? ''}
        resourceLabel="SMTP username"
        title="Rotate SMTP password"
        description={
          credential
            ? 'Existing apps using the current password will stop working until you update them. Type the SMTP username below to confirm.'
            : undefined
        }
        confirmLabel="Rotate password"
        onConfirm={handleRotateConfirm}
        isPending={rotatePassword.isPending}
        testId="smtp-rotate-dialog"
      />
    </DashboardLayout>
  );
}

function CredentialCard({
  credential,
  password,
  revealed,
  canReveal,
  onToggleReveal,
  onCopy,
}: {
  credential: SmtpCredential;
  password: string;
  revealed: boolean;
  canReveal: boolean;
  onToggleReveal: () => void;
  onCopy: (value: string, label: string) => void;
}) {
  return (
    <div data-testid={`smtp-row-${credential.id}`} className="border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-base font-medium">{credential.name}</h3>
          </div>
          <div className="mt-1 font-mono text-[11.5px] text-muted-foreground">
            {credential.region}
          </div>
        </div>
        <StatusBadge status={credential.is_active ? 'active' : 'paused'} />
      </div>

      <div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-4">
        <KV k="HOST" v={credential.host} mono onCopy={() => onCopy(credential.host, 'Host')} />
        <KV k="PORT" v={credential.port} mono onCopy={() => onCopy(String(credential.port), 'Port')} />
        <KV
          k="USERNAME"
          v={credential.username}
          mono
          onCopy={() => onCopy(credential.username, 'Username')}
        />
        <KV
          k="PASSWORD"
          v={revealed ? password : '••••••••••••••'}
          mono
          action={
            canReveal ? (
              <button
                type="button"
                onClick={onToggleReveal}
                className="text-muted-foreground hover:text-foreground"
              >
                {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground">Rotate to reveal</span>
            )
          }
          onCopy={canReveal && revealed ? () => onCopy(password, 'Password') : undefined}
        />
      </div>

      {!canReveal ? (
        <p className="mt-3 text-[12px] text-muted-foreground">
          Password is hidden after refresh. Rotate the password if you need a new one.
        </p>
      ) : null}
    </div>
  );
}

function KV({
  k,
  v,
  mono = false,
  action,
  onCopy,
}: {
  k: string;
  v: string | number;
  mono?: boolean;
  action?: React.ReactNode;
  onCopy?: () => void;
}) {
  return (
    <div className="bg-card p-3">
      <div className="label-mono">{k}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className={`truncate text-[12.5px] ${mono ? 'font-mono' : ''}`}>{v}</span>
        <div className="flex items-center gap-1">
          {action}
          {onCopy ? (
            <button
              type="button"
              onClick={onCopy}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
