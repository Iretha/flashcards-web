# Supabase authentication implementation and acceptance plan

Proposed 2026-11-22; documentation only. [Proposal](AUTH-OTP-QR-PROPOSAL.md) defines architecture/schema/policy; [inventory](AUTH-INVENTORY.md) records current code and references. Supabase, Google, Email OTP and QR are approved; no project creation, external configuration or implementation is authorized in this task.

## Phase 1 - Preparation

Recheck current login, session validation/logout, all deck/card/sharing/study checks and fc_ Management API. Baseline existing tests before changes. Owner supplies verified Supabase subjects and exact existing users.id mappings; neither email nor username similarity authorizes mapping. Initially deny unmapped subjects without creating D1 users. Preserve all existing IDs, ownership, collaborators, settings/history, API tokens and sessions. Inventory references from AUTH-INVENTORY.md against the selected database only when separately authorized; no remote data was accessed here.

Minimum schema: nullable unique users.supabase_sub; user_id index on unchanged three-column auth_sessions; one short-lived auth_device_requests table/indexes from proposal. No per-method authorization or custom OTP/claim tables. Keeping auth_sessions columns unchanged preserves current positional INSERT and rollback compatibility. Reuse login_limits with separate namespaces; legacy login counters and token budgets remain operational.

Prepare full consistent D1 backup including schema/triggers, restricted/encrypted storage, application version/nonsecret config record and approved mapping manifest. Prove restore and mapping dry-run in an isolated local database with external effects disabled. Record exact before/after counts, content hashes and FK integrity. Do not copy events back through INSERT triggers or consolidate progress. No source data changes occur in this documentation task.

Acceptance: baseline passes or pre-existing failures documented; mapping unique and owner-reviewed; no resource/permission changes; restored snapshot and inverse-mapping rehearsal succeed. Checkpoint P1: pre-change backup, compatible build and mapping undo manifest. Rollback does not delete historical users or move decks.

## Phase 2 - Supabase alongside legacy

After separate implementation/setup authorization, configure Google PKCE, Email OTP token template/expiry, redirects, asymmetric signing/JWKS and custom SMTP. Add server-side Supabase JS, jose and shared session issuance helpers only where useful. Per-request SDK state; no refresh-token vault. Worker accepts a verified subject only through its controlled mapping and issues the existing 30-day cookie. Legacy shared-code/username login, implicit registration, rate limits, Origin/body checks, current sessions and UI remain operational. A helper refactor must preserve those semantics.

Add explicit logout-all alongside current logout. Delete relevant sessions and invalidate unconsumed user grants in a D1 batch. Revocation is authoritative on the next protected check after commit, with no positive session cache; already-authorized requests may finish. Concurrent fresh authentication can create a new session after logout, as usual. Revocation is not an account ban, and retained shared-code login can reauthenticate. Supabase logout alone is not D1 revocation. Use primary/consistent D1 reads and transactional QR checks where read replicas exist.

Acceptance: legacy/Google/OTP select the intended same internal IDs; no new D1 users for these accounts; cookie attributes and fixed 30-day expiry unchanged; unknown subjects denied; immediate current/all-session revocation tested; decks/history/permissions/fc_ unchanged. Flags independently disable new handlers as well as UI. Checkpoint P2: disable Google/OTP and revert compatible build, retaining additive schema and valid existing cookies. A bad mapping is undone with expected-value predicates; explicitly revoke affected local sessions because unmapping alone is insufficient. No bulk session invalidation or ownership transfer.

## Phase 3 - QR login

Implement five-minute start/manual lookup/approval/denial/poll with independent poll/approval secrets and explicit authenticated phone consent. Accept existing authenticated Flashcards sessions regardless of login method, including legacy. Do not transfer phone tokens. Issue TV a fresh independent 30-day cookie. Recheck approver session and user in conditional transactional redemption; one winning response only. All authorization remains the existing internal-ID checks.

Acceptance: expiry/denial/replay terminal, manual entry safe, one completion under concurrent polls, no session on failed batch, logout-first blocks redemption, completion-first is removed by subsequent logout-all. Completed TV session survives phone-only logout. Poll bounded to five minutes; no per-poll heartbeat writes. Checkpoint P3: disable QR endpoints and UI, invalidate outstanding requests; existing independent sessions survive unless explicitly revoked. Other login methods and data remain intact.

## Phase 4 - Validation and owner review

Run automated matrix below and real LG/manual tests. Record evidence for legacy, Google, Email OTP and QR; correct IDs, 30-day cookie behavior, immediate application revocation, unchanged deck/card/owner/sharing/history/API behavior, concurrency and Free resource headroom. A failed replacement path does not disable working legacy login. Owner reviews actual results; elapsed time is not approval.

