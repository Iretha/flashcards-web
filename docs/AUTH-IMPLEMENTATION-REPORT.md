# Authentication implementation report

Repository: Iretha/flashcards-web, branch feature/auth. No deployment, remote migration, real identity assignment or production-data operation was performed. This is locally implemented functionality with external release gates, not a production-readiness claim.

## Deliverable status

| Deliverable | Classification | Evidence/limit |
|---|---|---|
| Phase 1 additive schema, legacy compatibility and mapping constraints | IMPLEMENTED AND TESTED | 0012 nullable unique users.supabase_sub; session user index; QR table. Three-column session schema and old cookie survive upgrade; legacy/authorization regression suites pass. Real owner backup/restore remains a pre-remote gate. |
| Phase 2 Google PKCE, JWT/JWKS and mapped session issue | IMPLEMENTED BUT NOT EXTERNALLY VERIFIED | Mocked-provider signed-JWT/PKCE integration tests pass; real Google consent/project/key rotation not tested. |
| Phase 2 Supabase Email OTP | IMPLEMENTED BUT NOT EXTERNALLY VERIFIED | Supported APIs, generic errors, budgets/cooldown and same-user rotation tested with mocks. Real OTP expiration/single-use/delivery/linking behavior remains Supabase integration acceptance. |
| Phase 3 QR delegation | IMPLEMENTED AND TESTED | Local D1 and real browser two-context manual activation; explicit approval/denial/expiry/replay/races; no phone token transfer. Physical QR camera scan and LG remain unverified. |
| Phase 4 login/theme/activation UI | IMPLEMENTED BUT NOT EXTERNALLY VERIFIED | Existing and new Edge browser tests pass including mobile-sized phone and light/dark QR. Real LG and broader mobile/Safari/Firefox matrix outstanding. |
| Current logout, logout-all and server flags | IMPLEMENTED AND TESTED | Independent cookies; immediate next-check revocation, approver loss and logout-all races; fresh authentication remains allowed. |
| Existing deck/card/collaboration/history/API compatibility | IMPLEMENTED AND TESTED | Existing 108-test baseline preserved; existing API suite now applies 0012. No resource SQL permission rules or data ownership changed. This is test-fixture evidence, not inspection of real remote data. |
| Exact Supabase subjects, real Google credentials, SMTP and domain setup | BLOCKED BY EXTERNAL CONFIGURATION | No values invented; new flags default off. Owner setup and mapping instructions in AUTH-SETUP.md. |
| Real LG validation, SMTP deliverability, hosted CPU/quota/load and paused-project recovery | BLOCKED BY EXTERNAL CONFIGURATION | Requires configured isolated service environment, owner-controlled mailboxes/hardware and measurement. No mandatory paid subscription added. |
| Backup/mapping/rollback procedures | IMPLEMENTED BUT NOT EXTERNALLY VERIFIED | Exact expected-value mapping/inverse procedure and backup gates documented. No public mapping endpoint; actual owner mappings and remote restore rehearsal not executed. |
| Phase 5 legacy retirement | NOT IMPLEMENTED | Explicitly excluded. Legacy code, form, ACCESS_CODE, users and sessions retained. |
| Production migration/deployment | NOT IMPLEMENTED | Requires separate approval and verified backup/restore. |

## Checks actually executed

- Baseline npm test: 12 files, **108 tests passed**.
- Final npm test: 13 files, **123 tests passed** (15 new auth tests, including real D1 transactional failure rollback and 20-way direct redemption).
- npm run typecheck: **0 errors, 0 warnings, 0 hints**.
- npm run build: **passed** for Cloudflare server/client output.
- npm run test:e2e: **8 passed**, Edge headless, local Wrangler/D1; includes six existing scenarios and two QR/theme scenarios.
- Dependency installation audit: **0 reported vulnerabilities** at installation.
- git diff --check: passed before commits.

During development the first new suite had three failures because its fixture lacked later application-schema migrations; applying all fixture migrations resolved them. Typecheck caught an overly narrow inferred UUID fixture parameter; annotating string resolved it. No baseline failure was observed. No claim is made that mocks prove hosted Supabase OTP replay guarantees or physical LG browser support.

## Security review and compatibility findings

All methods converge on existing D1 users and shared cookie/authorization logic. New provider login requires fixed issuer/JWKS/audience, allowed ES256/RS256 signature, expiry/nbf/iat, UUID sub/session_id, authenticated role/nonanonymous user, getUser validation before subject lookup or automatic provisioning. No email/user metadata authorization or existing ownership change. Fixed callback, single-use browser transaction and SDK PKCE reject unbound/replayed callbacks; only one in-flight Google flow per browser is supported. Provider access/refresh tokens stay in ephemeral server memory, never reach TV or persistent client storage.

QR uses independent 256-bit approval/poll secrets and hashed manual code, five-minute expiry, explicit phone approval and conditional D1 batch redemption. The displayed phrase is independent of the manual credential. Direct 20-way redemption and logout-all race tests pass; an injected session INSERT failure rolls back consumed state. Current phone logout blocks uncompleted redemption but preserves a completed TV session. Application logout-all deletes current rows; an operation already authorized may complete, and later fresh login is allowed.

Server flags reject disabled new methods independently. Application sessions remain fixed 30 days; no Supabase token is checked on normal app requests. Existing sessions do not require mapping. Primary D1 sessions avoid replica staleness at cookie validation. fc_ scope/token ownership/idempotency and all deck guards remain unchanged. Supabase sign-out alone is not application-session revocation. Shared-code legacy login can still authenticate to mapped usernames; this is the approved temporary security floor, not a Supabase bypass of deck authorization.

