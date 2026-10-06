import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { TemplateEmailEditorHandle } from '@/components/templates/TemplateEmailEditor';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '@/components/newsletter/classes';
import {
  useAudiences,
  useCampaignMutations,
  useNewsletterSettings,
} from '@/hooks/useNewsletter';
import { useDomains } from '@/hooks/useDomains';
import { useTemplates } from '@/hooks/useTemplates';
import {
  abTestBlockers,
  audienceReceiptCopy,
  contentHasPhysicalAddress,
  contentHasUnsubscribe,
  DEFAULT_CAMPAIGN_TIMEZONE,
  formatCount,
  hasPhysicalAddress,
  isEmailAddress,
  meterOverageMessage,
  perVariantCount,
  reviewSendFloor,
  sendRequiresReview,
  suppressedCount,
} from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Campaign } from '@/types/newsletter';
import type { TemplateDesign } from '@/types';

const TemplateEmailEditor = lazy(() => import('@/components/templates/TemplateEmailEditor'));

const STEPS = ['Audience', 'Content', 'Subject test', 'Test send', 'Review & send'] as const;
const WAIT_HOURS = [1, 2, 4, 8, 24];
const TIMEZONES = [
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Africa/Nairobi',
  'Africa/Cairo',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'UTC',
];

interface CampaignBuilderProps {
  campaign: Campaign;
}