Checkpoint P4: independently disable new methods and return to legacy-capable compatible build. Keep schema and new learning activity; use reviewed inverse mapping repair. Do not restore a stale full snapshot over new writes. A full restore requires maintenance/write freeze, reconciliation approval and proof that newer content will survive. D1 backup does not restore Supabase Auth: preserve nonsecret configuration/recovery access separately. Never delete provider identities as a rollback shortcut.

## Phase 5 - Legacy retirement: separately approved work

Do not implement automatically. After Phase 4 succeeds, prepare a removal proposal listing ACCESS_CODE/API/form/equalCode/upsert, tests, scripts, docs, devices and rollback dependencies. Obtain explicit owner approval, then remove in a separate change. Assess whether remaining historical accounts need mappings before removal and whether existing sessions should remain; no mass invalidation is preapproved. No Phase 1-4 completion gate demands removing or disabling legacy. Retain application/auth/API/learning tables and migration history; optional historical cleanup needs separate reference review.

## Minimum surface and effort

New handlers: POST /api/auth/google/start, GET /api/auth/callback, POST /api/auth/email/start and /verify, POST /api/auth/device/start, /poll and /decision (including authenticated preview/manual lookup). Reuse /api/logout with explicit current/all scope and /api/home cookie check. Existing /api/login remains. No public identity-mapping endpoint. Server-render login/activation forms, keep existing legacy form. Shared helpers do not introduce a framework. Libraries: server Supabase JS, jose, qrcode and existing Web Crypto; no Redis/queues/WebSockets/extra provider or device framework.

Estimate for Phases 1-4: **12-20 engineer-days**, approximately 3-4 weeks for one engineer including mapping rehearsal, concurrency and real-TV QA. External provider approval/hardware access can extend elapsed time. Phase 5 is excluded and must be scoped separately. Dependencies: owner mappings/backups before enabling new methods; PKCE/JWKS/SMTP spike before login UI completion; transactional redemption tests before QR release; actual LG evidence before Phase 4 signoff.

## Essential automated tests

| Area | Required cases and pass conditions |
|---|---|
| Identity | Google-first/OTP-first same verified mailbox -> one Supabase sub/D1 ID; different subjects never merge on matching display strings; mapping uniqueness under concurrent login; unmapped Supabase subject denied while legacy/null-mapped accounts and old cookies still work |
| Legacy | Shared-code plus existing username returns original ID; unmapped account login works; implicit registration and rate limits/CSRF unchanged; old cookies survive schema update; simultaneous legacy/new logins preserve identity and independent sessions |
| Google | Callback success/denial, absent/wrong browser transaction, verifier mismatch, expired/replayed code, unsafe return URL, multi-tab isolation, callback cookie clearing; no D1 session on failure |
| Email | Mapped returning user and unmapped denied subject; generic enumeration-safe responses; actual code template, five-minute expiry, resend cooldown, wrong code, replay, concurrent verify, upstream 429/timeout/delayed mail; no custom OTP storage |
| JWT | Good rotated key, bad signature, wrong project/issuer/audience/algorithm, expired/future token, missing sub/session_id, anonymous/service token, unknown kid refresh/cooldown, stale JWKS/outage, cache purge and key-overlap rotation |
| Application sessions | Secure/HttpOnly/Lax/path and no-store; 30-day boundary; current-cookie rotation; logout-current vs logout-all; explicit application revocation; no sliding extension; Supabase logout alone does not falsely appear to revoke local cookie; no refresh tokens persisted |
| QR | Scan/manual input, login-before-approval continuity, no approval on GET, legacy/Google/OTP authenticated approver, expired/revoked approver, fresh independent 30-day TV expiry, denial/expiry/restart, wrong poll secret, manual brute-force limits and separate secrets |
| QR races | 20 simultaneous completion polls yield one session row/cookie winner; approval-vs-denial/expiry; two accounts approving; logout-all versus approval/redemption; batch failure rolls back, response loss requires safe restart |
| Permissions | Owner/editor/shared-reader/outsider across deck/card read/write/import/export/study/delete/collaborators; removal concurrent with edit still guarded in SQL |
| Management API | Generated legacy and personal fc_ tokens retain scope/expiry/revocation, hashes and IDs; unchanged resource access; JWT/cookie alone rejected by bearer API; ETag/If-Match and idempotency regressions |
| Migration | Exact controlled sub mappings preserve all IDs, owners, memberships, settings/progress/history and token namespaces; no new D1 users or transfer; inverse mapping and isolated restore succeed |
| Security/resources | CSRF/login-CSRF/open redirect, device-label XSS, request bounds, no code/token/verifier leakage in logs/URL/Referer; saturating multi-isolate rate budgets; no per-poll DB heartbeat; quota outage fail-closed, bounded cleanup |

