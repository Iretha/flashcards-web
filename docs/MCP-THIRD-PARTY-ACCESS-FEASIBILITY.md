# MCP Third-Party Access — Current-State Assessment

Date: 2026-11-23. Assessment only; no implementation approval implied.

Baseline: branch `feature/auth`, commit `8cf959a73b42f541a87c1baba0da313092a418c0`; `git status --short` was empty. Scope is checked-in source, not verification of a deployed service. `.dev.vars` was neither read nor changed. No tests, migrations, builds, deployments, key operations or external service probes were executed. Existing tests were inspected, not newly certified as passing.

## A. Executive Summary

**Backend: CONDITIONAL GO. Direct ChatGPT connection using existing API keys: NO-GO.**

The Worker can reuse its existing opaque personal API token verifier and user identity, existing owner/editor relationship, card validation, revision guards and D1 mutation batches. It cannot safely expose the management API as MCP unchanged: current reads include public-to-authenticated-users SHARED decks, no third-party opt-in exists, and write keys can modify deck metadata. There is no implemented MCP endpoint, transport, tool or resource.

A dedicated MCP surface with current ACL checks and a default-deny deck setting is feasible without another OAuth provider for clients that can explicitly supply an API key. ChatGPT custom MCP connections cannot supply customer API keys, according to current official OpenAI guidance. OAuth with the existing Supabase provider is a possible alternative, conditional on resource-bound token issuance and a separately implemented OAuth/MCP authorization path. No additional provider is inherently required, but existing evidence does not establish that this Supabase project meets that contract.

## B. Verified Current Architecture

Evidence references below are relative to the baseline commit; line references identify entry points, not deployed behavior.

- Astro's Cloudflare server adapter routes `/api/*` through `src/pages/api/[...path].ts:1-8` into `handle` (`src/server/api.ts:15-23`). `handle` requests a first-primary D1 session. `/api/decks*` dispatches to bearer-only management; other app routes use opaque session cookies.
- `src/server/auth.ts:20-30` hashes bearer credentials with SHA-256 and queries active, unexpired `api_tokens`, returning `user_id` and `can_write`. Identity is database-derived, never an input user ID. Cookies use a separate hashed `auth_sessions` lookup (`auth.ts:39-65`) and Secure/HttpOnly/SameSite=Lax attributes (`:5-9`).
- Legacy shared-code login remains (`auth.ts:68-93`): knowledge of the shared access code and a username can establish that user's session. Google/email identity validation uses Supabase (`src/server/supabase-auth.ts:48-73`); `validateClaims` accepts app audience `authenticated`, then verified subjects map to `users.supabase_sub` (`:12-21`). It is not a resource-specific MCP verifier. QR delegates an app session; it is not MCP authorization.
- `migrations/0007_management_api.sql` binds token hashes to user foreign keys and a boolean `can_write`. `0010_personal_api_tokens.sql` adds IDs, names, timestamps and revocation; `0011_api_token_description.sql` adds descriptions. `tokens` (`src/server/tokens.ts:4-43`) lists only that user's metadata, generates 32 random bytes prefixed `fc_`, stores only a digest, returns the secret on creation, supports 30/90/180/365-day expiry, limits active keys to ten and rate-limits operations. Revocation is owner-qualified SQL (`:22-26`). There are no per-deck, audience or MCP scopes.
- Collaboration is membership only: `migrations/0009_deck_collaborators.sql:1-8` has no role column. Every collaborator is an editor; read-only collaborators do not currently exist. `editAccess`, `canEditDeck`, and permission DTOs (`src/server/permissions.ts:1-14`) encode owner/editor access and owner-only management/deck deletion.
- Visibility is PRIVATE/SHARED (`src/server/decks.ts:14-30`). SHARED grants reads to signed-in outsiders, including API clients. It is not evidence of anonymous access: both route families require authentication. `getDeck`, `listDecks`, `deckWithCards`, and `cardsForDeck` (`decks.ts:28-80`) explicitly include SHARED read access.
- Application deck/card editing is in `saveDeck`, `changeCard`, `applyImport` (`decks.ts:109,142,257`). Revision updates include current membership predicates and gate subsequent statements by a unique mutation marker within a batch (`:184-202,286-299`). Card IDs are constrained to their parent deck. Editing permission includes card deletion; deck deletion remains owner-only (`api.ts:107-113`).
- Management `manage` (`src/server/management.ts:146-215`) authenticates bearer, checks `can_write` for POST/PATCH, uses shared read helpers, checks editor access, requires If-Match for PATCH and Idempotency-Key for POST. Its method allowlist excludes DELETE (`:163-165`). It supports deck creation/update and card creation/update, not API card deletion. Deck updates protect visibility and chat instructions from collaborators (`:224-234`).
- `collaborators` (`src/server/collaborators.ts:5-26`) requires ownership, and add/remove SQL repeats the owner predicate. Its input `userId` identifies the removal target, not the caller.
- Reviewed AUTH-ARCHITECTURE, AUTH-SETUP, AUTH-IMPLEMENTATION-REPORT, MCP-OAUTH-COMPATIBILITY and MCP-IMPLEMENTATION-REPORT. The MCP reports describe a stopped OAuth proposal, not functioning routes. The proposed owner-only read grant design in those reports differs from this task's owner/collaborator intersection and must not be treated as the approved implementation. Source route inventory and dependencies contain no MCP server. No JSON-RPC initialize, tools/list, resources/list or protocol negotiation exists. Transport and protocol version are therefore unimplemented/unselected; references to the 2026-07-28 authorization specification in documentation are not an implemented protocol version.

