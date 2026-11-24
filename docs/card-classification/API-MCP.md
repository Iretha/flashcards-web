# API and MCP contracts

Planned changes. Keep current credentials, origin checks, scope, grants, revision
guards, idempotency and error envelopes. [Capability approval](DECISIONS.md) required.

## Shared card contract

Management fields add topics:string[], priority:number|null, likelihood:number|null,
origin enum. Card Type only metadata.cardType question/task. Create defaults
[]/null/null/UNKNOWN/question. PATCH omission preserves; topics [] clears; ratings
null clears; origin null invalid (use UNKNOWN). metadata null explicitly clears
provenance/references and resets to {cardType:question}; validate final translations.
Metadata object patch becomes presence-aware for cardType/provenance/answerReferences;
provenance null clears, answerReferences [] clears. Reject metadata.topic/coding_task
after cutover; use legacy converter. Difficulty contract unchanged.
Response includes normalized topics, universal ratings, origin, canonical metadata,
revision and clearly legacy interview_priority pending T-01. No root duplicate type.

Existing Management /api/decks/{id}/cards GET/list/POST/PATCH routes retained. No new
global search/filter parameters. POST exact-body idempotency and PATCH deck If-Match
remain. Missing If-Match 428; stale 412; conflicting receipt 409; invalid fields 400.
Classifications/memberships/receipt commit atomically. Metadata contract is incompatible;
document cutover, reject obsolete fields instead of ignoring them. Read/write authorization
remains distinct from MCP third-party policy.

## MCP proposal T-07

DEC-023 requires eventual read/create/edit support but does not silently enlarge the
answer-only update tool. Proposed create_card optional fields: topics, priority,
likelihood, origin, metadata, questionDetails. Existing question/answer/language/deck
defaults remain; task details required. Request fingerprint includes all supplied
fields and their presence; preserve receipt/replay/current-access checks.

Propose NEW update_card_classification(card_id, expected_revision, optional topics,
priority, likelihood, origin, metadata). Strict shared patch schema; at least one field
required. Type task validates all retained specs; supply specs through existing content
management first if absent. Existing update_card remains answer-only. Alternative:
explicit approval to broaden update_card. Neither registered without separate capability
approval. New tool annotations readOnlyHint false, destructiveHint false, idempotentHint
true for value-setting patch; annotations never grant authority. Expected deck revision
required; conflict -> CONFLICT, no blind retry. Need read get_card to expose revision.

get_card adds topics/priority/likelihood/origin/revision; metadata stays canonical.
search_cards summaries unchanged; no global classification search. Define strict input
and explicit documented output envelopes: read {item}, list {items,next_after}; create
{card_id,status}; classification update {card_id,revision,topics,priority,likelihood,
origin,metadata,status}. Preserve structuredContent+JSON text, existing request/result
byte caps and bounded errors INVALID_ARGUMENTS/CONFLICT/UNAVAILABLE.

Keep membership AND third_party_access checks at candidate read, materialization,
replay and atomic mutation with freshly verified credentials. SHARED alone never
grants MCP access. No Study controls or broader token permissions.

## Browser Study

GET /api/study and home include applied filters/sorting, available options,
eligibleTotal, remainingInCycle, completionReason, limitState, version and current
view fields. No bulk answer fetch for options.

Proposed POST /api/study/configure:

```json
{"id":"s1","version":8,"filters":{"topics":["TRANSACTIONS"],"priorities":[1,null],"likelihoods":[],"origins":[],"cardTypes":["task"]},"sorting":{"field":"priority","direction":"asc"}}
```

Require all arrays and full sorting object; normalize/dedup topics, allow int1..5/null
ratings, reject unknown fields/enums. One atomic Apply updates settings, projects queue
once and increments version once; no global deck/user preferences. Preserve history,
progress and Repeat. Stale ID/version -> 409 with no overwrite. Existing browser auth,
same-Origin/JSON guards, no bearer session control. Response authoritative Study view.

Live reconcile at start/resume/Study reads/actions/Apply; no polling/push. Read-side
persistence uses CAS if projection changes; retry bounded projection on source deck
revision drift, never silently retry stale user actions. Return latest state or conflict.
Commit validates current access/source revisions. Card changes do not eagerly rewrite
every user session. Revocation must prevent new SHOWN/outcome writes for revoked cards.
Cross-device reads restore last applied state, never another device's draft.
