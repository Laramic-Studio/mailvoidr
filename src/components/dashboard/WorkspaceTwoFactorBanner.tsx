import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function WorkspaceTwoFactorBanner() {
  const { data } = useSettings();

  if (!data) return null;

  const { workspace_settings, profile, workspace } = data;

  if (!workspace_settings.require_two_factor) return null;
  if (profile.two_factor_enabled) return null;
  if (workspace?.role === 'owner') return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px]"
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-foreground">
        This workspace requires two-factor authentication before you can use workspace features.{' '}
        <Link to="/dashboard/settings" className="font-medium underline underline-offset-2">
          Enable 2FA in Settings → Security
        </Link>
      </p>
    </div>
  );
}
