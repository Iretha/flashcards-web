# Flashcards Markdown v5 — file format

Implemented locally for standard import; production deployment is separately authorized. The authoritative technical contract is [MARKDOWN-V5.md](card-classification/MARKDOWN-V5.md). See [example](FLASHCARDS-V5-EXAMPLE.md) and [generator classification rules](../skills/flashcards-deck-generator/CLASSIFICATION-GUIDELINES.md).

## Grammar

UTF-8, optional BOM; YAML frontmatter formatVersion: 5 required. Retain existing
deckId/title/description/visibility/primaryLanguage/supportedLanguages validation.
Card boundary ## card: KEY, existing deck-local import-key rules. Create defaults:
topics[], priority3, likelihood3, creationMode UNKNOWN, cardType question. Enforce
10 unique normalized topics and 200 UTF-16 units per topic after deduplication.
Each metadata heading occurs at most once before languages:

| Heading | Body/value |
|---|---|
| ### topics | YAML string list or [] |
| ### priority: | Integer 1..5; null resets to3 |
| ### likelihood: | Integer 1..5; null resets to3 |
| ### creationMode: | MANUAL, AI, UNKNOWN; empty/null resets UNKNOWN |
| ### cardType: | question or task; empty/null invalid |
| ### difficulty: | Existing integer 1..5 or null; optional |
| ### provenance | Existing YAML object, or null |
| ### answerReferences | Existing YAML list, or [] |

Language heading ### canonical-BCP47 then #### question, optional #### questionDetails
and #### answer. Question nonblank/max2000; answer/details max20000; empty answer
valid. Task details nonblank in all final retained translations. All lengths retain
current JS string-unit semantics. Enforce current request/card limits.
Reject duplicate languages/fields/headings, unknown structural fields, invalid YAML
types and unsupported source keys. Disable aliases/executable tags. Preserve fenced
reserved headings and Markdown content as existing parser does. occurrenceCount is
not authored. Session settings are not valid authored metadata/frontmatter.

```markdown
---
formatVersion: 5
deckId: transaction-practice
primaryLanguage: en
supportedLanguages: [en, bg]
---
## card: isolation-1
### topics
- Transactions
- Transaction Isolation
### priority: 1
### likelihood: 2
### creationMode: MANUAL
### cardType: task
### en
#### question
Design an isolation policy.
#### questionDetails
Specify concurrent operations and consistency guarantees.
#### answer
### bg
#### question
Проектирайте политика за изолация.
#### questionDetails
Опишете конкурентните операции и гаранциите за консистентност.
#### answer
```

## Presence and reimport

| Field | Create omission | Update omission | Explicit clear |
|---|---|---|---|
| topics | [] | Preserve | [] |
| priority/likelihood | 3 | Preserve | null resets to3 |
| creationMode | UNKNOWN | Preserve | UNKNOWN or null/empty -> UNKNOWN |
| cardType | question | Preserve | Invalid; explicitly choose question |
| difficulty | null | Preserve | null |
| provenance | Absent | Preserve | null |
| answerReferences | Absent | Preserve | [] |
| answer | Empty | Preserve | Present empty section |
| questionDetails | Absent | Preserve | Present empty; invalid for task |
| language | Primary required | Preserve omitted languages | No implicit deletion |

Metadata headings now patch by presence, unlike old unit replacement. Validate final
merged card. Supplied provenance object/list replaces its sources under existing
rules; no source heuristics. Clearing provenance leaves type/references intact.
Supplied topic lists use the shared NFC/whitespace/uppercase/final-NFC normalizer;
reject null, non-list values and empty elements; [] is valid. Omitted topics preserve
existing canonical values exactly without normalization. Normal reimport retains IDs/progress/omitted
cards/import keys. Preview must show classifications, type transitions and clears;
apply uses the identical proposed payload. Existing destructive replacement remains
separate, owner-only and explicitly confirmed with impact report.


## Retained field rules

Deck key max 160, title max 160, description max 2000; visibility PRIVATE or SHARED, default PRIVATE. Canonical BCP 47 languages are unique and include the primary. Card keys are 1–100 ASCII letters/digits/underscore/hyphen, starting with letter/digit. Existing language configuration is preserved. Sources require sourceName and credential-free HTTP(S) sourceUrl; sourced/mixed require a source. Optional company/location/interviewLocation/occurrenceId are nonempty strings max 2000; publishedAt is a real YYYY-MM-DD string. Answer references use title and credential-free HTTP(S) url. Preserve existing provenance semantics; occurrenceId identifies independently documented interviews only, and reposts share it. Never author occurrenceCount. Retired simple/example/details headings are invalid outside fences.

Topic normalization: NFC, trim, collapse ECMAScript Unicode whitespace, locale-independent uppercase, final NFC, deduplicate; reject empty elements. No synonym or accent folding. Ratings use 1 highest, 5 lowest. Legacy interviewPriority is not copied or inverted. See the authoritative contract for conversion.
