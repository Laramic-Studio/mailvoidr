import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, EmptyStateButton } from '@/components/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { StatusPill } from '@/components/newsletter/StatusPill';
import {
  Dialog,
  DialogContent,
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
import { fieldClass, primaryButtonClass } from '@/components/newsletter/classes';
import { useAudiences, useFormMutations, useForms } from '@/hooks/useNewsletter';
import { formatCount, formatRate } from '@/lib/newsletter/format';
import { toastError, toastSuccess } from '@/lib/toast';

export default function Forms() {
  const navigate = useNavigate();
  const query = useForms();
  const audiences = useAudiences();
  const { create } = useFormMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [audienceId, setAudienceId] = useState('');
  const forms = query.data?.data ?? [];

  async function handleCreate() {
    try {
      const result = await create.mutateAsync({ name: name.trim(), audience_id: audienceId });
      setOpen(false);
      toastSuccess(result.message);
      navigate(`/dashboard/forms/${result.form.id}`);
    } catch (error) {
      toastError(error, 'Could not create the form.');
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Newsletters"
        title="Forms"
        description="Hosted signup forms. Double opt-in stays on."
        actions={
          <button type="button" className={primaryButtonClass} onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New form
          </button>
        }
      />
      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading forms…</p> : null}
      {query.isError ? (
        <QueryErrorState error={query.error} subject="forms" onRetry={() => void query.refetch()} framed />
      ) : null}
      {query.isSuccess && forms.length === 0 ? (
        <EmptyState
          framed
          title="No forms yet"
          description="Collect subscribers with a hosted form. Every signup confirms by email."
          action={<EmptyStateButton onClick={() => setOpen(true)}>New form</EmptyStateButton>}
        />
      ) : null}
      {forms.length > 0 ? (
        <>
          <div className="hidden border border-border bg-card md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Audience', 'Signups (30d)', 'Confirmation rate', 'Status'].map((heading) => (
                    <th key={heading} className="p-3 text-left label-mono">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-b border-border last:border-0">
                    <td className="p-3"><Link className="font-medium hover:underline" to={`/dashboard/forms/${form.id}`}>{form.name}</Link></td>
                    <td className="p-3">{form.audience_name || '—'}</td>
                    <td className="p-3">{formatCount(form.signups_30d)}</td>
                    <td className="p-3">{formatRate(form.confirmation_rate)}</td>
                    <td className="p-3"><StatusPill status={form.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {forms.map((form) => (
              <Link key={form.id} to={`/dashboard/forms/${form.id}`} className="block border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{form.name}</span>
                  <StatusPill status={form.status} />
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {form.audience_name || 'No audience'} · {formatCount(form.signups_30d)} signups · {formatRate(form.confirmation_rate)}
                </p>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New form</DialogTitle>
          </DialogHeader>
          <label className="block text-[13px]">
            Name
            <input className={`${fieldClass} mt-1.5`} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block text-[13px]">
            Audience
            <Select value={audienceId || undefined} onValueChange={setAudienceId}>
              <SelectTrigger className="mt-1.5" aria-label="Audience">
                <SelectValue placeholder="Choose an audience" />
              </SelectTrigger>
              <SelectContent>
                {(audiences.data?.data ?? []).map((audience) => (
                  <SelectItem key={audience.id} value={audience.id}>{audience.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          {(audiences.data?.data ?? []).length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              <Link to="/dashboard/audiences" className="text-primary hover:underline">Create an audience</Link> before this form.
            </p>
          ) : null}
          <DialogFooter>
            <button type="button" className={primaryButtonClass} disabled={!name.trim() || !audienceId || create.isPending} onClick={() => void handleCreate()}>
              Create form
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
