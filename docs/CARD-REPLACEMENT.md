# Guarded card replacement

Prefer normal reimport, which preserves stable card identities and progress.
Destructive replacement accepts supported v3/v4 files and requires an owned target.
Use [v4](FLASHCARDS-IMPORT-TEMPLATE.md) for new authoring.

## Preparation

1. Review the complete replacement file and validate provenance independently.
2. Preview `/api/import/preview` with `{source, target: deckId, replace: true}`.
   The file is evaluated against an empty target. Retain `response.deck.id` and
   `response.deck.revision`; the response has no top-level previewId or revision.
3. Download `/api/replacement-report` for current owned-deck counts and impact.
   Refresh it immediately before approval; historical inventories are not evidence.
4. Obtain a verified full database recovery point and rehearse restoration in isolation.
   `/api/export` includes only the caller's progress and is not a full restore format.
5. Obtain explicit owner authorization for production replacement and review exact
   target IDs, revisions and loss counts.

## Apply and consequences

The authenticated owner calls `/api/import/apply` with reviewed source, target,
`previewId: response.deck.id`, `revision: response.deck.revision`, `replace: true`, `confirmReplacement: deckId`, filename,
visibility and choices/links appropriate to the preview (empty for fresh recreation).
Browser Apply performs a normal import when replacement is not selected. When
replacement is selected, Apply submits the replacement request with the required
confirmation. Invalid cards abort replacement.

The guarded D1 batch advances revision, deletes old cards and imports new cards.
Stale revision, authorization failure or SQL failure cannot partially replace a deck.
Old card database IDs and all users' corresponding progress are lost. Active sessions
selecting the deck are invalidated. Historical events retain old IDs and are not
reapplied to new cards. Deck identity/ownership, users, authentication sessions and
unrelated content/progress remain. SQL triggers synchronize search automatically.

See the [current specification](FLASHCARDS-V4-SPECIFICATION.md) for content and
study compatibility and [recovery precautions](SEARCH-ARCHITECTURE.md) for operations.
