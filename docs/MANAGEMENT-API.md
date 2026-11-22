# Flashcards Management API

The API works with the same decks and cards as the browser and Markdown importer. Requests and responses use JSON. Use HTTPS and send the API credential in `Authorization: Bearer <token>`. For writes, send `Content-Type: application/json`. Request bodies may be up to 1,000,000 UTF-8 bytes.

## Access and token provisioning

A token belongs to one existing `users.id`. Read scope allows access to the user's decks and shared decks. Write scope includes read and permits creating decks and editing the user's own decks and cards. Private decks belonging to others return 404. Attempts to modify a visible shared deck owned by another user return 403.

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

Issue a new token and revoke the old one to rotate a credential. The management API uses bearer authentication only. Browser sessions and the browser access code continue to serve the existing browser routes. Provisioning is operator-managed.

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

### Card fields

| Field | Type and rules |
| --- | --- |
| `translations` | Object keyed by `bg` or `en`. One or both languages may be present. |
| `primary_language` | `bg` or `en`. Must have a translation. On create, defaults to BG when supplied and EN otherwise. |
| `import_key` | Optional identifier matching `[A-Za-z0-9][A-Za-z0-9_-]{0,99}`, unique within the deck, or null |
| `difficulty`, `interview_priority` | Optional integers from 1 to 5 or null |
| `metadata` | Optional v3 metadata object or null |
| `id`, `deck_id`, `position`, `revision` | Read-only resource IDs, order and deck revision |

Each new translation requires nonempty Markdown `question` (up to 2,000 characters) and `answer` (up to 20,000). Optional Markdown `questionDetails`, `simple`, `example` and `details` each allow up to 20,000 characters. PATCH merges fields within each supplied language. An empty string clears an optional section. Questions follow the importer's normalized uniqueness checks, with the D1 primary-question constraint also enforced.

A supplied metadata object uses the [existing v3 contract](FLASHCARDS-IMPORT-TEMPLATE.md). It contains `cardType` (`question` or `coding_task`), nonempty `topic`, nonnegative integer `occurrenceCount`, `provenance` and optional `answerReferences`. Provenance has `type` (`sourced`, `mixed` or `generated`) and `sources`; sourced and mixed cards require at least one source. Each source has `sourceName` and `sourceUrl` and may include `company`, `location`, `interviewLocation`, `publishedAt` (YYYY-MM-DD) or `occurrenceId`. The count equals the number of distinct documented occurrence IDs. References each contain `title` and `url`. URLs use HTTP(S) without credentials. Each language of a coding task requires `questionDetails`.

For original, unsourced material, omit `metadata` or set it to null. For content based on a real source without interview evidence, use `occurrenceCount: 0` and omit occurrence IDs. The same card ID and study progress are preserved by PATCH. A Markdown import can match API-created deck and card records by `source_key` and `import_key`, subject to its existing rules for mixing legacy and v3 cards.

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
{"error":{"code":"validation_error","message":"Unsupported field.","details":[{"field":"translations.fr","message":"Unsupported field."}]}}
```

Other error codes are `unauthorized` (401), `forbidden` (403), `not_found` (404), `method_not_allowed` (405), `conflict` (409), `revision_mismatch` (412), `payload_too_large` (413), `unsupported_media_type` (415), `precondition_required` (428) and `internal_error` (500).

## Future MCP adapter

Expose list, get, create and patch operations as tools with equivalent input schemas. Use OAuth authorization code with PKCE for interactive MCP clients, publish protected resource metadata and verify token issuer, audience, expiry and scopes. Resolve the verified OAuth identity to a Flashcards user and obtain that user's scoped Flashcards credential from a server-side secret store. Send that credential to this API. Keep MCP access tokens scoped to the MCP resource. Preserve idempotency keys across retries and surface revision conflicts for reconciliation. [MCP TypeScript SDK authorization guide](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization)
