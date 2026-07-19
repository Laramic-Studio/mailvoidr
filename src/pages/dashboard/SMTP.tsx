import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { CodeBlock } from '@/components/CodeBlock';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSandbox, useSandboxMutations } from '@/hooks/useSandbox';
import { useSmtpCredentialMutations, useSmtpCredentials } from '@/hooks/useSmtpCredentials';
import { toastError, toastSuccess } from '@/lib/toast';
import type { SandboxInbox, SmtpCredential } from '@/types';
import {
  Server,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  FlaskConical,
  Zap,
  Inbox,
  ArrowRight,
} from 'lucide-react';

type SmtpMode = 'test' | 'live';

export default function SMTP() {
  const [mode, setMode] = useState<SmtpMode>('test');

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Developer"
        title="SMTP credentials"
        description="Connect your app over SMTP — capture test mail on port 587, or deliver live on port 2525."
      />

      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as SmtpMode)}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-10 w-auto shrink-0 grid grid-cols-2">
            <TabsTrigger value="test" data-testid="smtp-tab-test" className="gap-2 px-4">
              <FlaskConical className="h-3.5 w-3.5" />
              Test
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">:587</span>
            </TabsTrigger>
            <TabsTrigger value="live" data-testid="smtp-tab-live" className="gap-2 px-4">
              <Zap className="h-3.5 w-3.5" />
              Live
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">:2525</span>
            </TabsTrigger>
          </TabsList>

          {mode === 'test' ? <TestSmtpToolbar /> : null}
          {mode === 'live' ? <LiveSmtpToolbar /> : null}
        </div>

        <TabsContent value="test" className="mt-0">
          <TestSmtpPanel />
        </TabsContent>

        <TabsContent value="live" className="mt-0">
          <LiveSmtpPanel />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function TestSmtpToolbar() {
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const { data } = useSandbox();
  const { regenerateCredentials } = useSandboxMutations();
  const inbox = data?.inbox ?? null;

  async function handleRegenerateConfirm() {
    if (!inbox) return;

    try {
      const result = await regenerateCredentials.mutateAsync();
      setShowRegenerateConfirm(false);
      toastSuccess(result.message ?? 'Sandbox SMTP credentials regenerated.');
    } catch (error) {
      toastError(error, 'Could not regenerate sandbox credentials.');
    }
  }

  if (!inbox) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        data-testid="smtp-test-regenerate"
        onClick={() => setShowRegenerateConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
      >
        <RefreshCw className="h-3 w-3" /> Regenerate credentials
      </button>

      <ConfirmDeleteDialog
        open={showRegenerateConfirm}
        onOpenChange={setShowRegenerateConfirm}
        resourceName={inbox.username}
        resourceLabel="SMTP username"
        title="Regenerate SMTP credentials"
        description="This creates a new username and password. Existing apps using the current credentials will stop working until you update them. Type the current SMTP username below to confirm."
        confirmLabel="Regenerate credentials"
        onConfirm={handleRegenerateConfirm}
        isPending={regenerateCredentials.isPending}
        testId="smtp-test-regenerate-dialog"
      />
    </>
  );
}

function TestSmtpPanel() {
  const [showPassword, setShowPassword] = useState(false);
  const { data, isLoading, isError } = useSandbox();
  const { enable } = useSandboxMutations();
  const inbox = data?.inbox ?? null;

  const snippet = useMemo(() => buildNodemailerSnippet(inbox), [inbox]);

  async function handleEnable() {
    try {
      await enable.mutateAsync();
      toastSuccess('Sandbox inbox ready — your test SMTP credentials are below.');
    } catch (error) {
      toastError(error, 'Could not enable sandbox inbox.');
    }
  }

  async function copyEnv(inbox: SandboxInbox) {
    await navigator.clipboard.writeText(
      `SMTP_HOST=${inbox.smtp_host}\nSMTP_PORT=${inbox.smtp_port}\nSMTP_USER=${inbox.username}\nSMTP_PASS=${inbox.password}\nSMTP_ENCRYPTION=null`,
    );
    toastSuccess('Test SMTP credentials copied.');
  }

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (isError) {
    return <ErrorPanel message="Could not load sandbox SMTP credentials." />;
  }

  if (!inbox) {
    return (
      <EmptyPanel
        icon={FlaskConical}
        title="Enable sandbox SMTP"
        description="Get a dedicated test inbox and SMTP credentials on port 587. Messages stay in your workspace — nothing is delivered to real recipients."
        actionLabel={enable.isPending ? 'Enabling…' : 'Enable test SMTP'}
        actionTestId="smtp-test-enable"
        actionPending={enable.isPending}
        onAction={handleEnable}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ModeCallout
        tone="test"
        title="Sandbox capture"
        description="Point staging or local apps here. Mail appears in your sandbox inbox instantly. Free and Starter include 3,000 sandbox captures per month."
        action={
          <Link
            to="/dashboard/inbox"
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-foreground hover:underline"
          >
            Open inbox
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <CredentialCard
        testId="smtp-test"
        title="Test SMTP"
        subtitle={`${inbox.smtp_host} · port ${inbox.smtp_port}`}
        status="active"
        rows={[
          { label: 'HOST', value: inbox.smtp_host },
          { label: 'PORT', value: inbox.smtp_port },
          { label: 'USERNAME', value: inbox.username, onCopy: () => copyValue(inbox.username, 'Username') },
          {
            label: 'PASSWORD',
            value: showPassword ? inbox.password : '••••••••••••••',
            action: (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            ),
            onCopy: showPassword ? () => copyValue(inbox.password, 'Password') : undefined,
          },
        ]}
        footer={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyEnv(inbox)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12.5px] hover:bg-accent"
            >
              <Copy className="h-3 w-3" /> Copy .env snippet
            </button>
            <Link
              to="/dashboard/inbox"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12.5px] hover:bg-accent"
            >
              <Inbox className="h-3 w-3" /> View captured mail
            </Link>
          </div>
        }
      />

      <SnippetSection
        title="Connect — test"
        description="Use STARTTLS if your client supports it. Messages route to your sandbox inbox only."
        code={snippet}
      />
    </div>
  );
}

