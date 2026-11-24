# Native search and deployment

Canonical content lives in cards.translations. Migration 0020 creates minimal card_search_keys (integer id, card_id foreign key, language, unique card/language) and card_search using FTS5 trigram case_sensitive 0. SQL triggers index every translation, combine question and nonempty questionDetails with a newline, and keep answer separate. Ordinary application writes perform no indexing calls. Unrelated card updates do not rebuild documents.

Free text requires three Unicode code points after trimming. Empty or omitted queries retain listing behavior. Phrases are escaped as literal FTS phrases, including quotes and punctuation; no wildcard syntax is accepted. Native SQLite Unicode folding applies: canonical composition is not normalized, sharp S does not equal ss, and Turkish I behavior differs from JavaScript normalization. Import duplicate normalization remains independent. Management exact card ID/import-key lookup and MCP get_card remain available for short keys. Search retains authorization, deduplication and keyset ordering. The global epoch protects multi-statement MCP reads against card, deck and collaborator changes; SEARCH_CHANGED requires retrying the whole request.

## Commands

Ordinary deployment: `npm run deploy` builds, applies pending migrations and publishes with `--keep-vars`. Existing Wrangler configuration, bindings and authentication remain unchanged. This flag alone does not preserve every configuration change.

Local migration: `npm run db:migrate:local`

Remote migration: `npm run db:migrate:remote`

Local repair: `npx wrangler d1 execute DB --local --persist-to .wrangler/state --config wrangler.jsonc --file scripts/repair-search.sql`

Remote repair: `npx wrangler d1 execute DB --remote --config wrangler.jsonc --file scripts/repair-search.sql`

The DB binding selects flashcards-db; confirm its database_id and target environment in wrangler.jsonc and Cloudflare Dashboard before administration. Remote commands are documentation only.

## Exceptional repair

Use repair only for damaged derived data. Pause application traffic and all writers, prepare recovery, then execute the complete SQL file (also suitable for D1 Console statements). It clears mapping and FTS, reconstructs every translation from canonical JSON and checks FTS integrity. Standalone multi-statement execution is not assumed atomic. If interrupted, keep traffic paused and repeat the entire script. It is safe to repeat. Verify foreign_key_check, translation/mapping/FTS counts, rowid correspondence and representative searches before resuming. FTS rebuild alone cannot recover canonical content absent from the FTS table.

## One-time incompatible schema transition

Prepare and validate a full restorable database recovery point. Rehearse pending migrations against an isolated populated copy. Pause traffic and writers before migration: the previous application depends on removed tables. Publish the new application immediately after successful migration, then check authorization, multilingual/details/answer searches, edits, clears, deletions and learning history before resuming traffic. A publication failure does not roll back migrations: keep traffic paused and retry publication of this schema-compatible application, or execute the rehearsed full recovery procedure. Ordinary deploy has no extra maintenance flags or credentials and performs no unconditional reconstruction.

E2E uses a fixed port; simultaneous runs are unsupported. The runner owns a unique disposable storage directory and removes only that directory after completion. Forced interruption or KEEP_E2E_STORAGE=1 can retain it for inspection.

## Future migrations

Assess search impact whenever canonical card schema, searchable fields, translations or JSON structure, FTS configuration, mapping, synchronization triggers, or relevant foreign keys/cascades change. Update affected triggers and FTS structures and embed required reconstruction in that same forward SQL migration. Never edit historical migrations. Update the canonical repair SQL when its procedure changes, and add local migration regression coverage for consistency, inserts/updates/deletes/cascades and canonical data preservation. Keep API documentation and specifications synchronized.

Reconstruction is necessary when a schema/index change makes existing derived rows invalid or incomplete, or for exceptional damage recovery. It is unnecessary for ordinary mutations and unrelated schema changes. Do not add backfill runners, activation endpoints, remote adapters or deployment-wide reconstruction/verification. The repair script is the sole manual reconstruction mechanism. See [mandatory repository rules](../AGENTS.md).