Use Vitest/Miniflare for local D1 invariants and transactional races, mocked JWKS/Supabase responses for deterministic errors, Playwright multi-context tests for browser flows. Local/mock tests do not prove hosted Supabase replay/linking or SMTP behavior: add small controlled integration tests against an authorized staging project/mailboxes. Routine CI must not send real emails or use production data. Review native JWT verification instead of timing-based cryptographic assertions. Record test versions/results; do not claim coverage percentages without measurement.

## Manual acceptance

Test Google consent/published configuration, OTP delivery to major mailbox providers, spam placement, delayed/duplicate mail, actual hosted resend/rate/expiry behavior and verified-email linking order. Verify provider limits/card/free-plan status in selected accounts without purchasing anything. Exercise paused-project login failure/restoration and an operator disable/revoke drill; avoid artificial activity intended to circumvent Free policies.

Desktop Chrome/Firefox/Safari/Edge and Android Chrome/iOS Safari: direct Google/OTP, scan/manual code, multiple tabs, refresh/back, revoked sessions, cookie blocking and offline recovery. On actual LG hardware record model, firmware, webOS and standalone browser version. Check TLS, basic form rendering, remote focus/keyboard, numeric OTP, QR readability at distance, manual code, approval on phone, polling sleep/wake, network interruption and cookie retention after browser/TV restart. Test direct OTP even when Google UI is unavailable. Desktop viewport emulation does not certify LG. Cookie failure must show useful guidance, never URL tokens or insecure cookie fallback.

## Monitoring and final acceptance

Monitor redacted aggregate legacy/Google/OTP/QR outcomes, JWKS/cookie failures, expiry/revocation results and quotas. No code, JWT, verifier, session secret, email, poll/approval secret or credential logging. Existing full sampling requires review for redaction, not a new telemetry service. Expiry is checked regardless of cleanup; bound cleanup and abuse writes to Free limits.

Revocation drills must cover sessions issued before rollout and by every method. Check no stale cached authorization survives commit; API token revocation remains separate. Two simultaneous independent logins may both create valid sessions; two requests redeeming one QR cannot. Logout-all races are serialized against approval/redemption; a fresh later login is allowed. Long-lived 30-day sessions and retained shared-code authentication are explicit risks: possession of the shared code and a username permits the same access through legacy regardless of Supabase security. Shared SQL permission guards still apply to every session. Document this residual risk without silently disabling the approved fallback.

Completion: all Phase 4 tests pass with recorded actual LG hardware evidence, resource/identity/permission/history/API invariants unchanged, 30-day sessions and immediate revocation demonstrated, P1-P4 rollback checkpoints rehearsed. Remaining owner inputs: verified mapping for each person/account, SMTP/domain readiness and effective quotas, LG model/support floor, backup/privacy retention and validation window. Optional future signup/consolidation needs approval. Phase 5 requires a new removal proposal and explicit owner approval; this task does not implement it or any other phase.

## Implementation update (feature/auth)

Implementation is now authorized and present, superseding earlier analysis-only status text above. See [AUTH-SETUP.md](AUTH-SETUP.md) for exact bindings, Google/Supabase/SMTP setup, controlled mapping, backup, rollback and LG checklist. Migration 0012 adds the approved mapping/index/device table; auth_sessions remains three columns and its INSERT now names columns explicitly. No real mappings, remote migrations, deployment or data transfers were performed. New flags default off; legacy login/cookies/30-day lifetime remain.

Code: server/supabase-auth.ts validates provider identity and issues mapped local sessions; server/device-auth.ts uses atomic one-time delegation; auth.ts adds shared session issue and logout-all; api.ts enforces existing CSRF/request checks and primary D1 access. ui/AuthMethods.tsx and /activate provide theme-compatible login/approval UI. Authentication tests use mocked provider responses and real isolated D1; live provider/SMTP and real LG validation remain external gates. Phase 5 remains excluded.

Implementation details replacing earlier optional design choices: Google callback URL is fixed, with a single-use browser transaction and SDK PKCE binding instead of a variable state query redirect. The SDK uses ephemeral per-request storage (persistSession enables its PKCE adapter, not persistent refresh storage). QR context/preview/approve/deny are separate POST actions under /api/auth/device. Device label and independent confirmation phrase are presentation columns; no manual activation credential is stored plaintext. Email/IP budget identifiers use HMAC with AUTH_RATE_LIMIT_SECRET. Runtime invocation URL logging is disabled to protect callback codes. No per-method authorization or subject requirement is added to existing cookie validation.
