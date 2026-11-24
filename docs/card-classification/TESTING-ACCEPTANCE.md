# Testing and acceptance plan

No tests run or created in specification phase. Future implementation must supply
evidence; no measured performance is claimed here.

## Automated matrix

| Area | Concrete acceptance scenarios |
|---|---|
| Normalizer | NFC composed/decomposed, spaces/tabs/newlines/NBSP, case expansion, dedup collisions, empty element rejection, empty array, bounds/idempotence |
| Membership | PK duplicate rejection, reverse index plan, card deletion cascade, no orphan/deck copy, atomic rollback |
| Migration | Populated null/full metadata, source/reference preservation, coding_task->task/details, IDs/progress/events/session parity; unknown map abort; FK/FTS parity |
| Priority | Strict int1..5/null, no strings/fractions; ambiguous raw legacy retained and universal null until approved mapping |
| Likelihood | Strict scale; attested catalog 6-old; null; already-target refuses inversion; counts/IDs/question text unchanged |
| Origin | Create UNKNOWN, omission preserve, explicit values; answer translation/provenance do not infer origin |
| Type | Default question; type-only metadata no fake source; task every retained language details; clear details invalid for task |
| v5 | Grammar, duplicate/unknown headings, fenced headings, aliases rejected, limits, presence/empty distinctions, preview/apply parity |
| Legacy | v3/v4 only conversion, sources/count validation, scalar topic one value, lossless translations/answers/details; ambiguous priority diagnostics |
| Reimport | IDs/progress preserved, omitted fields/languages/cards retained; explicit topics/rating/reference clears; type changes validated |
| Options | 1/2/30 decks UNION DISTINCT; no phantom enum; null present-only; independent of Repeat/filters; stale selection remains restrictive |
| Predicates | Each field one/multiple, OR within/AND across all five; all empty; clear one/all; no Evidence/Difficulty filters |
| Sorting | Every field both directions/default, null/UNKNOWN/no-topics last; sequences/prefixes/Unicode; stable ties/ranks; global deck interleave; history unchanged |
| Live additions | Eligible/ineligible additions, preserve frontier, tail append, explicit Apply resorts; deterministic new ranks/default |
| Re-inclusion | Passed excluded, unpassed restored, current excluded/reincluded, Repeat admission preserved |
| Deletion/access | Current/pending/history deletion/revoke; no disclosure/new outcome; other decks continue; access regain; cascade |
| History | Circular first->last, one/zero accessible, duplicate positions; Next tail->frontier->consume; no SHOWN from browsing; Repeat viewed card |
| Repeat | Initial pass, boundaries, mark/unmark historical, newly admitted card in repeat cycle, no accidental infinite history loop |
| Completion | Filtered exhaustion same ID reopens; no passed reset/filter clear; new card resume; explicit start-new guarded |
| Limits | Start 5000/5001; growth/recovery without truncation; filters don't change scope cap |
| Apply/concurrency | Draft no effect; single atomic update; stale version no mutation; source drift; duplicate request no count inflation |
| Resume | Refresh/login/two authenticated device clients; settings/history/Repeat/timer restored; user-isolated shared decks |
| Management | Read/create/PATCH, strict field/presence rules, If-Match/idempotency, atomic memberships, revoke between read/write |
| MCP | Approved capability schemas; unchanged answer-only tool; create receipt; scope/grants/revocation; size limits; no session/global search tools |
| Regressions | Existing timer semantics, Difficulty controls/values, FTS Unicode/3-codepoint rules/exact lookup/details/answers/all translations/epoch |

Use existing tests/study.test.ts, study-cycles.test.ts, api.test.ts, ui-api.test.ts,
languages.test.ts, markdown.test.ts, v3.test.ts, migration-v4.test.ts, search-fts.test.ts,
mcp-reads.test.ts, mcp-update.test.ts, third-party-access.test.ts and e2e/study.pw.ts as
integration points. Add meaningful fixtures, not tests mirroring implementation only.
Do not weaken existing regressions to pass new behavior; update obsolete snapshot
expectations only with approved lifecycle evidence.

## Manual acceptance

Desktop/mobile/light/dark/BG/EN: start before controls, five dropdowns only Study,
no chips, full labels; Apply/Cancel/Clear/Default; empty results/completion still editable.
Keyboard Tab/Space/arrows/Escape and global R isolation; popup focus restore and screen
reader checkbox names/count announcement. TV physical remote Back/OK/directional focus,
no hover-only controls. Shared deck two users independently Apply; two devices same user
conflict visibly and restore applied state. Existing sidebars/Deck Details/Difficulty
remain usable. Task Specification content visible and translations retained.

## Performance and native verification

Benchmark 1/2/30 decks, up to 5000 cards, zero/one/many topics, skewed common topics,
large membership sets, Apply/resume/source churn and Fully Live overflow/recovery.
Measure SQL duration, rows read/written, Worker CPU, serialized state/response bytes,
queries and bound parameters. Do not fetch all answers for projections. D1 currently
documents 100 parameters/query; recheck target plan/version during implementation.
Use bounded JSON array arguments instead of one parameter per ID where appropriate.

Representative global-scale exact/multi-topic/combined/FTS-intersection queries are
local experiments, not new endpoints. EXPLAIN QUERY PLAN must demonstrate reverse
topic index for selective lookup and PK for card memberships; record temp-sort/full
scan trade-offs for broad matches. No index-per-combination speculation. Compare live
queue projection memory/state growth across cycles, preserving required history.
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
