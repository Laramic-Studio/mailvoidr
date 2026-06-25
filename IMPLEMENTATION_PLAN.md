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
| `/dashboard/virtual-emails` | Virtual emails | `test-emails/*` | `virtual_email_addresses` | **Many** per user/workspace |
| `/dashboard/virtual-emails/:id` | Virtual email detail | `test-emails/show` | `virtual_email_addresses` + `emails` | One virtual address |
| `/dashboard/inbox` | Inbox (sandbox) | `dashboard.tsx` (Inbox) | `inboxes` | **One** sandbox inbox per user/workspace |

**Rules:**
- Users get **one sandbox inbox** (SMTP creds, captured mail, spam/render tools) → **Inbox** page (`/dashboard/inbox`).
- Users create **many virtual emails** (disposable addresses, TTL, forwarding) → **Virtual emails** page.
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

**Status: ✅ Done (Module 0).** All `frontend/src/` app code is TypeScript.

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

**Package:** [`tymon/jwt-auth`](https://jwt-auth.readthedocs.io/en/develop/laravel-installation/) `^2.3` (Laravel 12 compatible).  
**OAuth (GitHub/Google):** redirect to Laravel Socialite → callback issues JWT → redirect to SPA with token in query/hash (one-time exchange).

### Frontend foundation (do once, Module 0)

| Task | Location |
|------|----------|
| API client (axios + interceptors) | `frontend/src/lib/api.ts` |
| Auth store + hooks | `frontend/src/stores/auth-store.ts`, `hooks/useAuth.ts` |
| Workspace store + hooks | `frontend/src/stores/workspace-store.ts`, `hooks/useWorkspaces.ts` |
| Route guards (auth + onboarding) | `frontend/src/routes/guards.tsx` |
| React Query provider | `frontend/src/index.tsx` |
| Env | `VITE_API_URL`, `VITE_WS_URL` in `frontend/.env` |
| CORS | Laravel `config/cors.php` — `FRONTEND_URL` |

**Fix during Module 0:**
- [x] Mount `ThemeProvider` in `index.tsx`
- [x] Fix broken links: `/workspace/select` → `/workspaces`
- [x] Add missing route: `/dashboard/templates/:id`

---

## Post-auth user journey

Laravel today has **no onboarding** — signup goes straight to dashboard. The SPA wizard at `/onboarding` is new product flow; we build it in **Module 2**.

```
Register → Verify email → 2FA (if on) → Onboarding (creates workspace here) → Dashboard
Login    → 2FA (if on) → Onboarding (if incomplete) → Dashboard
Invite accept → Verify email (if new) → Accept invite → Dashboard (skip onboarding — joined existing workspace)
```

| Module | What it delivers for this journey |
|--------|-----------------------------------|
| **1 — Auth** | JWT login/register/verify/2FA. `GET /auth/me` returns `onboarding_completed`. `OnboardingGate` redirects incomplete users to `/onboarding`. Register accepts optional `invite_token`. |
| **2 — Onboarding** | Wire `/onboarding` wizard. **Workspace is created inside onboarding** (step 1), not a separate pre-step. Sets `onboarding_completed_at`, provisions sandbox inbox. **Skipped** when user accepts a workspace invite. |
| **3 — Workspaces + invites** | **After onboarding:** switch workspace, `/workspaces` picker, invite accept. `/invite?workspace={id}` for existing users; `/invite?token={token}` for email invites (incl. users not on the platform yet). |

Module 1 does **not** implement the wizard — only the gate that sends new users there after auth succeeds.

---

| # | Module | Priority | Depends on |
|---|--------|----------|------------|
| 0 | Foundation + marketing (static) | — | — |
| 1 | Authentication | Critical | 0 |
| 2 | **Onboarding wizard** (incl. workspace create) | Critical | 1 |
| 3 | Workspaces + invites (post-onboarding) | High | 2 |
| 4 | Inboxes (virtual emails, many) | Critical | 2 |
| 5 | Virtual email detail + messages | Critical | 4 |
| 6 | Email testing (sandbox inbox, one) | High | 2 |
| 7 | Domains | High | 2 |
| 8 | API keys | High | 2, 7 (for send) |
| 9 | SMTP credentials | High | 2 |
| 10 | Send email (dashboard) | High | 7, 8 |
| 11 | Email logs (outbound) | High | 10 |
| 12 | Dashboard overview | Medium | 4, 10, 11 |
| 13 | Settings | Medium | 1, 3 |
| 14 | Teams | Medium | 3 |
| 15 | Live sending + credits | Medium | 10 |
| 16 | Templates (workspace library) | Medium | 10 |
| 16b | Template marketplace (free) | Medium | 16 |
| 17 | Webhooks | Medium | 10, 11 |
| 18 | Analytics | Lower | 11 + new tracking |
| 19 | Billing (full) | Lower | 15 |
| 20 | Notifications | Lower | multiple |
| 21 | Global search | Lower | 4, 11, 16 |
| 22 | Marketing backend | Lowest | — |
| 23 | Docs CMS | Lowest | — |
| 24 | Enterprise / status page | Lowest | — |

### Shipped progress (SPA + API)

| # | Module | Status | Backend tests |
|---|--------|--------|---------------|
| 0 | Foundation + marketing | ✅ Shipped | health route |
| 1 | Authentication | ✅ Shipped* | `tests/Unit/Api/V1/Auth/` |
| 2 | Onboarding wizard | ✅ Shipped | `tests/Unit/Api/V1/Onboarding/` |
| 3 | Workspaces + invites | ✅ Shipped | `tests/Unit/Api/V1/Workspace/` |
| 4 | Virtual emails (list) | ✅ Shipped | `tests/Unit/Api/V1/VirtualEmail/VirtualEmailTest.php` |
| 5 | Virtual email detail | ✅ Shipped | `tests/Unit/Api/V1/VirtualEmail/VirtualEmailMessageTest.php` |
| 6 | Sandbox inbox | ✅ Shipped v1 | `tests/Unit/Api/V1/Sandbox/` |
| 7 | Domains | ✅ Shipped | `tests/Unit/Api/V1/Domain/` |
| 8 | API keys | ✅ Shipped | `tests/Unit/Api/V1/ApiKey/` |
| 9 | SMTP credentials | ✅ Shipped | `tests/Unit/Api/V1/Smtp/` |
| 10 | Send email (compose) | ✅ Shipped | `tests/Unit/Api/V1/Send/` |
| 11 | Email logs (outbound) | ✅ Shipped | `tests/Unit/Api/V1/EmailSend/` |
| 13 | Settings | ✅ Shipped | `tests/Unit/Api/V1/Settings/` |
| 14 | Teams | ✅ Shipped | `tests/Unit/Api/V1/Team/` |
| 15 | Live sending + credits | ✅ Shipped† | `tests/Unit/Api/V1/Credit/` |
| 12 | Dashboard overview | ⏳ Not started | — |
| 16 | Templates (workspace library) | ✅ Shipped | `tests/Unit/Api/V1/Template/` |
| 16b | Template marketplace (free) | ✅ Shipped | `tests/Unit/Api/V1/Template/TemplateMarketplaceTest.php` |
| 17 | Webhooks | ✅ Shipped | `tests/Unit/Api/V1/Webhook/WebhookTest.php` |
| 18+ | Analytics, billing (full), … | ⏳ Not started | — |

\*Module 1 gaps: OAuth buttons in SPA are UI-only (no JWT exchange yet); 401 clears session instead of silent `POST /auth/refresh`.

†Module 15: credits API + sidebar widget + `Billing.tsx` overview tab wired; full billing redesign deferred to Module 19.

**Deploy checklist:** [DEPLOY-STEPS.md](../DEPLOY-STEPS.md) — update when each module ships.

**Next up:** Module 18 — Analytics (or Module 12 Dashboard overview scoped).

**Then:** Module 19 Billing (full) → remaining lower-priority modules.

---

## Module 0 — Foundation + static marketing

**Status: ✅ Shipped**

**Goal:** SPA deploys, talks to Laravel health check, marketing pages live without auth.

### Frontend files
- All `pages/marketing/*`
- `pages/docs/DocsLanding.tsx`, `pages/docs/DocsArticle.tsx` (static for now)
- Layouts: `MarketingLayout`, `DocsLayout`

### Backend
- `GET /api/v1/health` → `{ status: "ok" }`
- CORS + JWT package installed

### Done when
- [x] `yarn dev` + Laravel — health check passes from browser
- [x] Marketing routes render with real deploy URL
- [x] API client + auth shell exist (`lib/api.ts`, `hooks/useAuth.ts`, route guards)

---

## Module 1 — Authentication

**Status: ✅ Shipped** (OAuth SPA + silent refresh deferred)

**Goal:** Real login/register/reset/verify/2FA. Unauthenticated users cannot reach `/dashboard/*` or `/onboarding`.

**Onboarding note:** Module 1 sets up redirect plumbing only (`onboarding_completed` on `/auth/me` + `OnboardingLayout` in `routes/guards.tsx`). The wizard (including workspace create) is **Module 2**.

### Frontend pages
| Route | File |
|-------|------|
| `/login` | `pages/auth/Login.tsx` |
| `/register` | `pages/auth/Register.tsx` |
| `/forgot-password` | `pages/auth/ForgotPassword.tsx` |
| `/reset-password` | `pages/auth/ResetPassword.tsx` |
| `/verify-email` | `pages/auth/VerifyEmail.tsx` |
| `/2fa` | `pages/auth/TwoFA.tsx` |

Route guards (replaces standalone `OnboardingGate` component):
- `routes/guards.tsx` — `ProtectedLayout`, `GuestLayout`, `OnboardingLayout` enforce verify → onboarding → dashboard order

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
```sql
-- users table
onboarding_completed_at  TIMESTAMP nullable
onboarding_step          TINYINT nullable  -- resume wizard (0–5), optional v1
```

New users: `onboarding_completed_at = null`. Invited users who join a workspace: set on accept (skip wizard).

### Auth redirect flow
```
Register → VerifyEmail → (2FA if enabled) → /onboarding
Login    → (2FA if enabled) → /onboarding if !onboarding_completed else /dashboard
/onboarding → /dashboard when complete
```

### Done when
- [x] JWT login + register works; 401 clears session and redirects to login
- [ ] Silent token refresh on 401 (`POST /auth/refresh` exists in API; not wired in axios interceptor)
- [x] Email OTP verification blocks dashboard until verified
- [x] 2FA challenge works end-to-end (login → `/2fa` → dashboard)
- [ ] OAuth buttons redirect and return with valid JWT (buttons present; Laravel Socialite is web-only today)
- [x] Route guards protect `/dashboard/*`, `/onboarding`, `/workspaces`
- [x] `GET /auth/me` returns `onboarding_completed: boolean`
- [x] `OnboardingLayout` sends incomplete users to `/onboarding` after login

---

## Module 2 — Onboarding wizard

**Status: ✅ Shipped**

**Goal:** Wire `/onboarding` end-to-end. **Workspace creation lives here** — not a separate module before this.

New users never hit `/workspaces` first; they go Register → Verify → **Onboarding** → Dashboard.

### Frontend — `pages/Onboarding.tsx`

| Step | UI | API call |
|------|-----|----------|
| 0 Welcome | intro | — |
| 1 Workspace | name, slug | `POST /onboarding/workspace` (creates workspace + sets `selected_workspace_id`) |
| 2 Usage | use case picker | `PATCH /onboarding/workspace` `{ use_case }` |
| 3 API key | reveal first key | `POST /onboarding/api-key` (or skip — “create later”) |
| 4 Done | CTA to dashboard | `POST /onboarding/complete` |

**No domain step** — domains live under `/dashboard/domains` (Module 7).  
Hide region picker (single default). API key step skippable.

### Backend — `routes/api/v1/onboarding.php`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/onboarding/status` | `{ completed, step, workspace }` |
| PATCH | `/onboarding/step` | Save wizard progress (resume) |
| POST | `/onboarding/workspace` | Create workspace during step 1 |
| PATCH | `/onboarding/workspace` | Update name, slug, `use_case` |
| POST | `/onboarding/api-key` | Optional first API key during step 3 |
| POST | `/onboarding/complete` | Finish onboarding + side effects |

Reuse internally: `Workspace` model, `WorkspaceController@store` logic (extract to `WorkspaceService`).

### On `POST /onboarding/complete`
1. Set `users.onboarding_completed_at = now()`
2. Ensure workspace exists + `selected_workspace_id` set
3. Create **sandbox inbox** if missing (implemented — see Module 6)
4. Return `{ redirect: "/dashboard" }`

### Schema changes
```sql
-- workspaces
use_case  VARCHAR nullable   -- developer | startup | agency | enterprise

-- users (from Module 1)
onboarding_completed_at  TIMESTAMP nullable
onboarding_step          TINYINT nullable
```

### Done when
- [x] New user lands on `/onboarding` after verify (never completed)
- [x] Step 1 creates a real workspace (not dummy state)
- [x] Each step persists to backend (`PATCH /onboarding/step`, workspace create/update)
- [x] Complete → `/dashboard`; returning user skips wizard
- [x] Invited user skips onboarding on invite accept (Module 3)

**Shipped extras:** referral source field on workspace step (`referral_source` on users).

---

## Module 3 — Workspaces + invites

**Status: ✅ Shipped**

**Goal:** **Post-onboarding** workspace management — switching, multi-workspace picker, invite accept. **Not** the first-time signup path.

### When users see this
| Route | When |
|-------|------|
| `/onboarding` | First signup only (Module 2) |
| `/workspaces` | User has 2+ workspaces or taps “Switch workspace” |
| `/invite` | Accepting a team invite link |

### Frontend pages
| Route | File |
|-------|------|
| `/workspaces` | `pages/auth/WorkspaceSelect.tsx` |
| `/invite` | `pages/auth/InviteAccept.tsx` |

Also wire workspace switcher in `components/dashboard/WorkspaceSwitcher.tsx` (used in `DashboardLayout.tsx`).

### Backend — `routes/api/v1.php` (workspaces group)

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/workspaces` | List owned + member workspaces |
| POST | `/workspaces` | Create **additional** workspace (post-onboarding) |
| GET | `/workspaces/{id}` | Show |
| PATCH | `/workspaces/{id}` | Update name, slug, description |
| POST | `/workspaces/{id}/switch` | `WorkspaceSwitchController` |
| POST | `/invitations/{workspace}/accept` | Accept invite → skip onboarding, set `onboarding_completed_at` |
| POST | `/invitations/{workspace}/decline` | Decline |
| GET | `/invitations/token/{token}` | Public preview (email invite — Module 14) |
| GET | `/invitations/pending` | Current user's pending invites (Module 14) |
| POST | `/invitations/token/{token}/accept` | Accept by token after auth (Module 14) |

Team invite **send** + member management → **Module 14 Teams**.

### Done when
- [x] Dashboard switcher lists real workspaces
- [x] Switching updates `selected_workspace_id` + `X-Workspace-Id` header
- [x] `/workspaces` works for multi-workspace users
- [x] Invite accept lands on dashboard (onboarding skipped) — `/invite?workspace={id}` or `/invite?token={token}`
- [x] New-user path: register → verify → accept invite (token in session; not onboarding)

---

## Module 4 — Inboxes (virtual emails)

**Status: ✅ Shipped**

**Goal:** Users create **multiple virtual email addresses** per workspace. Maps to `virtual_email_addresses` — same as `ui/resources/js/pages/test-emails/*`.

### Frontend
- `pages/dashboard/VirtualEmails.tsx` — list + create modal (`VirtualEmailCreateDialog.tsx`)
- Hooks: `hooks/useVirtualEmails.ts`, `lib/api/virtual-emails.ts`

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
- [x] Create modal persists virtual email with label, TTL, optional forward
- [x] Table shows address, message/unread counts, TTL, forwarding
- [x] Copy address button works
- [ ] Plan limits enforced when billing module lands

---

## Module 5 — Virtual email detail + messages

**Status: ✅ Shipped**

**Goal:** Read mail captured by a **virtual email address** (not the sandbox inbox).

### Frontend
- `pages/dashboard/VirtualEmailDetail.tsx` — route `/dashboard/virtual-emails/:id`

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
- [x] Message list + detail split view works per virtual email
- [x] Tabs: Preview, HTML, Raw, Headers, Attachments render real data
- [x] Delete virtual email + refresh works

---

## Module 6 — Email testing (sandbox inbox)

**Status: ✅ Shipped v1**

**Goal:** **One sandbox inbox** per user/workspace — SMTP credentials, captured messages, spam/render tools. Maps to `inboxes` table + `ui/resources/js/pages/dashboard.tsx`.

### Frontend
- `pages/dashboard/Inbox.tsx` — Mailtrap-style master/detail inbox (replaces prototype `Testing.jsx`)
- `hooks/useSandbox.ts`, `hooks/useSandboxRealtime.ts`, `lib/api/sandbox.ts`
- `lib/email-socket.ts` — Socket.IO client (`VITE_WS_URL` → smtp `HTTP_PORT`, default **3030**)

### Backend — `routes/api/v1.php` (sandbox group, `throttle:inbox-api`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/sandbox` | User/workspace **single** `Inbox` + SMTP creds |
| POST | `/sandbox/enable` | Create inbox if missing |
| GET | `/sandbox/messages` | Paginated list |
| GET | `/sandbox/messages/{id}` | Message detail |
| GET | `/sandbox/messages/{id}/sidebar` | Lightweight row for realtime upsert |
| GET | `/sandbox/messages/{id}/raw` | Raw MIME |
| DELETE | `/sandbox/messages` | Clear all messages |
| POST | `/sandbox/messages/mark-all-read` | Mark all read |

Reuse: `SandboxService`, `SandboxInboxResource`, `Inbox` model, inbound SMTP on `:2525`.

**smtp/ on ingest:** `services/emailAnalysisService.ts` writes heuristic spam + HTML check to `email_analyses` table.

**Do not** allow multiple sandbox inboxes. "Projects" tab in UI — defer to v2 or map to virtual emails.

### Schema changes
- `email_analyses` table + `EmailAnalysis` model (migration `2026_06_25_120000_create_email_analyses_table`)
- Unique constraint on one inbox per workspace — **not yet enforced** (defer)

### Done when
- [x] Inbox shows real messages from the user's single sandbox inbox
- [x] SMTP credential modal uses real `inboxes.username` / `password` + `MAILVOIDR_SANDBOX_SMTP_HOST`
- [x] Spam Analysis + HTML Check tabs show data from `email_analyses`
- [x] Socket.IO realtime (`new-email` event) updates list without refresh
- [x] Responsive layout + desktop/mobile HTML preview toggle

**Deferred v2:** cursor pagination, production spam/HTML engines, DB unique constraint on sandbox inbox.

---

## Module 7 — Domains

**Status: ✅ Shipped**

**Goal:** Add/verify custom sending domains with DNS instructions.

### Frontend
- `pages/dashboard/Domains.tsx` — `hooks/useDomains.ts`, `lib/api/domains.ts`

### Backend — reuse live sending stack

| Method | Path | Reuse |
|--------|------|-------|
| GET | `/domains` | `VerifiedDomain` scoped to workspace |
| POST | `/domains` | `VerifiedDomainService::add` |
| GET | `/domains/{id}` | show + DNS records |
| POST | `/domains/{id}/verify` | dispatch `VerifyVerifiedDomainJob` |
| DELETE | `/domains/{id}` | remove |

Hide **region** column in UI or show static "Default" — no multi-region backend.

Reputation bar: verification status only for v1 (no bounce-rate score yet).

### Done when
- [x] Add domain modal + DNS panel match real records from `DnsVerificationService`
- [x] Status badges (verified / pending / warning) reflect DB
- [ ] Plan limits enforced when billing module lands

---

## Module 8 — API keys

**Status: ✅ Shipped**

**Goal:** Create, rotate, revoke keys with scopes.

### Frontend
- `pages/dashboard/APIKeys.tsx` — `hooks/useApiKeys.ts`, `lib/api/api-keys.ts`

### Backend — extend `ApiKeyService`

| Method | Path |
|--------|------|
| GET | `/api-keys` |
| POST | `/api-keys` |
| POST | `/api-keys/{id}/rotate` |
| DELETE | `/api-keys/{id}` |

Scopes stored on `api_keys.scopes` JSON; enforced in `auth.api_key` middleware for `/api/v1/mail/*`.

### Done when
- [x] Create modal saves name + scopes; returns full key once
- [x] Mask/reveal/copy token works
- [x] Revoked keys styled; revoked keys rejected by mail API

---

## Module 9 — SMTP credentials

**Status: ✅ Shipped**

**Goal:** Show live SMTP credentials for outbound sending.

### Frontend
- `pages/dashboard/SMTP.tsx` — `hooks/useSmtpCredentials.ts`, `lib/api/smtp-credentials.ts`

### Backend — reuse `SendingAccountService`

| Method | Path |
|--------|------|
| GET | `/smtp-credentials` |
| POST | `/smtp-credentials` | enable live sending if not active |
| POST | `/smtp-credentials/{id}/rotate-password` |

v1: one credential set per workspace. UI shows one production card.

### Done when
- [x] Credentials match `sending_accounts` table
- [x] Nodemailer snippet uses real host/port/username
- [x] Enable live sending + rotate password wired

---

## Module 10 — Send email (dashboard compose)

**Status: ✅ Shipped**

**Goal:** Compose and send from dashboard (not only external API).

### Frontend
- `pages/dashboard/SendEmail.tsx` — `hooks/useSend.ts`, `lib/api/send.ts`

### Backend

| Method | Path | Reuse |
|--------|------|-------|
| POST | `/send` | `SendMailService::queue` |
| POST | `/send/preview` | render HTML preview |
| GET | `/send/history` | recent sends for compose history tab |

Tabs **Scheduled**, **Transactional**, **Templates** — empty states until Modules 16+ land.

Live-sending gate + credit check surfaced in compose UI (Module 15).

### Done when
- [x] Compose sends via API using verified from-domain
- [x] History tab shows real `email_sends`
- [x] Preview modal renders submitted HTML

---

## Module 11 — Email logs (outbound)

**Status: ✅ Shipped**

**Goal:** Searchable outbound send log with detail drawer.

### Frontend
- `pages/dashboard/EmailLogs.tsx` — `hooks/useSends.ts`, `lib/api/sends.ts`

### Backend

| Method | Path |
|--------|------|
| GET | `/sends` | filter by status, domain, date, recipient |
| GET | `/sends/{id}` | detail + timeline |
| POST | `/sends/{id}/retry` | re-queue failed |

### Schema changes (shipped)
- `email_send_events` table — timeline events per send
- `html_body`, `text_body`, `reply_to` on `email_sends` (for retry + detail drawer)

### Done when
- [x] Filters and status pills work
- [x] Detail drawer shows timeline + payload
- [x] Retry failed sends (deducts credits when live sending enabled)
- [ ] "View in inbox" links when return-path capture exists

---

## Module 12 — Dashboard overview

**Status: ⏳ Not started** (UI prototype at `pages/dashboard/Overview.tsx` — still dummy data)

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

**Status: ✅ Shipped**

**Goal:** Profile, security, workspace, notification prefs.

### Frontend
- `pages/dashboard/Settings.tsx` — `hooks/useSettings.ts`, `lib/api/settings.ts`
- Domains / SMTP / Branding **not** in Settings nav (those pages live in sidebar as separate modules).

### Backend

| Section | Endpoints |
|---------|-----------|
| Profile | `PATCH /auth/me`, `PATCH /auth/password` |
| Security | `GET/POST/DELETE /settings/two-factor/*` |
| Notifications | `PATCH /settings/notifications` (JSON on `users`) |
| Workspace | `GET /settings`, `PATCH /settings/workspaces/{id}` |
| General | workspace name/slug via settings snapshot |
| Danger zone | `DELETE /settings/workspaces/{id}` |

Workspace policy toggles (2FA required, public invites, default role) are **saved but not enforced** elsewhere yet.

### Done when
- [x] Profile, security (2FA), notifications, workspace, danger zone persist and reload
- [x] Settings cache keyed by `selected_workspace_id`; invalidates on workspace switch
- [ ] Avatar upload
- [ ] Enforce workspace policy toggles app-wide

---

## Module 14 — Teams

**Status: ✅ Shipped**

**Goal:** Members, invitations, roles, activity.

### Frontend
- `pages/dashboard/Teams.tsx` — `hooks/useTeam.ts`, `lib/api/team.ts`
- Invite / manage / revoke dialogs; roles tab static reference cards

### Backend — workspace members + email invitations

| Method | Path |
|--------|------|
| GET | `/workspaces/{id}/members` |
| PATCH | `/workspaces/{id}/members/{userId}` | change role |
| DELETE | `/workspaces/{id}/members/{userId}` | remove |
| GET | `/workspaces/{id}/invitations` |
| POST | `/workspaces/{id}/invitations` |
| DELETE | `/workspaces/{id}/invitations/{id}` | revoke (pivot id or email-invite ULID) |
| GET | `/workspaces/{id}/activity` | member audit log |
| GET | `/invitations/pending` | current user's pending workspace invites |
| GET | `/invitations/token/{token}` | public preview (new users) |
| POST | `/invitations/token/{token}/accept` | accept after auth |
| POST | `/invitations/token/{token}/decline` | decline |

Module 3 routes still handle `/invitations/{workspace}/accept|decline` for existing users.

### Schema changes (shipped)
- `workspace_user.role` → `owner`, `admin`, `developer`, `billing_manager`, `viewer` (`member` → `developer`)
- `workspace_activities` table — team audit events
- `workspace_email_invitations` table — invite by email before user exists

### Invite behaviour
- **Existing user:** `workspace_user` pending row + email with `/invite?workspace={id}`
- **New user:** `workspace_email_invitations` row + email with `/invite?token={token}` → register → verify → accept → dashboard (onboarding skipped on accept)
- Register/login claim pending email invites; `invite_token` optional on `POST /auth/register`

### Done when
- [x] All four tabs use real data (members, invitations, roles reference, activity)
- [x] Invite by email works for users not on the platform yet
- [x] Role change + remove member + revoke invitation
- [x] Invite accept flow integrated with Module 3 (`InviteAccept.tsx`, onboarding skip)
- [ ] Resend invitation (UI stub disabled)

---

## Module 15 — Live sending activation + credits

**Status: ✅ Shipped** (billing UI interim — full redesign in Module 19)

**Goal:** Enable outbound, buy credits, enforce limits.

### Frontend
- `CreditsUsageWidget` in `DashboardLayout` sidebar
- `pages/dashboard/Billing.tsx` — credits summary + transactions + Stripe checkout (overview tab partial)
- Live-sending banner on Send page when not enabled

### Backend — reuse
- `SendingAccountService`, `SendCreditService`, `CreditPurchaseService`, Stripe webhook

| Method | Path |
|--------|------|
| POST | `/live-sending/enable` |
| GET | `/credits` | balance + free tier usage |
| POST | `/credits/checkout` | Stripe session |
| POST | `/credits/checkout/confirm` | confirm after redirect |
| GET | `/credits/transactions` |

**Bug fix (shipped):** `SendCreditService::deduct()` called in `SendMailService::queue()`; live-sending gate before outbound send.

### Done when
- [x] User must enable live sending before SMTP/API outbound works
- [x] Credit balance visible in dashboard layout usage widget
- [x] Stripe checkout session + confirm updates balance
- [ ] Full billing page redesign (plans, invoices, payment methods — Module 19)

---

## Module 16 — Templates

**Status: ✅ Shipped**

**Goal:** Template gallery, versions, variables, send with template.

### Frontend
- `pages/dashboard/Templates.tsx`, `TemplateDetail.tsx`
- `hooks/useTemplates.ts`, `lib/api/templates.ts`
- Send email **Templates** tab wired (`SendEmail.tsx`)

### Backend — new resource

| Method | Path |
|--------|------|
| GET/POST | `/templates` |
| GET/PATCH/DELETE | `/templates/{id}` |
| POST | `/templates/{id}/versions` |
| POST | `/templates/{id}/preview` |

### Schema
- `email_templates` — workspace-scoped metadata + `current_version_id`
- `email_template_versions` — immutable snapshots
- `email_sends.email_template_id`, `email_template_version_id`, `template_variables`

Send API accepts `template_id` + `variables` (pins version at queue time).

### Done when
- [x] CRUD + template detail page works
- [x] Send flow can select template and merge variables
- [x] Version history + preview with `{{variable}}` substitution

**Note:** Module 16 is the **workspace library** (copies you send from). **Module 16b** adds a **free public marketplace** on top — no paid listings in v1.

---

## Module 16b — Template marketplace (free)

**Status: ✅ Shipped**

**Goal:** Sidebar marketplace of **free** public templates. Users publish templates (public by default), browse others’ templates, **add to library** → appears in Send email Templates tab. Paid listings deferred to a future module.

### Product model (important)

Two concepts — do not merge in the UI:

| Surface | Route (proposed) | What it is |
|---------|------------------|------------|
| **Marketplace** (sidebar) | `/dashboard/templates/marketplace` | Browse **public** templates from all users. Free only in v1. |
| **My templates** | `/dashboard/templates` | Workspace **library** — templates you created or added from marketplace. |
| **Send → Templates tab** | `/dashboard/send` | Same library as “My templates” (send-ready only). |

**Rules (v1):**
- **Free only** — no price, no checkout, no creator payouts. Plan paid marketplace later (likely with Module 19 billing).
- **Public by default** — new templates are `visibility: public` unless user sets **private**.
- **Private** — visible only in creator’s workspace library; not listed in marketplace.
- **Add to library** — copies a **snapshot** of the public template into the workspace (`source_template_id` FK). Original author updates do not auto-change installed copies.
- **Upload** — same create flow as Module 16; marketplace is just the public catalog view.

### Frontend
- Rename / split sidebar: **Templates** → **Marketplace** (+ **My templates** sub-nav or tabs)
- `pages/dashboard/TemplateMarketplace.tsx` — grid, search, category filter, preview, “Add to library”
- `Templates.tsx` — filter to workspace library; badge “From marketplace” when `source_template_id` set
- Create/edit template — visibility toggle (default **public**)

### Backend

| Method | Path | Notes |
|--------|------|-------|
| GET | `/template-marketplace` | Paginated public templates; search, category |
| GET | `/template-marketplace/{template}` | Preview (no workspace required beyond auth) |
| POST | `/template-marketplace/{template}/add` | Fork into current workspace library |
| PATCH | `/templates/{id}` | Add `visibility`: `public` \| `private` (default `public` on create) |

Extend Module 16 create: `visibility` defaults to `public`.

### Schema changes
```
email_templates
  visibility          ENUM public|private  DEFAULT public
  source_template_id  ULID nullable FK → email_templates  -- set on fork from marketplace
  published_at        TIMESTAMP nullable                 -- when made public
```

Index: `(visibility, created_at)` for marketplace listing. Workspace library query unchanged (`workspace_id`).

**Out of scope v1:** `price_cents`, purchases, Stripe, revenue share, ratings, moderation queue (add before heavy public launch).

### Done when
- [x] Marketplace page lists public templates (free only)
- [x] Create template defaults to public; user can mark private
- [x] “Add to library” forks template into workspace
- [x] Send Templates tab shows library (own + added)
- [x] Private templates never appear in marketplace

### Future (not v1)
- Paid templates + checkout
- Creator payouts / revenue share
- Ratings, featured, moderation

---

## Module 17 — Webhooks

**Status: ✅ Shipped**

**Goal:** User-configured endpoints, delivery logs, replay.

### Frontend
- `pages/dashboard/Webhooks.tsx` — endpoints tab (create, pause, rotate secret, test), delivery logs + replay, event catalog
- `hooks/useWebhooks.ts`, `lib/api/webhooks.ts`

### Backend

| Method | Path |
|--------|------|
| GET/POST | `/webhooks` |
| GET/PATCH/DELETE | `/webhooks/{id}` |
| POST | `/webhooks/{id}/rotate-secret`, `/webhooks/{id}/test` |
| GET | `/webhooks/{id}/deliveries`, `/webhooks/deliveries` |
| POST | `/webhooks/deliveries/{id}/replay` |

### Schema — `webhook_endpoints`, `webhook_deliveries`
- Workspace-scoped endpoints; secret stored encrypted, `whsec_*` shown once on create/rotate
- `DeliverWebhookJob` — HTTP POST with `Mailvoidr-Signature` HMAC header
- Dispatched from `EmailSendEventService::record()` when an `email_send_events` row is created (email lifecycle only)
- **Open/click tracking v1:** pixel + link wrapper injected at send time; public `GET /t/o/{token}`, `GET /t/c/{token}` record events and fire webhooks (API/dashboard HTML sends only; SMTP direct path not yet wrapped)
- Legacy admin `webhook_logs` table left unchanged

### Done when
- [x] Create endpoint with event subscriptions
- [x] Delivery log + replay works for test events

---

## Module 18 — Analytics

**Goal:** Opens, clicks, geo, device, provider breakdowns.

### Tracking v1 (shipped — backend only)
- `EmailTrackingService` injects open pixel + wrapped links into HTML at queue time
- Public routes: `GET /t/o/{token}` (1×1 gif), `GET /t/c/{token}` (302 redirect)
- Events saved to `email_send_events` (`opened`, `clicked`) → webhooks `email.opened`, `email.clicked`
- Send flags: `track_opens`, `track_clicks` (default `true` when HTML present)
- Config: `MAILVOIDR_TRACKING_URL` (default `{APP_URL}/t`; production: `https://track.mailvoidr.com/t`)
- **Gap:** Live SMTP submissions through Node relay are not rewritten yet; analytics dashboards still stubbed

### Frontend
- `pages/dashboard/Analytics.jsx`

### Backend — requires tracking infrastructure

| Method | Path |
|--------|------|
| GET | `/analytics/overview` |
| GET | `/analytics/engagement` |
| GET | `/analytics/domains` |
| GET | `/analytics/templates` |

### Schema — engagement data
- v1 uses existing `email_send_events` (payload: ip, user_agent, url for clicks)
- Optional later: `email_tracking_events` for geo/device rollups

### Done when
- [ ] Volume + delivery charts use real data
- [x] Open/click events recorded + webhook dispatch (tracking v1)
- [ ] Analytics UI charts populate from engagement data
- [ ] Geo/device breakdowns (needs enrichment)

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
├── v1/onboarding/*        Module 2
├── v1/workspaces/*        Module 3, 14 (members, invitations, activity)
├── v1/invitations/*       Module 3, 14 (accept, token preview, pending)
├── v1/virtual-emails/*    Module 4–5
├── v1/sandbox/*           Module 6
├── v1/domains/*           Module 7
├── v1/api-keys/*          Module 8
├── v1/smtp-credentials/*  Module 9
├── v1/send/*              Module 10
├── v1/sends/*             Module 11
├── v1/settings/*          Module 13
├── v1/live-sending/*      Module 15
├── v1/credits/*           Module 15
├── v1/dashboard/*         Module 12 (not started)
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

1. Create `frontend/src/lib/api/<module>.ts` — typed fetch functions
2. Add React Query hooks in `frontend/src/hooks/`
3. Replace imports from `@/lib/dummyData` in the target page(s)
4. Add loading/error/empty states (use existing `EmptyState`, skeletons)
5. Manual test against staging API
6. Remove unused dummy exports only after module ships
7. Update [DEPLOY-STEPS.md](../DEPLOY-STEPS.md) with server config for the module

---

## Known frontend gaps (fix when touching module)

| Issue | Fix in | Status |
|-------|--------|--------|
| `/dashboard/templates/:id` not routed | Module 16 — `App.tsx` | ✅ Routed (page still dummy data) |
| `/workspace/select` wrong link | Module 3 — `DashboardLayout.tsx` | ✅ Fixed → `/workspaces` |
| `ThemeProvider` not mounted | Module 0 — `index.tsx` | ✅ Fixed |
| Silent JWT refresh on 401 | Module 1 — `lib/api.ts` | ⏳ Deferred |
| OAuth → JWT in SPA | Module 1 — auth pages | ⏳ Deferred |
| Region selectors in onboarding/domains/settings | Hide/stub — Modules 2, 7, 13 | Partial (onboarding hides region) |
| Billing page full redesign | Module 19 — `Billing.tsx` has interim credits UI | ⏳ Deferred |
| Team invitation resend | Module 14 — `Teams.tsx` | ⏳ Stub disabled |
| Workspace settings policies not enforced | Module 13 — saved only | ⏳ Pending |
| Analytics tabs all show same content | Module 18 — split tab components | ⏳ Pending |
| `SCHEDULED_EMAILS`, `CAMPAIGNS` unused in dummyData | Wire in Modules 10/16 or leave for later | ⏳ Pending |

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

- Build SPA: `cd frontend && npm run build` → serve `dist/` via Nginx at `app.mailvoidr.com`
- Laravel API stays at `app.mailvoidr.com/api/v1`
- Same cookie domain not required (JWT in memory/localStorage)
- WebSocket (Socket.IO) on smtp `HTTP_PORT` (default **3030**); proxy `/socket.io/` via Nginx in production
- Full per-module deploy checklist: [DEPLOY-STEPS.md](../DEPLOY-STEPS.md)

---

## Suggested sprint order (updated)

**Completed (Modules 0–11, 13–17, 16b):** Foundation through outbound stack, settings, teams, live sending + credits, templates + **free marketplace**, **webhooks**.

**Current sprint — pick one:**
- Module 18 Analytics — volume/delivery charts from `email_sends`; engagement tabs empty until tracking ships
- Module 12 (scoped) — Dashboard overview — stats, chart, recent logs, top domains; stub activity until ready

**Deferred / polish:** Paid template marketplace, OAuth JWT exchange, silent refresh, invitation resend, enforce workspace policy toggles, return-path “view in inbox” on email logs.

---

*Last updated: June 2026 — Module 17 webhooks shipped (signed deliveries, replay, event catalog).*
