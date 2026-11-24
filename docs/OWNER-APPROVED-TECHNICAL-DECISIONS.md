# Owner-approved technical decisions — Card Classification & Study Filters

Status: Approved product decisions; documentation update pending. Not authorization to implement.
Repository: `Iretha/flashcards-web`  
Branch: `feature/card-classification-study-filters`  
Reference specification: `4560247d76670f0b440a151ac696da860ce9411a`

## Authority

DEC-001–DEC-023 remain valid except where superseded below. Update the authoritative DEC records and dependent contracts, preserving traceability. Do not silently resolve new product questions. These decisions supersede earlier conflicting proposals.

## T-01 — Legacy interview_priority

Preserve the legacy field and raw values. Do not infer compatibility or direction of its scale. New functionality uses only `priority`; absent an attested compatible mapping, initialize it to 3. Removal is deferred to FI-001.

## T-02 — Topic normalization during migration

Use the standard SQL migration mechanism, not a custom runner. Inspect existing distinct values before preparing migration; use `UPPER()` and `TRIM()` only where proven equivalent to the canonical normalization. Check Unicode, NFC, whitespace and repeated spaces. Use explicit SQL mappings for exceptions and guard against unknown or invalid values. No unauthorized production access. Future writes use one shared server-side JavaScript normalizer: NFC, trim, collapse whitespace, locale-independent uppercase, deduplicate, reject empty values. Preserve DEC-002.

## T-03 — Session limits

Check maximum 30 decks and 5000 accessible cards only at session start. Do not recheck growth during active Fully Live sessions, introduce LIMIT_EXCEEDED state, block, truncate or otherwise specially handle overflow. Remove planned overflow-specific API fields and acceptance requirements. Restart is a new start and uses ordinary start checks.

## T-04 — New card ordering

Append newly eligible cards to the pending tail regardless of active sort. Preserve existing pending order, eligible frontier and stable original ranks. Explicit Apply recomputes and sorts remaining cards.

## T-05 — Circular history navigation

Previous from first accessible history entry wraps to last. Next through history advances toward the active frontier; Next on the active frontier advances learning normally. Next after the last entry of a completed session wraps to first. Single-entry history navigation is a no-op. Skip deleted/inaccessible cards. History browsing does not alter progress, Repeat or SHOWN counts. Distinguish browsing from learning advancement.

## T-06 — Completion and restart

When no further cards remain under active filters and existing Repeat rules, mark COMPLETE, communicate completion and offer Restart Session / Започни отначало. Do not reopen a completed session on new cards, classification changes, filter changes, resume or ordinary reads. This supersedes the reopening part of DEC-015.

Restart creates a new session with the same selected decks, applied filters and sort. Preserve persistent progress, statistics, user history and Repeat marks. Reinitialize session-local passed state, navigation history, cursor, current card, cycle, pending queue and other ordinary start state. Use current accessible scope and classifications. Initial cycle includes all matching cards irrespective of Repeat marks. Apply normal start limits. Restart is not a destructive progress reset. Completed history remains navigable according to T-05.

## T-07 — MCP tools

Extend get_card, create_card and existing update_card with the five classification fields. update_card supports both answer and classification updates; do not create update_card_classification. search_cards remains unchanged. Owner explicitly approves expansion of update_card capability. Preserve valid existing requests, presence-aware updates, membership and third_party_access checks, atomic authorization revalidation, concurrency protection, applicable idempotency/replay safeguards and atomic writes. No broader access, Study tools or global classification search. Revise DEC-023.

## T-08 — Explicit card type

Persist metadata.cardType explicitly for every card: question or task. Default and migrate missing type to question; convert coding_task to task. Type-only metadata is valid, e.g. `{"cardType":"question"}`. Provenance is optional but validated when provided. Every final stored language of a task requires nonblank questionDetails.

## T-09 — New cards during Repeat

