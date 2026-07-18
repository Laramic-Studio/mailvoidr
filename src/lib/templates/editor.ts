import type { TemplateDesign, TemplateVariable } from '@/types';

export type { TemplateDesign };

export const BLANK_TEMPLATE_HTML =
  '<div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #111827;"></div>';

export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'name', label: 'Recipient name', default: 'there' },
];

export function cleanTemplateVariables(
  variables: TemplateVariable[] | null | undefined,
): TemplateVariable[] {
  return (variables ?? [])
    .map((variable) => ({
      key: variable.key.trim(),
      label: variable.label?.trim() || null,
      default: variable.default?.trim() || null,
      required: variable.required,
    }))
    .filter((variable) => variable.key.length > 0);
}

export function variablesToMergeTags(
  variables: TemplateVariable[] | null | undefined,
): Record<string, { name: string; value: string; sample?: string }> {
  const mergeTags: Record<string, { name: string; value: string; sample?: string }> = {};

  for (const variable of cleanTemplateVariables(variables)) {
    mergeTags[variable.key] = {
      name: variable.label ?? variable.key,
      value: `{{${variable.key}}}`,
      sample: variable.default ?? undefined,
    };
  }

  return mergeTags;
}

export function variablesToRecord(
  variables: TemplateVariable[] | null | undefined,
): Record<string, string> {
  const record: Record<string, string> = {};

  for (const variable of cleanTemplateVariables(variables)) {
    record[variable.key] = variable.default ?? '';
  }

  return record;
}

export function substituteTemplateVariables(
  content: string,
  variables: Record<string, string>,
): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match,
  );
}

export function renderTemplatePreview(
  subject: string,
  html: string | null,
  variables: Record<string, string>,
): { subject: string; html: string | null } {
  return {
    subject: substituteTemplateVariables(subject, variables),
    html: html ? substituteTemplateVariables(html, variables) : null,
  };
}

function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, ' ').trim();
}

/** True only when a version has real HTML content but no visual design JSON. */
export function isLegacyTemplateVersion(version: {
  html_body?: string | null;
  design_json?: TemplateDesign | null;
} | null | undefined): boolean {
  if (!version || version.design_json) return false;

  const html = version.html_body?.trim();
  if (!html) return false;
  if (normalizeHtml(html) === normalizeHtml(BLANK_TEMPLATE_HTML)) return false;

  return true;
}
