# MCP implementation gate report

## Follow-up source verification — 2026-11-23

Follow-up validation completed: `npm test` passed all 127 tests in 13 files; `npm run typecheck` passed with zero diagnostics in 56 files; `npm run build` completed successfully. These are existing local regression checks, not real MCP OAuth tests. Browser E2E and external OAuth tests were not run. Build loaded local variables without printing their values. No deployment command was run.

The working tree was clean on `feature/auth` at the start of this follow-up. Existing report content is preserved below. No secrets were read from `.dev.vars`.

New upstream evidence: [Supabase Auth issue #2610](https://github.com/supabase/auth/issues/2610), still open when checked, reports that authorization and token endpoints accept but ignore `resource`, issuing `aud=authenticated`. This is an upstream issue report, not a reproduced test of this project's deployed Auth version. [Supabase token security documentation](https://supabase.com/docs/guides/auth/oauth-server/token-security) describes audience customization; that alone does not prove resource validation across authorization, exchange and refresh. The release decision remains **NO-GO pending project-specific evidence**.

[Current OpenAI authentication guidance](https://developers.openai.com/plugins/build/auth) supports predefined clients as well as CIMD and DCR. DCR is therefore not required for this proposed integration and remains disabled. Obtain the exact redirect URI from the connection management page: callback mode determines the URI; do not assume either a stable callback or a callback-ID-specific URL.

Owner action needed: provide access to an isolated Supabase test project's OAuth Server configuration and the exact callback URI displayed by ChatGPT. Keep DCR disabled. Confirm the deployed Auth version's RFC 8707 support with Supabase before proceeding with resource-bound authorization, exchange and refresh probes. Do not configure a consent URL pointing to an unimplemented route. No Dashboard setting, client registration, consent implementation, MCP transport or D1 data access was added in this follow-up. The requested implementation and real ChatGPT test remain incomplete; this update must not be interpreted as successful delivery.

Date: 2026-11-23. Repository: Iretha/flashcards-web. Branch: feature/auth.

## Decision: NO-GO

Implementation stopped before adding MCP routes or D1 access, as required by the task's resource isolation gate. This is an evidence gap, not a demonstrated claim that every Supabase version lacks RFC 8707 support. No successful live authorization-code exchange, resource binding or refresh isolation has been established for this project.

The four required authentication documents were reviewed. The existing login verifier deliberately accepts `aud=authenticated`; it is appropriate to the existing identity-to-app-session flow but must not authorize MCP. Supabase's documented OAuth token example also uses this audience. A hook changing audience by client ID cannot demonstrate validation of a requested resource at authorization, exchange and refresh.

## Official sources checked

- [MCP authorization, latest redirect to 2026-07-28](https://modelcontextprotocol.io/specification/latest/basic/authorization): resource indicators and resource-specific token validation.
- [OAuth 2.1 current IETF draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/): currently draft 17; OAuth 2.1 remains a draft. MCP's page references draft 13.
- [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707): resource indicators identify the intended protected resource.
- [Supabase token security](https://supabase.com/docs/guides/auth/oauth-server/token-security): default audience and client-specific audience hooks.
- [Supabase flows](https://supabase.com/docs/guides/auth/oauth-server/oauth-flows): custom scopes currently unsupported; standard scopes control identity information, not D1 permissions.
- [Supabase MCP guide](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication): integration guidance is not project-specific issuance evidence.

## Endpoints and architecture

No new endpoints implemented: `/mcp`, protected resource metadata, AS discovery forwarding and `/oauth/consent` are all deferred. No get_decks tool, grants table, migration, OAuth client, hook or feature flag was added. No cookie or generic Supabase token was repurposed as MCP authorization.

After the gate passes, the intended architecture remains ChatGPT → Worker resource server → Supabase issuer/JWKS validation → active read grant → existing users.supabase_sub lookup → bound ownership-filtered D1 query. Supabase alone handles code issuance, PKCE and OAuth tokens. MCP must never auto-create or merge D1 users. Consent requires a real validated Supabase session and explicit approval; a legacy D1 cookie is insufficient. Only get_decks may be exposed, with pagination and minimal fields. Missing/revoked grants fail closed on every call.

## Verification performed

| Check | Result and evidence boundary |
| --- | --- |
| npm test | PASS: 13 files, 127 tests, isolated local D1 and mocked provider responses |
| npm run typecheck | PASS: 56 files, zero errors/warnings/hints |
| npm run build | PASS: Cloudflare production build; no deployment |
| Existing authentication | Existing regression suite passed; this does not establish live Google/SMTP behavior |
| MCP initialize and tools/list | NOT RUN: endpoint intentionally not implemented |
| MCP bearer validity, expiry, issuer, audience, missing permission, foreign decks | NOT RUN: no MCP verifier or data path implemented |
| Consent denial, OAuth state/PKCE, code replay, refresh reuse, revocation | Live MCP checks NOT RUN; existing app auth mocks are not evidence for MCP issuance |
| RFC 8707 and client/resource replay isolation | UNCONFIRMED, release and implementation blocker |
| Browser E2E | Not rerun in this documentation-only change |

No new mock tests were added to simulate a successful provider contract that has not been established. The requested MCP test matrix remains outstanding. Real user data and remote D1 were not touched. `.dev.vars` contents were not printed or changed; the existing build reports loading local variables.

## Required isolated Supabase verification

Use an isolated free test project and synthetic users, with asymmetric signing keys. Confirm OAuth Server availability without paid services. Keep Dynamic Client Registration disabled. Do not register any client until the exact redirect URI is obtained from the actual ChatGPT configuration UI. Configure a real HTTPS test consent URL only once its implementation is ready; do not point authorization at a nonexistent handler.

Obtain project-specific provider evidence or an isolated executable test setup proving resource support before exposing data. Test authorization and exchange with the same canonical MCP resource, then missing, foreign, malformed, repeated and changed resources, including refresh. Record redacted statuses and relevant claims, never raw tokens/codes/verifiers. Require resource-bound audience and approved client ID; generic authenticated audience is a failure. Test second-client replay, wrong PKCE verifier, state mismatch, code reuse, redirect mismatch, denied consent, grant revocation and provider refresh revocation. Measure old JWT validity separately from refresh revocation.

If these checks cannot establish safe RFC 8707 behavior, stop: no hook-only workaround, fallback audience, custom authorization server or D1 access. Custom scopes being unavailable also means explicit server-side grants would need a separate implemented and tested authorization policy.

## Future ChatGPT connection

Only after the above gate, implement and test the local transport/verifier/consent/ACL suite, obtain a separate authorized HTTPS test deployment with isolated D1, and copy the actual callback URI from ChatGPT. Register a static OAuth client using supported authentication methods, without DCR. Configure the MCP URL and exact client credentials in ChatGPT, perform real login and explicit read consent, verify only the mapped user's decks, deny consent, disconnect/revoke and retry. Do not connect production or publish this endpoint before security acceptance.

## Critical review

Separate final review of this documentation-only change found no new executable authentication surface, no D1 access path and no weaker verifier. No independent external auditor or second agent review was performed. Key unresolved risks remain generic-audience replay, silent resource ignoring, missing D1 grants and confusing D1 app sessions with Supabase consent sessions. This report does not claim these risks are mitigated by unimplemented code.

No production deployment, remote migration, real-data modification, paid service, commit or push was performed. Approval of this report does not itself establish the missing security evidence.
