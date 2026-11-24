# Study session lifecycle

Proposed state machine for DEC-012–019. T-03–06/T-09 need review. Existing snapshot
lifecycle changes explicitly; reuse D1 JSON/versioning, no push or timer redesign.

## State

```json
{"schemaVersion":2,"classification":{"filters":{"topics":[],"priorities":[],"likelihoods":[],"origins":[],"cardTypes":[]},"sorting":{"field":"default","direction":"asc"}},"live":{"originalOrder":["a","b"],"cycle":0,"passed":[],"admittedNew":[],"pending":["b"],"frontier":"a","completionReason":null},"history":["a"],"cursor":0}
```

Illustrative fragment; retain existing Repeat, language, reveal/answer overrides and
timer values. OriginalOrder encodes first-discovery ranks, including persisted shuffle.
History may retain deleted IDs for audit, but presentation resolves access every time.
Passed means consumed in current cycle, not every SHOWN event. Frontier is live work
item independent of historical cursor. Only next/legacy learn consuming frontier
marks passed. New frontier appends history and emits one SHOWN. History navigation
never consumes pending or emits SHOWN. Persistent Learned state does not exclude initial
pass; session Repeat remains distinct.

## Fully Live reconciliation

1. Query accessible scope IDs/classifications; validate selected deck access.
2. Detect additions/deletions/changed classification from current reads/revisions.
Append stable ranks for new IDs in selected-deck/position/ID order. Known IDs keep rank.
3. Options derive from all accessible scope cards before filters/Repeat/passed status.
4. Candidates are matching accessible unpassed cards. Cycle0 includes all; later cycles
include established Repeat members plus newly admitted cards (T-09).
5. Preserve eligible frontier despite additions. Filter exclusion/deletion/revocation
selects next work; no fabricated outcome event for excluded card.
6. Apply reorders all pending once; ordinary discovery retains old pending order and
appends new IDs (T-04). Never destroy passed/history/Repeat to filter.
7. Commit with session CAS and source revision/access guards. Bounded retry on source
drift; stale user mutation remains conflict.

Frontier is not passed yet. If excluded, it may re-enter when filters expand. When
Apply occurs in history, keep accessible historical view even outside filters; frontier
may independently change. Deleted/inaccessible viewed entry moves to adjacent accessible
history or frontier; if none show exhausted/unavailable without content disclosure.

## Cycles and exhaustion

After frontier consumption and empty pending, begin next Repeat cycle if eligible
marked cards exist; reset per-cycle passed, increment cycle, snapshot eligible Repeat.
Unmarked established repeat pending is skipped; newly marked historical card joins
next cycle as today. No duplicate IDs per cycle queue.

No eligible repeat work -> COMPLETE + FILTERED_EXHAUSTED (T-06), retaining filters,
history/passed/Repeat. Keep Apply available. Broader filter or matching new cards on
resume can reopen same ID without re-presenting passed cards. Exhaustion is not
permanent closure; existing explicit Start new replaces old session under confirmation
and version guard. No automatic filter clearing, no close endpoint added.

New-card example T-09: cycle2 repeats A; new B joins once without Repeat mark.
B passed -> later cycles require B marked. If filtered out before passing, retained
admission lets filter expansion restore B. New cards discovered during exhausted
state join retained cycle. Existing passed cards never reappear merely on filter clear.
History wrap itself cannot cross cycles; only frontier consumption can. Intentional
Repeat cycling while marks exist remains existing behavior, not circular-navigation loop.

## Circular navigation T-05

Previous wraps full accessible session history, not filtered subset. Separate repeated
presentations remain separate positions. First -> last accessible; one position no-op;
none disabled. Next in history moves toward tail, no wrap. At tail, if not viewing
frontier, return to frontier without consuming it; subsequent Next consumes it. This
prevents consuming unseen live work. Historical outside-filter view labeled History.
Repeat toggle applies to viewed accessible card. Legacy learn records viewed card's
outcome and returns toward frontier without consuming a different card. Deleted/revoked
entries skipped; sorting never changes history order or historical presentation counts.

## Limits T-03

Max30 selected decks and 5000 accessible scope cards, before filters, retain current
start contract. Start over limit rejected. Fully Live growth above cap gives recoverable
LIMIT_EXCEEDED; preserve state/applied settings; no silent subset or forward admission.
History browsing/exit remain available. Filter narrowing does not reduce scope count.
Recover when scope shrinks or explicitly start a smaller selected-deck session. No
new in-session deck editor. Alternative owner-approved filtered-cap/higher cap requires
separate performance evidence. Query count/IDs/classifications, never unbounded answers.

## Access loss

Remove inaccessible cards from current/pending/history presentation at next interaction.
Keep selected deck IDs privately for restoration but do not expose inaccessible deck
labels/options. Other decks continue, no whole-session invalidation. Access regained
may restore unpassed cards with previous rank. Forward trigger changes required.

## Existing-session adapter

Cycle-aware active/exhausted sessions retain current/history/cursor/order/pending,
Repeat, language, answer overrides and timer bytes. Initialize passed from current-cycle
membership minus pending minus frontier; do not use entire multi-cycle history. Adapter
must fixture-test history cursor away from frontier and completed cycles; retain old
state until validated. Existing later-cycle snapshot provides known members; new admission
only on actual discovery. Empty applied filters/default sort; persist once under CAS.
No forced restart of valid current sessions. Unsupported pre-v3/no-cycle state keeps
documented historical handling. Ambiguous malformed state is explicit diagnostic, never
silent reset. Conversion implementation must resolve frontier using old engine invariants,
not assume the historical current view always equals live frontier.

## Timer boundary

No automatic pause on panel open/Apply/exhaustion. Same frontier retains deadline/reveal;
replacement frontier uses existing navigation timer initialization. History uses existing
timing behavior. Empty frontier clears deadline as current completion does. Existing
timeout/show/pause/resume untouched. If these requirements cannot be reconciled in code,
escalate technical conflict; do not refactor timer lifecycle.
