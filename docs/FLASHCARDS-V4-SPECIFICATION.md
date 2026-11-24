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
Unknown and retired section headings fail validation; literal reserved headings
inside fenced Markdown remain content.

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
existing answers. Management/MCP text search covers question and answer, with task
details excluded explicitly from text search (still returned as content).
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

Migration 0018 deliberately invalidates affected derived search rows through existing
triggers. Before reopening search, backfill using the existing shared backfillSearch
and verifySearch functions in an approved maintenance context. The existing
scripts/backfill-card-search.mjs utility is LOCAL ONLY; do not use it as a remote
migration command. A production maintenance invocation must be independently reviewed
and authorized. Until the index is verified, MCP returns controlled SEARCH_NOT_READY
rather than partial search results. No remote operation was performed by this task.

Legacy generated records with occurrence IDs retain every source and identifier and
report their derived count consistently, without silently asserting zero or changing
provenance. During authorized rollout, inventory these records for content review
using provenance.type=generated and nonempty source occurrenceId. New v4/API metadata
rejects that contradiction. Historical source claims are not independently verified.

Stable keys remain: historical fixtures use distinct values and no production data
inspection was authorized. Legacy learn remains a supported action producing LEARNED;
all historical event kinds and trigger interpretations remain intact. Text search
covers question and answer, excluding questionDetails consistently; Management API
also retains identifier/import-key lookup. This intentionally retires its former
incidental search over task details and is a documented client-visible change.

The complete bilingual [v4 example](FLASHCARDS-V4-EXAMPLE.md), current template and historical v3 reference are all checked through the production parser in tests/markdown.test.ts.
