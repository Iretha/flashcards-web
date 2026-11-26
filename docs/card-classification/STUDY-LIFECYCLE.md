# Study session lifecycle

Approved planned state machine for DEC-012–019. T-03-T-06/T-09/T-16 are approved. IMP-008 is accepted with outstanding manual two-device verification retained for final acceptance; IMP-009 navigation/Apply/Restart is implemented locally. Existing snapshot
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
History browses under T-05. Q-02 RESOLVED: completed settings are read-only.
Restart starts a new session with the same selected decks/applied filters/sorting;
settings become editable only after it starts. COMPLETE never reopens.

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

Owner-approved restoration amendment (2026-11-25): restore existing cycle-aware
sessions with **no active classification filters** and default sorting. Preserve
existing pending, current, history/cursor, persisted shuffle, cycle, Repeat, language,
answer overrides, deadlines/remaining time and progress. Do not reconstruct unavailable
historical cycle boundaries or historical passed membership. This supersedes the prior
requirement to infer current-cycle passed from legacy history/membership.

The versioned adapter adds metadata without altering those stored values. The old
engine's last history entry is the frontier even when the cursor browses history.
Initialize `passed` empty and copy only stored pending plus frontier into the cycle's
admission snapshot (`cycles.live.members`); this is remaining work, not a claim about
historical consumption. Previously known cards outside that snapshot cannot be
readmitted during that cycle. Actual new discoveries are admitted normally. At a
natural Repeat boundary, the same shared cycle engine initializes the next membership
snapshot and clears per-cycle passed/admissions normally. No forced cycle reset,
termination, or separate permanent legacy engine. Subsequent consumption records passed
prospectively. No historical information is required for exact unfiltered restoration.

Implementation stores schemaVersion/classification on StudyState and live metadata
on the existing cycles object: originalOrder, frontier, passed, admittedNew, members,
eligible (matching scope in applied sort order) and accessible (history access only).
Existing cycles.pending remains the single pending queue. Original ranks include
persisted shuffle; old queue ordering is retained. Options and projection use shared
classification predicates/comparators. Ordinary reads do not resort existing pending.

Persist adaptation once with session CAS plus current source/access guards, including
terminal sessions without admission or reopening. COMPLETE remains terminal; explicit
Restart uses POST /api/study/restart (IMP-009). Unsupported pre-v3/no-cycle state keeps documented historical
handling. Malformed/unknown versioned state is diagnostic, never silently reset.
Source guards reuse selected-deck revisions/current access and the existing card/topic
epoch; no new signal, background work, index or per-user fanout. Retry source/CAS drift
at most three attempts; stale user versions remain conflicts. Single-card materialization
revalidates access and checks source again before returning content/options. Unchanged
read reconciliation checks session ID/version and source in the same SQL read; concurrent
session changes retry within the same three-attempt bound. A session change during final
materialization returns a conflict rather than a stale view.

IMP-009 completes empty-frontier lifecycle handling: exhausted work becomes terminal
COMPLETE while retaining accessible history, passed, original ranks and Repeat. New
source work or classification changes do not admit cards into COMPLETE. Previous
wraps accessible history; ACTIVE Next browses toward the frontier and consumes only
that frontier, while COMPLETE Next wraps history without outcomes or SHOWN. Repeated
history positions remain distinct. Legacy learn on historical entries cannot consume
or advance another frontier. Empty/single-entry history navigation is safe.

POST /api/study/configure accepts exactly id/version/full filters/full sorting. It
validates shared contracts, projects once with the proposed settings, sorts all pending
by the shared comparator, and commits one version increment under session/source guards.
It preserves eligible frontier, historical cursor/view, Repeat/passed and unchanged
frontier timer values. No global preferences are written. Source drift retries within
three attempts; stale session IDs/versions and completed-session Apply return 409.

POST /api/study/restart accepts exactly the completed id/version. It reuses normal
start validation (including access, deck/card limits), creates a new ID, retains
selected decks/applied settings/Repeat and persistent statistics/events, and initializes
ordinary initial-pass navigation/answer/timer state. Failure leaves the completed
session intact. COMPLETE accepts history navigation only; ordinary settings/actions
cannot reopen it. No new UI controls are introduced before IMP-010.

## Timer boundary

No automatic pause on panel open/Apply/exhaustion. Same frontier retains deadline/reveal;
replacement frontier uses existing navigation timer initialization. History uses existing
timing behavior. Empty frontier clears deadline as current completion does. Existing
timeout/show/pause/resume untouched. If these requirements cannot be reconciled in code,
escalate technical conflict; do not refactor timer lifecycle.
