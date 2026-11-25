# Database migration plan

Migration 0021 and its canonical storage writes are implemented locally and await
independent review. This is not deployment authorization; the coordinated-release gate
remains in force.

## Approved preparation contract T-02

Use standard SQL migrations, no custom runner. Before preparing migration inspect
existing distinct topic values only in authorized data. Compare UPPER/TRIM against
the canonical JS normalizer for the actual domain: Unicode/NFC, case expansion,
final post-uppercase NFC, edge/internal whitespace, repeated spaces/tabs/newlines/NBSP.
Use SQL functions only
where equivalence is proven; explicit reviewed SQL mappings for exceptions. Guard
unknown/invalid values and capture/cutover drift; abort rather than approximate.
No production access or real migration preparation/execution in this documentation task.

## Forward transition

1. Select next unused migration after actual applied head (repository head 0020).
Never edit historical SQL. Rehearse populated fixtures and capture preservation
baselines for cards/decks/translations/progress/events/metadata/session JSON.
2. Add owner-approved card_topics and reverse index. Add universal ratings/creationMode
with INTEGER NOT NULL DEFAULT3 and integer/range CHECKs for both ratings;
creation_mode NOT NULL DEFAULT UNKNOWN with enum CHECK. Priority initializes to3
absent attested compatible mapping. Retain raw interview_priority, never infer scale
compatibility/direction. Separate FI-001 removal is outside this migration.
3. Insert one normalized membership per scalar topic, no semicolon splitting.
Metadata null yields no membership. Blank/invalid scalar metadata triggers diagnostic
and failure, not silent loss. Use PK for dedup after normalization. Verify coverage,
then remove metadata.topic in same forward transition: no dual canonical storage.
4. Missing/unattested likelihood -> 3; creation_mode UNKNOWN. Never infer from other ratings/provenance.
5. coding_task -> task via JSON update; null metadata -> {cardType:question}; missing
type -> question for otherwise valid metadata. Preserve all source properties,
references, translations, details and identifiers. Reject invalid types/task specs;
do not invent specifications, source records or new evidence fields.
6. Remove card-deletion/deck-unshare whole-session invalidation triggers. Fully Live
reconciliation revalidates current access/source revisions and uses the existing session
CAS only when session state changes; do not add a trigger-only version signal. Keep
historical events and existing FKs.
7. Membership INSERT/DELETE/UPDATE triggers increment existing card_search_state.epoch.
No FTS text writes; no second epoch. Multiple increments per transaction harmless.
8. Keep valid active/exhausted session data; lazy versioned adapter initializes new
fields without resetting current/order/history/Repeat/timer. Existing COMPLETE stays
terminal: no read/resume/filter/new-card reopening. See lifecycle spec.

## Atomic canonical writes

Normalize/validate before SQL. Existing authorized revision+mutation header guards
card and membership statements in one D1 batch. Only supplied topics delete old and
insert new memberships; omitted topics do no membership writes and are not normalized
again. Explicit null topics are invalid at shared-domain ingress. Guard each statement
on successful mutation marker. Rollback card, links, deck revision and receipts on
any error. Native indexes maintain themselves; no dual indexing/backfill service.

## Search assessment

Canonical translations, FTS schema/tokenizer/mapping unchanged. Classification-only
transition needs no FTS reconstruction. Test translation rowids, details/answer search,
cascades and epoch consistency. If final SQL changes reconstruction requirements,
embed reconstruction in that migration and update scripts/repair-search.sql; otherwise
repair procedure remains unchanged. No ordinary deployment reconstruction/verification.

## Deployment and failure handling

Later API/import/session consumers must become schema-compatible before cutover. Under a
separately authorized release plan pause traffic/writers, capture a verified restorable
recovery point, rehearse migration and mapping coverage, then use
unchanged npm run deploy (build -> migrations -> wrangler deploy --keep-vars).
Preserve secrets/bindings/auth/arguments. Build/migration failure stops publish.

Verify atomicity and interruption behavior of the actual Wrangler migration path;
do not infer it from D1 batch unit tests. Preconditions precede destructive steps;
rehearse failure at each step. Successful migration is not rolled back by failed
publish. Keep traffic paused, deploy compatible app or execute rehearsed full recovery.
Do not casually roll old app onto incompatible schema. No destructive downgrade.

## Validation gates

IDs/import keys/translations/details unchanged; progress/events/source metadata and
references preserved; expected normalized memberships, no duplicates/orphans/old
canonical topic; raw priority retained; defaults correct; session current/history/
Repeat/order/timer preserved; FK check and FTS parity pass. Produce transformed/rejected
counts and exact diagnostics. Default3 is expressly approved T-01/T-13, not a
reassessment. T-10 normalized topic bounds apply after deduplication; reject offending
rows diagnostically. No active-session overflow state or growth cap.
