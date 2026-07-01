import type { EmailMessage } from '@/types';

export function SpamPanel({ analysis }: { analysis?: EmailMessage['analysis'] }) {
  if (analysis?.status !== 'completed') {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Spam analysis runs when the message is received via SMTP.
      </p>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-medium">{analysis.spam_score ?? '—'}</span>
        <span className="font-mono text-sm text-muted-foreground">
          / 10 · {analysis.spam_rating}
        </span>
      </div>
      <ul className="mt-6 divide-y divide-border">
        {(analysis.spam_rules ?? []).map((rule) => (
          <li key={rule.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  rule.status === 'pass'
                    ? 'bg-primary'
                    : rule.status === 'warn'
                      ? 'bg-amber-500'
                      : 'bg-destructive'
                }`}
              />
              <div>
                <div className="font-mono text-[12.5px]">{rule.id}</div>
                <div className="text-[11.5px] text-muted-foreground">{rule.description}</div>
              </div>
            </div>
            <span className="font-mono text-[12px] text-muted-foreground">
              {rule.points > 0 ? `+${rule.points}` : rule.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HtmlCheckPanel({ analysis }: { analysis?: EmailMessage['analysis'] }) {
  if (analysis?.status !== 'completed') {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        HTML compatibility check runs when the message is received via SMTP.
      </p>
    );
  }

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[240px_1fr]">
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/20 p-6 text-center">
        <div className="text-3xl font-medium">{analysis.html_support_score ?? '—'}%</div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">MARKET SUPPORT</div>
      </div>
      <div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(analysis.html_checks ?? []).map((check) => (
            <div
              key={check.client}
              className="flex items-center justify-between rounded border border-border px-3 py-2 text-[12px]"
            >
              <span>{check.client}</span>
              <span className="font-mono text-muted-foreground">{check.support_score}%</span>
            </div>
          ))}
        </div>
        {(analysis.html_issues ?? []).length > 0 && (
          <div className="mt-6">
            <div className="label-mono">&lt;body&gt; element</div>
            <ul className="mt-3 divide-y divide-border border border-border">
              {analysis.html_issues.map((issue, index) => (
                <li
                  key={`${issue.client}-${index}`}
                  className="flex items-start gap-3 px-3 py-2.5 text-[12px]"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      issue.status === 'fail' ? 'bg-destructive' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <div className="font-medium">{issue.client}</div>
                    <div className="text-muted-foreground">{issue.message}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
