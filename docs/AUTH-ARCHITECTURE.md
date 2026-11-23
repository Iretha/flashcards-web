# Flashcards authentication architecture and external services

Status: implementation on `feature/auth`; Google and Email OTP were manually exercised locally by the owner. QR on physical LG TV and production rollout remain unverified. This document describes architecture, not permission to deploy.

## Overview

Flashcards supports four independent sign-in routes:

| Route | Identity proof | Application account/session |
| --- | --- | --- |
| Legacy username + ACCESS_CODE | Existing shared access code | Existing D1 user and 30-day app session |
| Google | Google OAuth through Supabase Auth | Verified Supabase subject mapped to D1 user; 30-day app session |
| Email OTP | Supabase Auth verifies a code sent by email | Same subject mapping and app session |
| TV/other-device QR | Existing authenticated phone explicitly approves a pending device request | Separate app session for the requesting device |

All application authorization, decks, cards, learning progress and history remain in Cloudflare D1. Supabase is an identity provider, **not** the database of application data. Normal application requests validate the application's D1 session, not a Supabase access token.

## External services and responsibility

| Service | Purpose | Where configured | Operational dependency |
| --- | --- | --- | --- |
| **Google Cloud / Google OAuth** | Google account sign-in | Google OAuth client and Supabase Google provider | OAuth consent/client configuration, redirect URI, provider availability |
| **Supabase Auth** | OAuth mediation, email OTP issuance/verification, identity subject and signed JWT | Supabase project; Worker URL and publishable key | Project availability, signing keys/JWKS, auth quotas, allowed redirect URLs |
| **Brevo** | Transactional SMTP delivery of email OTP | Custom SMTP settings **inside Supabase**, not Worker | Verified sender, SMTP credentials, deliverability, sending limits |
| **Cloudflare Workers** | Hosts server authentication endpoints and application | Worker deployment/environment bindings | Runtime availability, correct origins/flags/secrets |
| **Cloudflare D1** | Stores users, subject mapping, app sessions, QR requests and app data | Worker D1 binding and migrations | Data integrity, backups, migration control |
| **Browser/device** | Holds HttpOnly application session cookie; phone scans/approves QR | Browser UI | Cookie and HTTPS compatibility, especially LG webOS |

Brevo is the **currently selected** SMTP provider for local owner setup; Resend is a documented alternative, not a second required service. Google and Supabase do not receive deck or study-progress data as part of this design. No external QR service is required.

## Google sign-in

1. Browser starts Google login through Flashcards Worker.
2. Worker requests a Supabase OAuth URL and stores short-lived, single-use browser transaction context and PKCE verifier.
3. Google authenticates the person and redirects through Supabase to the fixed Flashcards callback.
4. Worker exchanges the authorization code server-side, verifies JWT signature/issuer/audience/claims using Supabase JWKS, and confirms the identity using Supabase `getUser`.
5. Worker looks up `users.supabase_sub` in D1; if absent, it creates a new independent D1 user.
6. Worker issues a 30-day `flashcards_session` cookie; subsequent app requests use D1 sessions.

The Google OAuth client secret belongs in Supabase, not Cloudflare Worker.

## Email OTP

1. Browser submits an email to the Worker.
2. Worker enforces per-email/IP rate limits and asks Supabase to send an OTP.
3. Supabase sends through configured **Brevo custom SMTP** using the email template containing `{{ .Token }}`.
4. User enters the code in Flashcards; Worker calls Supabase `verifyOtp`.
5. Verified identity follows the **same** subject lookup/creation and D1 session issuance as Google.

No password is stored by Flashcards. Worker intentionally returns a generic send acknowledgment to avoid revealing account existence or delivery state. OTP expiry, sender configuration and provider-side abuse limits must also be maintained in Supabase/Brevo.

## Automatic registration and account separation

The only automatic linking key is the **verified Supabase subject UUID**, stored in `users.supabase_sub` with a uniqueness constraint. A subject already mapped to D1 reuses its user; an unmapped verified subject creates a new user with a random UUID ID and a generated `Learner-<UUID>` username.

**Never automatically merge or claim a legacy account by email, Google profile name or other metadata.** Two distinct Supabase subjects remain separate even if their email addresses match. Existing legacy users remain available through legacy login. Linking a legacy user to a verified subject requires separate owner-approved proof-of-control and mapping procedures; see `AUTH-SETUP.md`.

Concurrent sign-ins rely on D1 uniqueness and targeted conflict handling. If app session creation fails after user creation, the mapping remains reusable on a fresh sign-in. This registration change requires no new migration beyond existing `0012_parallel_auth.sql`.

