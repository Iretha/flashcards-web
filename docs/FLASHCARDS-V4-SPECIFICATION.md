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

## Canonical migration and compatibility

Migration 0018 removed retired simple/example/details, root question/answer mirrors
and explanation counters. It preserved canonical translations (including empty
answers), recovered missing canonical text from mirrors where valid, and rejected
irreconcilable malformed content. IDs, source/import/stable keys, permissions,
progress and historical events were preserved. Stable keys remain because distinct
historical values exist. Valid cycle sessions retain their state after obsolete
extras are removed. Legacy learn and historical event kinds remain supported;
explanation actions are rejected. Historical migrations must remain unchanged.

## Contracts and integrations

Browser, Management API, MCP and exports expose canonical translations without root
mirrors or explanation statistics. New metadata inputs exclude occurrenceCount;
responses derive it. All write interfaces allow empty answers; omission preserves
existing answers. Management/MCP text search covers question, questionDetails and answer.
External AI requests include the resolved question and matching questionDetails,
never the stored answer, and request the user's selected output language. Authored
content is delimited untrusted data, not application instructions.
Export behavior is defined below.

## Deployment and recovery

The owner confirmed deployment of commit `4b130a52f73dad53b857aeae1f96f1fd3599a2f8`,
including migrations 0018-0020, canonical data preservation and search verification.
External authenticated integration and physical-device checks remain separate.
See [search architecture and recovery](SEARCH-ARCHITECTURE.md) for native Unicode
behavior, epoch consistency, migration reconstruction and incompatible transitions.
Browser JSON export is not a demonstrated restorable full-database backup.

Legacy generated records with occurrence IDs retain their sources, identifiers and
derived counts. They require content review rather than silent reclassification;
new v4/API input rejects that contradiction. Derivation does not verify source truth.

The complete bilingual [v4 example](FLASHCARDS-V4-EXAMPLE.md), current template and historical v3 reference are all checked through the production parser in tests/markdown.test.ts.


## Decks, access and persistence

Decks have title, description, owner, source identity, ordered cards and PRIVATE or
SHARED visibility. SHARED permits authenticated users to study; active collaborators
can also read private decks and edit content. Owners alone manage visibility,
collaborators, AI instructions and whole-deck deletion. Sharing changes preserve
identity and personal history. Multiple accessible decks may be studied together.
See [Management API](MANAGEMENT-API.md) for permission and concurrency contracts and
[authentication architecture](AUTH-ARCHITECTURE.md) for identity/session boundaries.

Import accepts multiple files with per-destination visibility and explicit target
selection. Duplicate question checks are scoped to the destination deck and use
Unicode/case/whitespace normalization independently of search. Preview classifies
new, unchanged, conflicting and invalid rows; review conflicts before applying.
Normal reimport preserves card IDs/progress and does not erase omitted cards.
See [replacement procedure](CARD-REPLACEMENT.md) for destructive replacement.

## Study and progress

Study settings select sequential or random initial order, optional timer (default
30 seconds; accepted range 1-3600), language and initial answer visibility. All
selected cards enter the first cycle regardless of legacy learned state. Later
cycles snapshot Repeat membership in the initial order. Unchecking a pending repeat
skips it; newly marked historical cards join the next snapshot. Next at a boundary
with no marks completes the session. History navigation does not record another
presentation. Show/Hide toggles the answer; expiry reveals without advancing or
changing Repeat. Navigation resets the answer/timer for that view.

Repeat marks are global within the session across history/cycle boundaries. D1
persists the versioned session and per-user/card progress/history across refresh
and devices; stale mutations are rejected and retried requests must not inflate
counts. One study session per user is shared across devices. Pause/exit permits
resumption. Legacy learn remains supported; explanation actions/counters are removed.
Reset makes progress unlearned without deleting historical events and invalidates
affected active sessions. Progress/history remain independent for users sharing cards.

With focus on the study panel, Enter/Space toggles answers, Left/Right navigates,
R toggles Repeat and Escape/Back pauses and returns to the library. Tab navigates
controls and Space activates focused checkboxes. Do not intercept text entry.
Responsive controls, readable Markdown/code, visible focus and keyboard/touch access
remain requirements; no essential action should require hover or dragging. Physical
LG webOS compatibility requires real-device checks, not desktop test inference.

## Card library and retained progress

The card library supports deck order (ascending position), hardest first
(descending actual presentation count), easiest first (ascending presentation
count), learned first (LEARNED before UNLEARNED), and recently shown (descending
last-shown timestamp, with missing timestamps treated as zero). Hardest/easiest
sorting uses accumulated presentations, not the authored difficulty rating.

Progress belongs to each user/card pair, including shared cards. Stored progress
retains shown, failed and learned counts, learned/unlearned status and last
shown/learned timestamps. The card list displays shown and failed counts; legacy
cards without metadata additionally display legacy status and times learned.
Deck responses aggregate the current user's learned-card count, presentations and
failures alongside total cards. These historical statistics remain distinct from
current Repeat-cycle controls; they do not restore a Learned study button or
change first-cycle eligibility.

## Export and operational boundaries

Authenticated GET `/api/export` downloads JSON version 2: accessible decks/cards,
the caller's progress and ordered history, without authentication secrets. It is
not every user's database backup and has no supported restore endpoint. Historical
events may refer to removed cards. Full recovery requires a verified database/schema
snapshot, isolated restoration rehearsal and identity/content/progress checks.

The application targets the existing Cloudflare infrastructure and approved free
service plans. Offline caching must not compromise D1 progress correctness; no
offline synchronization contract or calendar spaced-repetition system is promised.
See [local verification](LOCAL-DEVELOPMENT.md), [external AI links](../EXTERNAL-AI-INTEGRATION.md)
and [content generation](../skills/flashcards-deck-generator/README.md).