New matching cards join the current Repeat cycle once regardless of Repeat marks. Retain admission state if temporarily filtered out. Never requeue a passed card in the same cycle. Subsequent Repeat cycles require Repeat marks. Preserve other approved Repeat behavior.

## T-10 — Topic limits

Maximum 10 unique normalized topics per card; maximum 200 UTF-16 code units per normalized topic. Validate after normalization/deduplication. Reject violations atomically; no truncation or silent dropping. Apply shared validation across all write paths. Protect against excessive raw payloads; propose any new concrete limits requiring approval separately.

## T-11 — Markdown v5

Use existing approved v5 grammar, parsing and validation with revised field names and defaults. Example card fragment:

```markdown
## card: 1

### topics
- JDBC
- TRANSACTIONS

### priority: 1

### likelihood: 2

### creationMode: AI

### cardType: question

### en

#### question
What is JDBC?

#### answer
Java Database Connectivity is...

### bg

#### question
Какво представлява JDBC?

#### answer
Java Database Connectivity е...
```

Create defaults: topics [], priority 3, likelihood 3, creationMode UNKNOWN, cardType question. On normal reimport omitted fields preserve values; empty topic list clears; null ratings reset to 3; UNKNOWN resets creationMode (retain approved Markdown null/empty semantics); explicit question sets card type. Preserve difficulty, provenance, answerReferences, questionDetails, IDs, progress and omitted languages. Update planned legacy conversion, template and generator requirements; do not actually convert catalogs or implement parser in this documentation task.

## T-12 — JSON Export v3

Export topics, numeric priority and likelihood (1–5), creationMode, metadata.cardType, legacy interviewPriority, difficulty, provenance, answerReferences and existing exportable content/progress/history/access-related data under current contract. Exclude active Study settings, filters and sort. No full backup restoration feature.

## T-13 — Mandatory ratings and partial updates

Both priority and likelihood are INTEGER NOT NULL DEFAULT 3 with database CHECK constraints for 1–5. Migrate missing/unattested ratings to 3.

| Value | Priority | Likelihood |
|---|---|---|
| 1 | Critical | Very High |
| 2 | High | High |
| 3 | Medium | Medium |
| 4 | Low | Low |
| 5 | Very Low | Very Low |

| Input | Create | Update |
|---|---|---|
| Omitted | 3 | Preserve |
| null | 3 | Reset to 3 |
| Integer 1–5 | Set | Set |
| Invalid | Reject | Reject |

Apply across Markdown, Management API and MCP. Remove Not Rated options, nullable stored/response ratings and rating null-specific sorting. Revise DEC-004, DEC-005, DEC-018 and dependent contracts. Preserve attested legacy catalog likelihood inversion rules; do not infer mappings.

Metadata updates are presence-aware: omitted fields preserve; topics [] clears; creationMode UNKNOWN resets; metadata.cardType question sets question; metadata.provenance null clears; metadata.answerReferences [] clears; metadata null resets to type-only question. Preserve existing API creation-mode input rules except approved changes. Validate final stored state, including retained languages.

## T-14 — Rename origin

Replace the planned classification origin field everywhere: database `creation_mode`; TypeScript, Management API, MCP, JSON and Markdown `creationMode`; UI EN Creation Mode, BG Начин на създаване. Values MANUAL, AI, UNKNOWN (default). MANUAL means human initiative including AI assistance; AI means delegated card creation/selection; UNKNOWN means not established. Do not infer from provenance, editorial origin, answer generation or translation. Do not rename unrelated origin fields or introduce compatibility aliases for the unimplemented field. Revise DEC-007 and dependent contracts.

## T-15 — No Topics filter

Add No Topics / Без теми when accessible scope contains cards without topics. OR with selected topics; AND with other filter categories. Not a real topic and never stored in card_topics. Representation must not collide with a literal user topic. Missing topics sort last in both directions. Preserve scope, options and stale-selection rules. Specify unambiguous API representation; escalate new product choices.

## T-16 — Classification changes in active sessions

