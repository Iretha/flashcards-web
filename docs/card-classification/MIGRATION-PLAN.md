# Database migration plan

No migration is authored/executed by this documentation task.

## Preparation and approval gates

Resolve T-01 and T-02 before migration implementation. SQL upper() is not full JS
Unicode uppercase and cannot implement NFC. Do not substitute an approximate SQL
normalizer. AGENTS forbids adding a custom maintenance/migration runner.

T-02 recommendation: after separately authorized snapshot capture, generate reviewed
static literal mapping SQL locally with the shared normalizer. Embed mappings in
the forward migration, verify all encountered scalar topic values covered, abort on
unknown/malformed data. Freeze writers across final capture and cutover; regenerate
on drift. This procedure and snapshot authorization require explicit owner approval.
Alternative mechanism needs an explicit architecture exception. No production read
or generated migration is authorized now.

## Forward transition

1. Select next unused migration after actual applied head (repository head 0020).
Never edit historical SQL. Rehearse populated fixtures and capture preservation
baselines for cards/decks/translations/progress/events/metadata/session JSON.
2. Add owner-approved card_topics and reverse index. Add universal ratings/origin
with constraints. T-01 proposal: priority NULL unless attested mapping exists;
retain interview_priority unchanged and clearly legacy in responses/export.
Do not copy or invert ambiguous values; later removal requires completed mapping.
3. Insert one normalized membership per scalar topic, no semicolon splitting.
Metadata null yields no membership. Blank/invalid scalar metadata triggers diagnostic
and failure, not silent loss. Use PK for dedup after normalization. Verify coverage,
then remove metadata.topic in same forward transition: no dual canonical storage.
4. Likelihood NULL; origin UNKNOWN. Never infer from other ratings/provenance.
5. coding_task -> task via JSON update; null metadata -> {cardType:question}; missing
type -> question for otherwise valid metadata. Preserve all source properties,
references, translations, details and identifiers. Reject invalid types/task specs;
do not invent specifications, source records or new evidence fields.
6. Forward-replace card-deletion/deck-unshare invalidation triggers to support live
exclusion instead of forced restart. Keep historical events; keep existing FKs.
7. Membership INSERT/DELETE/UPDATE triggers increment existing card_search_state.epoch.
No FTS text writes; no second epoch. Multiple increments per transaction harmless.
8. Keep valid active/exhausted session data; lazy versioned adapter initializes new
fields without resetting current/order/history/Repeat/timer. See lifecycle spec.

## Atomic canonical writes

Normalize/validate before SQL. Existing authorized revision+mutation header guards
card and membership statements in one D1 batch. Only supplied topics delete old and
insert new memberships; omitted topics do no membership writes. Guard each statement
on successful mutation marker. Rollback card, links, deck revision and receipts on
any error. Native indexes maintain themselves; no dual indexing/backfill service.

## Search assessment

Canonical translations, FTS schema/tokenizer/mapping unchanged. Classification-only
transition needs no FTS reconstruction. Test translation rowids, details/answer search,
cascades and epoch consistency. If final SQL changes reconstruction requirements,
embed reconstruction in that migration and update scripts/repair-search.sql; otherwise
repair procedure remains unchanged. No ordinary deployment reconstruction/verification.

## Deployment and failure handling

Old code depends on scalar topic, coding_task and required provenance: incompatible
cutover. Under separately authorized production plan pause traffic/writers, capture
verified restorable recovery point, rehearse migration and mapping coverage, then use
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
counts and exact diagnostics. No silent repair or arbitrary rating assignment.
