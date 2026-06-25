# Mailvoidr Frontend — Implementation Plan

Reference for wiring the Vite SPA (`frontend/`) to the Laravel API (`ui/`).  
The SPA is the **only user-facing product**. The Inertia app stays for admin/internal use only.

**Auth:** Laravel JWT (not Sanctum).  
**Rollout:** Module by module. Nothing removed from the frontend unless we deliberately add or cut a feature.  
**Out of scope (v1):** Multi-region sending, data residency, SAML/SCIM.

---

## Product model (important)

Two different concepts — do not merge them in the backend:

| Frontend route | UI label | Laravel today | DB table | Count |
|----------------|----------|---------------|----------|-------|
| `/dashboard/inboxes` | Inboxes | `test-emails/*` | `virtual_email_addresses` | **Many** per user/workspace |
| `/dashboard/inboxes/:id` | Inbox detail | `test-emails/show` | `virtual_email_addresses` + `emails` | One virtual address |
| `/dashboard/testing` | Email Testing | `dashboard.tsx` (Inbox) | `inboxes` | **One** sandbox inbox per user/workspace |

**Rules:**
- Users get **one sandbox inbox** (SMTP creds, captured mail, spam/render tools) → **Email Testing** page.
- Users create **many virtual emails** (disposable addresses, TTL, forwarding) → **Inboxes** page.
- The prototype UI is already on the correct pages — no route swap needed.

---

## TypeScript (decide before Module 1)

**Recommendation: migrate to TypeScript now**, before wiring any API.

| | Stay JS | Switch to TS |
|---|---------|--------------|
| When | Never planning shared types with Laravel | **Now** — still dummy data, no API contracts yet |
| Pros | Zero migration cost | Typed API responses, fewer wiring bugs, matches `ui/resources/js/` |
| Cons | API shapes drift silently | ~1–2 days upfront (`tsconfig`, rename files, shared `types/`) |

**Migration scope (Module 0):**
1. Add `typescript`, `@types/react`, `@types/react-dom`
2. `tsconfig.json` + rename `src/**/*.{jsx,js}` → `.tsx` / `.ts`
3. Create `src/types/` — `User`, `Workspace`, `VirtualEmail`, `SandboxInbox`, `Email`, API envelopes
4. Type the axios client and React Query hooks as modules ship

Do **not** migrate mid-rollout (e.g. during Module 4) — finish TS in Module 0 or stay JS for the whole project.

---

## Principles