function LiveSmtpToolbar() {
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const { data } = useSmtpCredentials();
  const { enable, rotatePassword } = useSmtpCredentialMutations();

  const credential = data?.credential ?? null;
  const liveSendingEnabled = data?.live_sending_enabled ?? false;

  async function handleEnable() {
    try {
      const result = await enable.mutateAsync();
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not enable live sending.');
    }
  }

  async function handleRotateConfirm() {
    if (!credential) return;

    try {
      const result = await rotatePassword.mutateAsync(credential.id);
      setShowRotateConfirm(false);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not rotate SMTP password.');
    }
  }

  if (!liveSendingEnabled) {
    return (
      <button
        type="button"
        data-testid="smtp-enable"
        disabled={enable.isPending}
        onClick={handleEnable}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {enable.isPending ? 'Enabling…' : 'Enable live sending'}
      </button>
    );
  }

  if (!credential) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        data-testid="smtp-rotate"
        onClick={() => setShowRotateConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
      >
        <RefreshCw className="h-3 w-3" /> Rotate password
      </button>

      <ConfirmDeleteDialog
        open={showRotateConfirm}
        onOpenChange={setShowRotateConfirm}
        resourceName={credential.username}
        resourceLabel="SMTP username"
        title="Rotate SMTP password"
        description="Existing apps using the current password will stop working until you update them. Type the SMTP username below to confirm."
        confirmLabel="Rotate password"
        onConfirm={handleRotateConfirm}
        isPending={rotatePassword.isPending}
        testId="smtp-rotate-dialog"
      />
    </>
  );
}

function LiveSmtpPanel() {
  const [showPassword, setShowPassword] = useState(false);
  const { data, isLoading, isError } = useSmtpCredentials();
  const { enable } = useSmtpCredentialMutations();

  const credential = data?.credential ?? null;
  const liveSendingEnabled = data?.live_sending_enabled ?? false;
  const password = credential?.password ?? '';

  const snippet = useMemo(() => buildNodemailerSnippet(credential), [credential]);

  async function handleEnable() {
    try {
      const result = await enable.mutateAsync();
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not enable live sending.');
    }
  }

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (isError) {
    return <ErrorPanel message="Could not load live SMTP credentials." />;
  }

  return (
    <div className="space-y-4">
      <ModeCallout
        tone="live"
        title="Production delivery"
        description="Verify a domain for branded sending, or whitelist your server IP to send from any From address (shown via mailvoidr.com)."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/ip-whitelist"
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-foreground hover:underline"
            >
              IP whitelist
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/dashboard/domains"
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-foreground hover:underline"
            >
              Verify a domain
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        }
      />

      {!liveSendingEnabled ? (
        <EmptyPanel
          icon={Zap}
          title="Live sending is off"
          description="Enable live SMTP to get port 2525 credentials for production traffic. Use the Test tab for sandbox capture on port 587."
          actionLabel={enable.isPending ? 'Enabling…' : 'Enable live sending'}
          actionTestId="smtp-live-enable-inline"
          actionPending={enable.isPending}
          onAction={handleEnable}
        />
      ) : credential ? (
        <CredentialCard
          testId={`smtp-row-${credential.id}`}
          title={credential.name}
          subtitle={`${credential.host} · port ${credential.port}${formatAltPorts(credential.alt_ports)}`}
          status={credential.is_active ? 'active' : 'paused'}
          rows={[
            { label: 'HOST', value: credential.host, onCopy: () => copyValue(credential.host, 'Host') },
            { label: 'PORT', value: credential.port, onCopy: () => copyValue(String(credential.port), 'Port') },
            ...(credential.alt_ports?.length
              ? [
                  {
                    label: 'ALT PORTS',
                    value: credential.alt_ports.join(', '),
                    onCopy: () => copyValue(credential.alt_ports!.join(', '), 'Alternate ports'),
                  },
                ]
              : []),
            {
              label: 'USERNAME',
              value: credential.username,
              onCopy: () => copyValue(credential.username, 'Username'),
            },
            {
              label: 'PASSWORD',
              value: showPassword && password ? password : '••••••••••••••',
              action: password ? (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              ) : null,
              onCopy: showPassword && password ? () => copyValue(password, 'Password') : undefined,
            },
          ]}
          footer={
            password ? (
              <button
                type="button"
                onClick={() =>
                  copyEnvSnippet(credential.host, credential.port, credential.username, password)
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12.5px] hover:bg-accent"
              >
                <Copy className="h-3 w-3" /> Copy .env snippet
              </button>
            ) : null
          }
        />
      ) : null}

      {liveSendingEnabled && credential ? (
        <SnippetSection
          title="Connect — live"
          description="Plain SMTP on port 2525 — works with default Laravel mail settings, no TLS configuration needed."
          code={snippet}
        />
      ) : null}
    </div>
  );
}

