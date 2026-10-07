import { Link } from 'react-router-dom';
import { subscriberCapNotice } from '@/lib/newsletter/format';

export function SubscriberCapNotice({
  used,
  limit,
}: {
  used?: number | null;
  limit?: number | null;
}) {
  const message = subscriberCapNotice(used, limit);
  if (!message) return null;
  return (
    <p className="border border-[hsl(var(--chart-3)/0.4)] bg-[hsl(var(--chart-3)/0.1)] p-3 text-[13px]" role="status">
      {message}{' '}
      <Link to="/dashboard/billing" className="underline">View billing</Link>
    </p>
  );
}

export function PlanLimitAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-[13px]">
      {message}{' '}
      <Link to="/dashboard/billing" className="underline">View billing</Link>
    </p>
  );
}
