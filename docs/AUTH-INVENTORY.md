# Authentication inventory

Reviewed 2026-11-22. Static repository inspection only; production configuration, data, delivery, and TV behavior were not inspected. At this review, Git reports only these three documents as untracked; they already existed and were updated in place. Facts below describe checked-in behavior, not evidence of production deployment.

## Identity and login

- `src/pages/api/[...path].ts` passes D1 `DB` and optional `ACCESS_CODE` to `handle` in `src/server/api.ts`.
- `src/server/auth.ts:login` accepts username and a shared server access code. `equalCode` hashes both inputs and accumulates character differences. This is neither a password per account nor email verification.
- `users` in `migrations/0001_initial.sql` has UUID `id`, display `username`, unique normalized `username_key`, timestamps and settings. Login upserts by `questionKey(username)`, preserving the ID on conflict. No email column exists. Knowing the shared secret and a username permits access to that identity. The shared credential cannot prove individual ownership; the owner accepts controlled reassignment of these pre-production test decks.
- Registration is implicit on first login. No dedicated account recovery, email change, OTP, QR or device authorization flow was found in the inspected server/UI files.

## Sessions and client

`auth.ts:login` creates two concatenated random UUIDs, stores their SHA-256 digest in `auth_sessions(token_hash,user_id,expires_at)`, and sets `flashcards_session`. Cookie attributes: host-only, Path=/, Secure, HttpOnly, SameSite=Lax, Max-Age=30 days. `authenticate` hashes the cookie and joins users with an unexpired row. Expiration is fixed; no sliding renewal is implemented. Login removes the presented old session and expired rows; logout deletes the presented row and expires the cookie. Other device sessions survive. There is no session listing or remote revocation UI.

`src/ui/api.ts:api` uses same-origin cookie credentials; `signIn` immediately checks `/api/home` and reports cookie persistence failure. Authentication is not stored in localStorage by this flow. `App.tsx` uses localStorage for answer size; theme storage is separate UI state. `src/server/sessions.ts` manages study sessions, not authentication: one study session per user means devices intentionally share learning state despite independent auth cookies.

## Authorization and API compatibility

`decks.ts:getDeck/listDecks/deckWithCards`, study queries in `sessions.ts`, and `permissions.ts:editAccess/canEditDeck` enforce owner, SHARED visibility or collaborator access. SHARED means readable by authenticated users generally. Owners and collaborators edit; owners manage collaborators and delete decks. `collaborators.ts` resolves additions by normalized username and guards mutations with owner predicates. `migrations/0009_deck_collaborators.sql` stores membership by immutable user ID. Do not substitute email for this key.

`api.ts:handle` routes `/api/decks...` to `management.ts:manage` before browser dispatch. `auth.ts:authenticateClient` accepts `fc_` plus 64 hex characters, hashes the bearer credential, checks expiry and revocation, and returns user ID plus `can_write`. This is a read/write capability, not OAuth scopes. Current deck permissions still apply; bearer write access does not confer ownership. Management uses revision/ETag preconditions and idempotency records (`api_creates`, migration 0007).

`tokens.ts:tokens` generates 32 random bytes, returns the secret once, stores only its hash, supports list/description/revocation, allows 30/90/180/365-day expiry, limits active tokens to ten with a conditional INSERT, and limits operations to 60/hour/user. Migrations 0010 and 0011 add nullable legacy-compatible metadata, revocation and descriptions. Preserve legacy rows and `fc_` behavior.

## Controls, runtime and schema

