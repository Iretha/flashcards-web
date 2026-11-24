# Implementation roadmap

No task starts without explicit implementation approval. Acceptance of a specification
does not authorize production/commit/push. Each task is independently reviewed/tested.
Common out of scope: global endpoints, new services, taxonomy, evidence expansion,
timer refactor and unrelated redesign. Files listed are expected, not permission to
change unrelated behavior. No new tests in this documentation phase.

## IMP-001 — Resolve technical contracts

- Objective/scope: accept exact syntax/metadata semantics and T-01–09; record decisions.
- Out of scope: implementation, source snapshot capture without separate authorization.
- Dependencies: owner review of this package.
- Components: this specification package; authoritative-document transition inventory.
- Database/API/security/migration impact: decisions only, no runtime change.
- Automated tests: reference/link/coverage checks.
- Manual acceptance: walk priority ambiguity, normalization backfill, new card in Repeat,
  history wrap, overflow, exhausted resume and MCP permissions examples.
- Required owner decisions: register T-01–09 and proposed bounds/export version.
- Completion: no contradictory unresolved contract for downstream task being authorized.

## IMP-002 — Shared classification domain and validation

- Objective/scope: normalizer, universal ratings/origin, question/task, type-only metadata,
  source/reference preservation, pure filter/comparator contracts.
- Out of scope: schema execution, UI and new API capabilities.
- Dependencies: IMP-001 relevant decisions.
- Components: src/lib/metadata.ts, translations.ts, classification helpers; tests/languages,
  metadata and comparator fixtures.
- Database impact: none yet; prepare validated DTOs.
- API impact: target schemas staged only with compatible adapters, no partial release.
- Security impact: strict allowlists, bounded arrays/strings and task validation.
- Migration impact: normalizer reused by approved preparation mechanism.
- Automated tests: normalization/scale/default/task/comparator matrix.
- Manual acceptance: review BG/EN labels and Unicode collision examples.
- Required decisions: T-08, bounds, comparator exact syntax.
- Completion: native search normalization unchanged; domain tests pass.

## IMP-003 — Forward migration and canonical membership writes

- Objective/scope: card_topics/indexes, ratings/origin, approved static backfill, type
  conversion, epoch triggers, lifecycle-compatible invalidation triggers.
