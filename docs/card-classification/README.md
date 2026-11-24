# Card classification and Study specification

Status: READY FOR OWNER REVIEW. Documentation only; not implemented.
The owner's DEC-001–023 supersede earlier exploration proposals.

Branch: `feature/card-classification-study-filters`.
Base: `441e1896e1622778f9648510ee4f561dd1d58ca2` (main and fetched origin/main matched).

## Document ownership

- [Decision register](DECISIONS.md): all approved decisions and T-01-T-16 traceability and remaining questions.
- [Technical specification](TECHNICAL-SPECIFICATION.md): card model, normalization, filtering, sorting and UI.
- [Migration plan](MIGRATION-PLAN.md): data conversion, search consistency and deployment.
- [Markdown v5 and conversion](MARKDOWN-V5.md): authored grammar and legacy conversion.
- [API/MCP contracts](API-MCP.md): transport and security boundaries.
- [Study lifecycle](STUDY-LIFECYCLE.md): Fully Live queues, history and completion.
- [Implementation roadmap](IMPLEMENTATION-ROADMAP.md): bounded tasks and dependencies.
- [Testing and acceptance](TESTING-ACCEPTANCE.md): automated/manual/performance evidence.

These are proposed technical contracts implementing approved product requirements.
T-01-T-16 are approved by OWNER-APPROVED-TECHNICAL-DECISIONS.md against reference
4560247d76670f0b440a151ac696da860ce9411a; they supersede conflicting earlier proposals.
New questions must be escalated, never silently resolved. No functional implementation is authorized.

The [current application specification](../FLASHCARDS-V4-SPECIFICATION.md),
[Management API](../MANAGEMENT-API.md), [MCP documentation](../MCP-TOOLS.md) and
[search runbook](../SEARCH-ARCHITECTURE.md) describe shipped behavior until acceptance.
Do not describe v5 or Fully Live as already available.

## Scope

Exactly five session filters/sort fields: Topics, Priority, Likelihood, Creation Mode and
Card Type. Single-field sorting, Explicit Apply, multi-deck distinct options,
server persistence, Fully Live membership and preserved progress/history/Repeat.
No global search endpoints, taxonomy, new services, evidence extensions,
Difficulty changes, timer refactoring or production operations.

## Verified current-code boundaries

| Source | Current behavior | Required change |
|---|---|---|
| src/lib/metadata.ts | Required scalar topic/provenance; question/coding_task | Membership topics; question/task; type-only metadata |
| src/server/decks.ts changeCard/writeCards | Shared guarded writes; browser preserves ratings | Atomic classification/membership writes |
| src/server/import-plan.ts | Omission preserves; metadata replaces as unit | Presence-aware v5 patch |
| src/lib/markdown.ts / markdown-v3.ts | Direct v3/v4 import | v5 import; conversion-only legacy path |
| src/lib/study-cycles.ts | Fixed membership; Previous clamps | Fully Live; per-cycle passed state; circular Previous |
| src/server/sessions.ts | User session, version checks, 30 decks/5000 cards | Applied projection; terminal COMPLETE and Restart |
| migrations/0001_initial.sql | Deletion/unshare invalidates sessions | Forward lifecycle-compatible trigger changes |
| src/server/mcp-writes.ts | Create question/answer; update answer only | Approved existing update_card expansion, unchanged access |
| migrations/0020_native_search.sql | Translation-triggered FTS; global epoch | Topic membership epoch coverage, no Topics in FTS |

Existing Deck Details filters and Difficulty controls remain; adapt their scalar
topic/type references only for compatibility. New session controls appear only in Study.

## Authoritative documentation rollout

At implementation acceptance update, without duplicating contracts:

- README: commands and pointers only.
- FLASHCARDS-V4-SPECIFICATION: explicit current/historical transition pointer.
- FLASHCARDS-IMPORT-TEMPLATE, FLASHCARDS-V4-EXAMPLE and V3-REFERENCE: versioned examples/conversion guidance.
- MANAGEMENT-API, MCP-TOOLS, MCP-EXTERNAL-ACCEPTANCE, CARD-REPLACEMENT.
- SEARCH-ARCHITECTURE; scripts/repair-search.sql only if reconstruction changes.
- samples/interview-question-catalog-guidelines and all four samples/db catalogs.
- skills/flashcards-deck-generator/SKILL.md and README; audit dependent answer-generation guidance.

This package owns planned behavior until promotion. Remove or mark superseded
proposal text when promoting it. Catalogs retain independent numbering from 1.
Pure conversion never adds, deletes or rewords questions or reassesses ratings.

The sole deferred item is [FI-001](../FUTURE-IMPROVEMENTS.md). No legacy field removal in current scope.

## Final owner resolutions

Q-01/Q-02 are resolved in the decision register and all dependent contracts. v5 omits
legacy interviewPriority with conversion-report diagnostics; database raw values remain.
COMPLETE settings are read-only; Restart new session preserves applied settings,
persistent progress and Repeat, then permits editing. No unresolved owner decisions
remain. This documentation update is not implementation authorization.
