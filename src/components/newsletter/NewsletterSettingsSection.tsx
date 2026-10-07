import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { QueryErrorState } from '@/components/QueryErrorState';
import {
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/newsletter/classes';
import { useNewsletterSettings, useNewsletterSettingsMutations } from '@/hooks/useNewsletter';
import { deliverabilityPolicyCopy, doiImportCopy, formatShortDate, queuePaceCopy, rampSummary } from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';

const ATTESTATION =
  'I confirm everyone added through the API or a CSV agreed to receive email from us, and I can show proof if asked.';

export function NewsletterSettingsSection() {
  const query = useNewsletterSettings();
  const { update } = useNewsletterSettingsMutations();
  const [address, setAddress] = useState<string | null>(null);
  const [attestOpen, setAttestOpen] = useState(false);
  const [attested, setAttested] = useState(false);

  const settings = query.data;
  const addressValue = address ?? settings?.physical_address ?? '';
  const doiExposed = settings?.doi_for_imports !== undefined || settings?.doi_imports_editable !== undefined;
  const importsOn = settings?.doi_for_imports !== false;
  const purgeDays = settings?.pending_purge_days ?? 30;
  const rampLine = rampSummary({
    trustTier: settings?.trust_tier,
    campaignCap: settings?.campaign_cap,
    dailyCap: settings?.daily_cap,
    capsFromApi: settings?.ramp_caps_from_api,
  });
  const policyLines = deliverabilityPolicyCopy({
    bouncePausePercent: settings?.bounce_pause_percent,
    complaintWarnPercent: settings?.complaint_warn_percent,
    complaintPausePercent: settings?.complaint_pause_percent,
  });

  async function saveAddress() {
    try {
      await update.mutateAsync({ physical_address: addressValue.trim() });
      setAddress(null);
      toastSuccess('Newsletter settings saved.');
    } catch (error) {
      toastError(error, 'Could not save the physical address.');
    }
  }

  async function setImports(enabled: boolean) {
    try {
      await update.mutateAsync({
        doi_for_imports: enabled,
        attestation: enabled ? undefined : ATTESTATION,
      });
      setAttestOpen(false);
      setAttested(false);
      toastSuccess(enabled ? 'Confirmation emails are on for imports.' : 'Import confirmation turned off.');
    } catch (error) {
      toastError(error, 'Could not update the import policy.');
    }
  }

  if (query.isLoading) {
    return <p className="text-[13px] text-muted-foreground">Loading newsletter settings…</p>;
  }

  if (query.isError) {
    return (
      <QueryErrorState
        error={query.error}
        subject="newsletter settings"
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
        framed
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-medium">Physical mailing address</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Required only for campaigns that include United States recipients. Mailvoidr adds it to that footer. Other campaigns can send without it.
          </p>
        </div>
        <label className="block text-[13px]" htmlFor="newsletter-physical-address">
          Address
          <textarea
            id="newsletter-physical-address"
            className={`${fieldClass} mt-1.5 min-h-28`}
            value={addressValue}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Studio name, street, city, country"
          />
        </label>
        <button type="button" className={primaryButtonClass} disabled={update.isPending} onClick={() => void saveAddress()}>
          {update.isPending ? 'Saving…' : 'Save address'}
        </button>
      </section>

      <section className="space-y-3 border border-border bg-card p-5">
        <h2 className="text-base font-medium">Sending trust</h2>
        <p className="text-[13px]">
          {rampLine ?? 'Trust tier and send caps are not available yet.'}
        </p>
        {settings?.ramp_tiers && settings.ramp_tiers.length > 0 ? (
          <ul className="space-y-1 text-[13px] text-muted-foreground">
            {settings.ramp_tiers.map((tier) => (
              <li key={tier.tier}>
                {tier.tier}: {tier.campaign_cap == null ? 'uncapped' : tier.campaign_cap.toLocaleString('en-US')}
                {' / '}
                {tier.daily_cap == null ? 'uncapped' : tier.daily_cap.toLocaleString('en-US')}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-[13px] text-muted-foreground">
          {queuePaceCopy({
            globalPerMinute: settings?.queue_global_per_minute,
            workspacePerMinute: settings?.queue_workspace_per_minute ?? settings?.sends_per_minute,
          })}
        </p>
        {policyLines.map((line) => (
          <p key={line} className="text-[13px] text-muted-foreground">{line}</p>
        ))}
      </section>

      <section className="space-y-3 border border-border bg-card p-5">
        <h2 className="text-base font-medium">Double opt-in for API and imports</h2>
        <p className="text-[13px] text-muted-foreground">
          Form signups always send a confirmation email. This switch covers API and CSV imports on paid plans.
        </p>
        {doiExposed && settings?.doi_imports_editable === false ? (
          <p className="flex items-center gap-2 text-[13px]">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Required on the free plan.
          </p>
        ) : null}
        {doiExposed && settings?.doi_imports_editable !== false ? (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px]">Send a confirmation email for API and CSV imports</span>
            <Switch
              checked={importsOn}
              disabled={update.isPending}
              aria-label="Double opt-in for API and imports"
              onCheckedChange={(checked) => {
                if (!checked) {
                  setAttested(false);
                  setAttestOpen(true);
                  return;
                }
                void setImports(true);
              }}
            />
          </div>
        ) : null}
        {!doiExposed ? (
          <p className="text-[13px] text-muted-foreground">
            The API has not exposed an import policy for this workspace yet. Form signups stay double opt-in.
          </p>
        ) : null}
        <p className="text-[13px] text-muted-foreground">{doiImportCopy(settings)}</p>
        {settings?.doi_for_imports === false && settings.doi_imports_disabled_by?.name ? (
          <p className="text-[13px]">
            Turned off by {settings.doi_imports_disabled_by.name} on {formatShortDate(settings.doi_imports_disabled_by.at)}.
          </p>
        ) : null}
        {settings?.doi_imports_disabled_by?.text ? (
          <p className="text-[13px]">Attestation: {settings.doi_imports_disabled_by.text}</p>
        ) : null}
        <p className="text-[13px] text-muted-foreground">
          Unconfirmed signups are removed after {purgeDays} days.
        </p>
      </section>

      <Dialog open={attestOpen} onOpenChange={setAttestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn off confirmation for imports</DialogTitle>
            <DialogDescription>
              Form signups stay double opt-in. This only changes API and CSV imports.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-[13px] leading-relaxed">
            <input
              type="checkbox"
              className="mt-1"
              checked={attested}
              onChange={(event) => setAttested(event.target.checked)}
            />
            <span>{ATTESTATION}</span>
          </label>
          <DialogFooter>
            <button type="button" className={secondaryButtonClass} onClick={() => setAttestOpen(false)}>
              Keep confirmation on
            </button>
            <button
              type="button"
              className={primaryButtonClass}
              disabled={!attested || update.isPending}
              onClick={() => void setImports(false)}
            >
              Turn off
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-[12px] text-muted-foreground">
        The United States footer address is read from here, not from each audience.{' '}
        <Link to="/dashboard/campaigns" className="text-primary hover:underline">
          Go to campaigns
        </Link>
      </p>
    </div>
  );
}