- `auth.ts:login` uses atomic UPSERT counters keyed by SHA-256 of CF-Connecting-IP (or `local`), allows eight attempts per 15 minutes, then rejects; successful login clears its counter. No email/account abuse limits exist. Shared NAT users share a bucket; unkeyed IP hashes are guessable.
- `api.ts:dispatch` requires exact same-origin Origin and JSON on browser POSTs, checks declared and actual text length (3 million), authenticates protected routes; `http.ts:json` sets no-store. Management has a separate streaming 1 MB body reader. SameSite alone is not the only CSRF control.
- Login/home diagnostics in `api.ts` record status and cookie/session presence/expiry, without credentials. They explicitly mention a temporary LG webOS session issue. Generic API errors may be logged; future sensitive auth payloads must be redacted.
- `wrangler.jsonc`: Workers, nodejs_compat, compatibility date 2026-04-01, D1 binding DB, migration directory, full observability sampling. Actual account plan is unknown. `astro.config.mjs` disables Astro sessions, uses Cloudflare adapter and React, and targets Chrome 79 for JS/CSS.
- Migration 0001 establishes users, auth_sessions, login_limits, decks, cards, progress, study sessions/events and invalidation triggers. 0002–0006 evolve learning/card content; 0007 adds API tokens/idempotency; 0008 deck languages; 0009 collaborators; 0010–0011 token metadata. No proposed schema changes were made.
- `package.json` contains no OTP, QR, email SDK or auth framework. Web Crypto is already used. Dependencies include Astro 7, React 19, Wrangler, Miniflare, Vitest and Playwright.

## Evidence and gaps

`tests/api.test.ts` includes D1-backed cookie/expiry, CSRF, invalid-code limiting, private/shared content, cross-device study, collaborator permission and bearer scope/revocation tests. Named cases include “issues a scoped session cookie”, “rejects missing sessions”, “enforces collaborator permissions”, and “creates secrets once”. `e2e/tokens.pw.ts`, `collaborators.pw.ts`, `study.pw.ts`, `languages.pw.ts` exercise browser features. Tests were inspected, not executed; coverage percentages are unknown. OTP, email ownership, QR races, delivery failures, remote session revocation and real TV persistence need new coverage.

LG compatibility is not established by the Chrome target. Cookie diagnostics indicate an unresolved area, not a proven root cause. Existing docs (`MANAGEMENT-API.md`, `LOCAL-DEVELOPMENT.md`, project specification) are contextual; source behavior above is authoritative for this inventory. See the proposal for migration safeguards and the implementation plan for verification gates.

## Pre-production transfer reference inventory

Owner confirms a few test accounts used by two people; individual legacy ownership need not survive. No database rows were inspected. Verified migration references:

| Table | References and transfer hazards |
|---|---|
| users | id, unique username_key, settings/timestamps; no administrator role |
| decks | owner_id cascading FK; UNIQUE(owner_id,source_key) may collide on consolidation; preserve IDs, visibility and metadata |
| cards | deck_id cascading FK; preserve IDs, content, translations, metadata, order and stable/import keys |
| deck_collaborators | (deck_id,user_id) key; added_by FK preserves provenance; review effective privileges |
| card_progress | (user_id,card_id) key; statuses/counters/timestamps cannot be merged blindly |
| study_sessions | unique user_id; serialized state, selected decks, current card, version/mutation; multiple active states cannot collapse |
| study_events | user_id FK; semantic study_id/card_id/deck_id links; preserve event history |
| auth_sessions | user_id FK; preserve existing sessions during rollout; reuse table and 30-day expiry |
| api_tokens | user_id FK; retain hashes, scope, expiry/revocation and metadata; transferred decks change effective access |
| api_creates | (user_id,route,request_key) key; preserve fingerprint/resource_id and idempotency namespaces |
| login_limits | semantic hashed-IP and tokens:user-id keys; retain token-operation budgets |

Migration 0002 count_study_event INSERT trigger updates progress: reinserting events can double-count. Keep history and progress under original IDs by default. Deleting users can cascade into decks, credentials and progress; collaborator added_by can block deletion. Changing deck.owner_id alone does not resolve uniqueness, permissions, credentials or learning-state handling. Retain historical users initially; the proposal does not require deleting them.

## Supabase architecture review update

Reviewed again 2026-11-22 against auth.ts, tokens.ts, permissions.ts, api.ts, management.ts, ui/api.ts, the API Astro entrypoint, package.json, astro.config.mjs and migrations. Supabase is an approved future dependency, not existing functionality: no Supabase subject mapping, Google callback, JWT/JWKS validator or Supabase SDK is present in the inspected authentication path. ACCESS_CODE remains the active source-code mechanism. No external account, database or deployment was accessed.

The new proposal supersedes the earlier custom OTP tables, HMAC verification, claim workflow and direct email-provider API design. Supabase owns new Google/OTP authentication and provider linking; the shared-code verifier remains operational in parallel. D1 users.id remains the application identity for ownership/permissions. Existing auth_sessions can represent an application session established by Supabase authentication or explicit delegation; it must not become a second credential-verification system. Its lifetime/revocation relationship to Supabase must be explicit (proposal).

