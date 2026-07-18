import type { TemplateVariable } from '@/types';

export type DraftVariable = TemplateVariable & { clientId: string };

export function toDraftVariables(
  variables: TemplateVariable[] | null | undefined,
): DraftVariable[] {
  return (variables ?? []).map((variable) => ({
    ...variable,
    clientId: crypto.randomUUID(),
  }));
}

export function emptyDraftVariable(): DraftVariable {
  return { clientId: crypto.randomUUID(), key: '', label: '', default: '' };
}
