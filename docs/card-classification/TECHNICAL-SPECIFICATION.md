# Consolidated technical specification

Owner-approved planned behavior under T-01-T-16; not implementation authorization. Traceability: [register](DECISIONS.md).

## Card storage and DTO

Use ordinary card_topics(card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE
CASCADE, topic_name TEXT NOT NULL, PRIMARY KEY(card_id,topic_name)), with native
index card_topics_by_topic(topic_name,card_id). No topic entity, deck_id copy,
canonical JSON topics column, original spelling or aliases. API arrays are projections.
No demonstrated need for WITHOUT ROWID optimization at this stage.

Add priority and likelihood INTEGER NOT NULL DEFAULT 3 with integer-type and 1..5
CHECK constraints; creation_mode TEXT NOT NULL DEFAULT UNKNOWN with enum CHECK.
Retain raw legacy interview_priority unchanged; never expose it as universal priority.
Unattested/missing new ratings migrate to 3. Legacy removal is deferred to FI-001.
Keep difficulty and its scale unchanged.

```json
{"id":"c1","deck_id":"d1","topics":["TRANSACTIONS"],"priority":1,"likelihood":2,"creationMode":"MANUAL","difficulty":3,"metadata":{"cardType":"task"},"translations":{"en":{"question":"Design a transaction boundary","questionDetails":"Specify consistency and failure handling.","answer":""}}}
```

Persist metadata.cardType explicitly for every card. Approved T-08 permits type-only metadata;
provenance is absent instead of fabricated. When present, provenance uses exactly
existing type/sources/properties and validation; answerReferences unchanged.
Remove metadata.topic through migration. OccurrenceCount remains derived from
distinct occurrenceId, never independently authored/stored. No evidence kinds,
notes field or new provenance semantics. Readers/renderers must tolerate absent
provenance; existing sourced/mixed/generated evidence constraints remain.
Default question on create; omission on update preserves current type. Task
requires nonblank questionDetails for every final stored translation, including
retained languages not mentioned by a patch.

## Normalization contract

Single server function: require string; normalize('NFC'); trim(); collapse
consecutive ECMAScript Unicode whitespace with /\s+/gu to one ASCII space;
toUpperCase() (not locale-dependent). Reject empty results; deduplicate final
values. Apply NFC before uppercase exactly; no NFKC/accent-folding or extra
normalization step. Empty array valid; empty elements invalid, not silently dropped.
Use exact binary equality thereafter. No per-query normalization of stored rows.
Reuse for create/update/import, conversion, migration preparation and filter/search
ingress. Case expansion collisions are expected, not data corruption.

T-10 bounds: max10 unique normalized topics/card, max200 UTF-16 code units per
normalized topic, validated after normalization/deduplication. Reject atomically;
no truncation or silent dropping. Retain existing payload caps. Any new concrete
raw-input limit needs separate approval.
DTO topic arrays sorted with deterministic Unicode scalar comparator; no localeCompare.

## Ratings and Creation Mode

| Value | Priority EN / BG | Likelihood EN / BG |
|---|---|---|
| 1 | P1 — Critical / P1 — Критичен | 1 — Very High / 1 — Много висока |
| 2 | P2 — High / P2 — Висок | 2 — High / 2 — Висока |
| 3 | P3 — Medium / P3 — Среден | 3 — Medium / 3 — Средна |
| 4 | P4 — Low / P4 — Нисък | 4 — Low / 4 — Ниска |
| 5 | P5 — Very Low / P5 — Много нисък | 5 — Very Low / 5 — Много ниска |

Likelihood is independent ordinal judgement, not a percentage or derived score.
Creation Mode MANUAL includes human formulation/selection with AI assistance; AI means
delegated card creation/selection; UNKNOWN lacks reliable information.
Answer generation, translation or editing never automatically changes creationMode.
Catalog ORIGINAL/ORIGINAL_REVISED/ADDED remain editorial labels, not creationMode evidence.

## Filter contract

