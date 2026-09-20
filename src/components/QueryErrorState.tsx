import { RefreshCw } from 'lucide-react';
import { EmptyState, EmptyStateButton } from '@/components/EmptyState';
import { getApiErrorMessage, getApiErrorStatus, isNetworkError } from '@/lib/api';

interface QueryErrorStateProps {
  error: unknown;
  /** What failed to load, as a lowercase noun phrase — e.g. "webhook endpoints". */
  subject: string;
  onRetry?: () => void;
  retrying?: boolean;
  size?: 'default' | 'compact';
  /** Adds the bordered card; leave off when already inside a bordered container. */
  framed?: boolean;
  testId?: string;
}

/**
 * Shared "could not load" state. It tells the reader *why* — a plan limit (402),
 * missing permission (403), a dropped connection, or a server fault — instead of
 * one generic message, and offers a retry when it makes sense.
 */
export function QueryErrorState({
  error,
  subject,
  onRetry,
  retrying = false,
  size = 'default',
  framed = false,
  testId = 'query-error',
}: QueryErrorStateProps) {
  const status = getApiErrorStatus(error);
  const common = { size, framed };

  if (status === 402) {
    return (
      <EmptyState
        {...common}
        testId={`${testId}-plan`}
        eyebrow="Upgrade required"
        title="Not included in your plan"
        description={getApiErrorMessage(error, `Your current plan doesn't include ${subject}.`)}
        action={<EmptyStateButton to="/dashboard/billing">View plans</EmptyStateButton>}
      />
    );
  }

  if (status === 403) {
    return (
      <EmptyState
        {...common}
        testId={`${testId}-forbidden`}
        eyebrow="No access"
        title={`You can't view ${subject}`}
        description="You don't have permission for this in the current workspace. Ask a workspace owner if you need access."
      />
    );
  }

  const network = isNetworkError(error);

  return (
    <EmptyState
      {...common}
      testId={testId}
      eyebrow={network ? 'Connection problem' : 'Something went wrong'}
      title={network ? "Can't reach Mailvoidr" : `Could not load ${subject}`}
      description={
        network
          ? 'Check your internet connection and try again.'
          : 'This is usually temporary. Try again in a moment.'
      }
      action={
        onRetry ? (
          <EmptyStateButton
            variant="secondary"
            icon={RefreshCw}
            onClick={onRetry}
            disabled={retrying}
            testId={`${testId}-retry`}
          >
            {retrying ? 'Retrying…' : 'Try again'}
          </EmptyStateButton>
        ) : undefined
      }
    />
  );
}
