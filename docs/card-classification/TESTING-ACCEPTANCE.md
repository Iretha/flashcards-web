# Testing and acceptance plan

No tests run or created in specification phase. Future implementation must supply
evidence; no measured performance is claimed here.

## Automated matrix

| Area | Concrete acceptance scenarios |
|---|---|
| Normalizer | Initial and final NFC, exact U+0390 -> U+03AA U+0301 counterexample, composed/decomposed Latin/Greek/Cyrillic, spaces/tabs/newlines/NBSP, case expansion, binary dedup collisions, empty element rejection, empty array, null/non-array rejection, 10 unique/200 UTF-16 against final values; 11/201 rejected atomically; existing raw payload caps; reproducible broad Unicode idempotence scan with coverage/runtime reported |
| Membership | PK duplicate rejection, reverse index plan, card deletion cascade, no orphan/deck copy, atomic rollback |
| Migration | Populated null/full metadata, source/reference preservation, coding_task->task/details, IDs/progress/events/session parity; unknown map abort; FK/FTS parity |
| Priority | Strict int1..5; missing/null create3, omitted update preserve/null reset3; raw legacy unchanged, new3 absent attested mapping |
| Likelihood | Mandatory default3/reset; attested catalog 6-old; raw null never inverted; already-target refuses inversion; counts/IDs/question text unchanged |
| Creation Mode | Create UNKNOWN, omission preserve, explicit values; answer translation/provenance do not infer creationMode |
| Type | Default question; type-only metadata no fake source; task every retained language details; clear details invalid for task |
| v5 | Grammar, duplicate/unknown headings, fenced headings, aliases rejected, limits, presence/empty distinctions, preview/apply parity |
| Legacy | v3/v4 only conversion, sources/count validation, scalar topic one value, lossless translations/answers/details; default3 plus retained raw legacy diagnostics/Q-01 |
| Reimport | IDs/progress preserved, omitted fields/languages/cards retained; omitted topics preserve exact values/order without normalization or array aliasing; explicit topics/reference clears and rating null reset3; type changes validated |
| Options | 1/2/30 decks UNION DISTINCT; no phantom enum; No Topics present-only/collision-free sentinel OR names; no missing-rating options; independent of Repeat/filters; stale selection remains restrictive |
| Predicates | Each field one/multiple, OR within/AND across all five; all empty; clear one/all; no Evidence/Difficulty filters |
| Sorting | Every field and applicable direction/default, numeric ratings; UNKNOWN/no-topics last; complete sequences/prefixes/Unicode; stable ties/ranks; reflexivity, antisymmetry and all-triples transitivity over varied primary values; comparator/input immutability; global deck interleave; history unchanged |
| Live additions | Eligible/ineligible additions, preserve frontier, tail append, explicit Apply resorts; deterministic new ranks/default |
| Re-inclusion | Passed excluded, unpassed restored, current excluded/reincluded, Repeat admission preserved |
| Deletion/access | Current/pending/history deletion/revoke; no disclosure/new outcome; other decks continue; access regain; cascade |
| History | Circular first->last, one/zero accessible, duplicate positions; ACTIVE Next toward frontier/learning; COMPLETE last Next wraps first; single-entry browse no-op; no SHOWN from browsing; Repeat viewed card |
| Repeat | Initial pass, boundaries, mark/unmark historical, newly admitted card in repeat cycle, no accidental infinite history loop |
| Completion | COMPLETE never reopens by reads/Apply/resume/new cards/classification; Restart new ID same decks/settings/Repeat; local navigation/passed reset only; persistent progress/statistics/user history retained; failure retains prior session |
| Limits | Start/restart30/31 decks and5000/5001 cards; active growth above5000 admitted normally, no extra API state/block/truncation or cap recheck |
| Apply/concurrency | Draft no effect; single atomic update; stale version no mutation; source drift; duplicate request no count inflation |
| Resume | Refresh/login/two authenticated device clients; settings/history/Repeat/timer restored; user-isolated shared decks |
| Management | Read/create/PATCH, strict field/presence rules, If-Match/idempotency, atomic memberships, revoke between read/write |
| MCP | Approved capability schemas; existing update_card answer/classification/combined patches, old valid requests preserved; no separate tool; create receipt; scope/grants/revocation; size limits; no session/global search tools |
| Regressions | Existing timer semantics, Difficulty controls/values, FTS Unicode/3-codepoint rules/exact lookup/details/answers/all translations/epoch |