topics:{values:string[],includeNoTopics:boolean}; priorities:(1..5)[]; likelihoods:(1..5)[];
creationModes:(MANUAL|AI|UNKNOWN)[]; cardTypes:(question|task)[].
OR within, AND across. Empty arrays are unrestricted. Topics unrestricted only
when values=[] and includeNoTopics=false. No Topics is present only if authorized
scope contains a card without memberships; OR it with selected topic names. The
boolean is a filter sentinel, never a stored topic or magic string: a literal topic
named NO TOPICS cannot collide. No Unspecified type, Evidence or Difficulty filter.
UI label: No Topics / Без теми. Show this checkbox only when noTopicsAvailable is
true. Stale applied selection stays visible as unavailable, never silently cleared.
Normalize ingress topic values once.
Options UNION DISTINCT all authorized live scope cards before classification
filters and independent of Repeat/passed subsets. Only present values; no Not Rated
options or nullable stored/response ratings. No card deduplication by content/topic.
Stale applied selections remain restrictions. Show unavailable-selection notice
and explicit clear action outside available options; never silently broaden results.

## Sorting contract

One {field:default|topics|priority|likelihood|creationMode|cardType,direction:asc|desc}.
Default canonical direction asc; no multi-rule array. Pending only, globally across
decks, history unchanged.

| Field | Ascending | Descending |
|---|---|---|
| Topics | Lexicographic sorted normalized topic sequences | Reverse comparator |
| Priority | 1..5 | 5..1 |
| Likelihood | 1..5 | 5..1 |
| Creation Mode | AI, MANUAL, UNKNOWN | MANUAL, AI, UNKNOWN |
| Card Type | question, task | task, question |

UNKNOWN and empty topic sets always last. Ratings are numeric 1..5. Topics shorter equal prefix
comes first ascending; Unicode scalar comparison, independent of UI locale.
Ties: originalRank then card ID. Original ranks are selected-deck order/position/ID
or persisted initial shuffle. New IDs get increasing first-discovery rank, with
deterministic selection-deck/position/ID order inside each discovered batch.
Default restores ranks without deck writes. Under T-04 new cards append until Apply
sorts the entire pending set. Current frontier remains if eligible. T-16 ordinary
classification changes remove newly ineligible pending cards, append newly eligible
unpassed cards and retain position of still-eligible cards even if sort keys change.

## Study UI specification

Study-only collapsible panel below toolbar; preserve sidebars and unrelated layout.
After COMPLETE show applied settings/history and Restart Session / Започни отначало.
No setting change can reopen COMPLETE. Whether completed settings can be edited
for the next Restart remains Q-02; do not silently implement either policy.
Desktop compact grid, mobile stacked, TV
large focus targets; no essential hover/drag interactions.

```text
Filters and sorting [expand]
Topics       [All topics       v]
Priority     [All priorities   v]
Likelihood   [All likelihoods  v]
Creation Mode [All Creation Modes v]
Card Type    [All Card Types   v]
[Clear All] [Cancel changes]
Sort by [Default Order v] Direction [Ascending v]
[Restore Default Order] [Apply]
Applied: 42 of 243 cards
```

Dropdown checkbox multi-select, no chips/pills. Topics has text search. Closed
summary full single label or first + N selected; enums display full labels.
Per-filter Clear/Clear All edit draft filters only (including includeNoTopics=false); sort unchanged. Restore Default
Order edits draft sort. Cancel restores applied state. Apply submits both atomically.
Pending disables Apply; conflict preserves draft and reloads applied state for
deliberate review/reapply. Draft never affects count, queue or cross-device state.

Card Type / Тип карта; Question / Въпрос; Task / Задача;
Creation Mode / Начин на създаване; No Topics / Без теми.
All Card Types / Всички типове карти. For task questionDetails display Task
Specification / Спецификация на задачата. Internal field name unchanged.
Color supplements text; verify light/dark contrast including yellow/green labels.
Accessible names, expanded state, checkbox group semantics, visible focus and
applied-count status announcements required. Tab/arrow/Space navigate options;
Escape closes popup before Study exit; return focus to trigger. Existing global
R/arrow shortcuts must ignore the entire control subtree. Test remote Back/OK.
Existing Deck Details controls remain with necessary topic/type compatibility only.

## Rating input and naming

Create omitted/null rating -> 3; update omitted -> preserve, null -> reset3;
integer1..5 -> set; invalid -> reject. Apply across Markdown, Management and MCP.
creation_mode is database naming; creationMode is TypeScript/API/MCP/JSON/Markdown.
No compatibility aliases for the former unimplemented classification field. Leave
unrelated origin fields and existing creation-mode input rules unchanged except
approved reset semantics. No percentage, inferred rating or statistical claim.

## Global search readiness

Reverse membership index permits exact/multi-topic lookup, deck discovery and FTS
ID intersection. Future bounded keysets and interface-specific access checks;
no global endpoint/tool search parameters implemented now. No Topics in FTS5.
