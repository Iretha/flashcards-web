# Implementation roadmap

All T-01-T-16 product decisions are approved; no task starts without explicit implementation approval. Acceptance of a specification
does not authorize production/commit/push. Each task is independently reviewed/tested.
Common out of scope: global endpoints, new services, taxonomy, evidence expansion,
timer refactor and unrelated redesign. Files listed are expected, not permission to
change unrelated behavior. No new tests in this documentation phase.

## IMP-001 — Record approved contracts and implementation gates

- Objective/scope: record approved T-01-T-16, revised DEC traceability and resolved Q-01/Q-02 contracts for conversion/completion controls.
- Out of scope: implementation, source snapshot capture without separate authorization.
- Dependencies: approved owner decision source and review of this synchronized package.
- Components: this specification package; authoritative-document transition inventory.
- Database/API/security/migration impact: decisions only, no runtime change.
- Automated tests: reference/link/coverage checks.
- Manual acceptance: walk priority ambiguity, normalization backfill, new card in Repeat,
  history wrap, completed Restart, start-only checks and approved MCP expansion examples.
- Required owner decisions: T-01-T-16 approved; Q-01/Q-02 resolved; implementation authorization separate.
- Completion: no contradictory unresolved contract for downstream task being authorized.

## IMP-002 — Shared classification domain and validation

- Objective/scope: normalizer, universal ratings/creationMode, question/task, type-only metadata,
  source/reference preservation, pure filter/comparator contracts.
- Out of scope: schema execution, UI and new API capabilities.
- Dependencies: IMP-001 approved-contract synchronization.
- Components: src/lib/metadata.ts, translations.ts, classification helpers; tests/languages,
  metadata and comparator fixtures.
- Database impact: none yet; prepare validated DTOs.
- API impact: target schemas staged only with compatible adapters, no partial release.
- Security impact: strict allowlists, bounded arrays/strings and task validation.
- Migration impact: normalizer reused by approved preparation mechanism.
- Automated tests: normalization/scale/default/task/comparator matrix.
- Manual acceptance: review BG/EN labels and Unicode collision examples.
- Required decisions: T-08/T-10/T-13/T-14 approved; only newly discovered questions escalated.
- Completion: native search normalization unchanged; domain tests pass.

## IMP-003 — Forward migration and canonical membership writes

- Objective/scope: card_topics/indexes, ratings/creationMode, approved static standard SQL backfill (proven UPPER/TRIM plus exceptions/guards), type
  conversion, epoch triggers, lifecycle-compatible invalidation triggers.
