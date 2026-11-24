> Historical v3 implementation record. Current behavior is governed by [v4](FLASHCARDS-V4-SPECIFICATION.md). Legacy explanation actions/counters have been retired; v1/v2 file import is unsupported.

# Flashcards v3 recreation runbook

## Stage A: preparation (implemented)

`0005_v3.sql` adds nullable JSON metadata storage only. It does not convert old cards or delete data. Legacy imports and backups remain readable. The v3 parser validates complete language variants, metadata, HTTP(S) URLs, calendar dates, ratings and distinct documented occurrence IDs. It does not contact source websites or establish whether two accounts describe the same interview; content review must establish that.

Use the import preview before applying a file. Normal import preserves stable keys and progress. For recreation, preview `/api/import/preview` with `{source, target: deckId, replace: true}`. This validates the incoming file against an empty target and returns the target revision plus an impact report. `/api/replacement-report` is an authenticated, read-only download listing every owned deck with its ID, title, revision, cards, progress records, active sessions and retained historical events. Import UI links to the report and displays per-deck impact. A read-only production snapshot is recorded in [the impact report](FLASHCARDS-V3-IMPACT.md); refresh it on the actual target immediately before approval.

Recreation loses all old card database IDs and all users' progress rows for those cards, including presentation/failure/learned counters and explanation-open counters. It invalidates active sessions selecting that deck. Stable import keys and deck identity/ownership remain; the incoming file determines the new cards and their metadata. Historical study events remain as audit records with their old card IDs; they are not applied to new cards. Users, authentication sessions, access settings, unrelated decks and unrelated progress are preserved.

Before any actual recreation:

1. Prepare and review the complete replacement Markdown v3 file; do not infer provenance from old cards.
2. Save the read-only impact report and the authenticated `/api/export` backup. That export covers the caller's accessible decks and personal progress, not every user's progress; obtain a full database backup through the database owner for a complete recovery point.
3. Test the file, backup and recovery procedure on an isolated copy. The automated D1 integration test exercises recreation on an in-memory test database.
4. Review the exact deck IDs, revisions and loss counts. Stop if other edits change the revision.

## Stage B: actual recreation (not executed on production)

Production deletion and deployment require separate explicit owner approval. This runbook is preparation, not that approval. The browser's normal Apply import never requests replacement. No automatic production recreation command or scheduled job is provided.

After separate authorization, an authenticated owner may call `/api/import/apply` with the preview's exact `previewId` and `revision`, reviewed `source`, `target: deckId`, `replace: true`, `confirmReplacement: deckId`, `filename`, `visibility`, and empty `choices`/`links` for a fresh recreation. The exact deck ID confirmation is required. Only v3 replacement files are accepted. Any invalid card aborts the operation.

The server checks ownership and revision, then performs the deck revision update, card deletion and complete reimport in one atomic D1 batch. Deletion is gated by the mutation created by that revision update. On stale revision, ownership failure, validation failure or SQL failure, replacement cannot partially succeed. Existing deletion triggers invalidate affected sessions and foreign keys remove card progress. Concurrent study actions use version checks. Reusing an old preview is rejected.

After recreation, read `/api/cards`, export again and verify card counts, stable import keys, languages and all metadata against the reviewed file. Start a new session and verify a first pass plus a Repeat cycle. Retain the backups and report. Recovery requires restoring the full backup, not reimporting cards alone, because reimport does not restore old database IDs or study progress.

## Study boundary contract

The session stores one immutable initial ordering, a pending list for the current cycle, unique Repeat membership and presentation history. First-cycle pending cards are unconditional. At the end of a cycle, Next snapshots current membership in initial order. During later cycles, an unchecked pending card is skipped; a newly marked historical card joins the next snapshot. Previous/Next through existing history never changes membership or records a new presentation. A card can occur once per cycle and multiple times in history. Removing the last mark completes at the next cycle boundary; the initial pass still finishes. Expiry reveals the answer without changing membership. Presentation order and marks persist in the versioned session JSON across devices.

The old `learn`/`explanation` API actions and legacy database counters remain compatibility surfaces for older clients; the v3 UI exposes neither. New sessions always include all selected cards regardless of legacy learned status.

Pre-v3 active sessions are reported as invalidated and require restart. Their old session JSON remains untouched; no card migration is performed.