Phase 5 retirement candidates, only after validation and explicit approval: shared-code login/equalCode, username-based authentication upsert, ACCESS_CODE binding and login form. Keep digest/authenticateClient, hashed cookie validation/logout with unchanged 30-day lifetime and added explicit revocation, token-operation limits, all authorization SQL, and sessions.ts learning logic. auth_sessions is reused, not dropped. No custom OTP/claim/email-binding tables should be introduced. Existing fc_ credentials remain separate from Supabase JWTs. Removing a user is unsafe until both schema and semantic references in the inventory above are addressed.

Existing tests were inspected, not executed in this documentation task. They cover current cookie, CSRF, permission and Management API behavior; they do not prove Supabase, Google, QR or real LG compatibility. No administrator role exists in the inspected user model. Hosting-plan eligibility and browser capabilities are external findings documented with dated official links in the proposal, not repository facts.

## Approved parallel rollout correction

The latest owner decisions supersede earlier transfer/cutover assumptions. Phases 1-4 retain shared-code/username login, its existing protections and implicit registration behavior, existing cookies and 30-day lifetime. Null supabase_sub is valid for legacy users/sessions. Controlled verified-sub-to-existing-users.id mappings enable Google/OTP without creating duplicate D1 users, moving decks, altering memberships/API identities or consolidating learning data. The user-reference inventory remains a backup/verification checklist, not authorization to transfer/delete data.

Reinspection of auth.ts confirms fixed 30-day expiry, cookie digest lookup on each request, logout deletion, and positional INSERT INTO auth_sessions VALUES with three values. Therefore proposed schema keeps this table's columns unchanged (user_id index only), adds nullable unique users.supabase_sub and one device-request table. No per-method session authorization or mapping requirement may invalidate existing cookies. Logout-all/revocation and QR are proposed additions, not current verified features. Immediate revocation means the next authoritative authorization check after commit, not cancellation of previously authorized in-flight work. Supabase logout does not automatically revoke local cookies or prevent legacy re-login.

Legacy removal/equalCode/form/ACCESS_CODE cleanup is Phase 5 only: prepare a dependency/removal proposal after actual replacement-method validation, then obtain explicit owner approval and implement a separate change. No mass session invalidation, ownership transfer or cleanup is approved by the parallel rollout. The proposal/plan contain explicit P1-P4 acceptance and rollback checkpoints. Supabase/SMTP Free-limit sources are retained from the preceding dated review, not reverified by this repository-only policy update.

## Implementation update (feature/auth)

Implementation is now authorized and present, superseding earlier analysis-only status text above. See [AUTH-SETUP.md](AUTH-SETUP.md) for exact bindings, Google/Supabase/SMTP setup, controlled mapping, backup, rollback and LG checklist. Migration 0012 adds the approved mapping/index/device table; auth_sessions remains three columns and its INSERT now names columns explicitly. No real mappings, remote migrations, deployment or data transfers were performed. New flags default off; legacy login/cookies/30-day lifetime remain.

Code: server/supabase-auth.ts validates provider identity and issues mapped local sessions; server/device-auth.ts uses atomic one-time delegation; auth.ts adds shared session issue and logout-all; api.ts enforces existing CSRF/request checks and primary D1 access. ui/AuthMethods.tsx and /activate provide theme-compatible login/approval UI. Authentication tests use mocked provider responses and real isolated D1; live provider/SMTP and real LG validation remain external gates. Phase 5 remains excluded.

Implementation details replacing earlier optional design choices: Google callback URL is fixed, with a single-use browser transaction and SDK PKCE binding instead of a variable state query redirect. The SDK uses ephemeral per-request storage (persistSession enables its PKCE adapter, not persistent refresh storage). QR context/preview/approve/deny are separate POST actions under /api/auth/device. Device label and independent confirmation phrase are presentation columns; no manual activation credential is stored plaintext. Email/IP budget identifiers use HMAC with AUTH_RATE_LIMIT_SECRET. Runtime invocation URL logging is disabled to protect callback codes. No per-method authorization or subject requirement is added to existing cookie validation.
