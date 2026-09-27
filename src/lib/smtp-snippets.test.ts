import { describe, expect, it } from 'vitest';
import { buildSmtpTabs } from '@/lib/smtp-snippets';

const conn = { host: 'smtp.mailvoidr.test', port: 587, username: 'user_123', password: 'S3cret!pass' };

describe('buildSmtpTabs', () => {
  it('masks the password on screen but copies the real one', () => {
    const tabs = buildSmtpTabs(conn, false);

    for (const tab of tabs) {
      expect(tab.code, tab.label).not.toContain(conn.password);
      expect(tab.copyCode, tab.label).toContain(conn.password);
    }
  });

  it('shows the real password once revealed', () => {
    for (const tab of buildSmtpTabs(conn, true)) {
      expect(tab.code, tab.label).toContain(conn.password);
    }
  });

  it('puts the host, port and username in every snippet', () => {
    for (const tab of buildSmtpTabs(conn, true)) {
      expect(tab.code, tab.label).toContain(conn.host);
      expect(tab.code, tab.label).toContain('587');
      expect(tab.code, tab.label).toContain(conn.username);
    }
  });

  it('covers the common stacks', () => {
    const labels = buildSmtpTabs(conn, false).map((tab) => tab.label);

    expect(labels).toEqual(
      expect.arrayContaining(['Node.js', 'Laravel', 'PHP', 'Python', 'Django', 'Ruby on Rails', 'Go', 'cURL', '.env']),
    );
  });

  it('escapes quotes so an unusual password cannot break out of the string', () => {
    const tricky = { ...conn, password: `p'a"ss\\word` };
    const byLabel = Object.fromEntries(buildSmtpTabs(tricky, true).map((tab) => [tab.label, tab.copyCode]));

    expect(byLabel['Node.js']).toContain(JSON.stringify(tricky.password));
    expect(byLabel['PHP']).toContain(`'p\\'a"ss\\\\word'`);
    expect(byLabel['cURL']).toContain(`'user_123:p'\\''a"ss\\word'`);
  });
});
