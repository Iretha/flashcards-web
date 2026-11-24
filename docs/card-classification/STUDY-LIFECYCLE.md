# Study session lifecycle

Approved planned state machine for DEC-012–019. T-03-T-06/T-09/T-16 are approved; not implemented. Existing snapshot
lifecycle changes explicitly; reuse D1 JSON/versioning, no push or timer redesign.

## State

```json
{"schemaVersion":2,"classification":{"filters":{"topics":{"values":[],"includeNoTopics":false},"priorities":[],"likelihoods":[],"creationModes":[],"cardTypes":[]},"sorting":{"field":"default","direction":"asc"}},"live":{"originalOrder":["a","b"],"cycle":0,"passed":[],"admittedNew":[],"pending":["b"],"frontier":"a","completionReason":null},"history":["a"],"cursor":0}
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

0. COMPLETE resolves access for historical display only; no queue admission/reopening.
1. ACTIVE queries accessible scope IDs/classifications; validate selected deck access.
2. Detect additions/deletions/changed classification from current reads/revisions.
Append stable ranks for new IDs in selected-deck/position/ID order. Known IDs keep rank.
3. Options derive from all accessible scope cards before filters/Repeat/passed status.
4. Candidates are matching accessible unpassed cards. Cycle0 includes all; later cycles
include established Repeat members plus newly admitted cards (T-09).
5. Preserve eligible frontier despite additions. Filter exclusion/deletion/revocation
selects next work; no fabricated outcome event for excluded card.
6. Apply reorders all pending once; live classification removes ineligible entries,
appends eligible unpassed cards and retains still-eligible order even if sort keys
change (T-04/T-16). Never destroy passed/history/Repeat to filter.
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

No eligible repeat work -> COMPLETE. Communicate completion and offer Restart
Session. Preserve applied filters/sort/history/passed/Repeat. COMPLETE is terminal:
new cards, classification/filter changes, resume and ordinary reads never reopen it.
History browses under T-05. Editing completed settings for a subsequent Restart is
not specified by T-06; see Q-02. Either policy must leave COMPLETE terminal.

### Restart T-06

Explicit Restart creates a new session ID, same selected decks/applied filters/sort
and Repeat marks. Resolve current accessible scope/classifications; normal start checks.
Preserve persistent progress/statistics/user event history and Repeat membership.
Reinitialize local passed/admission/navigation history/cursor/frontier/cycle/pending
and ordinary start answer/timer state. Initial pass includes all matching cards
regardless Repeat. No RESET or destructive progress operation. If start checks fail,
retain completed session untouched. Version guards protect concurrent restart.
Completed navigation history remains available until successful replacement; persistent
user event history survives replacement. No extra archival session service introduced.

### New cards during active Repeat T-09

Cycle2 repeats A; matching new B appends once regardless Repeat. If filtered out before
passing, admission retained for reinclusion. Passed B never requeues in cycle2;
subsequent Repeat cycles require mark. No admission into COMPLETE; use Restart.
History wrap cannot advance cycles or generate presentations; only frontier learning
advances. Existing intentional Repeat cycles with marked cards remain.

## Circular navigation T-05

Previous first accessible entry -> last; skip deleted/inaccessible; repeated history
positions remain distinct. Single accessible entry browsing no-op; none disabled.
History browsing never changes progress/Repeat/SHOWN; explicit Repeat action is separate.
ACTIVE Next browsing advances toward frontier; Next on frontier learns normally.
Single-entry browsing rule must not disable learning Next on an ACTIVE frontier.
COMPLETE Next after last accessible entry wraps to first; never learns or starts cycles.
Keep cursor/frontier distinct; reconcile removed frontier mapping before Next, never
consume unseen work. Historical outside-filter view labeled History. Legacy learn is
an explicit outcome, not browsing; never consume a different frontier.

## Start-only limits T-03

At start/restart enforce max30 selected decks/max5000 accessible cards before filters.
Do not check active growth or introduce special overflow state/block/truncation/subset.
Fully Live may grow above5000 normally. Use ID/classification reads and platform-aware
operations, not bulk answers. Performance checks cover growth without adding product
limits. Restart is a fresh start and can fail limits, retaining completed history.

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
COMPLETE remains terminal; explicit Restart only. No forced restart of valid ACTIVE sessions. Unsupported pre-v3/no-cycle state keeps
documented historical handling. Ambiguous malformed state is explicit diagnostic, never
silent reset. Conversion implementation must resolve frontier using old engine invariants,
not assume the historical current view always equals live frontier.

## Timer boundary

No automatic pause on panel open/Apply/exhaustion. Same frontier retains deadline/reveal;
replacement frontier uses existing navigation timer initialization. History uses existing
timing behavior. Empty frontier clears deadline as current completion does. Existing
timeout/show/pause/resume untouched. If these requirements cannot be reconciled in code,
escalate technical conflict; do not refactor timer lifecycle.
