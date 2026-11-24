# Flashcards v4 implementation contract

## Content and operational state

Translations contain only nonempty `question` (maximum 2000 characters), `answer`
(maximum 20000, empty allowed), and optional `questionDetails` (maximum 20000).
Coding tasks require nonempty question details for every supplied language.
Examples, code, explanations and nuances belong in the canonical Markdown answer.
Identity, ownership, permissions, ordering, normalized question keys, revisions,
mutation guards, timestamps, progress, history and search indexes are operational state.
They are not authored card text. Existing authorization remains unchanged.

## Import

An explicit formatVersion of 3 or 4 is required; all other versions are rejected.
Both formats normalize into one import DTO with optional answer presence, then into
the canonical persisted Translation. v4 uses the existing card/language heading
syntax and metadata, except authored occurrenceCount is rejected. v3 requires and
validates its historical occurrenceCount against distinct occurrence IDs.
Languages use the shared canonical BCP 47 validator, including regional/script codes.
Only question, answer and questionDetails are structural field headings (####).
After a field begins, other headings remain ordinary Markdown content, except
reserved card/language/metadata headings and retired #### simple/example/details
headings outside fences. Retired fields fail validation. Literal reserved headings
inside fenced Markdown remain content. Put ordinary content after a supported field
heading; unsupported content before a field is invalid.

Missing answer initializes an empty answer for creation and preserves the old
answer on update. A present empty answer clears it. Preview and execution use the
same normalized proposed translation. Omitted languages are preserved; metadata
replaces as a unit. Existing target deck language configuration is never changed
by import; incompatible authored translations fail validation.

## Metadata

Retain cardType, topic, provenance, source properties, answerReferences and optional
1–5 priority/difficulty ratings. Occurrence count is derived from distinct nonempty
validated source occurrenceIds, never source URL count. New metadata cannot claim
interview occurrences for generated content. Historical v3/persisted contradictions
retain sources/IDs and use the same derived count everywhere; they require content
review, not silent reclassification. Derivation does not verify real-world evidence.

## Retirement and migration

Discard simple/example/details without merging. Remove root question/answer
columns and explanation counters using a forward migration; historical migrations
remain unchanged. Valid canonical translations take precedence over mirrors,
including intentionally empty answers. Recover absent question/answer from mirrors
only when canonical data is missing; fail on irreconcilable malformed translations.
Preserve IDs, import/source keys, ordering, normalized uniqueness, permissions,
progress and all historical events. Retain stable_key because historical distinct
values exist in repository fixtures and production values are unknown.
Remove explanation actions/state and obsolete queue failed/visits; normalize old
session extras without invalidating valid cycles. Retain learn and historical event
kinds. Remove test-only compareImport.

## Contracts and integrations

Browser, Management API, MCP and exports expose canonical translations without root
mirrors or explanation statistics. New metadata inputs exclude occurrenceCount;
responses derive it. All write interfaces allow empty answers; omission preserves
existing answers. Management/MCP text search covers question, questionDetails and answer.
External AI requests include the resolved question and matching questionDetails,
never the stored answer, and request the user's selected output language. Authored
content is delimited untrusted data, not application instructions.
JSON export version advances to 2; no restore implementation is promised.

## Verification and rollout

Acceptance requires fresh/upgrade migration tests, reconciliation failure tests,
v3/v4 parser and reimport tests, generalized languages, answerless API/MCP flows,
search synchronization, retained study behavior, authorization/idempotency/revision
regressions, documented example parsing, typecheck, build and browser tests.
Production rollout is not authorized. Before rollout stop writes, obtain a verified
full database/schema recovery snapshot, rehearse isolated recovery and migration,
compare identity/content/progress/event counts and foreign keys, review legacy
metadata contradictions, and coordinate breaking API/import changes with clients.
Browser JSON export alone is not a demonstrated restorable backup.


## Deployment and search recovery gate

Migration 0020 reconstructs native search directly from canonical translations. SQL triggers maintain it thereafter. See [deployment and repair](MCP-FTS-ROLLOUT.md). Free text requires three Unicode code points and uses native SQLite Unicode behavior.

Legacy generated records with occurrence IDs retain every source and identifier and
report their derived count consistently, without silently asserting zero or changing
provenance. During authorized rollout, inventory these records for content review
using provenance.type=generated and nonempty source occurrenceId. New v4/API metadata
rejects that contradiction. Historical source claims are not independently verified.

Stable keys remain: historical fixtures use distinct values and no production data
inspection was authorized. Legacy learn remains a supported action producing LEARNED;
all historical event kinds and trigger interpretations remain intact. Text search
covers question, questionDetails and answer consistently; Management API
also retains identifier/import-key lookup. Search includes task details through questionDetails.

The complete bilingual [v4 example](FLASHCARDS-V4-EXAMPLE.md), current template and historical v3 reference are all checked through the production parser in tests/markdown.test.ts.


Search uses native FTS5 and automatic SQL triggers after forward migration 0020; there is no activation step. Required reconstruction belongs in the affected forward migration; see the [search maintenance runbook](MCP-FTS-ROLLOUT.md). No additional Worker or endpoint is introduced. E2E tests use owned disposable storage cleaned after normal success/failure; KEEP_E2E_STORAGE=1 retains it for debugging. Interrupted/forcibly terminated runs may retain storage and require manual inspection.
