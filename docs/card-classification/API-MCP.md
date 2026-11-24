# API and MCP contracts

Owner-approved planned contracts T-07/T-11-T-16, not implemented. No broader access,
Study MCP tools or global classification search. Preserve existing credentials,
origin/CSRF checks, grants, ownership/collaboration and atomic mutation guards.

## Shared card fields

External topics:string[], priority:int1..5, likelihood:int1..5, creationMode:
MANUAL|AI|UNKNOWN, metadata.cardType:question|task. DB maps creationMode to creation_mode.
No aliases for former unimplemented classification name; unrelated origin unchanged.
Type explicitly persisted for every card. difficulty stays existing nullable scale.

| Input | Create | Partial update |
|---|---|---|
| Omitted rating | 3 | Preserve |
| null rating | 3 | Reset3 |
| integer1..5 | Set | Set |
| invalid rating | Reject | Reject |
| Omitted topics | [] | Preserve |
| topics [] | [] | Clear |
| Omitted creationMode | UNKNOWN | Preserve |
| creationMode UNKNOWN | UNKNOWN | Reset UNKNOWN |
| creationMode null | Reject | Reject |

Retain existing API creation-mode input rules except approved naming/default changes;
Markdown's approved empty/null reset is format-specific. Metadata object updates are
presence-aware: omitted members preserve, cardType question explicitly sets question,
provenance null clears, answerReferences [] clears. metadata null resets to type-only
question. Task validates every final retained language for nonblank questionDetails.
Default/implicit type on creation is persisted, not only inferred at read time.
Normalize topics then enforce10 unique/max200 UTF-16 units each, atomic rejection.
Existing request caps protect raw payload; new concrete bounds require approval.

Responses have numeric non-null universal ratings, creationMode, topics, metadata and
revision; preserve legacy raw rating distinctly. JSON Export v3 names it interviewPriority;
Management existing interview_priority read field stays explicitly legacy, not universal.
Old mutable interview_priority compatibility cannot reinterpret priority; preserve raw
values and valid existing legacy requests until separately approved FI-001 transition.
No evidence model extensions. Export keeps existing content/progress/history/access
contract, provenance/references, difficulty; no active Study settings/filters/sort or restore.

## Management

Existing /api/decks/{id}/cards GET/list/POST/PATCH paths. No global search parameters.
Retain POST idempotency/exact-body fingerprint and PATCH deck If-Match (428 missing,
412 stale); 409 conflicting receipt, 400 invalid fields. Omitted answer preserves,
empty clears. Classification/membership/receipt/revision writes one guarded batch;
failures rollback all. Current membership revalidated atomically, not only prior GET.
Document incompatible metadata/type transition before release; legacy Markdown uses
converter. Keep existing authentication/access and supported nonconflicting requests.

## Existing MCP tool expansion T-07

Owner approves extending get_card/create_card/existing update_card. Do not create a
separate classification tool. search_cards schema/capabilities unchanged.
get_card returns canonical five classifications and deck revision with existing content.
create_card adds optional topics, priority, likelihood, creationMode, metadata and
questionDetails for task creation, retaining existing question/answer/language/deck defaults.
update_card supports answer and/or optional classifications; omitted fields preserve,
null rating resets3. Classification-only update must not clear answer. Existing answer-
only requests, including omission-preserve behavior, remain valid. Type change validates
retained languages/specs; missing specs reject instead of fabricating content.

Concurrency: optional expected_revision for legacy answer-only compatibility; require it
for classification-bearing updates. Compare deck revision in committing SQL; all paths
retain existing internal revision/mutation guard. get_card supplies revision. Stale ->
CONFLICT; no blind retry. Do not impose a new mandatory argument on old valid answer-only
requests. Existing create idempotency optional; fingerprint includes presence and every
new field; replay rechecks access and preserves current safeguards.

Strict input/output contracts retain bounded structuredContent+JSON text and current
byte/rate limits. get_card {item}; create {card_id,status} plus documented canonical
fields if returned; update preserves existing card_id/language/answer/status for old
answer requests, adds revision/classification fields for edits without removing old
fields. Errors INVALID_ARGUMENTS/CONFLICT/UNAVAILABLE; annotations do not grant access.
Validate membership AND third_party_access/credential purpose at discovery/materialization,
replay and atomic write. SHARED alone insufficient. No Study or broader token permissions.

## Browser Study Apply

GET /api/study and GET /api/home include applied settings, available options, eligibleTotal,
remainingInCycle, version/current/status. No overflow-specific fields. COMPLETE never
reopens: display read-only settings/history and Restart. Q-02 RESOLVED: configure
on COMPLETE is rejected without changing applied settings, queue or version.
Settings can be edited only on the newly started session after successful Restart.

Proposed POST /api/study/configure (ACTIVE only; Q-02 resolved):

```json
{"id":"s1","version":8,"filters":{"topics":{"values":["TRANSACTIONS"],"includeNoTopics":true},"priorities":[1,3],"likelihoods":[],"creationModes":[],"cardTypes":["task"]},"sorting":{"field":"priority","direction":"asc"}}
```

No Topics representation is separate boolean, never a topic string: empty values plus
false unrestricted; true OR zero-membership cards with any selected names. Options expose
available topic strings plus noTopicsAvailable boolean. Stale applied true/name stays
restrictive even if no longer present; explicit Clear resets. Rating arrays integer1..5
only; null invalid. Normalize names, dedup, require all filter categories/full sort;
reject unknown fields. One atomic Apply projects once and increments version once;
no global preference. Stale ID/version409, no silent overwrite; draft unaffected until
Apply. Same-Origin/JSON/cookie guards, no bearer session control.

## Restart and reconciliation

Browser-only explicit Restart operation uses session ID/version; creates new ID with
same decks/applied settings/Repeat, resets local navigation/passed state only. Normal
start checks once; fail leaves prior COMPLETE intact. Return authoritative new view.
No mutation reopens prior COMPLETE. Restart route/action shares current start guards;
implementation should select narrow existing-route extension, no remote administration.
ACTIVE reconcile at read/resume/action/Apply, no push/polling; COMPLETE reads only
revalidate historical access. CAS persists active projection, bounded retry on source
revision drift, never silently retry stale user input. Current access/source revisions
checked inside commit; no SHOWN/outcome after revocation. Restore last applied state
across devices, never draft. New cards/classification only affect ACTIVE sessions.