function ModeCallout({
  tone,
  title,
  description,
  action,
}: {
  tone: 'test' | 'live';
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const isTest = tone === 'test';

  return (
    <div
      className={`flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between ${
        isTest
          ? 'border-primary/25 bg-primary/5'
          : 'border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
            isTest ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isTest ? <FlaskConical className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-[13px] font-medium">{title}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function CredentialCard({
  testId,
  title,
  subtitle,
  status,
  rows,
  footer,
}: {
  testId: string;
  title: string;
  subtitle: string;
  status: 'active' | 'paused';
  rows: Array<{
    label: string;
    value: string | number;
    action?: ReactNode;
    onCopy?: () => void;
  }>;
  footer?: ReactNode;
}) {
  return (
    <div data-testid={testId} className="border border-border bg-card">
      <div className="flex items-start justify-between border-b border-border p-5">
        <div>
          <div className="inline-flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-base font-medium">{title}</h3>
          </div>
          <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">{subtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <KV key={row.label} {...row} />
        ))}
      </div>

      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </div>
  );
}

function SnippetSection({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{description}</p>
      <CodeBlock language="js" code={code} className="mt-3" />
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTestId,
  actionPending,
  onAction,
}: {
  icon: typeof Server;
  title: string;
  description: string;
  actionLabel: string;
  actionTestId: string;
  actionPending: boolean;
  onAction: () => void;
}) {
  return (
    <div className="border border-dashed border-border bg-card p-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 text-base font-medium">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <button
        type="button"
        data-testid={actionTestId}
        disabled={actionPending}
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex justify-center p-12 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return <p className="text-sm text-destructive">{message}</p>;
}

function KV({
  label,
  value,
  action,
  onCopy,
}: {
  label: string;
  value: string | number;
  action?: ReactNode;
  onCopy?: () => void;
}) {
  return (
    <div className="bg-card p-3">
      <div className="label-mono">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[12.5px]">{value}</span>
        <div className="flex shrink-0 items-center gap-1">
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

async function copyValue(value: string, label: string) {
  await navigator.clipboard.writeText(String(value));
  toastSuccess(`${label} copied.`);
}

async function copyEnvSnippet(host: string, port: number, username: string, password: string) {
  await navigator.clipboard.writeText(
    `MAIL_MAILER=smtp\nMAIL_HOST=${host}\nMAIL_PORT=${port}\nMAIL_USERNAME=${username}\nMAIL_PASSWORD=${password}\nMAIL_ENCRYPTION=null`,
  );
  toastSuccess('Live SMTP credentials copied.');
}

function formatAltPorts(altPorts?: number[]): string {
  if (!altPorts?.length) {
    return '';
  }

  return ` · alt ${altPorts.join(', ')}`;
}

function buildNodemailerSnippet(cred: SandboxInbox | SmtpCredential | null): string {
  if (!cred) {
    return `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "YOUR_SMTP_HOST",
  port: 587,
  secure: false,
  auth: { user: "YOUR_SMTP_USERNAME", pass: process.env.MV_SMTP_PASS },
});`;
  }

  const host = 'smtp_host' in cred ? cred.smtp_host : cred.host;
  const port = 'smtp_port' in cred ? cred.smtp_port : cred.port;
  const user = cred.username;

  return `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "${host}",
  port: ${port},
  secure: false,
  ignoreTLS: true,
  auth: { user: "${user}", pass: process.env.MV_SMTP_PASS },
});

await transporter.sendMail({
  from: "${'smtp_port' in cred ? 'test@your-app.dev' : 'noreply@your-domain.com'}",
  to: "recipient@example.com",
  subject: "${'smtp_port' in cred ? 'Sandbox test' : 'Welcome'}",
  html: "<h1>Hello from Mailvoidr</h1>",
});`;
}
