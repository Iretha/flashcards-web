# Flashcards Management API

The API works with the same decks and cards as the browser and Markdown importer. Requests and responses use JSON. Use HTTPS and send the API credential in `Authorization: Bearer <token>`. For writes, send `Content-Type: application/json`. Request bodies may be up to 1,000,000 UTF-8 bytes.

## Access and token provisioning

A token belongs to one existing `users.id`. Read scope allows access to the user's decks and shared decks. Write scope includes read and permits creating decks and editing owned decks or decks with active collaborator membership. Private decks belonging to others return 404. Attempts to modify a visible shared deck without edit access return 403.

An operator with D1 access issues a separate token per client. Generate 32 cryptographically random bytes and encode them as lowercase hexadecimal with the `fc_` prefix. Hash the **full token including the prefix** with SHA-256 and store the lowercase hexadecimal digest. For example, run this in a private local terminal and transfer the token to the client's secret store.

```sh
node -e "const c=require('node:crypto'); const token='fc_'+c.randomBytes(32).toString('hex'); console.log({token, hash:c.createHash('sha256').update(token).digest('hex')})"
```

Apply migration `0007_management_api.sql` locally with `npm run db:local`. Execute the following with bound parameters or equivalent operator tooling. Use `can_write = 0` for read scope or `1` for read/write. `expires_at` is a Unix timestamp in milliseconds.

```sql
INSERT INTO api_tokens (token_hash, user_id, can_write, expires_at)
VALUES (?, ?, ?, ?);

DELETE FROM api_tokens WHERE token_hash = ?;
```

Issue a new token and revoke the old one to rotate a credential. The management API uses bearer authentication only. Browser sessions and the browser access code continue to serve the existing browser routes. Provisioning supports self-service through Settings and existing operator tooling.

## Endpoints

| Method | Path | Request | Success |
| --- | --- | --- | --- |
| GET | `/api/decks` | — | 200 `{data: Deck[]}` |
| POST | `/api/decks` | Deck fields with required `title` | 201 `{data: Deck}` |
| GET | `/api/decks/{id}` | — | 200 `{data: Deck}` |
| PATCH | `/api/decks/{id}` | Partial deck fields | 200 `{data: Deck}` |
| GET | `/api/decks/{id}/cards` | Optional `q` of up to 200 characters | 200 `{data: Card[], revision: number}` |
| POST | `/api/decks/{id}/cards` | Card fields with at least one complete translation | 201 `{data: Card}` |
| GET | `/api/decks/{id}/cards/{cardId}` | — | 200 `{data: Card}` |
| PATCH | `/api/decks/{id}/cards/{cardId}` | Partial card fields | 200 `{data: Card}` |

IDs in paths are the server-generated resource IDs. The list of cards uses deck order, and `q` matches case-insensitive substrings of IDs, import keys and text in any translation, including supplemental sections. Lists return all matches.

### Deck fields

| Field | Type and rules |
| --- | --- |
| `title` | Nonempty string, up to 160 characters |
| `description` | String, up to 2,000 characters, defaults to empty |
| `visibility` | `PRIVATE` or `SHARED`, defaults to `PRIVATE` |
| `source_key` | Optional nonempty string up to 160 characters, unique per owner, or null. Maps to Markdown `deckId`. |
| `chatgpt_default` | `universal` or `legacy`, defaults to `universal` |
| `chatgpt_en`, `chatgpt_bg` | Optional nonempty strings up to 10,000 characters, or null to clear |
| `id`, `owned`, `revision` | Read-only string, boolean and integer |
| `permissions` | Read-only calculated `can_read`, `can_edit`, `can_manage` booleans |

### Card fields

| Field | Type and rules |
| --- | --- |
| `translations` | Object keyed by canonical BCP 47 codes configured in the deck supported languages. The deck primary language must be present. |
| `primary_language` | Canonical BCP 47 code with a translation. Uses the configured deck primary language when available. |
| `import_key` | Optional identifier matching `[A-Za-z0-9][A-Za-z0-9_-]{0,99}`, unique within the deck, or null |
| `difficulty`, `interview_priority` | Optional integers from 1 to 5 or null |
| `metadata` | Optional v3 metadata object or null |
| `id`, `deck_id`, `position`, `revision` | Read-only resource IDs, order and deck revision |

Each new translation requires nonempty Markdown `question` (up to 2,000 characters). `answer` is a string of up to 20,000 characters; on creation it may be omitted and defaults to `""`. Empty or whitespace-only supplied answers normalize to `""`. During PATCH, omitting `answer` preserves the existing answer; supplying `answer: ""` clears it. Optional Markdown `questionDetails` allows up to 20,000 characters. PATCH merges fields within each supplied language. An empty string clears an optional section. Questions follow the importer's normalized uniqueness checks, with the D1 primary-question constraint also enforced.

