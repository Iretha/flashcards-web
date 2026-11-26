# Markdown v5 specification and legacy conversion

Approved grammar revised by T-11/T-13/T-14. IMP-004 implements v5-only standard
import locally, with presence-aware preview/apply and final merged-card validation.
IMP-005 provides local reviewed conversion; direct v3/v4 import remains rejected.
Use the Import screen’s separate conversion panel, review/download the v5 document
and report, then select the v5 file for normal preview and explicit import. Database migration and production cutover authorization are separate.

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

## JSON export

Approved JSON Export v3 for classification cutover. topics DTO array
comes from memberships; canonical metadata has type/provenance/references only.
Export raw legacy interview_priority as interviewPriority, with numeric 1..5 ratings,
creationMode, difficulty, existing content/progress/history/access-related data.
Provenance and answerReferences stay in metadata alongside explicit cardType; no
duplicate evidence fields. No reinterpretation of legacy raw values. Retain caller
progress/history/access scope; exclude session settings. No implied restore endpoint
or full-database backup guarantee. Exclude active Study settings/filters/sort.

## Legacy conversion

Keep current v3/v4 parsers as conversion-only dependencies initially. No new direct
legacy import into target model. Current parser supports explicit 3/4, not v1/v2;
unsupported formats produce actionable diagnostics, requiring separately scoped
conversion. Do not delete markdown-languages/markdown-v3 before fixture/skills/parser
dependency audit and owner approval of removal.

Flow: original validation -> presence-preserving DTO -> shared topic normalizer ->
type conversion -> v5 serialization -> v5 validation -> semantic comparison -> preview
-> explicit import. Preserve heading presence from source where old normalized DTO
would erase omitted/empty distinction. v3 occurrenceCount validated then omitted as
derived; sources/IDs preserved exactly. Scalar topic becomes one list item, not split.
coding_task becomes task. Preserve all translations, empty answers, details, keys,
Difficulty, source properties/references. Unknown/unrepresentable fields stop conversion
with card/key/field diagnostics; never silently drop metadata or fabricate provenance.
Historical generated+occurrence contradictions require review; do not silently strip
evidence or relax existing new-input validation. DB preservation and authored validation
are different responsibilities.

Q-01 RESOLVED: do not carry legacy interviewPriority into v5 and do not add a legacy
v5 field. Use priority: 3 when no reliable new priority can be established. Record every
omitted legacy value by card key in the conversion report. This approved omission is
not a conversion blocker; do not gate import-ready output on a legacy transfer mechanism.
Database migration retains existing raw interview_priority until FI-001; normal reimport
preserves the matched card's retained legacy field. No implicit scale copy/inversion.
Legacy unit-metadata replacement converts to explicit full supplied headings; omission
semantics from original source must be preserved for patch/reimport intent.

## Catalog likelihood conversion

Only attested old rubric 5 highest -> new=6-old; missing/null yields default3 in
final card state, never inverted. Diagnostic raw values remain preserved. v5 never inverts.
For catalogs without formatVersion use explicit reviewed per-file old-scale manifest,
not numeric heuristics. Record source hash, rubric and conversion version in review
diagnostics, not unsupported card metadata. Emit target-scale marker/rubric and reject
already-target input as old-scale conversion. Re-running against the same original
is reproducible; re-running target is a no-op/error, never second inversion.

Inspect/convert samples/db/database-interview-questions.md, sql-interview-questions.md,
nosql-interview-questions.md, jdbc-interview-questions.md only after confirming each
legend. Update guidelines/legends/examples and values atomically. Keep each file IDs
starting at 1; no global numbering or question edits. P1–P4 catalog values retain
meaning under approved universal Priority labels; no reassessment. Editorial origin
labels stay; app creationMode UNKNOWN absent reliable attestation. Evidence Markdown stays.
No new evidence schema: qualifiers can remain existing sourceName text when lossless;
otherwise report limitation for review. Answer-scope notes remain catalog information.
Catalogs are not full import decks: missing answers/task specs need separately approved
content preparation, never invented by a format converter.

### Implemented conversion review

`src/lib/legacy-conversion.ts` reuses the retained v3/v4 parser. Authored legacy
metadata is retained before normalization so provenance properties and difficulty
presence survive. Legacy required type/topic/provenance are emitted explicitly;
absent answerReferences emits [] to preserve old unit-replacement clearing.
Absent difficulty, answers, details and translations remain omitted. Priority is
explicitly 3 with every raw interviewPriority omission reported. Likelihood and
creationMode remain omitted: create defaults are 3/UNKNOWN, update omissions preserve.
Every supplied translation and authored metadata property is compared after v5
serialization/validation, including empty versus absent fields. Historical generated
occurrence contradictions block output with card/field review diagnostics. Unknown
frontmatter and pre-card content block conversion rather than disappearing.
No parser was removed; legacy parsing remains a conversion/test dependency and both
standard preview and apply retain their v5-only guard.

Each of the four catalog legends explicitly attested the old 5-highest rubric.
The [per-file manifest](conversion/catalog-manifest.json) pins those exact original
SHA-256 hashes, rubric and conversion version. The [conversion report](conversion/catalog-report.json)
records target hashes and every original rating by local ID (array index + 1).
`node scripts/convert-catalog.mjs` requires this manifest and refuses target-marked
input, changed/unreviewed originals and overwriting an existing output file.
Tests reconstruct each exact original hash from the target, checking unchanged
question text, IDs, topics, priorities, evidence and all remaining document bytes.
Ratings preserve meaning: old 5 core -> new 1 Very High; old 4 likely -> new 2 High;
3 stays Medium; old 2 uncommon -> new 4 Low; old 1 specialist -> new 5 Very Low.
The JDBC distribution uses the same inversion. Historical rating ranges in evidence
notes remain explicitly labeled as old scale; evidence/answer-scope text is retained.
The catalogs remain catalogs and are never silently promoted to import decks.