export default function CampaignBuilder({ campaign }: CampaignBuilderProps) {
  const { update, test, schedule, send } = useCampaignMutations();
  const audiences = useAudiences();
  const domains = useDomains();
  const templates = useTemplates();
  const settings = useNewsletterSettings();
  const editorRef = useRef<TemplateEmailEditorHandle>(null);
  const [step, setStep] = useState(0);
  const [audienceId, setAudienceId] = useState(campaign.audience_id ?? '');
  const [includeTags, setIncludeTags] = useState(campaign.include_tags.join(', '));
  const [excludeTags, setExcludeTags] = useState(campaign.exclude_tags.join(', '));
  const [fromName, setFromName] = useState(campaign.from_name ?? '');
  const [localPart, setLocalPart] = useState(campaign.from_address?.split('@')[0] ?? '');
  const [domain, setDomain] = useState(campaign.from_address?.split('@')[1] ?? '');
  const [replyTo, setReplyTo] = useState(campaign.reply_to ?? '');
  const [subject, setSubject] = useState(campaign.subject ?? '');
  const [previewText, setPreviewText] = useState(campaign.preview_text ?? '');
  const [html, setHtml] = useState(campaign.html ?? '');
  const [text, setText] = useState(campaign.text ?? '');
  const [templateId, setTemplateId] = useState(campaign.template_id ?? '');
  const [contentMode, setContentMode] = useState<'template' | 'html' | 'editor'>(campaign.template_id ? 'template' : 'html');
  const [abEnabled, setAbEnabled] = useState(campaign.ab_test_enabled);
  const [subjectB, setSubjectB] = useState(campaign.subject_b ?? '');
  const [share, setShare] = useState(campaign.ab_test_share ?? 20);
  const [winnerRule, setWinnerRule] = useState<'click_rate' | 'manual'>(campaign.ab_winner_rule ?? 'click_rate');
  const [waitHours, setWaitHours] = useState(campaign.ab_wait_hours ?? 4);
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const [testInput, setTestInput] = useState('');
  const [scheduleOn, setScheduleOn] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [timezone, setTimezone] = useState(campaign.timezone || DEFAULT_CAMPAIGN_TIMEZONE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [live, setLive] = useState(campaign);

  useEffect(() => {
    setLive(campaign);
  }, [campaign]);

  const audience = (audiences.data?.data ?? []).find((item) => item.id === audienceId) ?? null;
  const eligible = live.eligible_count ?? audience?.subscribed_count ?? null;
  const pending = live.pending_excluded ?? audience?.pending_count ?? null;
  const suppressed = live.suppressed_excluded ?? (audience ? suppressedCount(audience) : null);
  const receipt = audienceReceiptCopy({ eligible, pending, suppressed });
  const blockers = abTestBlockers(eligible ?? 0, share);
  const abAllowed = blockers.length === 0;
  const fromAddress = localPart && domain ? `${localPart}@${domain}` : '';
  const recipients = live.total_recipients ?? eligible;
  const floor = reviewSendFloor({ totalRecipients: recipients, sendsPerMinute: live.sends_per_minute ?? settings.data?.sends_per_minute });
  const overLimit = meterOverageMessage(settings.data?.monthly_sends_used, settings.data?.monthly_send_limit, eligible);
  const reviewHold = sendRequiresReview(live.requires_review, eligible, settings.data?.first_large_send_threshold);
  const addressReady = hasPhysicalAddress(settings.data?.physical_address);
  const unsubPresent = live.has_unsubscribe_link === true || contentHasUnsubscribe(html, text);
  const addressPresent = live.has_physical_address === true || contentHasPhysicalAddress(html, text, settings.data?.physical_address);
  const perSide = perVariantCount(eligible ?? 0, share);
  const domainRows = domains.data?.data ?? [];

  const templateOptions = templates.data?.data ?? [];
  const selectedTemplate = templateOptions.find((item) => item.id === templateId);

  const saving = update.isPending || schedule.isPending || send.isPending;

  const summary = useMemo(() => ([
    ['Audience', audience?.name ?? live.audience_name ?? '—'],
    ['Recipients', formatCount(recipients)],
    ['From', fromAddress || '—'],
    ['Subject', abEnabled ? `${subject || 'A'} / ${subjectB || 'B'}` : (subject || '—')],
  ]), [abEnabled, audience?.name, fromAddress, live.audience_name, recipients, subject, subjectB]);

  async function save(payload: Parameters<typeof update.mutateAsync>[0]['payload'], advance = true) {
    const result = await update.mutateAsync({ id: campaign.id, payload });
    setLive(result.campaign);
    if (advance) setStep((current) => Math.min(current + 1, STEPS.length - 1));
    return result;
  }

  async function exportEditorHtml() {
    if (contentMode !== 'editor' || !editorRef.current?.isReady()) {
      return { html, design: null as TemplateDesign | null };
    }
    const exported = await editorRef.current.exportDesign();
    setHtml(exported.html);
    return exported;
  }

  async function saveAudience() {
    if (!audienceId) {
      toastError(null, 'Choose an audience.');
      return;
    }
    try {
      await save({
        audience_id: audienceId,
        include_tags: splitTags(includeTags),
        exclude_tags: splitTags(excludeTags),
      });
    } catch (error) {
      toastError(error, 'Could not save the audience.');
    }
  }

  async function saveContent() {
    if (!fromName.trim() || !fromAddress || !subject.trim()) {
      toastError(null, 'From name, from address, and subject are required.');
      return;
    }
    try {
      const exported = await exportEditorHtml();
      await save({
        from_name: fromName.trim(),
        from_address: fromAddress,
        reply_to: replyTo.trim() || null,
        subject: subject.trim(),
        preview_text: previewText.trim() || null,
        html: exported.html,
        text,
        design_json: exported.design,
        template_id: contentMode === 'template' ? templateId || null : null,
        template_version_id: contentMode === 'template' ? selectedTemplate?.current_version?.id ?? null : null,
      });
    } catch (error) {
      toastError(error, 'Could not save the content.');
    }
  }

  async function saveSubjectTest() {
    if (abEnabled && !abAllowed) return;
    if (abEnabled && !subjectB.trim()) {
      toastError(null, 'Add subject B.');
      return;
    }
    try {
      await save({
        ab_test_enabled: abEnabled,
        subject_b: abEnabled ? subjectB.trim() : null,
        ab_test_share: share,
        ab_winner_rule: winnerRule,
        ab_wait_hours: waitHours,
      });
    } catch (error) {
      toastError(error, 'Could not save the subject test.');
    }
  }

  function addTestEmail() {
    const next = testInput.trim();
    if (!isEmailAddress(next)) {
      toastError(null, 'Enter a valid email.');
      return;
    }
    if (testEmails.includes(next) || testEmails.length >= 5) return;
    setTestEmails([...testEmails, next]);
    setTestInput('');
  }

  async function handleTestSend() {
    if (testEmails.length === 0) {
      setStep(4);
      return;
    }
    try {
      const result = await test.mutateAsync({ id: campaign.id, emails: testEmails });
      toastSuccess(result.message || 'Test sent. Test sends don’t count in stats.');
      setStep(4);
    } catch (error) {
      toastError(error, 'Could not send the test.');
    }
  }

  async function handleConfirmSend() {
    try {
      if (scheduleOn) {
        if (!date || !time) {
          toastError(null, 'Pick a date and time.');
          return;
        }
        const result = await schedule.mutateAsync({
          id: campaign.id,
          send_at: `${date}T${time}:00`,
          timezone,
        });
        toastSuccess(result.message);
      } else {
        const result = await send.mutateAsync(campaign.id);
        toastSuccess(result.message);
      }
      setConfirmOpen(false);
    } catch (error) {
      toastError(error, 'Could not send the campaign.');
    }
  }

  const primaryDisabled = (step === 4 && (!addressReady || !fromAddress || Boolean(overLimit))) || saving;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title={live.name}
        description="Each step saves the draft."
        breadcrumbs={['Campaigns', live.name]}
      />
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Campaign steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              aria-current={index === step ? 'step' : undefined}
              className={`rounded-full border px-3 py-1 text-[12px] ${index === step ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>
      <p className="label-mono mb-4" aria-live="polite">Step {step + 1} of {STEPS.length}</p>

      {step === 0 ? (
        <section className="max-w-xl space-y-4">
          <label className="block text-[13px]">
            Audience
            <Select value={audienceId || undefined} onValueChange={setAudienceId}>
              <SelectTrigger className="mt-1.5" aria-label="Audience"><SelectValue placeholder="Choose an audience" /></SelectTrigger>
              <SelectContent>
                {(audiences.data?.data ?? []).map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block text-[13px]">Include tags<input className={`${fieldClass} mt-1.5`} value={includeTags} onChange={(event) => setIncludeTags(event.target.value)} placeholder="launch, customers" /></label>
          <label className="block text-[13px]">Exclude tags<input className={`${fieldClass} mt-1.5`} value={excludeTags} onChange={(event) => setExcludeTags(event.target.value)} /></label>
          {receipt ? <p className="text-[13px]">{receipt}</p> : null}
          {overLimit ? (
            <p className="border border-[hsl(var(--chart-3)/0.4)] bg-[hsl(var(--chart-3)/0.1)] p-3 text-[13px]">
              {overLimit} <Link to="/dashboard/billing" className="underline">Upgrade</Link>
            </p>
          ) : null}
          <button type="button" className={primaryButtonClass} disabled={saving} onClick={() => void saveAudience()}>Continue</button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <label className="block text-[13px]">From name<input className={`${fieldClass} mt-1.5`} value={fromName} onChange={(event) => setFromName(event.target.value)} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-[13px]">From address<input className={`${fieldClass} mt-1.5`} value={localPart} onChange={(event) => setLocalPart(event.target.value)} placeholder="news" /></label>
              <label className="block text-[13px]">
                Domain
                <Select value={domain || undefined} onValueChange={setDomain}>
                  <SelectTrigger className="mt-1.5" aria-label="From domain"><SelectValue placeholder="Verified domain" /></SelectTrigger>
                  <SelectContent>
                    {domainRows.map((item) => (
                      <SelectItem key={item.id} value={item.domain} disabled={item.status !== 'verified'}>
                        {item.domain}{item.status === 'verified' ? '' : ' — verify first'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Unverified domains stay disabled. <Link to="/dashboard/domains" className="text-primary hover:underline">Verify SPF, DKIM and DMARC first</Link>
            </p>
            <label className="block text-[13px]">Reply-to<input className={`${fieldClass} mt-1.5`} value={replyTo} onChange={(event) => setReplyTo(event.target.value)} /></label>
            <label className="block text-[13px]">Subject<input className={`${fieldClass} mt-1.5`} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
            <label className="block text-[13px]">Preview text<input className={`${fieldClass} mt-1.5`} value={previewText} onChange={(event) => setPreviewText(event.target.value)} /></label>
            <p className="text-[12px] text-muted-foreground">
              Merge tag <code>{'{{first_name|there}}'}</code> uses the first name, or “there” when it is missing.
            </p>
            <div className="flex flex-wrap gap-2">
              {(['template', 'editor', 'html'] as const).map((mode) => (
                <button key={mode} type="button" className={contentMode === mode ? primaryButtonClass : secondaryButtonClass} onClick={() => setContentMode(mode)}>
                  {mode === 'template' ? 'Template' : mode === 'editor' ? 'Editor' : 'HTML + text'}
                </button>
              ))}
            </div>
            {contentMode === 'template' ? (
              <Select value={templateId || undefined} onValueChange={setTemplateId}>
                <SelectTrigger aria-label="Template"><SelectValue placeholder="Choose a template version" /></SelectTrigger>
                <SelectContent>
                  {templateOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}{item.current_version ? ` · v${item.current_version.version}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {contentMode === 'editor' ? (
              <div className="h-[480px] overflow-hidden border border-border">
                <Suspense fallback={<p className="p-4 text-[13px] text-muted-foreground">Loading editor…</p>}>
                  <TemplateEmailEditor ref={editorRef} design={(live.design_json as TemplateDesign | null) ?? null} />
                </Suspense>
              </div>
            ) : null}
            {contentMode === 'html' ? (
              <>
                <label className="block text-[13px]">HTML<textarea className={`${fieldClass} mt-1.5 min-h-40 font-mono`} value={html} onChange={(event) => setHtml(event.target.value)} /></label>
                <label className="block text-[13px]">Plain text<textarea className={`${fieldClass} mt-1.5 min-h-24`} value={text} onChange={(event) => setText(event.target.value)} /></label>
              </>
            ) : null}
            <div className="flex gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setStep(0)}>Back</button>
              <button type="button" className={primaryButtonClass} disabled={saving} onClick={() => void saveContent()}>Continue</button>
            </div>
          </div>
          <ComplianceCard unsub={unsubPresent} address={addressPresent} addressReady={addressReady} />
        </section>
      ) : null}

      {step === 2 ? (
        <section className="max-w-xl space-y-4">
          <label className="flex items-center justify-between gap-3 text-[13px]">
            Test two subject lines
            <Switch
              checked={abEnabled}
              disabled={!abAllowed && !abEnabled}
              onCheckedChange={(checked) => {
                if (checked && !abAllowed) return;
                setAbEnabled(checked);
              }}
              aria-label="Test two subject lines"
            />
          </label>
          {!abAllowed ? (
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
              {blockers.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          ) : null}
          {abEnabled ? (
            <>
              <label className="block text-[13px]">Subject A<input className={`${fieldClass} mt-1.5`} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
              <label className="block text-[13px]">Subject B<input className={`${fieldClass} mt-1.5`} value={subjectB} onChange={(event) => setSubjectB(event.target.value)} /></label>
              <div>
                <div className="mb-2 flex justify-between text-[13px]">
                  <span>Test share {share}%</span>
                  <span>{formatCount(perSide)} per variant</span>
                </div>
                <Slider min={10} max={50} step={1} value={[share]} onValueChange={([value]) => setShare(value)} aria-label="Test share" />
              </div>
              <RadioGroup value={winnerRule} onValueChange={(value) => setWinnerRule(value as 'click_rate' | 'manual')}>
                <label className="flex items-center gap-2 text-[13px]"><RadioGroupItem value="click_rate" /> Highest click rate after</label>
                <Select value={String(waitHours)} onValueChange={(value) => setWaitHours(Number(value))}>
                  <SelectTrigger className="max-w-[140px]" aria-label="Winner wait"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WAIT_HOURS.map((hours) => <SelectItem key={hours} value={String(hours)}>{hours} h</SelectItem>)}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-[13px]"><RadioGroupItem value="manual" /> I&apos;ll pick manually</label>
              </RadioGroup>
              <p className="text-[12px] text-muted-foreground">If clicks are tied or too few, we&apos;ll ask you to pick.</p>
            </>
          ) : null}
          <div className="flex gap-2">
            <button type="button" className={secondaryButtonClass} onClick={() => setStep(1)}>Back</button>
            <button type="button" className={primaryButtonClass} disabled={saving || (abEnabled && !abAllowed)} onClick={() => void saveSubjectTest()}>Continue</button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="max-w-xl space-y-4">
          <p className="text-[13px] text-muted-foreground">Up to 5 addresses. Test sends don&apos;t count in stats.</p>
          <div className="flex flex-wrap gap-2">
            {testEmails.map((email) => (
              <button key={email} type="button" className="rounded-full border border-border px-2 py-1 text-[12px]" onClick={() => setTestEmails(testEmails.filter((item) => item !== email))}>
                {email} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={fieldClass}
              value={testInput}
              placeholder="name@example.com"
              aria-label="Test address"
              disabled={testEmails.length >= 5}
              onChange={(event) => setTestInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTestEmail();
                }
              }}
            />
            <button type="button" className={secondaryButtonClass} disabled={testEmails.length >= 5} onClick={addTestEmail}>Add</button>
          </div>
          <div className="flex gap-2">
            <button type="button" className={secondaryButtonClass} onClick={() => setStep(2)}>Back</button>
            <button type="button" className={primaryButtonClass} disabled={test.isPending} onClick={() => void handleTestSend()}>
              {testEmails.length ? 'Send test' : 'Continue'}
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="max-w-xl space-y-4">
          <div className="border border-border bg-card p-4 text-[13px]">
            {summary.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-right">{value}</span>
              </div>
            ))}
            {floor ? <p className="pt-3">{floor}</p> : null}
          </div>
          {!addressReady ? (
            <p className="text-[13px]">
              Add a physical address before the first send.{' '}
              <Link to="/dashboard/settings?section=newsletters" className="text-primary hover:underline">Newsletter settings</Link>
            </p>
          ) : null}
          {overLimit ? <p className="text-[13px]">{overLimit}</p> : null}
          <label className="flex items-center justify-between text-[13px]">
            Schedule instead of sending now
            <Switch checked={scheduleOn} onCheckedChange={setScheduleOn} />
          </label>
          {scheduleOn ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="date" className={fieldClass} value={date} onChange={(event) => setDate(event.target.value)} aria-label="Send date" />
              <input type="time" className={fieldClass} value={time} onChange={(event) => setTime(event.target.value)} aria-label="Send time" />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger aria-label="Time zone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((zone) => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {reviewHold ? (
            <p className="text-[13px] text-muted-foreground">
              This send is above the first-large-send threshold, so it goes to review
              {settings.data?.review_turnaround ? ` (usually up to ${settings.data.review_turnaround})` : ''}.
            </p>
          ) : null}
          <div className="flex gap-2">
            <button type="button" className={secondaryButtonClass} onClick={() => setStep(3)}>Back</button>
            <button type="button" className={primaryButtonClass} disabled={primaryDisabled} onClick={() => setConfirmOpen(true)}>
              {reviewHold && !scheduleOn ? 'Submit for review' : scheduleOn ? 'Schedule' : 'Send now'}
            </button>
          </div>
        </section>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewHold && !scheduleOn ? 'Submit for review' : scheduleOn ? 'Schedule campaign' : 'Send campaign'}</DialogTitle>
            <DialogDescription>
              {formatCount(recipients)} recipients from {fromAddress || 'an unset address'}.
              {scheduleOn ? ` Scheduled for ${date} ${time} ${timezone}.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" className={secondaryButtonClass} onClick={() => setConfirmOpen(false)}>Back</button>
            <button type="button" className={primaryButtonClass} disabled={saving} onClick={() => void handleConfirmSend()}>
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function splitTags(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function ComplianceCard({
  unsub,
  address,
  addressReady,
}: {
  unsub: boolean;
  address: boolean;
  addressReady: boolean;
}) {
  return (
    <aside className="h-fit border border-border bg-card p-4 text-[13px]">
      <p className="font-medium">Compliance check</p>
      <p className="mt-3">Unsubscribe link {unsub ? '✓ inserted' : '— We’ll add our standard footer'}</p>
      <p className="mt-2">
        Physical address {address ? '✓ inserted' : addressReady ? '— We’ll add our standard footer' : '— Add it in Settings'}
      </p>
      <p className="mt-3 text-[12px] text-muted-foreground">The standard footer cannot be removed.</p>
    </aside>
  );
}
