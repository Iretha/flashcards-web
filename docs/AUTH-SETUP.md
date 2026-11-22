# Authentication setup and operational checklist

Implementation on feature/auth. No external configuration, remote migration or deployment was performed. New methods are off unless explicitly enabled. Legacy ACCESS_CODE and username login remain available. Do not run npm run deploy as a setup check: it includes remote migrations.

## Required configuration

Use ignored .dev.vars for local credentials and Worker secret bindings for sensitive deployed values. Do not commit real values. Configure separately for each environment:

| Binding | Required for | Value/source |
|---|---|---|
| ACCESS_CODE | legacy | Keep existing secret unchanged |
| AUTH_GOOGLE_ENABLED | Google | Exact string true enables; missing/false disables endpoints and UI |
| AUTH_EMAIL_ENABLED | email | Same independent flag |
| AUTH_QR_ENABLED | QR | Same independent flag; QR can work with legacy phone authentication alone |
| SUPABASE_URL | Google/email | Owner's actual HTTPS project origin, no path |
| SUPABASE_PUBLISHABLE_KEY | Google/email | Supabase publishable key (not service_role/secret key) |
| AUTH_SITE_ORIGIN | Google/email | Exact application origin including scheme and optional local port, no trailing slash/path |
| AUTH_RATE_LIMIT_SECRET | email | Owner-generated random secret of at least 32 characters; HMAC pseudonymizes email/IP counters |

Use a dedicated provider test project/mailboxes when authorized. Local HTTPS is preferred for Secure cookie testing; loopback browser exceptions are not proof of production behavior. SDK is server-only and uses ephemeral request storage; persistSession is true only because the installed SDK needs its storage adapter for PKCE. No access/refresh token is written to a persistent store. JWTs are ES256/RS256 only; configure asymmetric keys before enabling. No service-role, Google client secret or SMTP password is needed in Workers. No secrets have been invented or installed by this change.

## Supabase and Google

1. Owner creates/selects a Free Supabase project and records actual URL/publishable key. Keep recovery access to its organization. Accept Free inactivity pause and lack of uptime SLA. Auth uses managed Supabase storage; decks/cards/history stay in D1.
2. Enable Google in Supabase. Create a Google web OAuth client and configure the **Supabase-provided Google callback** in Google's authorized redirect URIs. Put Google's client ID/secret in Supabase only. Configure Google consent screen, test users while in testing, authorized domains, minimal openid/email/profile scopes and publishing/verification requirements for intended audience.
3. Set Supabase Site URL to the real application origin. Allow the **fixed exact** application callback URL `<application-origin>/api/auth/callback`; add exact local/staging URLs separately. No wildcard production redirects. The Worker always uses that URL, never a client return URL. Google/Supabase handle provider state; the Worker additionally binds a five-minute single-use D1 browser transaction cookie to its SDK PKCE verifier cookie. Only the latest Google flow per browser is supported; opening a second flow replaces cookies, so restart if tabs conflict. An invalid callback burns/clears its context safely.
4. Select asymmetric Supabase signing keys. Worker verifies fixed JWKS/issuer/audience, exp/nbf/iat, authenticated role, UUID subject/session ID, rejects anonymous/HS256 and validates getUser identity before mapping. JWKS cache <=10min, unknown-key cooldown 30s; allow planned key overlap. A compromised key requires explicit D1 session revocation as well as provider action.
5. Enable email OTP with a manually entered code. In the relevant Supabase email template include `{{ .Token }}` and code-entry instructions, not just ConfirmationURL. Set OTP expiration to 300 seconds and resend interval >=60 seconds. Confirm secure email-change settings if that feature is later exposed. Password UI, magic-link handlers, custom OTP generation and self-service claims are not implemented.
6. Test Google-first/OTP-first using the same verified mailbox. Both must yield the same approved subject. Supabase's verified identity linking does not authorize merging historical D1 accounts by email. Public application provisioning is denied even if Supabase creates an Auth user during email sign-in.

## SMTP: Brevo preferred, Resend alternative

Supabase's default sender is team-address-only and two messages/hour; not suitable for general login. Configure **custom SMTP in Supabase**, not Workers. Prefer Brevo Free after transactional activation; use the SMTP host/port/login/key from that account's SMTP dashboard, require TLS and set an authenticated From address. Resend alternative: smtp.resend.com with documented TLS port, username resend and SMTP API key password. No provider was enrolled or configured here.

Verify an owned sending domain and publish provider-generated SPF/DKIM records; configure DMARC and inspect alignment in real received messages. Do not paste DNS records from another account. Disable open/click tracking for auth mail. Check spam placement, bounces, complaints, delays and provider suppression behavior. Do not buy a paid plan, dedicated IP or automatic credits. Domain renewal can be an existing unavoidable cost; do not claim it is free.

Before enablement verify actual Free plan, transactional eligibility, SMTP/API rate limits, card requirement, quota/reset/exhaustion/queue behavior and no automatic paid upgrades in the selected account. Previous official-source review is in AUTH-OTP-QR-PROPOSAL.md (Brevo 300/day; Resend 100/day and 3,000/month). Supabase custom SMTP initially limits sending to 30/hour; configure within provider quota and test 429 behavior. Worker email budgets: 1/minute, 3/15min and 10/day/email, 20 sends/hour/IP; verification 5/5min/email and 30/15min/IP. Provider timeout/rejection returns the same delivery acknowledgment to avoid enumeration; UI explains that delivery may be unavailable. No automatic send retries. Direct public Supabase endpoints can bypass Worker counters, so set provider-side abuse controls and alerts too. Do not impose a CAPTCHA that silently prevents TV direct OTP; validate any progressive challenge on supported devices.

