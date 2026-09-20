import { Plus } from 'lucide-react';
import { EmptyState, EmptyStateButton } from '@/components/EmptyState';

interface VirtualEmailsEmptyStateProps {
  variant: 'empty' | 'search';
  onCreate?: () => void;
}

export function VirtualEmailsEmptyState({ variant, onCreate }: VirtualEmailsEmptyStateProps) {
  const action = onCreate ? (
    <EmptyStateButton
      icon={Plus}
      onClick={onCreate}
      testId={variant === 'empty' ? 'virtual-email-empty-create' : undefined}
    >
      Create virtual email
    </EmptyStateButton>
  ) : undefined;

  if (variant === 'search') {
    return (
      <EmptyState
        size="compact"
        testId="virtual-emails-empty-search"
        title="No matching virtual emails"
        description="Try a different search term, or create a new address for this workspace."
        action={action}
      />
    );
  }

  return (
    <EmptyState
      testId="virtual-emails-empty"
      eyebrow="Virtual emails"
      title="Create your first address"
      description="Disposable addresses for signup flows, OTPs, and staging emails. Mail is captured in Mailvoidr — use a label so your team knows what each address is for."
      action={action}
    />
  );
}
