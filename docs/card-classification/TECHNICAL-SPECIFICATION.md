# Consolidated technical specification

Planned behavior. Approval gates: [register](DECISIONS.md).

## Card storage and DTO

Use ordinary card_topics(card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE
CASCADE, topic_name TEXT NOT NULL, PRIMARY KEY(card_id,topic_name)), with native
index card_topics_by_topic(topic_name,card_id). No topic entity, deck_id copy,
canonical JSON topics column, original spelling or aliases. API arrays are projections.
No demonstrated need for WITHOUT ROWID optimization at this stage.

Add priority and likelihood nullable INTEGER, CHECK integer type and 1..5 when
non-null; origin TEXT NOT NULL DEFAULT UNKNOWN with enum CHECK. Retain raw legacy
interview_priority until T-01 resolution; never expose it as universal priority.
Keep difficulty and its scale unchanged.

```json
{"id":"c1","deck_id":"d1","topics":["TRANSACTIONS"],"priority":1,"likelihood":2,"origin":"MANUAL","difficulty":3,"metadata":{"cardType":"task"},"translations":{"en":{"question":"Design a transaction boundary","questionDetails":"Specify consistency and failure handling.","answer":""}}}
```

Type remains metadata.cardType. Proposed T-08: metadata may contain type only;
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

Proposed bounds: 100 distinct topics/card, 2000 UTF-16 units/topic after transform;
also enforce request byte cap and raw element count to bound duplicate-heavy input.
Reject overlong input/results rather than truncate. Bounds await spec acceptance.
DTO topic arrays sorted with deterministic Unicode scalar comparator; no localeCompare.

## Ratings and origin

| Value | Priority EN / BG | Likelihood EN / BG |
|---|---|---|
| 1 | P1 — Critical / P1 — Критичен | 1 — Very High / 1 — Много висока |
| 2 | P2 — High / P2 — Висок | 2 — High / 2 — Висока |
| 3 | P3 — Medium / P3 — Среден | 3 — Medium / 3 — Средна |
| 4 | P4 — Low / P4 — Нисък | 4 — Low / 4 — Ниска |
| 5 | P5 — Very Low / P5 — Много нисък | 5 — Very Low / 5 — Много ниска |
| null | Not Rated / Неоценен | Not Rated / Неоценена |

Likelihood is independent ordinal judgement, not a percentage or derived score.
Origin MANUAL includes human formulation/selection with AI assistance; AI means
delegated question selection/creation; UNKNOWN lacks reliable information.
Answer generation, translation or editing never automatically changes question origin.
Catalog ORIGINAL/ORIGINAL_REVISED/ADDED remain editorial labels, not origin evidence.

## Filter contract

topics:string[]; priorities:(1..5|null)[]; likelihoods:(1..5|null)[];
origins:(MANUAL|AI|UNKNOWN)[]; cardTypes:(question|task)[].
OR within, AND across; [] unrestricted. No missing-topic selection, Unspecified
Card Type, Evidence or Difficulty filter. Normalize ingress topics once.
Options UNION DISTINCT all authorized live scope cards before classification
filters and independent of Repeat/passed subsets. Only present values, including
rating null when present. No card deduplication by content/topic.
Stale applied selections remain restrictions. Show unavailable-selection notice
and explicit clear action outside available options; never silently broaden results.

## Sorting contract

One {field:default|topics|priority|likelihood|origin|cardType,direction:asc|desc}.
Default canonical direction asc; no multi-rule array. Pending only, globally across
decks, history unchanged.

| Field | Ascending | Descending |
|---|---|---|
| Topics | Lexicographic sorted normalized topic sequences | Reverse comparator |
| Priority | 1..5 | 5..1 |
| Likelihood | 1..5 | 5..1 |
| Origin | AI, MANUAL, UNKNOWN | MANUAL, AI, UNKNOWN |
| Card Type | question, task | task, question |

Null ratings, UNKNOWN and empty topic sets always last. Topics shorter equal prefix
comes first ascending; Unicode scalar comparison, independent of UI locale.
Ties: originalRank then card ID. Original ranks are selected-deck order/position/ID
or persisted initial shuffle. New IDs get increasing first-discovery rank, with
deterministic selection-deck/position/ID order inside each discovered batch.
Default restores ranks without deck writes. Under T-04 new cards append until Apply
sorts the entire pending set. Current frontier remains if eligible.

## Study UI specification

Study-only collapsible panel below toolbar; preserve sidebars and unrelated layout.
Also available in filtered completion. Desktop compact grid, mobile stacked, TV
large focus targets; no essential hover/drag interactions.

```text
Filters and sorting [expand]
Topics       [All topics       v]
Priority     [All priorities   v]
Likelihood   [All likelihoods  v]
Origin       [All origins      v]
Card Type    [All Card Types   v]
[Clear All] [Cancel changes]
Sort by [Default Order v] Direction [Ascending v]
[Restore Default Order] [Apply]
Applied: 42 of 243 cards
```

Dropdown checkbox multi-select, no chips/pills. Topics has text search. Closed
summary full single label or first + N selected; enums display full labels.
Per-filter Clear/Clear All edit draft filters only; sort unchanged. Restore Default
Order edits draft sort. Cancel restores applied state. Apply submits both atomically.
Pending disables Apply; conflict preserves draft and reloads applied state for
deliberate review/reapply. Draft never affects count, queue or cross-device state.

Card Type / Тип карта; Question / Въпрос; Task / Задача;
All Card Types / Всички типове карти. For task questionDetails display Task
Specification / Спецификация на задачата. Internal field name unchanged.
Color supplements text; verify light/dark contrast including yellow/green labels.
Accessible names, expanded state, checkbox group semantics, visible focus and
applied-count status announcements required. Tab/arrow/Space navigate options;
Escape closes popup before Study exit; return focus to trigger. Existing global
R/arrow shortcuts must ignore the entire control subtree. Test remote Back/OK.
Existing Deck Details controls remain with necessary topic/type compatibility only.

## Global search readiness

Reverse membership index permits exact/multi-topic lookup, deck discovery and FTS
ID intersection. Future bounded keysets and interface-specific access checks;
no global endpoint/tool search parameters implemented now. No Topics in FTS5.