Use existing tests/study.test.ts, study-cycles.test.ts, api.test.ts, ui-api.test.ts,
languages.test.ts, markdown.test.ts, v3.test.ts, migration-v4.test.ts, search-fts.test.ts,
mcp-reads.test.ts, mcp-update.test.ts, third-party-access.test.ts and e2e/study.pw.ts as
integration points. Add meaningful fixtures, not tests mirroring implementation only.
Do not weaken existing regressions to pass new behavior; update obsolete snapshot
expectations only with approved lifecycle evidence.

## Manual acceptance

Desktop/mobile/light/dark/BG/EN: start before controls, five dropdowns only Study,
no chips, full labels; Apply/Cancel/Clear/Default; active empty results editable; COMPLETE settings/history and Restart; Q-02 read-only settings; editable only after Restart starts new session, never reopens.
Keyboard Tab/Space/arrows/Escape and global R isolation; popup focus restore and screen
reader checkbox names/count announcement. TV physical remote Back/OK/directional focus,
no hover-only controls. Shared deck two users independently Apply; two devices same user
conflict visibly and restore applied state. Existing sidebars/Deck Details/Difficulty
remain usable. Task Specification content visible and translations retained.

## Performance and native verification

Benchmark 1/2/30 decks, up to 5000 cards, zero/one/many topics, skewed common topics,
large membership sets, Apply/resume/source churn and Fully Live growth beyond5000 without special handling; restart uses ordinary start limits.
Measure SQL duration, rows read/written, Worker CPU, serialized state/response bytes,
queries and bound parameters. Do not fetch all answers for projections. D1 currently
documents 100 parameters/query; recheck target plan/version during implementation.
Use bounded JSON array arguments instead of one parameter per ID where appropriate.

Representative global-scale exact/multi-topic/combined/FTS-intersection queries are
local experiments, not new endpoints. EXPLAIN QUERY PLAN must demonstrate reverse
topic index for selective lookup and PK for card memberships; record temp-sort/full
scan trade-offs for broad matches. No index-per-combination speculation. Compare live
queue projection memory/state growth across cycles, preserving required history.
Ordinary classification changes must preserve still-eligible positions despite sort-key
changes; append newly eligible unpassed, no passed-card requeue. No Topics sentinel
never writes card_topics, literal NO TOPICS stays separate; stale sentinel stays restrictive.

No acceptance latency budget was supplied: record baseline/results and obtain owner
agreement on material limits before performance sign-off.

Official references: [D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[D1 indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/),
[SQLite query plans](https://www.sqlite.org/queryplanner.html).

## Release gates

Applicable unit/integration/migration/E2E checks plus typecheck/build; clean diff check;
docs/contracts/templates aligned; exact migration-runner failure rehearsal; recovery
validated locally. Production migration/deploy/commit/push each require separate owner
authorization. No local verification result is evidence of production/device success.

## Approval synchronization checks

DEC/T matrix covers T-01-T-16. No planned nullable universal rating/default-null,
missing-rating sort branch, unimplemented former classification alias, separate MCP
classification tool, COMPLETE reopen or special active overflow behavior. Verify explicit
persisted type-only metadata, max10/200 normalization, non-destructive Restart, circular
completed Next, No Topics collision resistance and FI-001 deferral. Historical notes
must be clearly superseded, not normative. No migration/catalog conversion during docs.

Q-01 RESOLVED acceptance: no legacy interviewPriority in v5 output/grammar; unattested
priority3; omitted raw values recorded by card key in conversion report; conversion not
blocked by that approved omission. DB migration retains raw values until FI-001.
Q-02 RESOLVED acceptance: completed settings read-only; configure cannot mutate them;
Restart new ID/same decks/filters/sort, persistent progress and Repeat unchanged;
new-session settings editable only after successful start. Failed restart retains old
session/settings; stale restart rejected; no completed-session reopening.