### Actual request paths

| Operation | Current path and authorization |
|---|---|
| List decks | GET /api/home → cookie authenticate → listDecks; GET /api/decks → authenticateClient → listDecks; both include SHARED |
| Read deck/cards | GET /api/decks/:id[/cards[/:cardId]] → manage → getDeck/deckWithCards; GET /api/cards?deck= → cookie → getDeck/listCards |
| Create card | POST /api/decks/:id/cards → write token + current editor + idempotency → guarded batch/writeCards; app POST /api/card → changeCard |
| Update card | PATCH /api/decks/:id/cards/:cardId → write token + editor + revision → guarded batch; app POST /api/card → changeCard |
| Delete card | App POST /api/card with method delete → changeCard → editor/revision + deck-qualified delete; management DELETE rejected |
| Manage collaborators | GET/POST /api/collaborators → cookie; POST additionally same-origin/JSON checks → owner-only collaborators |
| Manage keys | GET/POST /api/tokens → cookie; POST same-origin/JSON → tokens with server-derived user ID |
| Delete deck | POST /api/deck/delete → cookie and same-origin → DELETE constrained by owner ID |

Authorization is partly centralized in permissions.ts but read visibility predicates are duplicated across deck queries and export (`api.ts:70`). Reuse validation and mutation primitives, with an explicit MCP policy context; forwarding requests to existing routes is insufficient.

## C. Requirements Coverage Matrix

| Requirement | Status | Existing implementation | Gap | Evidence |
|---|---|---|---|---|
| User-bound API credentials | READY | Hashed key resolves user_id | No caller userId needed | auth.ts:25-30; migration 0007 |
| Secure generation/storage/expiry | READY | 256-bit random, digest only, finite expiry | Hosted secret handling unverified | tokens.ts:32-43 |
| Revocation on subsequent authentication | READY | revoked_at and expires_at checked each call | In-flight request can finish | tokens.ts:22-26; auth.ts:28 |
| Fine-grained credential scope | PARTIAL | can_write boolean | No deck/resource/MCP scope | migration 0007; management.ts:165 |
| Owner/collaborator ACL reuse | PARTIAL | Membership gives editor rights | Need MCP-specific intersection | permissions.ts:2-14 |
| Read-only collaborator | MISSING | All collaborators edit | Optional role extension if required; do not equate SHARED readers with collaborators | migration 0009 |
| Third-party NONE/READ/READ_WRITE | MISSING | No deck field or policy | Add default NONE with constraint | Deck interface; migrations 0001-0012 |
| Exclude SHARED-only readers | PARTIAL | Owner/editor predicate exists | Current read helpers permit SHARED | decks.ts:28-80 |
| Effective write intersection | PARTIAL | editor ACL + key can_write | Add READ_WRITE gate; keep key ceiling | management.ts:165,188-195 |
| Direct deck/card ID protection | PARTIAL | Parent-qualified reads/mutations | Add opt-in predicate to every MCP query | decks.ts:60-80,184-202 |
| Deny collaborator/key/permission management via MCP | MISSING | Cookie management separated | MCP operation allowlist absent | api.ts:49,96,101; no MCP route |
| Deny whole-deck deletion | PARTIAL | REST management excludes DELETE | Must explicitly exclude in MCP | management.ts:163-165; api.ts:111 |
| Card delete for editors | PARTIAL | App implements guarded deletion | No bearer/MCP deletion surface | decks.ts:190-202 |
| MCP endpoint/transport/tools/resources | MISSING | Documentation proposal only | Implement negotiated MCP transport and allowlisted operations | route inventory; package.json |
| Supabase OAuth resource binding | UNVERIFIED | App JWT verifier accepts authenticated audience | No isolated issuance/refresh proof | supabase-auth.ts:55; MCP reports |
| Direct ChatGPT API-key auth | BLOCKED | Worker accepts fc_ bearer | ChatGPT cannot present custom keys | OpenAI auth guidance, section E |
| MCP policy regression tests | MISSING | Existing auth/API tests reusable | New intersection/race/negative tests | tests/api.test.ts; tests/auth.test.ts |