- Out of scope: production execution and arbitrary legacy priority mapping.
- Dependencies: IMP-002; T-01/T-02 approved snapshot/mapping procedure.
- Components: next forward migrations/*.sql, src/server/decks.ts writeCards,
  import-plan DTOs, migration/search tests; repair SQL only if procedure changes.
- Database impact: canonical schema/data transition, FKs/indexes/triggers.
- API impact: target storage adapters; no standalone deployment against old app.
- Security impact: mutation marker/revision/authorization gates every membership write.
- Migration impact: full preservation/failure rehearsal from MIGRATION-PLAN.
- Automated tests: populated migration, unknown map abort, atomic rollback/cascades/epoch.
- Manual acceptance: compare preservation manifest and reviewed migration SQL.
- Required decisions: T-01/T-02; incompatible cutover plan.
- Completion: local migration and write tests pass; zero dual canonical topics; release
  remains blocked until compatible app/import/session tasks complete.

## IMP-004 — Markdown v5 parser, preview and apply

- Objective/scope: exact v5 grammar, presence-aware patch, preview/apply parity.
- Out of scope: direct legacy import, generated answers or question reassessment.
- Dependencies: IMP-002/003; accepted v5 contract.
- Components: src/lib/markdown.ts and parser modules, src/server/import-plan.ts,
  decks.ts, src/ui/Import.tsx, markdown/API tests.
- Database impact: existing guarded membership/card batch only.
- API impact: browser import contract becomes explicit v5; actionable legacy diagnostics.
- Security impact: YAML safety/size limits, ownership/replacement guards retained.
- Migration impact: no further schema; cutover coordinated.
- Automated tests: missing/empty/clear/reimport IDs/progress/languages/tasks/fences.
- Manual acceptance: preview classification change and explicit destructive replacement.
- Required decisions: exact syntax and old-client rejection policy.
- Completion: v5 validation and reimport parity pass, no silent metadata loss.

## IMP-005 — Legacy conversion and catalog documentation

- Objective/scope: v3/v4 conversion-only parser path, diagnostics, one-time attested
  likelihood inversion and rubric/template/guideline updates.
- Out of scope: v1/v2 parser invention, source verification, content additions/deletions.
- Dependencies: IMP-004; T-01 mapping for non-null old priorities.
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
  and ambiguous Priority treatment.
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
- Required decisions: T-01/T-08 and consumer cutover.
- Completion: no answer-only update loses topics/source data; contract tests pass.

## IMP-007 — MCP classification capabilities

- Objective/scope: get_card classifications/revision, approved create extension and
  separately approved classification update tool.
- Out of scope: global search, Study controls, silent answer-tool widening.
- Dependencies: IMP-006; explicit T-07 capability approval.
- Components: mcp-reads.ts, mcp-writes.ts, mcp.ts registration, schemas/tests/docs.
- Database impact: reuse authorized canonical batches/receipts.
- API impact: strict input/output additions and documented tool capability boundary.
- Security impact: membership + third_party_access + credential purpose, live checks,
  revision/idempotency/size/rate limits unchanged.
- Migration impact: none beyond IMP-003.
- Automated tests: capability schema, revoke/replay, conflict/atomic rollback, hostile input.
- Manual acceptance: authenticated MCP read/create/edit with denied-access cases.
- Required decisions: T-07 separately; no registration until approved.
- Completion: desired card data support without expanded session/global permissions.

## IMP-008 — Session state adapter and Fully Live projection

- Objective/scope: versioned state, original ranks, passed/admitted/frontier, live options
  and pending, overflow/access exclusion; preserve existing sessions.
- Out of scope: circular UI/timer refactor/push.
- Dependencies: IMP-002/003; T-03/T-04/T-09.
- Components: study.ts, study-cycles.ts, sessions.ts, session/migration tests.
- Database impact: existing JSON/session CAS; no per-user fanout infrastructure.
- API impact: state/options/count/limit fields and read-time reconciliation semantics.
- Security impact: whole scope current access, no unavailable labels/events.
- Migration impact: lazy guarded adapter, no restart of valid sessions.
- Automated tests: live addition/removal/reinclude/rank/limit, adapter random/history states.
- Manual acceptance: mutate deck on second device and resume retained session.
- Required decisions: T-03/T-04/T-09; adapter ambiguity resolved with fixtures.
- Completion: no duplicate cards or lost current/history/Repeat/timer/progress.

## IMP-009 — Lifecycle, navigation and atomic Apply API

- Objective/scope: circular Previous, Next/frontier boundary, filtered completion/reopen,
  atomic configure, all five filter/sort predicates and stale-state handling.
- Out of scope: new timer lifecycle or remote Study management.
- Dependencies: IMP-008; T-05/T-06.
- Components: study/cycle engine, sessions.ts, api.ts, ui/api.ts and tests.
- Database impact: existing session JSON/version/events; no schema service.
- API impact: browser-only configure and authoritative view responses.
- Security impact: same-Origin/JSON/cookie gates; no stale outcomes after revoke.
- Migration impact: session adapter stays backward compatible.
- Automated tests: full lifecycle/Apply/cross-device/event-count/timer regression matrix.
- Manual acceptance: history wrap->Next->frontier, empty results->Apply->resume same ID.
- Required decisions: T-05/T-06; timer conflict escalation if evidenced.
- Completion: deterministic pending, finite history navigation, no silent overwrites.

## IMP-010 — Study controls and management compatibility

- Objective/scope: five dropdowns, draft Apply/Cancel/Clear/Default, completion panel,
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
- Required decisions: exact UI/spec acceptance.
- Completion: wireframe behavior passes; Study core/sidebars preserved.

## IMP-011 — Performance, integration and documentation acceptance

- Objective/scope: representative datasets/query plans, complete regression and authoritative
  docs promotion; incompatible migration/deployment recovery rehearsal.
- Out of scope: actual production deployment/commit/push or global search endpoints.
- Dependencies: IMP-003–010 accepted; all blocking technical gates resolved.
- Components: relevant tests/E2E, local fixtures, docs inventory in package README.
- Database impact: local verification only; no production operations.
- API/security impact: end-to-end contracts and revocation/permission evidence.
- Migration impact: exact runner and rollback/recovery rehearsal.
- Automated tests: applicable npm test/typecheck/build/E2E, migration/search/authorization.
- Manual acceptance: full TESTING-ACCEPTANCE matrix and owner performance review.
- Required decisions: measured performance thresholds, explicit subsequent release approval.
- Completion: documented evidence/limitations, no stale authoritative contracts, diff check;
  feature ready for separate release authorization, never automatically deployed.