## QR sign-in for LG TV

1. TV opens the login screen and requests a short-lived activation request.
2. Screen shows a QR code (and manual activation alternative).
3. Phone opens the activation link; the person signs in on the phone if necessary.
4. Phone displays the target device and independent confirmation phrase, and the person explicitly approves or denies.
5. TV polls for approval and redeems the one-time grant to obtain its **own** application session.

The phone's session and Supabase tokens are **not** copied to the TV. QR requests expire after five minutes; credentials are protected by hashing/independent secrets and conditional D1 redemption. Phone logout does not automatically log out a TV that already completed activation; **Sign out all devices** revokes all D1 application sessions. Physical LG browser, scanning, sleep/wake and hosted performance are not yet verified.

## Session and security model

- `flashcards_session`: 30 days, `Secure`, `HttpOnly`, `SameSite=Lax`.
- App sessions and permissions are checked in D1. Supabase sign-out alone does **not** revoke an existing Flashcards cookie.
- Google callback uses fixed redirect origin, PKCE and single-use state. JWTs require trusted asymmetric algorithms (ES256/RS256) and provider identity confirmation.
- Email and OAuth endpoints use abuse budgets. Do not store provider tokens, OTPs or secrets in logs or client storage.
- Legacy `ACCESS_CODE` login is intentionally retained; retiring it requires a separate decision and rollout.
- Feature flags independently control Google, Email OTP and QR, including server endpoints.

## Configuration reference

| Binding | Function |
| --- | --- |
| `ACCESS_CODE` | Existing legacy shared-code login |
| `AUTH_GOOGLE_ENABLED` | Enables Google sign-in |
| `AUTH_EMAIL_ENABLED` | Enables email OTP |
| `AUTH_QR_ENABLED` | Enables QR/device login |
| `SUPABASE_URL` | Supabase project HTTPS origin |
| `SUPABASE_PUBLISHABLE_KEY` | Public Supabase client key, not a service-role key |
| `AUTH_SITE_ORIGIN` | Exact Flashcards application origin |
| `AUTH_RATE_LIMIT_SECRET` | Secret for HMAC-protected email/IP rate-limit identifiers |

Local credentials go in ignored `.dev.vars`; deployed sensitive values must be configured as Worker secrets. SMTP credentials stay in Supabase. Do not commit actual credentials or publish full callback URLs containing codes.

## Operating and release checklist

- Confirm Google OAuth client, Supabase project/redirect allowlist and JWT signing-key configuration.
- Confirm Supabase Email OTP template, expiry and custom Brevo SMTP sender; check SPF/DKIM/DMARC and actual message delivery.
- Check Supabase/Brevo/Cloudflare free-plan quotas, suspension/pausing, rate limits and failure behavior; provider quotas may change.
- Back up **full** D1 data, rehearse isolated restore and verify user/deck/progress/history integrity **before** any authorized remote migration.
- Test a genuinely new Google identity, an existing mapped identity and a distinct identity sharing an email; ensure no legacy data is claimed.
- Test actual HTTPS QR activation on LG TV with phone, denial, expiry, replay and logout-all.
- Enable methods individually and retain rollback flags and legacy access. Do not delete newly registered users or restore stale production data over new learning progress.

## Evidence and status

The implementation agent reported 127 passing unit/integration tests, 8 Edge browser tests, clean typecheck and successful build at commit `c3ba9065fc6c2f528949920ef0a331c32393dfa0`. These are **agent-reported** checks, not an independent external audit. Owner reports local Google and Email OTP sign-in working with the same visible decks/progress; this does not by itself prove every identity-linking edge case. No production deployment or remote migration is authorized or documented as completed.

## Detailed references

- [AUTH-SETUP.md](AUTH-SETUP.md): exact provider configuration, secrets, operational controls, mapping, backups and LG acceptance checklist.
- [AUTH-IMPLEMENTATION-REPORT.md](AUTH-IMPLEMENTATION-REPORT.md): implementation scope, tests, limitations and changes.
- [AUTH-OTP-QR-PROPOSAL.md](AUTH-OTP-QR-PROPOSAL.md): design rationale and provider considerations.
- [AUTH-OTP-QR-IMPLEMENTATION-PLAN.md](AUTH-OTP-QR-IMPLEMENTATION-PLAN.md): phased implementation plan.
- Source: `src/server/supabase-auth.ts`, `src/server/device-auth.ts`, `src/server/auth.ts`, `migrations/0012_parallel_auth.sql`.
