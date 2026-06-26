import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { FormSelect } from '@/components/form/FormSelect';
import { useSettings, useSettingsMutations } from '@/hooks/useSettings';
import { toastError, toastSuccess } from '@/lib/toast';
import type { NotificationPreferences, WorkspaceSettings } from '@/types';
import { AlertTriangle, Loader2, ShieldCheck, Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { workspaceInitials } from '@/hooks/useWorkspaces';

const SECTIONS = [
  'General',
  'Profile',
  'Security',
  'Notifications',
  'Workspace',
  'Danger zone',
] as const;

type SectionId = (typeof SECTIONS)[number];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
];

const MEMBER_ROLE_OPTIONS = [
  { value: 'developer', label: 'Developer' },
  { value: 'admin', label: 'Admin' },
  { value: 'viewer', label: 'Viewer' },
];

export default function Settings() {
  const [active, setActive] = useState<SectionId>('General');
  const { data, isLoading } = useSettings();

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Profile, workspace, security, and integrations."
      />

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <ul className="space-y-0.5">
            {SECTIONS.map((section) => (
              <li key={section}>
                <button
                  type="button"
                  data-testid={`settings-nav-${section.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActive(section)}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${
                    active === section
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  } ${section === 'Danger zone' ? 'text-destructive hover:text-destructive' : ''}`}
                >
                  {section}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="max-w-2xl space-y-6">
          {isLoading || !data ? (
            <div className="flex justify-center p-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              {active === 'General' && <GeneralSection snapshot={data} />}
              {active === 'Profile' && <ProfileSection snapshot={data} />}
              {active === 'Security' && <SecuritySection snapshot={data} />}
              {active === 'Notifications' && <NotificationsSection snapshot={data} />}
              {active === 'Workspace' && <WorkspaceSection snapshot={data} />}
              {active === 'Danger zone' && <DangerZoneSection snapshot={data} />}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function GeneralSection({ snapshot }: { snapshot: import('@/types').SettingsSnapshot }) {
  const workspace = snapshot.workspace;
  const [name, setName] = useState(workspace?.name ?? '');
  const [slug, setSlug] = useState(workspace?.slug ?? '');
  const { updateWorkspace } = useSettingsMutations();

  useEffect(() => {
    setName(workspace?.name ?? '');
    setSlug(workspace?.slug ?? '');
  }, [workspace?.name, workspace?.slug]);

  async function handleSave() {
    if (!workspace) return;

    try {
      await updateWorkspace.mutateAsync({ workspaceId: workspace.id, name, slug });
      toastSuccess('Workspace updated.');
    } catch (error) {
      toastError(error, 'Could not save workspace.');
    }
  }

  if (!workspace) {
    return <EmptyState message="No workspace selected." />;
  }

  return (
    <Section title="General" desc="Workspace-wide preferences">
      <Field label="Workspace name" value={name} onChange={setName} />
      <Field label="Workspace slug" value={slug} onChange={setSlug} mono />
      <p className="text-[12px] text-muted-foreground">
        Default region is fixed to a single Mailvoidr region in v1.
      </p>
      <SaveButton onClick={handleSave} pending={updateWorkspace.isPending} />
    </Section>
  );
}

function ProfileSection({ snapshot }: { snapshot: import('@/types').SettingsSnapshot }) {
  const [name, setName] = useState(snapshot.profile.name);
  const [email, setEmail] = useState(snapshot.profile.email);
  const [timezone, setTimezone] = useState(snapshot.profile.timezone ?? 'UTC');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(snapshot.profile.avatar_url);
  const { updateProfile, uploadAvatar, deleteAvatar } = useSettingsMutations();

  useEffect(() => {
    setName(snapshot.profile.name);
    setEmail(snapshot.profile.email);
    setTimezone(snapshot.profile.timezone ?? 'UTC');
    setAvatarPreview(snapshot.profile.avatar_url);
  }, [snapshot.profile]);

  async function handleSave() {
    try {
      const result = await updateProfile.mutateAsync({ name, email, timezone });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not save profile.');
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Choose a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toastError('Image must be 2 MB or smaller.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const result = await uploadAvatar.mutateAsync(file);
      setAvatarPreview(result.user.avatar_url ?? null);
      toastSuccess(result.message);
    } catch (error) {
      setAvatarPreview(snapshot.profile.avatar_url);
      toastError(error, 'Could not upload profile photo.');
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function handleRemoveAvatar() {
    try {
      const result = await deleteAvatar.mutateAsync();
      setAvatarPreview(null);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not remove profile photo.');
    }
  }

  return (
    <Section title="Profile" desc="Your personal info">
      <div className="flex items-center gap-4 border border-border bg-card p-4">
        <Avatar className="h-16 w-16 border border-border">
          {avatarPreview ? <AvatarImage src={avatarPreview} alt={name} /> : null}
          <AvatarFallback className="font-mono text-sm">
            {workspaceInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent">
              <Upload className="h-3.5 w-3.5" />
              {uploadAvatar.isPending ? 'Uploading…' : 'Upload photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={uploadAvatar.isPending}
              />
            </label>
            {avatarPreview ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={deleteAvatar.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-[12px] text-muted-foreground">Square images work best. Max 2 MB.</p>
        </div>
      </div>
      <Field label="Full name" value={name} onChange={setName} />
      <Field label="Email" value={email} onChange={setEmail} mono />
      {!snapshot.profile.email_verified ? (
        <p className="text-[12px] text-amber-500">Email changed — verify your new address.</p>
      ) : null}
      <div className="border border-border bg-card p-4">
        <label className="label-mono mb-2 block">Timezone</label>
        <FormSelect value={timezone} onValueChange={setTimezone} options={TIMEZONE_OPTIONS} />
      </div>
      <SaveButton onClick={handleSave} pending={updateProfile.isPending} />
    </Section>
  );
}

function SecuritySection({ snapshot }: { snapshot: import('@/types').SettingsSnapshot }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [setupCode, setSetupCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [setup, setSetup] = useState<import('@/types').TwoFactorSetup | null>(null);

  const {
    updatePassword,
    enableTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
    recoveryCodes,
  } = useSettingsMutations();

  async function handlePasswordSave() {
    try {
      const result = await updatePassword.mutateAsync({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not update password.');
    }
  }

  async function handleEnableTwoFactor() {
    try {
      const result = await enableTwoFactor.mutateAsync();
      setSetup(result.setup);
      setTwoFactorOpen(true);
    } catch (error) {
      toastError(error, 'Could not start 2FA setup.');
    }
  }

  async function handleConfirmTwoFactor() {
    try {
      const result = await confirmTwoFactor.mutateAsync(setupCode);
      setSetup(null);
      setSetupCode('');
      setTwoFactorOpen(false);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Invalid authentication code.');
    }
  }

  async function handleDisableTwoFactor() {
    try {
      const result = await disableTwoFactor.mutateAsync(disablePassword);
      setDisablePassword('');
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not disable 2FA.');
    }
  }

  async function handleShowRecoveryCodes() {
    try {
      const result = await recoveryCodes.mutateAsync();
      if (result.recovery_codes.length === 0) {
        toastError('No recovery codes available.');
        return;
      }
      await navigator.clipboard.writeText(result.recovery_codes.join('\n'));
      toastSuccess('Recovery codes copied to clipboard.');
    } catch (error) {
      toastError(error, 'Could not load recovery codes.');
    }
  }

  return (
    <Section title="Security" desc="Password, 2FA, sessions">
      <div className="border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Two-factor authentication
            </div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {snapshot.profile.two_factor_enabled
                ? 'Authenticator app · enabled'
                : 'Add an extra layer of security to your account.'}
            </p>
          </div>
          {snapshot.profile.two_factor_enabled ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleShowRecoveryCodes}
                className="rounded-md border border-border px-3 py-1.5 text-[12.5px] hover:bg-accent"
              >
                Copy recovery codes
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEnableTwoFactor}
              disabled={enableTwoFactor.isPending}
              className="rounded-md border border-border px-3 py-1.5 text-[12.5px] hover:bg-accent disabled:opacity-50"
            >
              Enable
            </button>
          )}
        </div>
        {snapshot.profile.two_factor_enabled ? (
          <div className="mt-4 space-y-2">
            <Field
              label="Password to disable 2FA"
              value={disablePassword}
              onChange={setDisablePassword}
              type="password"
            />
            <button
              type="button"
              onClick={handleDisableTwoFactor}
              disabled={disableTwoFactor.isPending || !disablePassword}
              className="rounded-md border border-destructive/30 px-3 py-1.5 text-[12.5px] text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              Disable 2FA
            </button>
          </div>
        ) : null}
      </div>

      {twoFactorOpen && setup ? (
        <div className="border border-border bg-card p-4 space-y-3">
          <p className="text-[13px]">Scan this QR code with your authenticator app.</p>
          <div
            className="inline-block rounded-md border border-border bg-white p-2"
            dangerouslySetInnerHTML={{ __html: setup.qr_svg }}
          />
          <p className="font-mono text-[11px] text-muted-foreground break-all">{setup.secret_key}</p>
          <Field label="Confirmation code" value={setupCode} onChange={setSetupCode} mono />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirmTwoFactor}
              disabled={confirmTwoFactor.isPending || setupCode.length < 6}
              className="rounded-md bg-primary px-3 py-1.5 text-[13px] text-primary-foreground disabled:opacity-50"
            >
              Confirm 2FA
            </button>
            <button
              type="button"
              onClick={() => {
                setTwoFactorOpen(false);
                setSetup(null);
              }}
              className="rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <Field
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        type="password"
      />
      <Field label="New password" value={password} onChange={setPassword} type="password" />
      <Field
        label="Confirm new password"
        value={passwordConfirmation}
        onChange={setPasswordConfirmation}
        type="password"
      />
      <SaveButton onClick={handlePasswordSave} pending={updatePassword.isPending} label="Update password" />
    </Section>
  );
}

function NotificationsSection({ snapshot }: { snapshot: import('@/types').SettingsSnapshot }) {
  const [prefs, setPrefs] = useState(snapshot.notifications);
  const { updateNotifications } = useSettingsMutations();

  useEffect(() => {
    setPrefs(snapshot.notifications);
  }, [snapshot.notifications]);

  async function handleSave() {
    try {
      const result = await updateNotifications.mutateAsync(prefs);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not save notification preferences.');
    }
  }

  const items: Array<[keyof NotificationPreferences, string, string]> = [
    ['deliverability_alerts', 'Deliverability alerts', 'Drops below 95% for any domain'],
    ['new_invitations', 'New invitations', 'When someone accepts an invite'],
    ['weekly_digest', 'Weekly digest', 'Email volume summary every Monday'],
    ['product_updates', 'Product updates', 'New features and changelog'],
    ['billing_alerts', 'Billing alerts', 'Plan limits, payment failures'],
  ];

  return (
    <Section title="Notifications" desc="Pick what you want to hear about">
      {items.map(([key, label, desc]) => (
        <Toggle
          key={key}
          label={label}
          desc={desc}
          on={prefs[key]}
          onChange={(value) => setPrefs((current) => ({ ...current, [key]: value }))}
        />
      ))}
      <SaveButton onClick={handleSave} pending={updateNotifications.isPending} />
    </Section>
  );
}

function WorkspaceSection({ snapshot }: { snapshot: import('@/types').SettingsSnapshot }) {
  const workspace = snapshot.workspace;
  const [settings, setSettings] = useState(snapshot.workspace_settings);
  const { updateWorkspaceSettings } = useSettingsMutations();

  useEffect(() => {
    setSettings(snapshot.workspace_settings);
  }, [snapshot.workspace_settings]);

  async function handleSave() {
    if (!workspace) return;

    try {
      const result = await updateWorkspaceSettings.mutateAsync({
        workspaceId: workspace.id,
        ...settings,
      });
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not save workspace settings.');
    }
  }

  if (!workspace) {
    return <EmptyState message="No workspace selected." />;
  }

  return (
    <Section title="Workspace" desc="Settings that affect everyone">
      <div className="border border-border bg-card p-4">
        <label className="label-mono mb-2 block">Default member role</label>
        <FormSelect
          value={settings.default_member_role}
          onValueChange={(value) =>
            setSettings((current) => ({ ...current, default_member_role: value }))
          }
          options={MEMBER_ROLE_OPTIONS}
        />
      </div>
      <Toggle
        label="Require 2FA for all members"
        desc="Enforce two-factor across the workspace"
        on={settings.require_two_factor}
        onChange={(value) => setSettings((current) => ({ ...current, require_two_factor: value }))}
      />
      <Toggle
        label="Allow public invites"
        desc="Members can invite without admin approval"
        on={settings.allow_public_invites}
        onChange={(value) => setSettings((current) => ({ ...current, allow_public_invites: value }))}
      />
      <SaveButton onClick={handleSave} pending={updateWorkspaceSettings.isPending} />
    </Section>
  );
}

function DangerZoneSection({ snapshot }: { snapshot: import('@/types').SettingsSnapshot }) {
  const workspace = snapshot.workspace;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteWorkspace } = useSettingsMutations();

  async function handleDelete() {
    if (!workspace) return;

    try {
      const result = await deleteWorkspace.mutateAsync({
        workspaceId: workspace.id,
        confirmationName: workspace.name,
      });
      setDeleteOpen(false);
      toastSuccess(result.message);
    } catch (error) {
      toastError(error, 'Could not delete workspace.');
    }
  }

  if (!workspace) {
    return <EmptyState message="No workspace selected." />;
  }

  return (
    <Section title="Danger zone" desc="Irreversible actions" danger>
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              Delete workspace
            </div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              All data — domains, inboxes, keys — will be permanently destroyed.
            </p>
          </div>
          <button
            type="button"
            data-testid="settings-delete-workspace"
            onClick={() => setDeleteOpen(true)}
            className="rounded-md border border-destructive bg-destructive px-3 py-1.5 text-[13px] text-destructive-foreground"
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resourceName={workspace.name}
        resourceLabel="workspace name"
        title="Delete workspace"
        description="This cannot be undone. Type the workspace name below to confirm."
        confirmLabel="Delete workspace"
        onConfirm={handleDelete}
        isPending={deleteWorkspace.isPending}
        testId="settings-delete-dialog"
      />
    </Section>
  );
}

function Section({
  title,
  desc,
  children,
  danger = false,
}: {
  title: string;
  desc: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <div>
      <h2 className={`text-lg font-medium tracking-tight ${danger ? 'text-destructive' : ''}`}>
        {title}
      </h2>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{desc}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <label className="label-mono mb-2 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
          mono ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border border-border bg-card p-4">
      <div>
        <div className="text-[14px]">{label}</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
        className={`relative inline-flex h-5 w-9 rounded-full border transition-colors ${
          on ? 'border-primary bg-primary' : 'border-border bg-muted'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${
            on ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SaveButton({
  onClick,
  pending,
  label = 'Save changes',
}: {
  onClick: () => void;
  pending: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-[13px] text-muted-foreground">{message}</p>;
}
