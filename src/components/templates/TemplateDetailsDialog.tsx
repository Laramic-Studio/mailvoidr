import { Loader2, Plus, Save } from 'lucide-react';
import { FormSelect } from '@/components/form/FormSelect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DraftVariable } from '@/lib/templates/draft-variables';
import { emptyDraftVariable } from '@/lib/templates/draft-variables';
import type { TemplateCategory, TemplateVisibility } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
] as const;

interface TemplateDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  category: TemplateCategory;
  isActive: boolean;
  visibility: TemplateVisibility;
  showVisibility: boolean;
  variables: DraftVariable[];
  isPending: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: TemplateCategory) => void;
  onIsActiveChange: (value: boolean) => void;
  onVisibilityChange: (value: TemplateVisibility) => void;
  onVariablesChange: (variables: DraftVariable[]) => void;
  onSave: () => void;
}

export function TemplateDetailsDialog({
  open,
  onOpenChange,
  name,
  description,
  category,
  isActive,
  visibility,
  showVisibility,
  variables,
  isPending,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onIsActiveChange,
  onVisibilityChange,
  onVariablesChange,
  onSave,
}: TemplateDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle>Template details</DialogTitle>
          <DialogDescription>
            Name, visibility, and merge variables for this template.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <label className="block space-y-1.5">
            <span className="label-mono">Name</span>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="label-mono">Description</span>
            <textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
              placeholder="Optional summary for marketplace listings"
            />
          </label>
          <FormSelect
            label="Category"
            value={category}
            onValueChange={(value) => onCategoryChange(value as TemplateCategory)}
            options={CATEGORY_OPTIONS}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => onIsActiveChange(event.target.checked)}
              className="rounded border-border"
            />
            <span className="text-[13px]">Active (available in Send email)</span>
          </label>
          {showVisibility ? (
            <FormSelect
              label="Visibility"
              value={visibility}
              onValueChange={(value) => onVisibilityChange(value as TemplateVisibility)}
              options={VISIBILITY_OPTIONS}
              disabled={isPending}
            />
          ) : null}

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium">Variables</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Defaults are used when previewing merge tags like {'{{name}}'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onVariablesChange([...variables, emptyDraftVariable()])}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[12px] hover:bg-accent"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            {variables.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">
                No variables yet. Add one to insert dynamic content.
              </p>
            ) : (
              variables.map((variable) => (
                <div key={variable.clientId} className="grid gap-2 rounded-md border border-border p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={variable.key}
                      onChange={(event) =>
                        onVariablesChange(
                          variables.map((item) =>
                            item.clientId === variable.clientId
                              ? { ...item, key: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="key"
                      className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-[12px]"
                    />
                    <input
                      value={variable.label ?? ''}
                      onChange={(event) =>
                        onVariablesChange(
                          variables.map((item) =>
                            item.clientId === variable.clientId
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Label"
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px]"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      value={variable.default ?? ''}
                      onChange={(event) =>
                        onVariablesChange(
                          variables.map((item) =>
                            item.clientId === variable.clientId
                              ? { ...item, default: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Default value"
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onVariablesChange(
                          variables.filter((item) => item.clientId !== variable.clientId),
                        )
                      }
                      className="rounded-md border border-border px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save details
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
