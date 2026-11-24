# MCP tools

The server registers seven tools: ping, list_decks, get_deck, search_cards,
get_card, create_card and update_card. The first five are read-only.

## Authentication and authorization

PERSONAL_MCP_URLS_ENABLED=true enables the HTTPS /mcp/<secret> endpoint.
Dedicated unexpired, unrevoked MCP-purpose credentials identify the user; Management
API credentials are not accepted. POST requests use stateless MCP JSON transport,
with a 16 KiB body limit. Query parameters and foreign Origin headers are rejected;
clients may omit Origin. Keep credential-bearing paths out of logs.
Deck reads require ownership or collaboration and third_party_access READ or
READ_WRITE. SHARED visibility alone grants no MCP access. Writes require
READ_WRITE and membership, checked again in guarded mutation SQL. Credential
purpose, expiry and revocation are validated at request admission using primary
D1 reads. Mutation SQL rechecks membership and third-party access with applicable
deck revision guards, not credential validity. Revocation or expiry blocks subsequent
admission but does not necessarily cancel already admitted in-flight operations.
This is a known implementation gap against the owner-approved
[atomic credential revalidation requirement](ALLOW-THIRD-PARTY-ACCESS.md#mcp-credential-validity).
That section defines the current timing limitations and authoritative security
contract; remediation is pending a separate implementation task.

## Requests and responses

| Tool | Arguments | Result |
| --- | --- | --- |
| ping | none | Connectivity text |
| list_decks | optional language, limit (1-50, default 20), after | items and next_after |
| get_deck | deck_id; optional language | item including revision |
| search_cards | query or deck_id; optional language, after | Up to 10 question summaries and next_after |
| get_card | card_id; optional language | Full canonical card item, metadata and ratings |
| create_card | deck_id, question; optional answer, language, idempotency_key | card_id and status: created |
| update_card | card_id; optional answer, language | card_id, language, resulting answer and status: updated |

Read responses contain structuredContent and matching JSON text. Tool failures
return isError with an error code. Cursor arguments are signed and scope-bound.
Cursor `after` has length 1 to 2,048 JavaScript string units when supplied (null is
also accepted). Trimmed `query` is at most 200 JavaScript string units and cannot
contain NUL. These maximum lengths differ from the three-Unicode-code-point
minimum for nonempty search text. Invalid arguments return `INVALID_ARGUMENTS`.
The serialized tool result, including both structuredContent and matching JSON
text, is limited to 1,048,576 UTF-8 bytes. Oversized results return
`RESULT_TOO_LARGE`; content is not silently truncated or omitted.

Deck titles/descriptions are untranslated metadata: resolved_language is null and
fallback_used is false. Card language defaults/falls back to its own primary_language.
With language=all, search_cards returns questions keyed by language, not answers or
details; get_card returns translations with question, answer and optional
questionDetails. Both use null resolution and false fallback for all.

create_card requires primary-language content; missing/empty answer creates an empty
answer. Its optional idempotency_key replays the same canonical request and conflicts
with different content. update_card changes only an existing translation's answer;
omission preserves it and empty clears it. Omitted language selects the card primary
language for update and deck primary language for creation. No batch tool exists.

## Search

Search covers question, questionDetails and answer across every translation using native case-insensitive FTS5 trigram matching. Nonempty free text requires at least three Unicode code points after trimming; empty queries retain listing behavior. Quotes are escaped as literal phrases. Native Unicode folding does not normalize composed/decomposed forms or expand sharp S; Turkish I follows SQLite behavior. get_card accepts short exact card identifiers independently.

Results retain authorization, translation selection, deduplication, signed pagination cursors and existing keyset ordering. The global SQL-maintained epoch protects candidate selection and materialization; SEARCH_CHANGED requires retrying the request. Pagination across requests remains best-effort. SQL triggers maintain derived rows in the same canonical write transaction. No application indexing or activation step exists.

See [migration, deployment and canonical SQL repair](SEARCH-ARCHITECTURE.md).

## Create idempotency

Optional keys have length 1 to 200 JavaScript string units (UTF-16 code units),
without trimming, and are scoped to authenticated user and create_card.
The canonical payload is deck ID, trimmed question, answer (omitted equals empty)
and language (omitted differs from explicit). Different payloads return CONFLICT.
Receipts, canonical writes and trigger-maintained search commit in one D1 batch;
competing requests resolve through the unique receipt key and revision guards.
Retries recheck current deck write permission before returning the stored card ID.

Receipts survive card/deck deletion indefinitely to prevent delayed retries from
recreating content. Do not age them out. Cleanup requires permanent principal
retirement and revocation of all its credentials; use bounded batches only after
separate authorization. Payloads contain card text and need the same protection.

## Credentials and external compatibility

Create dedicated MCP URLs through Settings, copy the secret once and revoke unused
credentials. Management tokens are a separate purpose. Requests have a per-user
budget of 120/minute. Keep bearer paths out of invocation logs, traces, proxy
analytics, screenshots and reports; query redaction does not protect path secrets.
See [external acceptance](MCP-EXTERNAL-ACCEPTANCE.md).

No MCP OAuth authorization server, consent flow, REST proxy or batch upload tool is
implemented. Supabase login tokens are identity proofs for application sessions,
not MCP resource credentials. An OAuth implementation would need separately approved
resource/audience, consent, refresh/revocation and real-client verification; changing
a generic token audience alone would not establish safe resource binding.
Authenticated ChatGPT/Claude connector interoperability remains unverified.