A supplied metadata object uses the [current v4 contract](FLASHCARDS-IMPORT-TEMPLATE.md). It contains `cardType` (`question` or `coding_task`), nonempty `topic`, `provenance` and optional `answerReferences`. Provenance has `type` (`sourced`, `mixed` or `generated`) and `sources`; sourced and mixed cards require at least one source. Each source has `sourceName` and `sourceUrl` and may include `company`, `location`, `interviewLocation`, `publishedAt` (YYYY-MM-DD) or `occurrenceId`. The count equals the number of distinct documented occurrence IDs. References each contain `title` and `url`. URLs use HTTP(S) without credentials. Each language of a coding task requires `questionDetails`.

For original, unsourced material, omit `metadata` or set it to null. For content based on a real source without interview evidence, omit occurrence IDs. The same card ID and study progress are preserved by PATCH. A Markdown import can match API-created deck and card records by `source_key` and `import_key`, subject to its existing rules for mixing legacy and v3 cards.

## Retries and concurrent edits

- Send a unique `Idempotency-Key` on every POST. Keys use 1–128 ASCII letters, digits, underscores or hyphens. Retrying the same route with the same exact JSON bytes returns the same resource ID with its current data, HTTP 200 and `Idempotency-Replayed: true`. Reusing a key with a different body returns 409. Keys are retained for the user and route, including after deletion, when an exact replay returns 404. A successful first POST returns HTTP 201 and `Location`; a replay also returns `Location`.
- Send the quoted revision from the resource's `ETag` header as `If-Match` on PATCH. The revision covers the entire deck, including cards. If it changed, the API returns 412. Fetch the latest resource, reconcile edits and retry. Missing `If-Match` returns 428.
- If another write changes the deck during card creation, the API can return 409. For a revision conflict, retry creation with the same key and body.
- Resource writes, deck revision updates and create receipts use atomic D1 batches.

## Examples

```sh
curl -i "$BASE/api/decks" \
  -H "Authorization: Bearer $FLASHCARDS_TOKEN" \
  -H 'Content-Type: application/json' -H 'Idempotency-Key: geography-001' \
  -d '{"title":"Geography","description":"European rivers"}'

curl -i "$BASE/api/decks/$DECK_ID/cards" \
  -H "Authorization: Bearer $FLASHCARDS_TOKEN" \
  -H 'Content-Type: application/json' -H 'Idempotency-Key: danube-001' \
  -d '{"import_key":"danube","difficulty":2,"translations":{"en":{"question":"Where does the Danube end?","answer":"The Black Sea."}}}'

curl -i -X PATCH "$BASE/api/decks/$DECK_ID/cards/$CARD_ID" \
  -H "Authorization: Bearer $FLASHCARDS_TOKEN" \
  -H 'Content-Type: application/json' -H 'If-Match: "1"' \
  -d '{"translations":{"en":{"example":"The Danube Delta."}}}'
```

The deck creation example returns HTTP 201 with `Location: /api/decks/{id}`, `ETag: "0"` and a body such as the following.

```json
{"data":{"id":"8d2b61d6-e9a2-433d-bfdb-b0b604b9ff5b","title":"Geography","description":"European rivers","visibility":"PRIVATE","source_key":null,"chatgpt_default":"universal","chatgpt_en":null,"chatgpt_bg":null,"revision":0,"owned":true}}
```

An example validation response is HTTP 400 with the following body.

```json
{"error":{"code":"validation_error","message":"Unsupported field.","details":[{"field":"translations.invalid_code","message":"Unsupported field."}]}}
```

Other error codes are `unauthorized` (401), `forbidden` (403), `not_found` (404), `method_not_allowed` (405), `conflict` (409), `revision_mismatch` (412), `payload_too_large` (413), `unsupported_media_type` (415), `precondition_required` (428) and `internal_error` (500).

## Future MCP adapter

Expose list, get, create and patch operations as tools with equivalent input schemas. Use OAuth authorization code with PKCE for interactive MCP clients, publish protected resource metadata and verify token issuer, audience, expiry and scopes. Resolve the verified OAuth identity to a Flashcards user and obtain that user's scoped Flashcards credential from a server-side secret store. Send that credential to this API. Keep MCP access tokens scoped to the MCP resource. Preserve idempotency keys across retries and surface revision conflicts for reconciliation. [MCP TypeScript SDK authorization guide](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization)


## Deck collaborators

Bearer tokens retain their existing user scope, expiry, write flag and compatibility with operator-managed provisioning. Read operations include private decks where that user is a collaborator. Writes require both `can_write` and current owner/collaborator membership; public visibility grants no write permission. Collaborators may update deck content and metadata but cannot change visibility. Existing supported methods, If-Match revision checks, idempotency keys and error envelopes remain unchanged. The Management API does not add deletion or collaborator administration methods.

Browser collaborator administration uses the existing session cookie and same-origin JSON POST rules:

- `GET /api/collaborators?deck={id}` returns an array of `{id, username}` for the owner only.
- `POST /api/collaborators` with `{deck, method: "add", username}` adds an existing normalized username immediately.
- `POST /api/collaborators` with `{deck, method: "remove", userId}` removes membership; repeated removal succeeds.
- Both POST operations return the updated collaborator array. Unknown usernames or inaccessible decks return 404, visible decks requested by non-owners return 403, owner self-addition returns 400, duplicate addition returns 409, missing authentication returns 401.

Collaborator removal preserves cards and progress. Subsequent mutations recheck membership in SQL, including requests made with existing bearer tokens. A write already committed before removal is retained. Non-destructive browser imports require an explicit target for collaborator decks; automatic source-key matching remains scoped to owned decks. Replacement imports and whole-deck deletion remain owner-only. Visibility cannot be changed through collaborator imports.

Migration `0009_deck_collaborators.sql` is additive and retains existing `owner_id` values, card IDs and study progress. Apply it through the normal migration workflow before serving the updated application. No ownership backfill is needed because the original schema already requires a user foreign key.


## Self-service tokens

Open the Settings icon in the toolbar and select API Tokens outside study mode. Name the token (1?80 characters), select Read only (default) or Read & Write, and an expiration of 30, 90 (default), 180 or 365 days. Copy the token immediately: it cannot be retrieved again. Keep it in a secret manager, never publish it or put it in URLs. Send `Authorization: Bearer <token>` over HTTPS. Revoke compromised tokens immediately.

Browser-session endpoints (bearer tokens cannot manage tokens):
- GET /api/tokens returns metadata only, never hashes or plaintext.
- POST /api/tokens accepts {name, can_write?: boolean, days?: number}; returns 201 {id, token} once.
- POST /api/tokens accepts {action: "revoke", id}; returns 200 {}; repeated revocation succeeds; another user's ID returns 404.

Mutations require same Origin and application/json. Unsupported fields including user IDs return 400; missing session 401; cross-origin 403; wrong content type 415; ten-active-token limit 409; over 60 mutation attempts per user per hour 429. Responses use no-store. The active limit includes operator tokens and is enforced by one atomic conditional INSERT. Last-used tracking is omitted to avoid authentication writes.

Migration 0010 preserves operator credentials and expiration. Missing historical metadata remains null; legacy tokens can be revoked by their owner in Settings. Personal token revocation and expiration are checked on each subsequent authentication. Write scope intersects current owner/collaborator permissions.

MCP uses dedicated personal bearer URLs with separate credential purpose. No MCP OAuth flow is implemented; real ChatGPT connectivity remains unverified. See [MCP contracts](MCP-READ-TOOLS.md).

Token descriptions are optional text of up to 500 characters, accepted as `description` at creation and returned in listings. Update your own token using POST /api/tokens with `{action: "describe", id, description}`. The same session, CSRF and rate limits apply. Migration 0011 adds a nullable description column without changing credentials. Legacy tokens without descriptions display "Used for curl requests and other testing purposes."; this label is editable and is not usage telemetry.

Only deck owners can change `chatgpt_default`, `chatgpt_en` or `chatgpt_bg`. Browser saves and Management API patches from collaborators containing these fields return 403. Collaborators may read instructions and edit other permitted deck content.


## Access filters and calculated permissions

`GET /api/decks` accepts optional `access`: `all` (default) returns all accessible decks; `owned` returns owned decks; `editable` returns owned and active collaborator decks; `shared` returns accessible decks owned by others, including private collaborator decks. Invalid values return the existing 400 validation error. Ordering remains title, then ID.

Every Management API deck response includes server-calculated `permissions: {can_read, can_edit, can_manage}`. Read is true for accessible decks, edit is true for owners or active collaborators, and manage is true only for owners. These describe deck membership, independently of token scope: a read-only token may receive `can_edit: true` but cannot write. Clients cannot supply permissions. Visibility and AI instructions remain owner-only.

Answerless cards retain their IDs and study progress when updated. The study answer panel displays a visual em dash and existing external AI links still use the question. No generated answer is saved automatically.

MCP create_card and update_card use shared canonical mutation logic, not a REST proxy. create_card supports an optional idempotency_key. Separate tool calls have partial-success semantics: a failed call does not roll back earlier successful cards. No batch upload tool or MCP OAuth flow is implemented. See [current tool contracts](MCP-READ-TOOLS.md).


V4 breaking contract: translation fields are question/answer/questionDetails only. Metadata input must omit occurrenceCount; response count is derived. Generated input cannot claim occurrences. Text search covers question, questionDetails and answer; questionDetails is included in the text index. Root card question/answer and explanation counters are removed. Export version 2 retains canonical content, progress and historical events; it is not a supported restore format.


Native search uses SQL triggers and case-insensitive FTS5 trigram indexing for question, questionDetails and answer in every translation. Free-text queries require three Unicode code points after trimming; empty queries list cards, and exact card IDs/import keys remain available independently. Native Unicode folding does not normalize composed/decomposed forms or expand sharp S. Migration 0020 reconstructs the index without application maintenance. See [deployment and SQL repair](MCP-FTS-ROLLOUT.md).