## D. Security Assessment

### Verified properties and limitations

**High — legacy shared-code identity impersonation capability.** `auth.ts:68-93` selects identity by username after a shared code check. A holder of the shared code can authenticate as another known username and use that session's token-management endpoints. This is an existing documented security floor, not a new MCP exploit or a demonstrated unauthorized incident. Strong per-user login alone does not remove it. Before broad third-party exposure, explicitly resolve or accept this credential-issuance risk; retiring/restricting legacy login requires a separate approved change.

**High — unsafe unchanged reuse of read authorization.** SHARED is an explicit read branch in `decks.ts:30,42,62,79`. Current behavior is intentional application sharing, not a verified IDOR. Exposing these queries as MCP without additional filtering would violate this task even for a READ-enabled deck when the caller has no membership. Apply membership AND opt-in in SQL, including card fetches, listing, counts and replay responses.

**High — broad key blast radius.** A write key remains usable directly against `/api/decks*` to create decks and modify owned deck settings; it has no audience/deck scope. MCP tool restrictions cannot narrow the credential at other endpoints. If the requirement means that a credential given to an MCP client must be incapable of broader REST privileges, unchanged keys do not meet it. Decide whether existing broad credentials are accepted with explicit disclosure or introduce optional narrower scope semantics. Do not expose the new opt-in setting through existing bearer deck PATCH: that would let the same credential grant itself access.

**Medium — revocation timing limitation.** Key validity is checked before the management mutation batch, not in its SQL predicate (`auth.ts:28`, `management.ts:256`). A concurrently revoked key can complete an already-authorized request. Current member-removal checks are stronger at mutation time (`editAccess` in the batch). For MCP, recheck credential, membership and deck permission inside the atomic write guard. Define read linearization: a response already fetched before revocation cannot be recalled. Avoid session-level cached rights; use primary reads on every call. Application logout-all does not revoke API keys (`auth.ts:114-119`); document separate key revocation.

No private-deck IDOR or current read-token write escalation was established by this inspection. SQL uses bound user/deck/card IDs and mutations repeat membership/revision predicates. This is source evidence, not a complete penetration test.

### Prospective risks requiring tests

- High: check-then-write races for the new opt-in setting if checked only before a batch. Include it in the guarded revision update and advance revision when it changes.
- Medium: accidental metadata disclosure through raw deck DTOs, aggregate counts, idempotency receipts or error differences. Current deck DTO includes chat instruction fields (`management.ts:39-42`); return only needed MCP fields with uniform unavailable responses.
- Medium: prompt injection in collaborator-authored questions, answers, metadata and deck instructions. Treat all as untrusted data, never authority to invoke tools, disclose keys or change policy. Tool annotations/UI approvals do not replace server ACLs.
- Medium: large listings/tool responses and abuse. Add pagination, bounded output/input and rate budgets; do not log Authorization headers or tool secrets.

## E. ChatGPT Compatibility — verified 2026-11-23

Three distinct layers:

