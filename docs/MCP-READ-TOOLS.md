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
revocation is checked on subsequent requests; it does not cancel in-flight work.

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

See [migration, deployment and canonical SQL repair](MCP-FTS-ROLLOUT.md).