1. **Backend-first per module** — ship API + tests, then connect the page.
2. **Reuse existing services** — `SendMailService`, `VerifiedDomainService`, `ApiKeyService`, etc. Wrap in JSON controllers; don't rewrite business logic.
3. **Workspace-scoped everything** — JWT carries user identity; every dashboard request also sends `X-Workspace-Id` (or path param).
4. **Schema evolves with the UI** — e.g. multiple inboxes, TTL, forwarding, scopes. Migrate when the module ships, not upfront.
5. **Keep dummy data until wired** — replace `dummyData.js` exports one module at a time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  frontend/  (Vite + React Router)                           │
│  app.mailvoidr.com  or  app.mailvoidr.com/app/*             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS  Authorization: Bearer <jwt>
                           │        X-Workspace-Id: <ulid>
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  ui/  Laravel API  /api/v1/*                                │
│  JWT guard · Form requests · Policies · Queue jobs          │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
           ▼                               ▼
     MySQL (shared)                  smtp/ (Node)
     inboxes, emails,                inbound :25/:2525
     email_sends, domains…           outbound :587 + relay
```

### JWT flow

| Step | Endpoint | Notes |
|------|----------|-------|
| Register | `POST /api/v1/auth/register` | Returns `{ access_token, refresh_token, user }` |
| Login | `POST /api/v1/auth/login` | Same shape |
| Refresh | `POST /api/v1/auth/refresh` | Rotate access token |
| Logout | `POST /api/v1/auth/logout` | Invalidate refresh token |
| Me | `GET /api/v1/auth/me` | User + `email_verified`, `two_factor_enabled`, `selected_workspace_id` |
| 2FA challenge | `POST /api/v1/auth/two-factor/challenge` | After login when 2FA enabled |
| Verify email OTP | `POST /api/v1/auth/email/verify-otp` | Reuse existing OTP notification |
| Forgot / reset | `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password` | Reuse Fortify actions |

**Package:** `tymon/jwt-auth` or `php-open-source-saver/jwt-auth` (maintained fork).  
**OAuth (GitHub/Google):** redirect to Laravel Socialite → callback issues JWT → redirect to SPA with token in query/hash (one-time exchange).

### Frontend foundation (do once, Module 0)

| Task | Location |
|------|----------|
| API client (axios + interceptors) | `frontend/src/lib/api.js` |
| Auth context + token storage | `frontend/src/contexts/AuthContext.jsx` |
| Workspace context | `frontend/src/contexts/WorkspaceContext.jsx` |
| Protected route wrapper | `frontend/src/components/ProtectedRoute.jsx` |
| React Query provider | wire in `frontend/src/index.jsx` (already installed) |
| Env | `VITE_API_URL=https://app.mailvoidr.com/api/v1` |
| CORS | Laravel `config/cors.php` — allow SPA origin |

**Fix during Module 0:**
- Mount `ThemeProvider` in `index.jsx`
- Fix broken links: `/workspace/select` → `/workspaces`
- Add missing route: `/dashboard/templates/:id`

---

## Module order (important → least)

| # | Module | Priority | Depends on |
|---|--------|----------|------------|
| 0 | Foundation + marketing (static) | — | — |
| 1 | Authentication | Critical | 0 |
| 2 | Workspaces + invites | Critical | 1 |
| 3 | Onboarding | High | 2 |
| 4 | Inboxes (virtual emails, many) | Critical | 2 |
| 5 | Virtual email detail + messages | Critical | 4 |
| 6 | Email testing (sandbox inbox, one) | High | 2 |
| 7 | Domains | High | 2 |
| 8 | API keys | High | 2, 7 (for send) |
| 9 | SMTP credentials | High | 2 |
| 10 | Send email (dashboard) | High | 7, 8 |
| 11 | Email logs (outbound) | High | 10 |
| 12 | Dashboard overview | Medium | 4, 10, 11 |
| 13 | Settings | Medium | 1, 2 |
| 14 | Teams | Medium | 2 |
| 15 | Live sending + credits | Medium | 10 |
| 16 | Templates | Medium | 10 |
| 17 | Webhooks | Medium | 10, 11 |
| 18 | Analytics | Lower | 11 + new tracking |
| 19 | Billing (full) | Lower | 15 |
| 20 | Notifications | Lower | multiple |
| 21 | Global search | Lower | 4, 11, 16 |
| 22 | Marketing backend | Lowest | — |
| 23 | Docs CMS | Lowest | — |
| 24 | Enterprise / status page | Lowest | — |

---

## Module 0 — Foundation + static marketing

**Goal:** SPA deploys, talks to Laravel health check, marketing pages live without auth.

### Frontend files
- All `pages/marketing/*`
- `pages/docs/DocsLanding.jsx`, `pages/docs/DocsArticle.jsx` (static for now)
- Layouts: `MarketingLayout`, `DocsLayout`

### Backend
- `GET /api/v1/health` → `{ status: "ok" }`
- CORS + JWT package installed (no routes yet)

### Done when
- [ ] `yarn dev` + `php artisan serve` — health check passes from browser
- [ ] Marketing routes render with real deploy URL
- [ ] API client + auth shell exist (empty stubs OK)

---

## Module 1 — Authentication

**Goal:** Real login/register/reset/verify/2FA. Unauthenticated users cannot reach `/dashboard/*`.

### Frontend pages
| Route | File |
|-------|------|
| `/login` | `pages/auth/Login.jsx` |
| `/register` | `pages/auth/Register.jsx` |
| `/forgot-password` | `pages/auth/ForgotPassword.jsx` |
| `/reset-password` | `pages/auth/ResetPassword.jsx` |
| `/verify-email` | `pages/auth/VerifyEmail.jsx` |
| `/2fa` | `pages/auth/TwoFA.jsx` |

### Backend — new `routes/api/v1/auth.php`

Reuse:
- `App\Actions\Fortify\CreateNewUser`
- `App\Actions\Fortify\ResetUserPassword`
- `App\Notifications\VerifyEmailWithOtp`
- Fortify 2FA columns on `users`

New:
- `AuthController` — login, register, logout, refresh, me
- `TwoFactorController` — challenge, enable, disable, recovery codes
- `EmailVerificationController` — send OTP, verify OTP
- `PasswordResetController` — forgot, reset
- `SocialAuthController` — GitHub/Google → JWT

Middleware: `auth:api` (JWT guard) on protected routes.

### Schema changes
None required (users table already has 2FA + OTP columns).

### Auth redirect flow
```
Register → VerifyEmail → (2FA setup optional) → Workspaces or Onboarding
Login → (2FA if enabled) → Workspaces (if >1 or none selected) → Dashboard
```

### Done when
- [ ] JWT access + refresh works; 401 triggers refresh or logout
- [ ] Email OTP verification blocks dashboard until verified
- [ ] 2FA challenge works end-to-end
- [ ] OAuth buttons redirect and return with valid JWT
- [ ] `ProtectedRoute` guards all `/dashboard/*`, `/onboarding`, `/workspaces`

---

## Module 2 — Workspaces + invites

**Goal:** User picks/creates workspace. All dashboard data scoped to workspace.

### Frontend pages
| Route | File |
|-------|------|
| `/workspaces` | `pages/auth/WorkspaceSelect.jsx` |
| `/invite` | `pages/auth/InviteAccept.jsx` |

Also wire workspace switcher in `components/layouts/DashboardLayout.jsx`.

### Backend — `routes/api/v1/workspaces.php`

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/workspaces` | `WorkspaceController@index` |
| POST | `/workspaces` | `WorkspaceController@store` |
| GET | `/workspaces/{id}` | `WorkspaceController@show` |
| PATCH | `/workspaces/{id}` | update name, slug, description |
| POST | `/workspaces/{id}/switch` | `WorkspaceSwitchController` |
| GET | `/workspaces/{id}/members` | new |
| POST | `/workspaces/invitations` | `WorkspaceInvitationController@store` |
| POST | `/invitations/{token}/accept` | accept |
| POST | `/invitations/{token}/decline` | decline |

### Schema changes
- Add `use_case` (nullable string) to `workspaces` — onboarding step 3
- Add `onboarding_completed_at` to `workspaces` or `users`
- **Remove/enforce** `canCreateWorkspace()` single-workspace limit — frontend expects multiple workspaces

### Done when
- [ ] User sees all owned + member workspaces on `/workspaces`
- [ ] Switching workspace updates `selected_workspace_id` and reloads context
- [ ] Invite accept/decline works from `/invite?token=…`
- [ ] Dashboard layout switcher shows real workspaces

---

## Module 3 — Onboarding

**Goal:** First-run wizard creates workspace, optional domain, first API key.

### Frontend
- `pages/Onboarding.jsx` (6 steps)

### Backend

| Step | API |
|------|-----|
| 2 Workspace | `POST /workspaces` (if none) or `PATCH /workspaces/{id}` |
| 3 Usage | `PATCH /workspaces/{id}` `{ use_case }` |
| 4 Domain | `POST /domains` (Module 7 — can stub DNS preview with static records) |
| 5 API key | `POST /api-keys` (Module 8 — or defer key to post-onboarding) |
| 6 Done | `POST /workspaces/{id}/complete-onboarding` |

Skip region picker values — show `us-east-1` only or hide EU/AP options in UI until multi-region exists.

### Done when
- [ ] New user lands on onboarding after first login (no completed workspace)
- [ ] Completing onboarding sets flag and redirects to `/dashboard`
- [ ] Returning user skips onboarding

---

## Module 4 — Inboxes (virtual emails)

**Goal:** Users create **multiple virtual email addresses** per workspace. Maps to `virtual_email_addresses` — same as `ui/resources/js/pages/test-emails/*`.

### Frontend
- `pages/dashboard/Inboxes.jsx` — list + create modal

### Backend — `routes/api/v1/virtual-emails.php`

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/virtual-emails` | `TestEmailController@index` logic |
| POST | `/virtual-emails` | create address |
| GET | `/virtual-emails/{id}` | show metadata |
| PATCH | `/virtual-emails/{id}` | label, TTL (`expires_at`), forwarding |
| DELETE | `/virtual-emails/{id}` | soft-delete |

Reuse: `VirtualEmailAddress` model, inbound SMTP routing by `email_address`.

### Schema changes — `virtual_email_addresses`

Extend existing table (most columns already exist):

```sql
forward_to   VARCHAR nullable   -- UI "Forward to"
label        VARCHAR nullable   -- maps to `name` or new column
```

Emails link via `emails.virtual_email_address_id` (already exists).

### Done when
- [ ] Create modal persists virtual email with label, TTL, optional forward
- [ ] Table shows address, message/unread counts, TTL, forwarding
- [ ] Copy address button works
- [ ] Plan limits enforced when billing module lands

---

## Module 5 — Virtual email detail + messages

**Goal:** Read mail captured by a **virtual email address** (not the sandbox inbox).

### Frontend
- `pages/dashboard/InboxDetail.jsx` — route stays `/dashboard/inboxes/:id`

### Backend

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/virtual-emails/{id}/messages` | paginate `Email` where `virtual_email_address_id` |
| GET | `/virtual-emails/{id}/messages/{emailId}` | show + headers + attachments |
| PATCH | `/virtual-emails/{id}/messages/{emailId}/read` | mark read |
| DELETE | `/virtual-emails/{id}/messages/{emailId}` | delete message |
| GET | `/virtual-emails/{id}/messages/{emailId}/raw` | raw MIME |
| GET | `/attachments/{id}/download` | file stream |

Reuse: `Api/EmailController`, `test-emails` APIs — scope by virtual email id.

### Schema changes
- Optional: `spam_score` on `emails` (nullable) for UI badge — populate later

### Done when
- [ ] Message list + detail split view works per virtual email
- [ ] Tabs: Preview, HTML, Raw, Headers, Attachments render real data
- [ ] Delete virtual email + refresh works

---

## Module 6 — Email testing (sandbox inbox)

**Goal:** **One sandbox inbox** per user/workspace — SMTP credentials, captured messages, spam/render tools. Maps to `inboxes` table + `ui/resources/js/pages/dashboard.tsx`.

### Frontend
- `pages/dashboard/Testing.jsx` — sandbox tab, SMTP panel, spam/preview/headers/source tabs

### Backend — `routes/api/v1/sandbox.php`

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/sandbox` | User/workspace **single** `Inbox` + SMTP creds |
| GET | `/sandbox/messages` | `Email` where `inbox_id` = sandbox inbox |
| GET | `/sandbox/messages/{id}` | message detail |
| POST | `/sandbox/enable` | Create inbox if missing (on signup or first visit) |

Reuse: `Inbox` model (one per user/workspace), `Api/EmailController` inbox resolution, existing SMTP inbound on `:2525`.

**Do not** allow multiple sandbox inboxes. "Projects" tab in UI — defer to v2 or map to virtual emails.

### Schema changes
- Keep `inboxes` as-is (one row per user or per workspace — decide and enforce unique constraint)
- Spam report: stub until analysis engine exists

### Done when
- [ ] Sandbox tab shows real messages from the user's single inbox
- [ ] SMTP credential snippet uses real `inboxes.username` / `password`
- [ ] Spam/render tabs show best-effort data (do not remove tabs)

---

## Module 7 — Domains

**Goal:** Add/verify custom sending domains with DNS instructions.

### Frontend
- `pages/dashboard/Domains.jsx`

### Backend — reuse live sending stack

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/domains` | `VerifiedDomain` scoped to workspace |
| POST | `/domains` | `VerifiedDomainService::add` |
| GET | `/domains/{id}` | show + DNS records |
| POST | `/domains/{id}/verify` | dispatch `VerifyVerifiedDomainJob` |
| DELETE | `/domains/{id}` | remove |

Hide **region** column in UI or show static "Default" — no multi-region backend.

Reputation bar: compute simple score from verification status + send bounce rate (later) or show verification status only for v1.

### Schema changes
Minimal — `verified_domains` exists. Optional: `reputation_score` cached column.

### Done when
- [ ] Add domain modal + DNS panel match real records from `DnsVerificationService`
- [ ] Status badges (verified / pending / warning) reflect DB

---

## Module 8 — API keys

**Goal:** Create, rotate, revoke keys with scopes.

### Frontend
- `pages/dashboard/APIKeys.jsx`

### Backend — extend `ApiKeyService`

| Method | Path |
|--------|------|
| GET | `/api-keys` |
| POST | `/api-keys` |
| POST | `/api-keys/{id}/rotate` |
| DELETE | `/api-keys/{id}` |

### Schema changes
```sql
-- api_keys table
scopes JSON nullable   -- ["send.write", "logs.read", ...]
requests_count INT default 0  -- optional counter
```

Enforce scopes in `auth.api_key` middleware when request hits `/api/v1/mail/*`.

### Done when
- [ ] Create modal saves name + scopes; returns full key once
- [ ] Mask/reveal/copy token works
- [ ] Revoked keys styled and rejected by mail API

---

## Module 9 — SMTP credentials

**Goal:** Show live SMTP credentials for outbound sending.

### Frontend
- `pages/dashboard/SMTP.jsx`

### Backend — reuse `SendingAccountService`

| Method | Path |
|--------|------|
| GET | `/smtp-credentials` |
| POST | `/smtp-credentials` | enable live sending if not active |
| POST | `/smtp-credentials/{id}/rotate-password` |

v1: one credential set per workspace/user (not multi-region cards). UI can show one "Production" card; hide EU/Staging cards or label as "Coming soon" without removing layout.

### Done when
- [ ] Credentials match `sending_accounts` table
- [ ] Nodemailer snippet uses real host/port/username

---

## Module 10 — Send email (dashboard compose)

**Goal:** Compose and send from dashboard (not only external API).

### Frontend
- `pages/dashboard/SendEmail.jsx`

### Backend

| Method | Path | Reuse |
|--------|------|-------|
| POST | `/send` | `SendMailService::queue` |
| POST | `/send/preview` | render HTML preview (optional) |
| GET | `/send/history` | recent sends for compose history tab |

Tabs **Scheduled**, **Transactional**, **Templates** — wire when Modules 16+ land; show empty states until then (do not remove tabs).

### Schema changes
None for basic send. Attachments: add `email_send_attachments` when needed.

### Done when
- [ ] Compose sends via API using verified from-domain
- [ ] History tab shows real `email_sends`
- [ ] Preview modal renders submitted HTML

---

## Module 11 — Email logs (outbound)

**Goal:** Searchable outbound send log with detail drawer.

### Frontend
- `pages/dashboard/EmailLogs.jsx`

### Backend

| Method | Path |
|--------|------|
| GET | `/sends` | filter by status, domain, date, recipient |
| GET | `/sends/{id}` | detail + timeline |
| POST | `/sends/{id}/retry` | re-queue failed |

### Schema changes
```sql
-- email_send_events table (new)
id, email_send_id, event, payload JSON, occurred_at
-- Events: queued, sent, delivered, bounced, deferred, failed, opened, clicked
```

Populate `sent`, `delivered`, `bounced` from existing columns + relay webhooks as they arrive.

### Done when
- [ ] Filters and status pills work
- [ ] Detail drawer shows timeline + raw JSON event
- [ ] "View in inbox" links when return-path capture exists

---

## Module 12 — Dashboard overview

**Goal:** Aggregate stats, charts, recent activity.

### Frontend
- `pages/dashboard/Overview.jsx`
- Wire stat widgets in `DashboardLayout.jsx` (plan usage bar)

### Backend

| Method | Path |
|--------|------|
| GET | `/dashboard/overview` | stats, chart series, recent sends, top domains/templates |
| GET | `/dashboard/activity` | activity feed |

### Schema changes
- `workspace_activity` table (new) — audit events for feed
- Or derive activity from existing tables initially (domain verified, send completed, member invited)

Open/click rates on overview: show only after Module 18 tracking exists; use sent/delivered/bounced until then.

### Done when
- [ ] Stat cards + chart use real aggregates
- [ ] Recent logs table matches Module 11 data
- [ ] Plan usage bar reads real credits/plan limits

---

## Module 13 — Settings

**Goal:** Profile, security, workspace, notification prefs.

### Frontend
- `pages/dashboard/Settings.jsx`

### Backend

| Section | Endpoints |
|---------|-----------|
| Profile | `PATCH /auth/me`, avatar upload |
| Security | 2FA enable/disable, `PATCH /auth/password` |
| Workspace | `PATCH /workspaces/{id}` |
| Notifications | `PATCH /users/notification-preferences` (new JSON column on users) |
| API prefs | workspace settings JSON |
| Branding | defer to v2 — show UI, save stub |
| Danger zone | `POST /workspaces/{id}/transfer`, `DELETE /workspaces/{id}` |

Hide or disable region selector — single default region only.

### Done when
- [ ] Each settings section persists and reloads correctly
- [ ] Domain/SMTP sections link to real pages

---

## Module 14 — Teams

**Goal:** Members, invitations, roles, activity.

### Frontend
- `pages/dashboard/Teams.jsx`

### Backend — extend workspace members

| Method | Path |
|--------|------|
| GET | `/workspaces/{id}/members` |
| PATCH | `/workspaces/{id}/members/{userId}` | change role |
| DELETE | `/workspaces/{id}/members/{userId}` | remove |
| GET | `/workspaces/{id}/invitations` |
| POST | `/workspaces/{id}/invitations` |
| DELETE | `/invitations/{id}` | revoke |
| GET | `/workspaces/{id}/activity` | member audit log |

### Schema changes
Extend `workspace_user.role` enum: `owner`, `admin`, `developer`, `billing_manager`, `viewer` (migrate `member` → `developer`).

### Done when
- [ ] All four tabs use real data
- [ ] Invite flow matches Module 2 accept page

---

## Module 15 — Live sending activation + credits

**Goal:** Enable outbound, buy credits, enforce limits.

### Frontend
- Billing usage pieces in `Billing.jsx` (overview tab partial)
- "Enable live sending" may live in SMTP or Settings until Billing module complete

### Backend — reuse
- `SendingAccountService`, `SendCreditService`, `CreditPurchaseService`, Stripe webhook

| Method | Path |
|--------|------|
| POST | `/live-sending/enable` |
| GET | `/credits` | balance + free tier usage |
| POST | `/credits/checkout` | Stripe session |
| GET | `/credits/transactions` |

**Fix existing bug:** call `SendCreditService::deduct()` in `SendMailService::queue()`.

### Done when
- [ ] User must enable live sending before SMTP/API outbound works
- [ ] Credit balance visible in dashboard layout usage widget
- [ ] Stripe checkout completes and updates balance

---

## Module 16 — Templates

**Goal:** Template gallery, versions, variables, send with template.

### Frontend
- `pages/dashboard/Templates.jsx`
- **Add route:** `/dashboard/templates/:id` (missing in `App.jsx`)

### Backend — new resource

| Method | Path |
|--------|------|
| GET/POST | `/templates` |
| GET/PATCH/DELETE | `/templates/{id}` |
| POST | `/templates/{id}/versions` |

### Schema — new tables
```
email_templates       id, workspace_id, name, subject, html_body, category, ...
email_template_versions  id, template_id, version, html_body, created_at
```

Wire SendEmail template picker to this API.

### Done when
- [ ] CRUD + template detail page works
- [ ] Send flow can select template and merge variables

---

## Module 17 — Webhooks

**Goal:** User-configured endpoints, delivery logs, replay.

### Frontend
- `pages/dashboard/Webhooks.jsx`

### Backend — new

| Method | Path |
|--------|------|
| GET/POST | `/webhooks` |
| PATCH/DELETE | `/webhooks/{id}` |
| GET | `/webhooks/{id}/deliveries` |
| POST | `/webhooks/deliveries/{id}/replay` |

### Schema — new tables
```
webhook_endpoints   id, workspace_id, url, secret, events JSON, status
webhook_deliveries  id, endpoint_id, event, payload, status_code, attempts
```
Extend existing `webhook_logs` or migrate to new structure.

Dispatch events from send lifecycle (Module 11 events).

### Done when
- [ ] Create endpoint with event subscriptions
- [ ] Delivery log + replay works for test events

---

## Module 18 — Analytics

**Goal:** Opens, clicks, geo, device, provider breakdowns.

### Frontend
- `pages/dashboard/Analytics.jsx`

### Backend — requires tracking infrastructure

| Method | Path |
|--------|------|
| GET | `/analytics/overview` |
| GET | `/analytics/engagement` |
| GET | `/analytics/domains` |
| GET | `/analytics/templates` |

### Schema — new
```
email_tracking_events  send_id, type (open|click), ip, user_agent, country, ...
```
Implement tracking pixel + link wrapper in outbound HTML (`smtp/` relay or Laravel job).

Until tracking live: overview tab shows volume/delivery from `email_sends` only; engagement tabs show honest empty states.

### Done when
- [ ] Volume + delivery charts use real data
- [ ] Open/click/geo populate after tracking pixel ships

---

## Module 19 — Billing (full)

**Goal:** Plans, invoices, payment methods, usage meters.

### Frontend
- `pages/dashboard/Billing.jsx`
- `pages/marketing/Pricing.jsx` (plan cards from API)

### Backend
- Stripe Customer + Subscription (upgrade from credit-packs-only)
- `invoices`, `payment_methods` tables or Stripe sync

Reuse: `plans` table, partial Stripe integration.

### Done when
- [ ] Plan upgrade/downgrade works
- [ ] Invoice list + PDF download
- [ ] Payment method CRUD

---

## Module 20 — Notifications

**Goal:** Bell icon in dashboard header.

### Frontend
- `DashboardLayout.jsx` notification dropdown

### Backend
```
notifications  Laravel database notifications or custom table
```
Trigger on: deliverability alerts, invites, billing, webhook failures.

### Done when
- [ ] Unread count + mark read works

---

## Module 21 — Global search

**Goal:** ⌘K search across inboxes, logs, templates, domains.

### Frontend
- Command palette in `DashboardLayout.jsx`

### Backend
```
GET /search?q=...&types[]=inboxes&types[]=sends
```
Use MySQL fulltext where indexes exist (`emails` sidebar index).

### Done when
- [ ] Search returns grouped results with navigation

---

## Module 22 — Marketing backend (lowest product priority)

| Page | Backend need |
|------|--------------|
| `Contact.jsx` | `POST /contact` → email or `feedback` table |
| `Pricing.jsx` | `GET /plans` (exists) |
| `Blog.jsx` | CMS or MD files — defer |
| `Status.jsx` | External status API or manual JSON — defer |
| `Enterprise.jsx` | Static + contact form |

---

## Module 23 — Docs

Keep static MDX/Markdown in repo for v1. Optional later: `GET /docs/:slug` from CMS.

Files: `pages/docs/*`, `DOCS_NAV` in dummyData → move to `content/docs/`.

---

## Module 24 — Enterprise / compliance UI

Enterprise page stays marketing-only until SAML, audit exports, and dedicated IPs exist. Do not remove enterprise claims from marketing — backend catches up later.

---

## Laravel API layout (target)

```
ui/routes/api.php
├── v1/health
├── v1/auth/*              Module 1
├── v1/workspaces/*        Module 2
├── v1/virtual-emails/*    Module 4–5
├── v1/sandbox/*           Module 6
├── v1/domains/*           Module 7
├── v1/api-keys/*          Module 8
├── v1/smtp-credentials/*  Module 9
├── v1/send/*              Module 10
├── v1/sends/*             Module 11
├── v1/dashboard/*         Module 12
├── v1/templates/*         Module 16
├── v1/webhooks/*          Module 17
├── v1/analytics/*         Module 18
├── v1/billing/*           Module 19
├── v1/notifications/*     Module 20
├── v1/search              Module 21
└── v1/mail/send           (existing — API key auth, unchanged)
```

New controllers live under `App\Http\Controllers\Api\V1\`.

---

## Frontend wiring checklist (per module)

1. Create `frontend/src/api/<module>.js` — typed fetch functions
2. Add React Query hooks in `frontend/src/hooks/`
3. Replace imports from `@/lib/dummyData` in the target page(s)
4. Add loading/error/empty states (use existing `EmptyState`, skeletons)
5. Manual test against staging API
6. Remove unused dummy exports only after module ships

---

## Known frontend gaps (fix when touching module)

| Issue | Fix in |
|-------|--------|
| `/dashboard/templates/:id` not routed | Module 16 — `App.jsx` |
| `/workspace/select` wrong link | Module 2 — `DashboardLayout.jsx` |
| `ThemeProvider` not mounted | Module 0 — `index.jsx` |
| Region selectors in onboarding/domains/settings | Hide/stub — Modules 3, 7, 13 |
| Analytics tabs all show same content | Module 18 — split tab components |
| `SCHEDULED_EMAILS`, `CAMPAIGNS` unused in dummyData | Wire in Modules 10/16 or leave for later |

---

## Testing strategy

| Layer | Tool |
|-------|------|
| API | Pest feature tests per module (`tests/Feature/Api/V1/`) |
| Auth | JWT login, refresh, 401, workspace scoping |
| Frontend | Manual QA checklist per module; add Playwright later using `constants/testIds/` |
| Integration | Inbound SMTP → inbox appears in SPA; outbound send → log appears |

---

## Deployment notes

- Build SPA: `cd frontend && yarn build` → serve `dist/` via Nginx at `app.mailvoidr.com` or subpath
- Laravel API stays at `app.mailvoidr.com/api/v1`
- Same cookie domain not required (JWT in memory/localStorage)
- WebSocket (`smtp/:3000`) for realtime inbox updates — optional Phase 5 enhancement

---

## Suggested first sprint (Modules 0–2)

1. Install JWT in Laravel, CORS, health route
2. Frontend API client + auth context + protected routes
3. Login, register, verify OTP, 2FA
4. Workspace list, create, switch, invite accept
5. Deploy SPA to staging — marketing + auth only

**Second sprint:** Modules 3–6 (onboarding + inboxes — core product shift).  
**Third sprint:** Modules 7–11 (outbound sending stack).  
**Fourth+:** Overview, settings, teams, then templates/webhooks/analytics/billing.

---

*Last updated: June 2025 — revise this doc when a module ships or scope changes.*