1. **MCP standard:** the current [authorization specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) describes optional authorization and OAuth-based HTTP interoperability, resource-specific access tokens and discovery. A private client can technically send an opaque bearer credential; doing so does not implement the standard OAuth discovery/issuance flow or guarantee client support.
2. **Flashcards:** authenticates its own fc_ bearer keys, but has no MCP implementation. Supabase is used for application identity login, not required by the current personal-key verifier.
3. **ChatGPT custom connections:** [official OpenAI authentication guidance](https://developers.openai.com/plugins/build/auth) expressly excludes customer API keys. The [custom MCP setup guide](https://developers.openai.com/api/docs/guides/custom-mcp-server) lists OAuth, no authentication, and OAuth-or-no-authentication. Anonymous mode cannot satisfy per-user private access. Static OAuth client credentials identify an OAuth application; they are not a field for a user's Flashcards key. Thus direct ChatGPT integration under the exact proposed authentication method is BLOCKED, even after backend implementation.

Viable alternatives: (a) use an API-key-capable MCP client; (b) build a separate application using the [Responses API remote MCP integration](https://developers.openai.com/api/docs/guides/tools-connectors-mcp), whose caller controls authentication parameters, subject to testing opaque-key behavior; this is not a ChatGPT custom connection; (c) retain Supabase as the sole OAuth provider if it proves the necessary resource-bound OAuth contract. An OAuth adapter would be additional security-sensitive implementation, not merely forwarding a pasted key. Do not put keys in URLs or expose unauthenticated tools accepting userId/key arguments as a workaround.

The old RFC 8707 limitation is irrelevant to a private fc_-key-only path, since no Supabase OAuth token is issued there. It remains relevant if choosing OAuth for ChatGPT. Prior MCP reports explicitly lack project-specific authorization/exchange/refresh evidence. This assessment did not repeat live provider tests and cannot declare the issue fixed or universally impossible. A custom audience hook alone does not establish resource validation. Existing app audience authenticated must not be accepted as an MCP resource token.

## F. Minimal Change Proposal — NOT IMPLEMENTED

- Database: one deck column, e.g. third_party_access TEXT NOT NULL DEFAULT 'NONE' with CHECK restricting the three values. Existing decks remain NONE. No second ACL/grants system needed for the API-key design. Do not add collaborator roles unless read-only collaboration itself becomes required.
- Backend authorization: preserve browser sharing semantics. Introduce a small explicit MCP policy helper/context reusing ownership/membership predicates. Reads require membership and READ/READ_WRITE. Writes additionally require can_write and READ_WRITE. Resolve user only from authenticated credentials. Bind card ID to authorized parent in each query; use primary reads.
- Atomic writes: reuse revision/mutation batch design and card validators, adding current key validity, membership and opt-in to the SQL guard. Apply the same policy to idempotent replays. Decide expected in-flight read/revocation behavior.
- UI: owner-only “Allow Third-Party Access” with NONE/READ/READ_WRITE choices and default NONE. Explain editing collaborators can delete cards when READ_WRITE is selected. Protect field updates server-side with owner-session authentication and revision checks. Reject it in bearer management and MCP payloads.
- MCP: implement a dedicated HTTPS Streamable HTTP endpoint with explicit protocol negotiation, initialize, tools/list and bounded tool calls. Select a supported version during implementation. Minimal tools: list/read decks and cards, create/update/delete card. No arbitrary REST proxy, SQL, deck deletion, collaborator/key management, opt-in changes or import replacement. Resources are optional, not required for this design.
- Credential decision: respect can_write as an additional ceiling. If strict least privilege for the handed-over key is required, add a narrow credential scope option and enforce it at all REST consumers; do not silently reinterpret all existing keys. No new provider is needed for key-capable clients.
- Tests: complete NONE/READ/READ_WRITE × owner/editor/outsider × read/write key matrix; shared nonmember denial; missing/malformed/expired/revoked keys; forged userId; foreign card ID; collaborator removal; concurrent downgrade/removal/key revocation; atomic rollback; revision conflict; replay after permission loss; prohibited operations including opt-in patch; default NONE for old/new/imported decks; output pagination/limits and secret-free errors. Test MCP protocol errors and tool argument validation separately from ACL behavior.

Existing test evidence: `tests/api.test.ts:67` exercises scoped management clients; the test named “enforces collaborator permissions through browser and scoped API tokens without resetting progress” checks foreign IDs, owner restrictions, stale/concurrent edits and removal. Its “personal API tokens” suite checks ownership, one-time secrets and revocation. `tests/auth.test.ts:59-202` exercises app identity/session/provider mocks and QR races. These do not prove MCP functionality. No external-service or persistent-data test was run for this assessment.

## G. Ordered Dependencies and Decisions

1. Owner approves the assessment and chooses target client. Direct ChatGPT plus unchanged API-key authentication is incompatible; settle this before transport work.
2. Decide broad-key acceptance, legacy-login security prerequisite, and whether read-only collaborator roles are truly required. Current mapping is owner/editor; token can_write=false is a client ceiling, not a collaborator role.
3. Design/review the single-column migration and owner-only setting API/UI. No migration execution is authorized here.
4. Implement/test shared membership predicates with explicit MCP context, including SQL guards and minimal DTOs. Preserve current app sharing behavior.
5. Implement the minimal MCP adapter and card-delete authorization, then local isolated protocol/ACL/race tests. Do not create parallel collaborators or generic routing capabilities.
6. Only if ChatGPT is selected: separately prove Supabase resource binding, define OAuth consent/identity mapping and revocation, and implement discovery/verifier. This is an additional prerequisite, not part of key reuse. If unavailable, reassess the design instead of weakening audience validation.
7. After separate owner authorization, perform isolated HTTPS/client acceptance and operational verification. Deployment, production data and real credentials remain outside this assessment.

## H. Final Recommendation

**Backend: CONDITIONAL GO** after default-deny opt-in, MCP-specific SQL authorization, restrictive operation surface, credential-risk decision and tests. Existing collaboration and API-key components provide a reasonable base; no wholesale rewrite or extra provider is required for capable clients.

**Direct ChatGPT with existing API keys: NO-GO** under verified current client constraints. **OAuth-based ChatGPT alternative: CONDITIONAL GO for further investigation only**, pending Supabase resource-binding evidence and implementation. Neither prior documentation nor this review establishes a working connection.

Only this report is authorized to change. Implementation requires explicit owner approval of the assessment and proposed changes.