Remove newly ineligible pending cards. Append newly eligible unpassed cards that qualify for the current cycle. Preserve position of still-eligible cards when sort values change. Do not requeue passed cards. Explicit Apply recomputes and sorts remaining cards. Preserve eligible frontier; if ineligible, choose next using approved lifecycle without fabricated outcome. Preserve history and progress. No reopening of COMPLETE sessions.

## Future improvements register

Create `docs/FUTURE-IMPROVEMENTS.md`, a persistent register outside current implementation scope.

### FI-001 — Remove legacy interview_priority

Status: Planned / Deferred. Remove legacy field after transition to priority to eliminate ambiguous semantics. Preconditions: audit usages, assess data retention/conversion needs, obtain separate owner approval. Completion: remove legacy database field, DTO/API/export references and compatibility paths via separate approved task and forward migration. Do not add to current mandatory roadmap or add unapproved future ideas.

## Documentation synchronization requirements

Update all nine existing specification documents at their actual paths: README.md, DECISIONS.md, TECHNICAL-SPECIFICATION.md, MIGRATION-PLAN.md, MARKDOWN-V5.md, STUDY-LIFECYCLE.md, API-MCP.md, IMPLEMENTATION-ROADMAP.md, TESTING-ACCEPTANCE.md. Create the future improvements register. Preserve unchanged requirements and distinguish planned from implemented behavior.

Update IMP-001–IMP-011 scope, dependencies, exclusions, database/API/security/migration contracts, automated/manual acceptance, completion criteria and owner gates. Record approval of T-01–T-16; do not mark implementation complete or start it.

## Scope and execution constraints

Documentation only. Read AGENTS.md and applicable instructions; inspect branch, status and all nine documents. Preserve unrelated changes; stop on conflict. No main changes, application code, schema changes, real migrations, production data access, deployment, catalog conversion, dependency changes or unrelated refactoring. No commit, push, PR or merge without separate approval.

Excluded features: global classification search, topic registry/taxonomy/rename, evidence extensions, new difficulty filters/sort, timer refactoring, multi-column sort, Study MCP tools, custom migration runner, legacy priority removal, full JSON restoration and special active-session overflow handling.

## Review and acceptance

Perform cross-document review for stale nullable ratings, Not Rated, incorrect defaults, planned origin naming, separate classification tool, answer-only update_card restrictions, COMPLETE reopening, destructive restart, active overflow state, automatic sorted insertion, missing circular Next, implicit-only card type, incorrect topic limits, missing No Topics option, passed-card requeue and premature legacy removal. Historical superseded text must be clearly marked.

Verify DEC/T traceability, API/Markdown/JSON/database consistency, lifecycle transitions, roadmap dependencies, acceptance coverage, local links, code fences, git diff --check and diff scope. Report actual results only. Escalate unresolved questions instead of making new product decisions.

Final report: executive summary; changed/new files; T-01–T-16 to DEC traceability matrix; roadmap changes; checks and results; blockers; remaining owner decisions; branch/status; confirmation of no application, migration or production changes. Use READY FOR OWNER REVIEW or BLOCKED — OWNER DECISION REQUIRED. Stop and await approval; no automatic implementation authorization.

## Q-01 - RESOLVED: Legacy interviewPriority

Do not carry legacy interviewPriority into Markdown v5 during conversion. Do not
introduce a legacy v5 field. Use priority: 3 when no reliable new priority can be
established. Preserve existing raw interview_priority values during database migration
until FI-001 is implemented. Document omitted legacy values in the conversion report.
This approved omission does not block conversion output.

## Q-02 - RESOLVED: Settings after COMPLETE

Completed session settings are read-only. Restart creates a new session using the same
selected decks, filters and sorting. Settings become editable again after the new
session starts. Preserve persistent user progress and Repeat statuses. Do not reopen
the completed session. These resolutions supersede earlier pending Q-01/Q-02 proposals.

No unresolved owner decisions remain in this scope. Documentation synchronization
only; no authorization to implement, commit, push, merge or deploy.