- Out of scope: production execution and arbitrary legacy priority mapping.
- Dependencies: IMP-002; approved T-01/T-02; authorized distinct-value inspection before migration preparation.
- Components: next forward migrations/*.sql, src/server/decks.ts writeCards,
  import-plan DTOs, migration/search tests; repair SQL only if procedure changes.
- Database impact: canonical schema/data transition, FKs/indexes/triggers.
- API impact: target storage adapters; no standalone deployment against old app.
- Security impact: mutation marker/revision/authorization gates every membership write.
- Migration impact: full preservation/failure rehearsal from MIGRATION-PLAN.
- Automated tests: populated migration, unknown map abort, atomic rollback/cascades/epoch.
- Manual acceptance: compare preservation manifest and reviewed migration SQL.
- Required decisions: T-01/T-02 approved; separate production cutover authorization.
- Completion: local migration and write tests pass; zero dual canonical topics; release
  remains blocked until compatible app/import/session tasks complete.

## IMP-004 — Markdown v5 parser, preview and apply

- Objective/scope: exact v5 grammar, presence-aware patch, preview/apply parity.
- Out of scope: direct legacy import, generated answers or question reassessment.
- Dependencies: IMP-002/003; approved v5 contract T-11/T-13.
- Components: src/lib/markdown.ts and parser modules, src/server/import-plan.ts,
  decks.ts, src/ui/Import.tsx, markdown/API tests.
- Database impact: existing guarded membership/card batch only.
- API impact: browser import contract becomes explicit v5; actionable legacy diagnostics.
- Security impact: YAML safety/size limits, ownership/replacement guards retained.
- Migration impact: no further schema; cutover coordinated.
- Automated tests: missing/empty/clear/reimport IDs/progress/languages/tasks/fences.
- Manual acceptance: preview classification change and explicit destructive replacement.
- Required decisions: T-11/T-13 grammar/defaults approved; escalate only new compatibility questions.
- Completion: v5 validation and reimport parity pass, no silent metadata loss.

## IMP-005 — Legacy conversion and catalog documentation

- Objective/scope: v3/v4 conversion-only parser path, diagnostics, one-time attested
  likelihood inversion and rubric/template/guideline updates.
- Out of scope: v1/v2 parser invention, source verification, content additions/deletions.
- Dependencies: IMP-004; T-01 default3; resolved Q-01: omit raw legacy field from v5 and report omissions.
- Components: existing parser modules/conversion entry point to be reviewed; docs/samples,
  templates, generator skill references; conversion fixtures.
- Database impact: none; not a deployment maintenance runner.
- API impact: conversion output feeds v5 preview only, no new remote administration.
- Security impact: same untrusted YAML/Markdown validation, no network/source fabrication.
- Migration impact: separate from DB migration; no auto-conversion during deployment.
- Automated tests: semantic round-trip, presence, source properties, hash/version guard,
  no double inversion and unchanged question texts/local IDs.
- Manual acceptance: per-file old rubric confirmation and before/after rating meaning.
- Required decisions: parser removal only after dependency audit; conversion interface
  and resolved Q-01 omission/reporting; no legacy v5 field; default3 approved.
- Completion: conversion diagnostics exhaustive; old parsers conversion-only or removal
  explicitly approved; sample IDs start independently at 1.

## IMP-006 — Management API and JSON export

- Objective/scope: read/create/PATCH classifications, metadata patch, export version.
- Out of scope: global search and session endpoints for bearer clients.
- Dependencies: IMP-002/003; target API/export acceptance.
- Components: management.ts, decks.ts, api.ts export, API tests/docs.
- Database impact: canonical guarded card/membership batches only.
- API impact: added fields and explicit incompatible metadata/export transition.
- Security impact: If-Match/idempotency/current membership/errors retained.
- Migration impact: compatible release required after IMP-003.
- Automated tests: fields/clears/defaults/revision/receipt/rollback/revoke/export parity.
- Manual acceptance: representative client create/edit/read and legacy raw rating export.
- Required decisions: T-01/T-08/T-12/T-13 approved; separate release authorization.
- Completion: no answer-only update loses topics/source data; contract tests pass.

## IMP-007 — MCP classification capabilities

- Objective/scope: get_card classifications/revision and approved create_card/update_card
  extensions for classification fields and answer patches; search_cards unchanged.
- Out of scope: global search, Study controls, separate classification tool or broader access.
- Dependencies: IMP-006; approved T-07 capability expansion, pending implementation authorization.
- Components: mcp-reads.ts, mcp-writes.ts, mcp.ts registration, schemas/tests/docs.
- Database impact: reuse authorized canonical batches/receipts.
- API impact: strict input/output additions and documented tool capability boundary.
- Security impact: membership + third_party_access + credential purpose, live checks,
  revision/idempotency/size/rate limits unchanged.
- Migration impact: none beyond IMP-003.
- Automated tests: capability schema, revoke/replay, conflict/atomic rollback, hostile input.
- Manual acceptance: authenticated MCP read/create/edit with denied-access cases.
- Required decisions: T-07 capability approved; registration only in explicitly authorized implementation.
- Completion: desired card data support without expanded session/global permissions.

## IMP-008 — Session state adapter and Fully Live projection

- Objective/scope: versioned state, original ranks, passed/admitted/frontier, live options
  and pending, access exclusion, start-only limits, No Topics; preserve existing sessions.
- Out of scope: circular UI/timer refactor/push.
- Dependencies: IMP-002/003; T-03/T-04/T-09.
- Components: study.ts, study-cycles.ts, sessions.ts, session/migration tests.
- Database impact: existing JSON/session CAS; no per-user fanout infrastructure.
- API impact: state/options/count fields and read-time reconciliation; ordinary start
  validation only, no active-growth limit fields.
- Security impact: whole scope current access, no unavailable labels/events.
- Migration impact: lazy guarded adapter, no restart of valid sessions.
- Automated tests: live addition/removal/reinclude/rank/start-limit, adapter random/history states.
- Manual acceptance: mutate deck on second device and resume retained session.
- Required decisions: T-03/T-04/T-09/T-16 approved; adapter ambiguity resolved with fixtures, no growth cap.
- Completion: no duplicate cards or lost current/history/Repeat/timer/progress.

## IMP-009 — Lifecycle, navigation and atomic Apply API

- Objective/scope: circular Previous, Next/frontier boundary, terminal completion/non-destructive Restart,
  atomic configure, all five filter/sort predicates and stale-state handling.
- Out of scope: new timer lifecycle or remote Study management.
- Dependencies: IMP-008; T-05/T-06.
- Components: study/cycle engine, sessions.ts, api.ts, ui/api.ts and tests.
- Database impact: existing session JSON/version/events; no schema service.
- API impact: browser-only configure and authoritative view responses.
- Security impact: same-Origin/JSON/cookie gates; no stale outcomes after revoke.
- Migration impact: session adapter stays backward compatible.
- Automated tests: full lifecycle/Apply/cross-device/event-count/timer regression matrix.
- Manual acceptance: active history->frontier learning; COMPLETE Next wraps; Restart new ID retains settings/Repeat and persistent progress.
- Required decisions: T-05/T-06 approved; Q-02 read-only completed settings approved; timer conflict escalation only if evidenced.
- Completion: deterministic pending, finite history navigation, no silent overwrites.

## IMP-010 — Study controls and management compatibility

- Objective/scope: five dropdowns including No Topics, draft Apply/Cancel/Clear/Default, read-only completed settings/Restart (Q-02 resolved),
  labels/accessibility; adapt existing Deck Details topic/type controls.
- Out of scope: unrelated sidebar redesign/new Library filters.
- Dependencies: IMP-006/009.
- Components: App.tsx, Decks.tsx, CardSources.tsx, CardLanguages.tsx, style/translations,
  StudySidebar only necessary integration; UI/E2E tests.
- Database impact: none; browser calls existing planned APIs.
- API impact: no additional endpoints.
- Security impact: no unsafe source rendering or unauthorized option leakage.
- Migration impact: type-only metadata/coding_task compatibility cutover.
- Automated tests: no controls outside Study, draft isolation, focus/key shortcuts, labels.
- Manual acceptance: desktop/mobile/TV, BG/EN light/dark, screen reader, existing Difficulty.
- Required decisions: T-10-T-16 approved labels/semantics; separate implementation approval.
- Completion: wireframe behavior passes; Study core/sidebars preserved.

## IMP-011 — Performance, integration and documentation acceptance

- Objective/scope: representative datasets/query plans, complete regression and authoritative
  docs promotion; incompatible migration/deployment recovery rehearsal.
- Out of scope: actual production deployment/commit/push or global search endpoints.
- Dependencies: IMP-003–010 accepted; resolved Q-01/Q-02 contracts verified, all implementation reviews accepted.
- Components: relevant tests/E2E, local fixtures, docs inventory in package README.
- Database impact: local verification only; no production operations.
- API/security impact: end-to-end contracts and revocation/permission evidence.
- Migration impact: exact runner and rollback/recovery rehearsal.
- Automated tests: applicable npm test/typecheck/build/E2E, migration/search/authorization.
- Manual acceptance: full TESTING-ACCEPTANCE matrix and owner performance review.
- Required decisions: measured performance thresholds, explicit subsequent release approval.
- Completion: documented evidence/limitations, no stale authoritative contracts, diff check;
  feature ready for separate release authorization, never automatically deployed.

## Cross-task binding updates T-10-T-16

IMP-001 records approvals, not implementation completion. IMP-002 enforces10/200 after
normalization/dedup, mandatory3 ratings, explicit type, creationMode naming and No Topics
filter sentinel. IMP-003 SQL uses proven normalizer equivalence/explicit exceptions,
preserves raw interview_priority; never removes it (FI-001 outside mandatory roadmap).
IMP-004/005 use v5 creationMode/default3/null-reset and one-time attested inversion;
update planned templates/generator/catalog rubrics only when implementation separately
approved. No actual catalog conversion in this documentation phase.
IMP-006 exports v3 interviewPriority/raw legacy and numeric ratings; presence-aware
metadata. IMP-007 extends existing update_card, retains old valid requests and guards;
no separate classification tool, no search_cards expansion.
IMP-008 accepts active growth without special policy; ordinary classification changes
retain still-eligible positions/remove ineligible/append new unpassed. IMP-009 adds
terminal COMPLETE and Restart new ID, retained Repeat/persistent progress/statistics/
event history; completed browsing Next wraps, no reopening. IMP-010 localizes Creation
Mode and No Topics, removes missing-rating UI, enforces Q-02 read-only completed settings
and offers Restart; only new session settings become editable. IMP-011 verifies these contracts, new-card Repeat admission, start-only limits,
non-destructive restart, topic bounds and unchanged timer/Difficulty/search behavior.
All task database/API/security/migration/test/completion bullets inherit these binding
updates; no superseded nullable-rating/overflow/reopen contract remains effective.

## Resolved-question acceptance

Q-01: IMP-005 emits no legacy interviewPriority field in v5, defaults unattested
priority to3 and reports omitted raw values. No legacy-transfer approval gate remains.
IMP-003 preserves DB raw values until deferred FI-001. Q-02: IMP-009 rejects completed
configure with no mutation; Restart creates new ID with same settings, persistent
progress and Repeat preserved. IMP-010 completed settings read-only; edit controls
available again after successful new-session start. IMP-011 verifies both resolutions.
No unresolved owner decisions remain; implementation authorization is separate.
