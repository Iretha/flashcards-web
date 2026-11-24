# Owner decision register

All DEC entries below are approved requirements, not implementation evidence.

| ID | Binding requirement | Primary document |
|---|---|---|
| DEC-001 | Canonical card_topics, composite PK/reverse index; no entities/JSON copy | TECHNICAL-SPECIFICATION |
| DEC-002 | Server NFC, trim, collapse whitespace, uppercase, dedup, reject empty | TECHNICAL-SPECIFICATION |
| DEC-003 | Value identity; no rename/aliases/history | TECHNICAL-SPECIFICATION |
| DEC-004 | Universal priority 1 Critical to 5 Very Low; no guessed legacy mapping | MIGRATION-PLAN |
| DEC-005 | Universal likelihood 1 highest; invert attested old catalogs once | MARKDOWN-V5 |
| DEC-006 | No evidence expansion or occurrence change | TECHNICAL-SPECIFICATION |
| DEC-007 | MANUAL/AI/UNKNOWN; no provenance/editorial inference | TECHNICAL-SPECIFICATION |
| DEC-008 | metadata.cardType question/task; coding_task conversion; task details | MIGRATION-PLAN |
| DEC-009 | Default question including null metadata; no fake provenance | TECHNICAL-SPECIFICATION |
| DEC-010 | Approved BG/EN Card Type and Task Specification labels | TECHNICAL-SPECIFICATION |
| DEC-011 | Question/Task type ordering, language independent | TECHNICAL-SPECIFICATION |
| DEC-012 | Fully Live membership; additions/deletions/access/classification; no push | STUDY-LIFECYCLE |
| DEC-013 | Preserved history, circular Previous, skip unavailable, no new presentation | STUDY-LIFECYCLE |
| DEC-014 | Recompute unpassed queue; Repeat separate | STUDY-LIFECYCLE |
| DEC-015 | Filtered exhaustion resumable without reset | STUDY-LIFECYCLE |
| DEC-016 | No timer refactor or automatic pause | STUDY-LIFECYCLE |
| DEC-017 | Single-field asc/desc/default only | TECHNICAL-SPECIFICATION |
| DEC-018 | Approved comparators, missing-last, stable pending-only sorting | TECHNICAL-SPECIFICATION |
| DEC-019 | Draft until explicit atomic Apply; version conflicts | API-MCP |
| DEC-020 | v5, presence-aware reimport, no session export settings | MARKDOWN-V5 |
| DEC-021 | Convert legacy before import; preserve dependencies pending approval | MARKDOWN-V5 |
| DEC-022 | Preserve Difficulty, no new Study filter/sort | MARKDOWN-V5 |
| DEC-023 | Management/MCP read/create/edit; security retained; capability gate | API-MCP |

## Technical proposals requiring review

These gate implementation tasks, not completion of this specification.

| ID | Evidence/problem | Recommendation, alternatives and trade-off | Gate |
|---|---|---|---|
| T-01 | Historical interview_priority is 1..5 with no proven direction (0004; history 6a2801b) | Preserve raw legacy column; priority NULL pending attested per-source mapping. Alternative: owner supplies mapping. Retention avoids loss but leaves temporary legacy field | Priority migration |
| T-02 | SQL lacks JS NFC/full Unicode uppercase; AGENTS forbids custom migration runners | Generate reviewed static SQL mapping locally with shared normalizer from separately authorized snapshot; abort on unknown values. Freeze writes to prevent drift. Alternative needs explicit exception approval | Backfill mechanism and source snapshot |
| T-03 | Fully Live can exceed 5000; silent truncation loses eligible cards | Scope cap remains 5000: recoverable LIMIT_EXCEEDED, no new admission, preserve history. Alternative increase cap after measurement or approve changed filtered-cap semantics | Live limit policy |
| T-04 | New cards append vs sorted insertion | Append at pending tail; explicit Apply subsequently sorts all pending. Simple, no imminent-next disruption; order intentionally not globally sorted between Applies | Queue order |
| T-05 | Circular Previous may trap Next | Previous wraps full accessible session history; Next advances to tail then returns to frontier, subsequent Next consumes frontier. One-entry Previous no-op | Navigation boundary |
| T-06 | Current COMPLETE rejects actions | Preserve COMPLETE status for exhaustion, add completionReason; Apply/resume reconciliation can reopen same ID. Start-new replaces as today; no new close endpoint | Completion/API contract |
| T-07 | update_card is answer-only today | New update_card_classification tool plus reviewed create_card optional fields. Alternative explicitly broaden existing update_card. Additional surface requires separate approval despite DEC-023 data requirement | MCP registration |
| T-08 | Null metadata cannot hold type without required provenance today | Persist type-only {cardType:question}; optional provenance, validated unchanged when supplied. Alternative implicit default avoids write but weakens explicit persistence | Metadata compatibility |
| T-09 | New cards arrive during Repeat cycles | Admit new cards once in current cycle regardless Repeat; retain admission if filtered out; subsequent cycles require mark | Repeat/new-card boundary |

Specification acceptance also covers exact v5 syntax, export-version transition,
API metadata patch semantics and proposed input bounds. No unapproved item is a
reason to start implementation or access production.

## Native evidence

- [D1 SQL/JSON/FTS support](https://developers.cloudflare.com/d1/sql-api/sql-statements/).
- [Native indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/).
- [Generated-column limitations](https://www.sqlite.org/gencol.html).
- [SQLite collations](https://www.sqlite.org/fileformat.html).

DEC-002 explicitly approves topic normalization. It is separate from native FTS
Unicode behavior and import question duplicate normalization.
