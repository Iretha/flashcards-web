# FTS production rollout and recovery — preparation only

No remote operation is authorized by this document. Owner approval is required
before any production execution. The local runner cannot access Cloudflare.

## Preflight: read-only verification

Record the target account/database ID, deployed code version, current schema,
backup/restore capability, and exact migration ledger (`d1_migrations`: name/id).
Compare ledger names and checksums of the corresponding reviewed SQL with this
checkout. D1 tracks filenames, not merely numeric prefixes. Preserve historical
0015_card_search_fts.sql unchanged. 0016_fts_consistency_recovery.sql is additive
migration history; it rebuilds derived storage and does not alter source cards.

If either discarded 0015 legacy-language/JSON draft appears in the ledger, stop:
retain its actual historical SQL and prepare a separately reviewed forward upgrade.
Never rename/rewrite an applied ledger entry or assume the remote ledger matches
local state. Do not run the current generic deploy command without this preflight.

## Ordered rollout (requires separate approval)

1. Validate backup and a restore rehearsal, including virtual-table limitations.
   Source cards are authoritative; FTS can be rebuilt. Record baseline counts.
2. Gate MCP text search and pause content writers. Stop old deployments/jobs that
   could write cards with the old FTS synchronization code. Do not leave old and
   new write paths active together during this migration.
3. Apply the reviewed schema migrations to the explicitly verified target. 0016
   removes old derived rows/markers and adds map/epoch/version machinery. Existing
   source content, translations and primary languages remain unchanged.
4. Deploy the matching writer/search code while the operational gate remains on.
   Existing search requests fail explicitly while cards lack versioned readiness.
5. Through a separately approved operator environment with the real D1 binding,
   run backfillSearch(db) from src/lib/search.ts in resumable bounded units. Do not
   point the local Miniflare CLI at production files or treat it as a remote tool.
   A remote bounded runner/command must be reviewed before production execution;
   a single long-lived Worker invocation must not index the whole database.
6. verifySearch(db) compares every source translation's normalized fields with
   mapping and FTS content, checks versioned markers/orphans, executes FTS internal
   integrity-check, and activates with an epoch compare-and-swap. Keep writers
   paused until verification succeeds, otherwise verification can fail/retry.
7. Check missing/version-mismatched readiness count = zero, source card/translation
   counts unchanged, schema/version correct, FTS/mapping row counts equal, plus
   owner/collaborator/stranger, Cyrillic, short queries, pagination smoke checks.
8. Remove the search gate and resume only new writers. Monitor SEARCH_CHANGED,
   SEARCH_NOT_READY, latency, database CPU, rows read/written and storage growth.

## Failure and rollback

Migration failure: stop and inspect; D1 rolls back the failed migration. Do not
manually mark it applied. Keep gates on until actual schema/ledger are reconciled.
Backfill interruption: rerun backfill; markers are committed per card. Source CAS
prevents stale work from replacing newer translations. Pending cards block search.
Verification failure: state becomes blocked; investigate then run an explicit
rebuild. No activation is allowed on partial or failed verification.

Rebuild: beginSearchRebuild(db) atomically gates search and clears markers, mapping
and FTS (including orphan rows). Repeating it while rebuilding preserves progress.
Then backfillSearch(db) resumes and verifies before activation. Use verifySearch(db)
for audits. A failed audit gates search; use explicit rebuild to repair it.
Local CLI: `node scripts/backfill-card-search.mjs <persist-dir> <database-id>
[backfill|rebuild|verify]`. Stop wrangler dev before using its local persistence.

Rollback is operational, not reverse SQL: gate search, pause writers and retain
source data. Do not roll back to writers that populate only the old FTS table,
which would bypass mapping synchronization. Prefer rolling forward to a corrected
compatible build. Any source-data restore is separately approved and followed by
a full rebuild/verification. Do not drop migrations/tables or edit the ledger as
part of rollback. Never export FTS shadow tables as the only recovery source.

References: Cloudflare documents D1 session sequential consistency separately
from batch transactional execution. This implementation relies on the former plus
triggered epochs, not an inferred multi-statement snapshot:
https://developers.cloudflare.com/d1/best-practices/read-replication/
https://developers.cloudflare.com/d1/worker-api/d1-database/
Physical database corruption that prevents FTS deletion/integrity operations needs
an approved restore/recreate procedure; the rebuild repairs logical missing,
incorrect and orphan index rows, not damaged SQLite storage files.
