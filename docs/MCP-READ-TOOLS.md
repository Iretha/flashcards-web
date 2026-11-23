# MCP read tools

Exactly five tools: ping, list_decks, get_deck, search_cards, get_card.
Authentication, transport, endpoint opt-in, and the 16 KiB request limit are unchanged.

Deck titles/descriptions are stored, untranslated metadata: resolved_language is
null and fallback_used is false. Deck language fields describe card configuration.
Card output defaults/falls back to the card's own primary_language. `all` returns
keyed translations (question-only for search), null resolution, and false fallback.

## Search

Search covers question and answer across every translation. card_search is an FTS5
virtual table with one row per translation, separate question/answer columns, and
`trigram case_sensitive 1`. The shared normalizer applies NFC, Unicode uppercase,
Unicode lowercase, then NFC to content and query. This is locale-independent case
mapping, not the full Unicode CaseFolding algorithm.

Normalized queries of at least three Unicode characters use a parameterized,
quoted MATCH phrase (embedded quotes doubled). Short queries and strings containing
NUL use SQL instr() over normalized fields. No JavaScript card scanning, LIKE
wildcards, semantic search, or arbitrary scan ceiling. Fields/translations are never
concatenated. FTS candidates feed an SQL IN subquery, so cards are deduplicated
before ordering/limiting. SQL applies membership and third-party opt-in predicates.

Search orders by global card ID; deck enumeration uses (position,id). At most ten
cards are returned with an eleventh ID for lookahead. Signed versioned cursors bind
to identity, credential, tool, query, language, and deck scope. Pagination is
best-effort: concurrent data changes can affect continuation. Authorization is
rechecked during matching and each content read. A disappearing/inaccessible
candidate fails the page rather than silently returning a partial result.

A search page uses two epoch reads, one readiness query, one candidate query, and at most ten
content reads (bounded independently of scanned collection size). No-match uses four
read queries. Enumeration does not need the readiness check. Short searches scan
normalized text; readiness checks and broad-match candidate sets can still be
costly. FTS stores normalized text plus trigram postings and adds write/storage
cost. Card-ID deletion predicates are not themselves FTS-indexed.

## Atomic writes and backfill

Migration 0015_card_search_fts creates card_search, card_search_ready, and triggers.
It does not alter existing card content, translations, or deck languages. The
obsolete legacy-primary and unfinished JSON-projection migration files are removed.
Only use this new 0015 when neither discarded local draft was previously applied;
a database with an applied draft needs a separately reviewed upgrade path.

Browser, management API, translation and Markdown-import writes share writeCards.
The guarded card upsert and all FTS replacement/ready-marker statements execute in
one D1 batch. Source and deck mutation guards prevent stale writes from modifying
the index. Translation-update triggers remove old FTS rows/markers; shared writes
repopulate them in the same transaction. Raw SQL translation edits leave the card
pending, never falsely searchable with stale text. Deletion triggers remove FTS
rows, including cascades from deck deletion; ready markers have cascading FKs.
Reordering and primary-language designation do not change translations.

Apply migrations locally through the existing migration mechanism, stop wrangler
dev, then run with Node >=24:

```
node scripts/backfill-card-search.mjs <local-persist-directory> <database-id>
```

This local-only command opens the existing Miniflare storage under v3/d1. Use the
same database ID and persistence directory as Wrangler. It does not connect to
Cloudflare. Backfill uses the shared normalizer, source compare-and-swap, atomic
per-card batches, and restartable ready markers. It preserves exact source JSON,
content, timestamps and revisions. The final pending count must be zero; rerun if
concurrent edits require another pass. Search fails with SEARCH_NOT_READY whenever
any authorized card in scope is pending, rather than returning incomplete results.
Future remote rollout/backfill requires its own approved operational procedure.
FTS is derived data; backup/restore must account for D1 virtual-table limitations.

## Result limits

JSON.stringify(CallToolResult), encoded as UTF-8, is capped at 1,048,576 bytes,
including structuredContent, text duplication and escaping. The JSON-RPC envelope
is outside this boundary. Oversize returns RESULT_TOO_LARGE; content is never
truncated and records are never skipped. INVALID_ARGUMENTS and UNAVAILABLE are
safe tool errors. Missing and unauthorized resources remain indistinguishable.

## Consistency and recovery (0016)

Search reads the monotonic global epoch before readiness, matching and content
reads, then checks epoch/version/mode again before success. Every supported card,
deck, membership, readiness, mapping/index or rebuild change advances the epoch.
SEARCH_CHANGED means retry the whole request; SEARCH_NOT_READY means backfill or
recovery is required. No successful page can span an observed index invalidation.
This uses the transport's first-primary, sequentially consistent D1 session;
sequential consistency is not assumed to be a shared snapshot. No read-batch
snapshot assumption is required. Individual SQLite statements read consistent
state; monotonically ordered reads plus unchanged epoch bound the result to one
stable database state. Changes after the final epoch read are outside that page's
linearization point. Pagination between requests remains best-effort.

The epoch is deliberately global: unrelated writes may cause conservative retries.
Continuous writes can prevent full verification/activation; quiesce writers for
operator verification. Direct administrative edits to FTS shadow/index tables are
unsupported during serving; gate search and run verification/rebuild afterward.

0016 keeps 0015 unchanged, adds card_search_rows with UNIQUE(card_id,language),
and drives FTS inserts/deletes by integer rowid through mapping triggers. Deletes
seek the mapping's card index and FTS rowid; they no longer scan all FTS card IDs.
Normalized text is also held in the mapping for verification, adding storage cost.
Version-1 markers and global format version prevent use of old readiness state.
verifySearch compares actual source normalization with mapping and FTS content,
checks orphans/markers/internal integrity, and uses epoch CAS activation. Failure
blocks search. Explicit rebuild is atomic at initiation, restartable per card,
and keeps search gated until complete verification succeeds.

See MCP-FTS-ROLLOUT.md for migration ledger checks, transition, recovery and rollback.
The production runner and execution remain a separate owner-approved operation.