Legacy session INSERT now names token_hash,user_id,expires_at. No auth_sessions layout change or mass invalidation. Logs omit raw provider exceptions; invocation URL logging is disabled to avoid callback code capture. Referrer policy is no-referrer; email/IP budgets use secret-keyed HMAC. Inspect upstream logging/analytics separately before public rollout.

## Files and commits

- Backend/migrations: src/server/auth.ts, auth-common.ts, supabase-auth.ts, device-auth.ts, api.ts; src/pages/api/[...path].ts; migrations/0012_parallel_auth.sql; wrangler.jsonc; package.json/package-lock.json.
- UI: src/ui/AuthMethods.tsx, App.tsx, style.css; src/pages/index.astro and activate.astro; .dev.vars.example.
- Tests: tests/auth.test.ts, tests/api.test.ts, e2e/auth.pw.ts, playwright.config.ts.
- Documentation: updated AUTH-INVENTORY.md, AUTH-OTP-QR-PROPOSAL.md, AUTH-OTP-QR-IMPLEMENTATION-PLAN.md; added AUTH-SETUP.md and this report.
- 1c2a91e: backend, additive migration, dependency and local integration coverage.
- e93deb8: themed login/activation UI, example flags and browser coverage.
- Documentation/setup/report are committed separately; see git log for its commit ID and remote confirmation in the final delivery message.

## Required owner actions and rollback

Follow [AUTH-SETUP.md](AUTH-SETUP.md): obtain actual Supabase URL/publishable key, exact application origin, rate-limit HMAC secret, Google provider/consent configuration, fixed callback allowlist, email token template/300s expiry, custom Brevo or Resend SMTP and verified SPF/DKIM/DMARC. Confirm Free quotas/eligibility, no automatic paid upgrades and inactivity risks. Existing-account linking remains a separately approved operation; new users need no mapping intervention.

Before remote 0012 or mapping: separately approve operation, take consistent full backup, prove isolated restoration, check FK/content/progress/history counts and hashes, then apply reviewed additive changes. Do not replay events, transfer decks or overwrite new study activity. Enable Google/email/QR independently only after their gates. For rollback disable relevant server flag(s), invalidate outstanding QR requests if needed and retain schema/legacy/current valid cookies; explicitly revoke affected cookies if identity was wrong. No stale full restore after new writes without reconciliation approval.

Run the real LG checklist in AUTH-SETUP.md before claiming TV readiness. Phase 4 owner review and Phase 5 removal approval remain separate. No production operation or legacy removal is implied by these commits.

## Open registration update

Google registration is open when AUTH_GOOGLE_ENABLED is true. After signed JWT and getUser verification, the shared server-only findOrCreateUserByVerifiedSubject operation returns the existing mapped user or inserts a new UUID user with its verified subject, timestamps and default settings. No invitation or administrator approval is needed. Email OTP uses exactly the same operation when independently enabled; this change does not enable it or configure SMTP. Equal subjects converge; different subjects remain separate even with equal emails.

Usernames are always Learner- plus a random UUID (44 ASCII characters, below the existing 64-character limit), normalized with questionKey. Display names, emails and metadata are ignored, including missing, malformed or Unicode names; existing Unicode usernames remain supported unchanged. Username conflicts regenerate up to five times. Neither conflict path updates another user's username or mapping.

The existing nullable unique subject index and username_key constraint are authoritative. A single INSERT initializes every required field and handles only those two unique conflicts with DO NOTHING; a losing request re-reads the subject mapping. Other database failures propagate without issuing access. No new migration is needed. Session issuance remains a separate atomic session batch: if it fails, the complete new account remains mapped, and restarting sign-in reuses it. Callback contexts are single-use, so restart Google sign-in rather than replaying a failed callback.

Legacy accounts are never found by email or profile attributes. An unmapped legacy user's Google login creates a separate empty personal account; their original data remains accessible through legacy login. Shared decks remain visible under existing permissions. For future explicit linking, retain access to the legacy account and request a separately reviewed proof-of-control procedure for both identities. Do not overwrite a mapping already created by registration or move data using the schematic mapping SQL above. Self-service linking and merging are outside this release.

Abuse protection retains Google start limits (20 per IP per 15 minutes), single-use five-minute callback admission, provider verification/timeouts and existing OTP budgets. Provisioning does bounded work and stores no profile or email. Distributed valid-identity abuse and provider/D1 quotas remain operational limitations; monitor redacted failure counts and provider-side controls. No CAPTCHA, new paid dependency or email requirement was introduced.

Local validation: npm test uses ephemeral Miniflare D1 and mocked provider responses with real signed JWTs; npm run typecheck, npm run build and npm run test:e2e cover compilation and existing browser regressions. No live Google, SMTP or physical LG compatibility is established. Rollback: disable the relevant server flags or revert this code while retaining schema, users, mappings and sessions. The previous build will reject only unmapped subjects; keep newly created mappings. Never delete registered users or restore stale data as rollback. No production deployment, remote migration, secret rotation or flag change was performed.

Verification for open registration: baseline 123 tests passed; final 127 unit/integration tests passed, typecheck zero diagnostics, production build passed, and all 8 Edge browser tests passed. Diff review checked targeted uniqueness conflicts, existing mappings, session failure recovery, unchanged permission queries and absence of remote operations. No additional schema or dependency change.