## Controlled identity mapping: no public endpoint

Before any remote mapping/migration: obtain separate owner approval, take a consistent full D1 export/backup, restore it locally in isolation, verify FK integrity and users/decks/cards/progress/history/session/token counts and content hashes, and record before/after manifest. Browser export alone is insufficient. Do not replay history INSERTs. Remote operations are not authorized by this implementation task.

For each person record in a restricted audit manifest: environment, exact existing users.id, old supabase_sub (possibly null), verified provider sub, authentication verification evidence, owner approval, timestamp/operator and rollback value. Do not include tokens, OTPs or credentials. Verify subject from Supabase user administration and a controlled actual login, not client claims or email matching. Preflight that user exists and subject is not assigned elsewhere. Apply only an expected-value conditional change:

```sql
-- Schematic placeholders: substitute only verified, reviewed values using a safe DB tool.
UPDATE users SET supabase_sub = :verified_sub
WHERE id = :existing_user_id AND supabase_sub IS :expected_previous_sub;
-- Require exactly one affected row, then SELECT id,supabase_sub for verification.
-- Unique index rejects a subject already assigned to another user.
```

Rollback uses the inverse conditional update, expecting the newly applied subject, and verifies exactly one row. Changing/unsetting a mapping does not revoke previously issued cookies; explicitly revoke affected sessions if an incorrect mapping was ever used. No user creation, merging, deck transfer, collaborator changes or API token reassignment is required. One user has at most one mapped subject. Extra historical accounts remain legacy-accessible; a request to consolidate/map multiple subjects needs separate policy approval.

## Migration, backup and rollout

0012_parallel_auth.sql is additive: nullable unique user subject, session user index and one QR table with hashed credentials, state, expiry, approver reference, label/confirmation phrase. Existing auth_sessions retains exactly three columns. No data backfill or mapping is embedded. Apply locally with the existing local migration command; tests use isolated ephemeral D1. Any remote application requires separate approval and verified backup/restore evidence first. Do not drop additive schema for routine rollback.

Enable one new flag at a time after testing. Flags reject server operations as well as hiding UI. AUTH_QR_ENABLED can be enabled independently of Google/email. Disable a method by setting its flag false or removing it; retain ACCESS_CODE. QR rollback also invalidates outstanding requests under a separately authorized operation if needed. Existing completed cookies survive flag changes; revoke them explicitly if required. Revert to a compatible legacy build while retaining additive schema and existing data. Do not restore stale whole-database snapshots over new learning activity. No global session invalidation is part of rollout.

## Sessions, revocation and privacy

All methods use flashcards_session, fixed 30 days, Secure/HttpOnly/SameSite=Lax. New login rotates only the presented old cookie. Current logout deletes its row; Settings > Sign out all devices deletes all user sessions and invalidates unconsumed grants atomically. Phone-only logout preserves an already completed TV session. Logout-first prevents pending redemption; redemption-first is removed by logout-all. Fresh authentication after revocation is allowed. Checks use primary D1 sessions, no positive auth cache. Already-authorized work can complete. API token revocation remains separate; Supabase signout alone does not revoke local cookies, and legacy shared-code credentials can reauthenticate until separately retired.

Workers invocation logs are disabled in wrangler configuration to avoid recording OAuth callback query codes; application diagnostics log only fixed endpoints/status/cookie booleans. Ensure any upstream proxy/analytics also redacts callback queries and excludes /activate. Referrer policy is no-referrer. Provider errors are never logged. D1 stores hashes of QR credentials; the independent displayed confirmation phrase is not a credential. Temporary approval context is an HttpOnly same-origin cookie, cleared on decision; Google verifier/state are cleared on callback. No tokens in localStorage/sessionStorage. Terminal QR records expire and bounded cleanup runs on starts; email/abuse counters expire independently. Monitor quotas and redacted failures.

## Real-device release checklist (not yet verified)

- Record LG model/firmware/webOS/standalone browser; test actual HTTPS TLS/cookies, cold start, restart and sleep/wake.
- Test QR readability at viewing distance, remote focus, keyboard, large confirmation text, manual activation, manual status refresh, lost network, expiry/denial and restart.
- On phone test login-before-approval with legacy, Google and OTP; verify account/device/phrase, deny, approve, phone logout and logout-all.
- Test direct TV Email OTP even if Google UI is unavailable. No third-party cookies, client Web Crypto, WebSockets or TV camera required.
- Desktop/mobile light/dark, phone scan/manual entry, Google cancellation, delayed/expired OTP, feature flag rollback, old-cookie validity and deck/history/API access.
- Measure actual Workers CPU (10ms Free), D1 rows/index writes and request budgets under staging load. Local pass does not certify Free CPU, deliverability or LG compatibility.

Phase 5 removal of legacy login is NOT IMPLEMENTED and requires separate validation, proposal and explicit approval.
