# Owner decision register

All DEC entries below are approved requirements, not implementation evidence.

| ID | Binding requirement | Primary document |
|---|---|---|
| DEC-001 | Canonical card_topics, composite PK/reverse index; no entities/JSON copy | TECHNICAL-SPECIFICATION |
| DEC-002 | Server NFC, trim, collapse whitespace, uppercase, dedup, reject empty | TECHNICAL-SPECIFICATION |
| DEC-003 | Value identity; no rename/aliases/history | TECHNICAL-SPECIFICATION |
| DEC-004 | Universal priority 1 Critical to 5 Very Low; mandatory default3; legacy preserved (T-01/13) | MIGRATION-PLAN |
| DEC-005 | Universal likelihood 1 highest; mandatory default3; attested inversion (T-13) | MARKDOWN-V5 |
| DEC-006 | No evidence expansion or occurrence change | TECHNICAL-SPECIFICATION |
| DEC-007 | creationMode MANUAL/AI/UNKNOWN; no inference (T-14) | TECHNICAL-SPECIFICATION |
| DEC-008 | metadata.cardType question/task; coding_task conversion; task details | MIGRATION-PLAN |
| DEC-009 | Default question including null metadata; no fake provenance | TECHNICAL-SPECIFICATION |
| DEC-010 | Approved BG/EN Card Type and Task Specification labels | TECHNICAL-SPECIFICATION |
| DEC-011 | Question/Task type ordering, language independent | TECHNICAL-SPECIFICATION |
| DEC-012 | Fully Live membership; additions/deletions/access/classification; no push | STUDY-LIFECYCLE |
| DEC-013 | Preserved history, circular Previous, skip unavailable, no new presentation | STUDY-LIFECYCLE |
| DEC-014 | Recompute unpassed queue; Repeat separate | STUDY-LIFECYCLE |
| DEC-015 | Terminal COMPLETE; non-destructive Restart (T-06 supersedes reopening) | STUDY-LIFECYCLE |
| DEC-016 | No timer refactor or automatic pause | STUDY-LIFECYCLE |
| DEC-017 | Single-field asc/desc/default only | TECHNICAL-SPECIFICATION |
| DEC-018 | Comparators, UNKNOWN/no-topics last; numeric ratings (T-13) | TECHNICAL-SPECIFICATION |
| DEC-019 | Draft until explicit atomic Apply; version conflicts | API-MCP |
| DEC-020 | v5, presence-aware reimport, no session export settings | MARKDOWN-V5 |
| DEC-021 | Convert legacy before import; preserve dependencies pending approval | MARKDOWN-V5 |
| DEC-022 | Preserve Difficulty, no new Study filter/sort | MARKDOWN-V5 |
| DEC-023 | Management/MCP read/create/edit; existing update_card expansion approved T-07 | API-MCP |

## Approved T-01 through T-16

Authority: OWNER-APPROVED-TECHNICAL-DECISIONS.md supplied by owner; reference commit
4560247d76670f0b440a151ac696da860ce9411a. All rows APPROVED, planned not implemented.
These supersede conflicting DEC/proposal text; no automatic implementation authority.

| T | Revises/elaborates DEC | Effective requirement | Contract |
|---|---|---|---|
| T-01 | 004 | Raw legacy preserved; priority3 absent attested mapping; FI-001 deferred | Migration/v5/API |
| T-02 | 001/002 | Standard SQL, inspect distinct values, proven UPPER/TRIM, explicit exceptions/unknown guards | Migration/tests |
| T-03 | 012 | Start-only 30 decks/5000; no active growth cap/block/truncate/special state | Lifecycle/API/tests |
| T-04 | 012/018 | Append new eligible cards; preserve pending/frontier/ranks; Apply sorts | Lifecycle |
| T-05 | 013 | Previous wraps; active Next learns at frontier; completed Next wraps; single-entry browse no-op | Lifecycle/tests |
| T-06 | 015 | COMPLETE terminal; Restart new ID/same settings/Repeat; persistent progress/history retained | Lifecycle/API/UI |
| T-07 | 023 | Extend get/create/existing update_card; no separate tool; search unchanged | API/roadmap |
| T-08 | 008/009 | Explicit question/task; type-only metadata; provenance optional and validated | Model/migration |
| T-09 | 012/014/015 | New cards once in active Repeat cycle; retain admission if excluded | Lifecycle |
| T-10 | 002 | max10 unique normalized topics, max200 UTF-16 each after dedup | Model/v5/API/tests |
| T-11 | 020/021 | v5 approved grammar revised naming/default3/reset; no actual conversion now | v5/roadmap |
| T-12 | 020 | Export v3 numeric ratings/creationMode/raw interviewPriority; no Study settings | v5/API |
| T-13 | 004/005/018/020/023 | NOT NULL DEFAULT3; omitted create3/update preserve; null reset3; metadata presence | All |
| T-14 | 007 | DB creation_mode; external creationMode; no aliases/unrelated renames | All |
| T-15 | 001/014/018 | No Topics sentinel OR names; not canonical topic | Model/API/UI/tests |
| T-16 | 012/014/018 | Remove ineligible, append eligible unpassed, preserve still-eligible position; no COMPLETE reopen | Lifecycle/tests |

## Superseded historical proposals

At reference commit nullable ratings/default null/missing-rating options, planned
classification name origin, 100/2000 topic limits, active overflow handling, COMPLETE
reopening and separate MCP classification tool were proposals. All superseded.
No compatibility aliases for unimplemented former fields. Updated DEC rows above
record effective requirements; owner technical decisions take precedence.

## Q-01 - RESOLVED: legacy interviewPriority conversion

Owner-approved: do not carry legacy interviewPriority into Markdown v5 and do not
add a legacy v5 field. Use priority: 3 without reliable new priority. Record omitted
legacy values in the conversion report, with card key/value for traceability; this
intentional omission does not block import-ready output. Preserve existing raw
interview_priority in database migration until separately approved FI-001 removal.
Normal reimport never overwrites the matched card's retained raw legacy value.

## Q-02 - RESOLVED: completed settings

Completed settings are read-only. Restart creates a NEW session with the same selected
decks, applied filters and sorting; settings become editable only after the new session
starts. Preserve persistent user progress and Repeat statuses. Never reopen COMPLETE.
Version guards and ordinary start checks remain; failed Restart leaves old session intact.

No unresolved owner product/technical decisions remain for the current specification.
Separate implementation/release authorization is still required; deferred FI-001 and
hypothetical future scope approvals are not unresolved current requirements.

## Execution gates and deferred work

No T decision awaits approval. Implementation/production access/migrations/commit/push/
PR/merge/deploy require separate authorization. New concrete raw-input limits and
legacy-parser removal need review. Legacy removal only [FI-001](../FUTURE-IMPROVEMENTS.md).

## Native evidence

- [D1 SQL/JSON/FTS](https://developers.cloudflare.com/d1/sql-api/sql-statements/).
- [Native indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/).
- [Generated columns](https://www.sqlite.org/gencol.html).
- [SQLite collations](https://www.sqlite.org/fileformat.html).

Topic normalization DEC-002 is separate from FTS and question duplicate normalization.
