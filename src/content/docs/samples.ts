import { mailSendUrl } from '@/content/marketing/home';

export type DocsCodeSampleId = 'send_curl' | 'send_node' | 'send_python' | 'send_go';

export const DOCS_CODE_LANGS: { id: DocsCodeSampleId; label: string }[] = [
  { id: 'send_node', label: 'Node.js' },
  { id: 'send_python', label: 'Python' },
  { id: 'send_curl', label: 'cURL' },
  { id: 'send_go', label: 'Go' },
];

export function buildDocsCodeSamples(sendUrl: string = mailSendUrl()): Record<DocsCodeSampleId, string> {
  return {
    send_curl: `curl ${sendUrl} \\
  -X POST \\
  -H "Authorization: Bearer $MAILVOIDR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@mail.yourdomain.com",
    "to": ["riya@example.com"],
    "subject": "Welcome to Acme",
    "html": "<h1>Hey Riya</h1><p>Glad you are here.</p>",
    "track_opens": true,
    "track_clicks": true
  }'`,
    send_node: `const response = await fetch("${sendUrl}", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.MAILVOIDR_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "hello@mail.yourdomain.com",
    to: ["riya@example.com"],
    subject: "Welcome to Acme",
    html: "<h1>Hey Riya</h1><p>Glad you are here.</p>",
    track_opens: true,
    track_clicks: true,
  }),
});

const { id, status, message_id, credits_remaining } = await response.json();
// → 202 Accepted · status=queued`,
    send_python: `import os
import requests

response = requests.post(
    "${sendUrl}",
    headers={
        "Authorization": f"Bearer {os.environ['MAILVOIDR_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "from": "hello@mail.yourdomain.com",
        "to": ["riya@example.com"],
        "subject": "Welcome to Acme",
        "html": "<h1>Hey Riya</h1><p>Glad you are here.</p>",
        "track_opens": True,
        "track_clicks": True,
    },
    timeout=30,
)

data = response.json()
# → 202 Accepted · status=queued`,
    send_go: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "os"
)

func main() {
    body, _ := json.Marshal(map[string]any{
        "from":    "hello@mail.yourdomain.com",
        "to":      []string{"riya@example.com"},
        "subject": "Welcome to Acme",
        "html":    "<h1>Hey Riya</h1><p>Glad you are here.</p>",
    })

    req, _ := http.NewRequest(http.MethodPost, "${sendUrl}", bytes.NewReader(body))
    req.Header.Set("Authorization", "Bearer "+os.Getenv("MAILVOIDR_API_KEY"))
    req.Header.Set("Content-Type", "application/json")

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()
    // → 202 Accepted · status=queued
}`,
  };
}

/*
 * SDK install snippet — uncomment when packages publish.
 *
 * export const DOCS_SDK_INSTALL_CODE = `# Node
 * npm install @mailvoidr/node
 * ...
 * `;
 */

export const DOCS_SEND_RESPONSE_SAMPLE = {
  success: true,
  id: 1842,
  message_id: '<202606251200.1842.1@mail.yourdomain.com>',
  status: 'queued',
  credits_remaining: 97,
};

export const DOCS_SEND_ERROR_SAMPLE = {
  success: false,
  error: 'The sending domain mail.yourdomain.com is not verified.',
  errors: {
    from: ['The sending domain mail.yourdomain.com is not verified.'],
  },
};
